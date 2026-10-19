/* Maiac AI Marketing. Native navigation, scrolling and SVG transforms; no dependencies. */
(() => {
  'use strict';
  let dispose;
  const init = () => {
    dispose?.();
    const $ = (s, scope = document) => scope.querySelector(s);
    const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
    const root = document.documentElement;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 900px)');
    const lifecycle = new AbortController();
    const cleanups = [];
    const on = (target, event, listener, options = {}) => target?.addEventListener(event, listener, { ...options, signal: lifecycle.signal });
    const header = $('[data-site-header]'), bar = $('[data-nav-bar]');
    const page = $('[data-page]'), footer = $('[data-footer]'), menu = $('[data-menu]');
    const openers = $$('[data-menu-open]'), navLinks = $$('[data-nav-link]'), sections = $$('[data-section]');
    const progress = $('[data-progress]'), mark = $('[data-footer-mark]');
    const mainMark = $('.site-footer__mark-img', mark);
    let frame = 0, layoutNeeded = true, opener = null, lockedY = 0, lastActive = null;

    // Native dialog supplies modal containment, inert background and top-layer coverage.
    const closeMenu = (restore = true) => {
      if (!menu.open) return;
      menu.close();
      root.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      window.scrollTo({ top: lockedY, behavior: 'instant' });
      openers.forEach(button => button.setAttribute('aria-expanded', 'false'));
      if (restore) {
        const returnTarget = [opener, $('.nav-bar__logo'), $('.site-header__logo'), ...openers].find(control => {
          if (!control?.getClientRects().length || control.closest('[inert]')) return false;
          const rect = control.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
        });
        returnTarget?.focus({ preventScroll: true });
      }
      requestTick();
    };
    openers.forEach(button => on(button, 'click', () => {
      if (menu.open) return;
      opener = button;
      lockedY = scrollY;
      menu.dataset.menuOrigin = button.closest('[data-nav-bar]') ? 'compact' : 'full';
      menu.showModal();
      root.classList.add('menu-open');
      document.body.classList.add('menu-open');
      // Fixed-body lock covers touch browsers that scroll through overflow:hidden.
      Object.assign(document.body.style, { position: 'fixed', top: `${-lockedY}px`, width: '100%' });
      openers.forEach(b => b.setAttribute('aria-expanded', 'true'));
      $('[data-menu-close]', menu).focus();
    }));
    on($('[data-menu-close]'), 'click', () => closeMenu());
    on(menu, 'cancel', event => { event.preventDefault(); closeMenu(); });
    on(menu, 'keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = $$('a[href],button:not([disabled])', menu).filter(control => control.getClientRects().length);
      const index = controls.indexOf(document.activeElement);
      event.preventDefault();
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    });
    on(desktop, 'change', () => { closeMenu(true); layoutNeeded = true; requestTick(); });

    // href/hash navigation stays native. Focus follows closure and hash assignment,
    // without a timeout or animation-completion race.
    on(document, 'click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      const fromMenu = menu.contains(link);
      if (fromMenu) closeMenu(false);
      if (fromMenu || link.hasAttribute('data-cta')) {
        event.preventDefault();
        if (location.hash !== link.hash) location.hash = link.hash;
        else target.scrollIntoView({ block: 'start' });
        const focusTarget = link.hasAttribute('data-cta') ? $('#f-name') : ($('h1, h2', target) || target);
        if (!focusTarget.matches('input, textarea, button, a')) focusTarget.tabIndex = -1;
        focusTarget.focus({ preventScroll: true });
        if (link.hasAttribute('data-cta')) focusTarget.scrollIntoView({ block: 'center', behavior: motion.matches ? 'instant' : 'smooth' });
      }
    });
    // Uncover the fixed footer as soon as a keyboard user focuses one of its links.
    on(footer, 'focusin', () => {
      if (root.classList.contains('footer-reveal')) window.scrollTo({ top: root.scrollHeight, behavior: 'instant' });
    });

    const team = $('[data-team-scroller]');
    let pointer = null, wheelTimer = 0;
    if (team) {
      const endDrag = () => {
        if (!pointer) return;
        const id = pointer.id;
        pointer = null;
        team.classList.remove('is-dragging');
        if (team.hasPointerCapture(id)) team.releasePointerCapture(id);
      };
      cleanups.push(endDrag, () => clearTimeout(wheelTimer));
      on(team, 'pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, left: team.scrollLeft };
        team.setPointerCapture(event.pointerId);
        team.focus({ preventScroll: true });
      });
      on(team, 'pointermove', event => {
        if (!pointer || pointer.id !== event.pointerId) return;
        const dx = event.clientX - pointer.x;
        if (Math.abs(dx) > 3) {
          team.classList.add('is-dragging');
          team.scrollLeft = pointer.left - dx;
          event.preventDefault();
        }
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => on(team, type, endDrag));
      on(team, 'dragstart', event => event.preventDefault());
      on(team, 'wheel', event => {
        // Preserve horizontal/diagonal trackpad input and browser pinch/zoom gestures.
        if (event.ctrlKey || event.metaKey || event.deltaX !== 0 || event.shiftKey || !event.deltaY) return;
        const max = team.scrollWidth - team.clientWidth, left = team.scrollLeft;
        if ((event.deltaY > 0 && left >= max - 1) || (event.deltaY < 0 && left <= 1) || max <= 1) return;
        const unit = event.deltaMode === 1 ? parseFloat(getComputedStyle(team).lineHeight) || 20 : event.deltaMode === 2 ? team.clientWidth : 1;
        event.preventDefault();
        clearTimeout(wheelTimer);
        team.classList.add('is-wheeling');
        team.scrollLeft = Math.max(0, Math.min(max, left + event.deltaY * unit));
        wheelTimer = setTimeout(() => team.classList.remove('is-wheeling'), 160);
      }, { passive: false });
      on(team, 'keydown', event => {
        if (event.target !== team || !['ArrowRight', 'ArrowLeft'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        const step = $('.member', team).getBoundingClientRect().width + 24;
        team.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: motion.matches ? 'instant' : 'smooth' });
      });
    }

    // Seven narrowing SVG copies; static/no-JS mode always uses the final mark.
    const copies = Array.from({ length: 7 }, () => {
      const copy = mainMark.cloneNode(false);
      copy.className = 'site-footer__mark-copy';
      copy.alt = '';
      mark.insertBefore(copy, mainMark);
      return copy;
    });
    cleanups.push(() => copies.forEach(copy => copy.remove()));
    const measure = () => {
      // Both modes use the same natural height, so a short window cannot oscillate.
      const height = footer.offsetHeight, fits = height <= innerHeight;
      root.classList.toggle('footer-reveal', fits);
      root.classList.toggle('no-footer-reveal', !fits);
      root.style.setProperty('--footer-h', `${height}px`);
      // Text-only zoom can overflow a desktop bar without changing viewport width.
      // Measure an inert natural-width copy independently of the condensed mode.
      let condensed = false;
      if (desktop.matches) {
        const probe = $('.nav-bar__inner', bar).cloneNode(true);
        probe.inert = true;
        probe.setAttribute('aria-hidden', 'true');
        Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', width: 'max-content', maxWidth: 'none', height: 'auto', pointerEvents: 'none' });
        $('.nav-bar__nav', probe).style.display = 'block';
        $('.nav-bar__cta', probe).style.display = 'inline-flex';
        $('.nav-bar__toggle', probe).style.display = 'none';
        bar.append(probe);
        condensed = probe.getBoundingClientRect().width > innerWidth;
        probe.remove();
      }
      bar.classList.toggle('is-condensed', condensed);
      layoutNeeded = false;
    };
    const paint = () => {
      frame = 0;
      if (menu.open) return;
      if (layoutNeeded) measure();
      const visible = header.getBoundingClientRect().bottom <= 0;
      if (bar.classList.contains('is-visible') !== visible) {
        bar.classList.toggle('is-visible', visible);
        bar.inert = !visible;
        bar.setAttribute('aria-hidden', String(!visible));
        $$('a,button', bar).forEach(control => visible ? control.removeAttribute('tabindex') : control.tabIndex = -1);
      }
      // Latest start above 35% stays active through continuation blocks and gaps.
      const line = innerHeight * 0.35;
      const active = sections.filter(section => section.getBoundingClientRect().top <= line).at(-1)?.id || '';
      if (active !== lastActive) {
        lastActive = active;
        navLinks.forEach(link => {
          const current = link.hash === `#${active}`;
          link.classList.toggle('is-active', current);
          if (current) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      const max = root.scrollHeight - innerHeight;
      progress.style.setProperty('--progress', String(max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0));
      const height = footer.offsetHeight || 1;
      const uncovered = Math.max(0, Math.min(height, innerHeight - page.getBoundingClientRect().bottom));
      const p = root.classList.contains('footer-reveal') ? uncovered / height : 1;
      const rest = motion.matches ? 0 : 1 - p * p * (3 - 2 * p);
      footer.style.setProperty('--reveal-rest', String(rest));
      const width = mark.offsetWidth;
      let offset = width * (1 - 0.3 * rest), scale = 0.5 * rest;
      copies.forEach(copy => {
        copy.style.transform = `translate3d(${-offset}px,0,0) scaleX(${scale})`;
        copy.style.opacity = scale > 0.002 && !motion.matches ? '1' : '0';
        offset += width * scale;
        scale *= 0.62;
      });
    };
    function requestTick() { if (!frame) frame = requestAnimationFrame(paint); }
    on(window, 'scroll', requestTick, { passive: true });
    on(window, 'resize', () => { layoutNeeded = true; requestTick(); });
    on(window, 'load', () => { layoutNeeded = true; requestTick(); });
    on(motion, 'change', requestTick);
    on(document.fonts, 'loadingdone', () => { layoutNeeded = true; requestTick(); });
    const observer = new ResizeObserver(() => { layoutNeeded = true; requestTick(); });
    [footer, page, header, $('.nav-bar__inner'), $('.nav-bar__list')].forEach(element => observer.observe(element));
    cleanups.push(() => observer.disconnect());
    $('[data-year]').textContent = new Date().getFullYear();
    root.classList.add('js');
    paint();
    dispose = () => {
      closeMenu(false);
      lifecycle.abort();
      cleanups.forEach(cleanup => cleanup());
      cancelAnimationFrame(frame);
      root.classList.remove('js', 'footer-reveal');
      bar.inert = true;
      bar.setAttribute('aria-hidden', 'true');
      bar.classList.remove('is-visible');
    };
  };
  try { init(); } catch (error) {
    document.documentElement.classList.remove('js', 'footer-reveal');
    console.error('[Maiac] Enhancement unavailable:', error);
  }
  window.addEventListener('pagehide', () => dispose?.());
  window.addEventListener('pageshow', event => { if (event.persisted) init(); });
})();
