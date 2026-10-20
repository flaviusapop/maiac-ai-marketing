/* Maiac contact form. No provider or endpoint is assumed. */
(() => {
  'use strict';

  const REQUEST_TIMEOUT_MS = 30000;
  let cleanup = null;

  const initialize = () => {
    cleanup?.();
    cleanup = null;

    const form = document.querySelector('[data-contact-form]');
    const status = form?.querySelector('[data-form-status]');
    const submit = form?.querySelector('button[type="submit"]');
    if (!form || !status || !submit) return;

    const listeners = new AbortController();
    const fields = Array.from(form.querySelectorAll('.field')).map((field) => ({
      field,
      input: field.querySelector('.field__input'),
      error: field.querySelector('.field__error'),
    })).filter(({ input }) => input);
    let pending = false;
    let disposed = false;
    let request = null;
    let timeout = null;

    const endpoint = () => (form.dataset.endpoint || form.getAttribute('action') || '').trim();
    const announce = (message) => { status.textContent = message; };
    const setBusy = (busy) => {
      pending = busy;
      submit.disabled = busy;
      // Keep the live status outside a busy ancestor so Sending can be announced immediately.
      submit.setAttribute('aria-busy', String(busy));
    };
    const describeError = (input, error, invalid) => {
      if (!error?.id) return;
      const descriptions = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      if (invalid) descriptions.add(error.id); else descriptions.delete(error.id);
      if (descriptions.size) input.setAttribute('aria-describedby', Array.from(descriptions).join(' '));
      else input.removeAttribute('aria-describedby');
    };
    const validate = ({ field, input, error }) => {
      const value = input.value.trim();
      const valid = (!input.required && !value) || (input.type === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
        : !input.required || value.length > 0);
      field.classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      if (error) error.hidden = valid;
      describeError(input, error, !valid);
      return valid;
    };

    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    setBusy(false); // The HTML button is disabled until the enhancement is available.

    fields.forEach((entry) => {
      entry.input.addEventListener('blur', () => {
        if (entry.input.value || entry.field.classList.contains('is-invalid')) validate(entry);
      }, { signal: listeners.signal });
      entry.input.addEventListener('input', () => {
        if (entry.field.classList.contains('is-invalid')) validate(entry);
      }, { signal: listeners.signal });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending || disposed) return;

      const results = fields.map(validate);
      const firstInvalid = results.indexOf(false);
      if (firstInvalid !== -1) {
        fields[firstInvalid].input.focus();
        announce('');
        return;
      }

      const data = new FormData(form);
      if (String(data.get('website') || '').trim()) {
        // This is only a client check. The real handler must validate the honeypot.
        announce('This message couldn’t be sent. Please reload the page and try again.');
        return;
      }
      const url = endpoint();
      if (!url) {
        announce('This form isn’t connected yet.');
        return;
      }

      setBusy(true); // Guard is synchronous, before the first asynchronous operation.
      announce('Sending…');
      request = new AbortController();
      const activeRequest = request;
      let timedOut = false;
      timeout = window.setTimeout(() => {
        timedOut = true;
        activeRequest.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
          signal: activeRequest.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (disposed) return;
        form.reset();
        fields.forEach((entry) => {
          entry.field.classList.remove('is-invalid');
          entry.input.removeAttribute('aria-invalid');
          if (entry.error) entry.error.hidden = true;
          describeError(entry.input, entry.error, false);
        });
        announce('Thank you. We’ll get back to you soon.');
      } catch (error) {
        if (disposed) return;
        announce(timedOut
          ? 'The request timed out. Your details are still here. Please try again.'
          : 'Something went wrong. Please try again in a moment.');
      } finally {
        window.clearTimeout(timeout);
        timeout = null;
        if (request === activeRequest) request = null;
        if (!disposed) setBusy(false);
      }
    }, { signal: listeners.signal });

    cleanup = () => {
      disposed = true;
      listeners.abort();
      window.clearTimeout(timeout);
      timeout = null;
      request?.abort();
      request = null;
      if (pending) announce('Something went wrong. Please try again in a moment.');
      setBusy(false);
    };
  };

  initialize();
  window.addEventListener('pagehide', () => {
    cleanup?.();
    cleanup = null;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) initialize();
  });
})();
