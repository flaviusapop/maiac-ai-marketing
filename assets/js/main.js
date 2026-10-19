/* Maiac AI Marketing local footer study. Native scrolling, SVG artwork and bounded Canvas 2D; no dependencies. */
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
    let atPageEnd = false, preservePageEnd = false;

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

    // Persistent narrowing artwork: scrolling uncovers it without changing its pose.
    const copies = Array.from({ length: 7 }, () => {
      const copy = mainMark.cloneNode(false);
      copy.className = 'site-footer__mark-copy';
      copy.alt = '';
      mark.insertBefore(copy, mainMark);
      return copy;
    });
    mark.classList.add('is-accordion');
    // User-selected exception: direct pointer/touch motion stays active under reduced
    // motion. Other page effects continue to honor the motion media query.
    const flowCanvas = document.createElement('canvas');
    flowCanvas.className = 'site-footer__flow';
    flowCanvas.setAttribute('aria-hidden', 'true');
    mark.append(flowCanvas);
    const columns = 24, rows = 28, count = (columns + 1) * (rows + 1);
    const flowX = new Float32Array(count), flowY = new Float32Array(count);
    let artWidth = 0, artHeight = 0, artDpr = 1, footerHeight = 1, geometry = [];
    let contours = null, contoursLoading = false, preparedPaths = [], pathsDirty = true, flowContext = null;
    let pointerPoint = null, pointerInput = null, velocityX = 0, velocityY = 0;
    let flowTime = 0, flowActive = false;
    let touchGesture = null, touchBlocked = false, touchMomentumUntil = 0;
    let lastTouchPosition = null, lastDirectTouchTime = -Infinity;
    const boundedScrollY = () => Math.max(0, Math.min(scrollY, root.scrollHeight - innerHeight));
    let lastScrollTop = boundedScrollY(), lastScrollTime = performance.now();
    const resetFlow = () => {
      flowX.fill(0); flowY.fill(0);
      pointerPoint = null; pointerInput = null; velocityX = 0; velocityY = 0;
      flowTime = 0; flowActive = false;
      mark.classList.remove('is-flowing');
    };
    const measureArt = () => {
      const rect = mark.getBoundingClientRect();
      artWidth = rect.width; artHeight = rect.height;
      artDpr = Math.min(devicePixelRatio || 1, 2);
      // Fill the footer vertically without changing the approved horizontal rhythm
      // when the viewport narrows. The SVG viewport itself keeps its native ratio.
      const sourceWidth = artHeight * 847 / 537;
      const mainWidth = artWidth / 3 * 847 / 537;
      let x = 0;
      geometry = [...copies].reverse().map((image, i) => {
        const width = mainWidth * 0.5 * 0.62 ** (6 - i);
        const item = { image, x, width };
        x += width;
        return item;
      });
      geometry.push({ image: mainMark, x, width: mainWidth });
      geometry.forEach(({ image, x, width }) => {
        // Keep the SVG viewport at its intrinsic aspect ratio before narrowing it.
        // A full-art-width viewport letterboxes the SVG, then squeezes it twice.
        image.style.inlineSize = `${sourceWidth}px`;
        image.style.transform = `translate3d(${x}px,0,0) scaleX(${width / sourceWidth})`;
        image.style.opacity = '1';
      });
      pathsDirty = true;
      resetFlow();
    };
    const loadContours = () => {
      if (contours || contoursLoading) return;
      contoursLoading = true;
      // Derived from the shipped SVG offline, so moving the mouse never has to
      // sample SVG geometry or import a graphics library.
      fetch(new URL('maiac-ma-contours.json', mainMark.src), { signal: lifecycle.signal })
        .then(response => { if (!response.ok) throw new Error(`Artwork data: ${response.status}`); return response.json(); })
        .then(data => { contours = data.paths; pathsDirty = true; })
        .catch(error => { if (error.name !== 'AbortError') console.warn('[Maiac] Cursor effect unavailable; static artwork retained.', error); });
    };
    const preparePaths = () => {
      if (!contours || !artWidth || !artHeight) return false;
      flowContext ||= flowCanvas.getContext('2d', { alpha: false });
      if (!flowContext) return false;
      if (pathsDirty) {
        flowCanvas.width = Math.ceil(artWidth * artDpr);
        flowCanvas.height = Math.ceil(artHeight * artDpr);
        preparedPaths = geometry.map(({ x, width }) => contours.map(glyph => glyph.map(contour => contour.map(([sourceX, sourceY]) => {
          const px = x + sourceX / 847 * width, py = sourceY / 537 * artHeight;
          const gx = Math.max(0, Math.min(columns, px / artWidth * columns));
          const gy = Math.max(0, Math.min(rows, py / artHeight * rows));
          const ix = Math.min(columns - 1, Math.floor(gx)), iy = Math.min(rows - 1, Math.floor(gy));
          const tx = gx - ix, ty = gy - iy, i = iy * (columns + 1) + ix;
          return [px, py, i, (1 - tx) * (1 - ty), tx * (1 - ty), (1 - tx) * ty, tx * ty];
        }))));
        pathsDirty = false;
      }
      return true;
    };
    // Original Canvas 2D contour renderer keeps curves continuous on every engine.
    // No WebGL, image readback, external code, scroll interception or idle render loop.
    const paintFlow = now => {
      if (!flowActive) return;
      if (document.hidden || !preparePaths()) { resetFlow(); return; }
      const elapsed = Math.max(1, Math.min(64, now - flowTime));
      const decay = Math.exp(-elapsed / 230);
      flowTime = now;
      let energy = 0;
      for (let i = 0; i < count; i++) {
        flowX[i] *= decay; flowY[i] *= decay;
      }
      if (pointerInput) {
        // Consume movement once per frame, independent of mouse polling frequency.
        const { x, y, dx, dy, start, time } = pointerInput;
        const dt = Math.max(8, Math.min(80, time - start));
        const smoothing = 1 - Math.exp(-elapsed / 24);
        velocityX += (dx / dt - velocityX) * smoothing;
        velocityY += (dy / dt - velocityY) * smoothing;
        const targetX = Math.min(160, artWidth * 0.115) * Math.tanh(velocityX * 0.85);
        const targetY = 36 * Math.tanh(velocityY * 0.65);
        const rx = Math.max(90, artWidth * 0.17), ry = Math.max(40, artHeight * 0.24);
        const response = 1 - Math.exp(-elapsed / 40);
        for (let row = 1; row < rows; row++) {
          const py = row / rows * artHeight;
          for (let col = 1; col < columns; col++) {
            const px = col / columns * artWidth, i = row * (columns + 1) + col;
            const influence = Math.exp(-0.5 * (((px - x) / rx) ** 2 + ((py - y) / ry) ** 2)) * Math.sin(Math.PI * row / rows) ** 2;
            const blend = response * influence;
            flowX[i] += (targetX - flowX[i]) * blend;
            flowY[i] += (targetY - flowY[i]) * blend;
          }
        }
        pointerInput = null;
      }
      for (let i = 0; i < count; i++) energy = Math.max(energy, Math.abs(flowX[i]), Math.abs(flowY[i]));
      if (energy < 0.12) { resetFlow(); return; }
      const ctx = flowContext;
      ctx.setTransform(artDpr, 0, 0, artDpr, 0, 0);
      ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0, 0, artWidth, artHeight);
      ctx.fillStyle = '#ffffff';
      for (const copy of preparedPaths) for (const glyph of copy) {
        ctx.beginPath();
        for (const contour of glyph) {
          for (let n = 0; n < contour.length; n++) {
            const [x, y, i, a, b, c, d] = contour[n], j = i + columns + 1;
            const dx = flowX[i] * a + flowX[i + 1] * b + flowX[j] * c + flowX[j + 1] * d;
            const dy = flowY[i] * a + flowY[i + 1] * b + flowY[j] * c + flowY[j + 1] * d;
            if (n) ctx.lineTo(x + dx, y + dy); else ctx.moveTo(x + dx, y + dy);
          }
          ctx.closePath();
        }
        ctx.fill('nonzero');
      }
      mark.classList.add('is-flowing');
      requestTick();
    };
    const queueFlow = ({ x, y, dx, dy, start, time, kind }) => {
      if (Math.abs(dx) + Math.abs(dy) <= 0.05 || menu.open || document.hidden) return false;
      // Native scroll is only a fallback; never add its force to a fresh finger sample.
      if (kind === 'scroll' && pointerInput && pointerInput.kind !== 'scroll') return false;
      if (pointerInput?.kind !== kind) pointerInput = null;
      pointerInput = {
        x, y, dx: (pointerInput?.dx || 0) + dx, dy: (pointerInput?.dy || 0) + dy,
        start: pointerInput?.start ?? start, time, kind,
      };
      if (!flowActive) flowTime = time;
      flowActive = true;
      requestTick();
      return true;
    };
    const visibleArtPoint = (clientX, clientY, clamp = false) => {
      const rect = mark.getBoundingClientRect();
      const top = Math.max(0, rect.top, root.classList.contains('footer-reveal') ? page.getBoundingClientRect().bottom : 0);
      const bottom = Math.min(innerHeight, rect.bottom);
      if (bottom <= top || (!clamp && (clientX < rect.left || clientX > rect.right || clientY < top || clientY > bottom))) return null;
      return {
        x: Math.max(0, Math.min(artWidth, clientX - rect.left)),
        y: Math.max(top, Math.min(bottom, clientY)) - rect.top,
      };
    };
    const stopTouch = (reset = true, blocked = false) => {
      touchGesture = null; touchMomentumUntil = 0; touchBlocked = blocked;
      lastTouchPosition = null; lastDirectTouchTime = -Infinity;
      if (reset) resetFlow();
    };
    on(footer, 'pointermove', event => {
      if (!['mouse', 'pen'].includes(event.pointerType) || touchGesture || document.hidden) return;
      const rect = mark.getBoundingClientRect(), now = performance.now();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      if (x < 0 || x > artWidth || y < 0 || y > artHeight) { pointerPoint = null; return; }
      if (pointerPoint) {
        const dx = x - pointerPoint.x, dy = y - pointerPoint.y;
        queueFlow({ x, y, dx, dy, start: pointerPoint.time, time: now, kind: 'pointer' });
      }
      pointerPoint = { x, y, time: now };
    }, { passive: true });
    ['pointerleave', 'pointercancel'].forEach(type => on(footer, type, () => { pointerPoint = null; }));
    // Passive TouchEvents survive native pan's pointercancel, so scrolling and
    // pinch zoom keep their browser behavior. No finger capture or touch-action override.
    on(document, 'touchstart', event => {
      // Warm the small artwork data on the first gesture, before a fast fling
      // reaches the footer on a slower mobile connection.
      if (event.touches.length === 1) loadContours();
      if (event.touches.length !== 1 || touchBlocked) { stopTouch(true, true); return; }
      stopTouch(false);
      pointerPoint = null;
      preservePageEnd = false;
      if (menu.open || document.hidden || event.target?.closest?.('a,button,input,textarea,select,[contenteditable],[data-team-scroller]')) return;
      const touch = event.touches[0], now = performance.now();
      touchGesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, time: now };
      lastTouchPosition = { x: touch.clientX, y: touch.clientY };
      lastScrollTop = boundedScrollY(); lastScrollTime = now;
    }, { passive: true });
    on(document, 'touchmove', event => {
      if (event.touches.length !== 1 || touchBlocked) { stopTouch(true, true); return; }
      if (!touchGesture || menu.open || document.hidden) return;
      const touch = Array.from(event.touches).find(item => item.identifier === touchGesture.id);
      if (!touch) { stopTouch(); return; }
      const now = performance.now(), point = visibleArtPoint(touch.clientX, touch.clientY);
      if (point && queueFlow({ ...point, dx: touch.clientX - touchGesture.x, dy: touch.clientY - touchGesture.y,
        start: touchGesture.time, time: now, kind: 'touch' })) {
        lastDirectTouchTime = now;
      }
      touchGesture = { ...touchGesture, x: touch.clientX, y: touch.clientY, time: now };
      lastTouchPosition = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    on(document, 'touchend', event => {
      if (touchBlocked) { if (!event.touches.length) stopTouch(); return; }
      if (touchGesture && !Array.from(event.touches).some(touch => touch.identifier === touchGesture.id)) {
        touchGesture = null;
        touchMomentumUntil = performance.now() + 900;
      }
    }, { passive: true });
    on(document, 'touchcancel', event => stopTouch(true, event.touches.length > 0), { passive: true });
    on(document, 'keydown', () => stopTouch());
    on(document, 'click', event => { if (event.target?.closest?.('a,button')) stopTouch(); });
    on(mainMark, 'load', () => { layoutNeeded = true; requestTick(); });
    on(document, 'visibilitychange', () => {
      stopTouch();
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else requestTick();
    });
    cleanups.push(() => { stopTouch(); copies.forEach(copy => copy.remove()); flowCanvas.remove(); mark.classList.remove('is-accordion'); mainMark.style.removeProperty('transform'); mainMark.style.removeProperty('inline-size'); });
    const measure = () => {
      // Both modes use the same natural height, so a short window cannot oscillate.
      const height = footer.getBoundingClientRect().height, fits = height <= innerHeight;
      footerHeight = height;
      root.classList.toggle('footer-reveal', fits);
      root.classList.toggle('no-footer-reveal', !fits);
      root.style.setProperty('--footer-h', `${height}px`);
      measureArt();
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
    const paint = (now = performance.now()) => {
      frame = 0;
      if (menu.open) { stopTouch(); return; }
      if (layoutNeeded) measure();
      if (preservePageEnd) {
        preservePageEnd = false;
        window.scrollTo({ top: root.scrollHeight, behavior: 'instant' });
      }
      atPageEnd = root.scrollHeight - innerHeight - scrollY <= 2;
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
      const height = footerHeight;
      const pageBottom = page.getBoundingClientRect().bottom;
      if (pageBottom < innerHeight + 600) loadContours();
      const uncovered = Math.max(0, Math.min(height, innerHeight - pageBottom));
      const p = root.classList.contains('footer-reveal') ? uncovered / height : 1;
      const rest = motion.matches ? 0 : 1 - p * p * (3 - 2 * p);
      footer.style.setProperty('--reveal-rest', String(rest));
      footer.style.setProperty('--reveal-progress', String(p));
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.bottom <= 0 || footerRect.top >= innerHeight || (!uncovered && root.classList.contains('footer-reveal'))) resetFlow();
      else paintFlow(now);
    };
    function requestTick() { if (!frame) frame = requestAnimationFrame(paint); }
    on(window, 'scroll', () => {
      const now = performance.now(), top = boundedScrollY(), delta = top - lastScrollTop;
      if ((touchGesture || now < touchMomentumUntil) && lastTouchPosition && !touchBlocked && !menu.open && !document.hidden && now - lastDirectTouchTime > 32 && Math.abs(delta) < Math.min(500, innerHeight * 0.75)) {
        const point = visibleArtPoint(lastTouchPosition.x, lastTouchPosition.y, true);
        if (point) queueFlow({ ...point, dx: 0, dy: -delta, start: lastScrollTime, time: now, kind: 'scroll' });
      }
      lastScrollTop = top; lastScrollTime = now;
      requestTick();
    }, { passive: true });
    on(window, 'resize', () => {
      // Retain a fully uncovered footer across responsive reflow without moving
      // readers who were part-way through the page before the resize.
      preservePageEnd ||= atPageEnd && !touchGesture;
      touchMomentumUntil = 0;
      lastScrollTop = boundedScrollY(); lastScrollTime = performance.now();
      layoutNeeded = true;
      requestTick();
    });
    on(window, 'load', () => { layoutNeeded = true; requestTick(); });
    on(motion, 'change', requestTick);
    on(document.fonts, 'loadingdone', () => { layoutNeeded = true; requestTick(); });
    const observer = new ResizeObserver(() => { layoutNeeded = true; requestTick(); });
    [footer, mark, page, header, $('.nav-bar__inner'), $('.nav-bar__list')].forEach(element => observer.observe(element));
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
