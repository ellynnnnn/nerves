/*
 * intro.js — the loading page: soft glows, the title and a spinner.
 * When everything is ready, the page opens from the centre.
 */
(function () {
  const intro = document.getElementById('intro');
  const MIN_SECONDS = 3;   // the loading page stays at least this long

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const minTime = new Promise((resolve) => setTimeout(resolve, MIN_SECONDS * 1000));
  Promise.all([fontsReady, minTime]).then(open);

  let opening = false;
  function open() {
    if (opening) return;
    opening = true;
    intro.classList.add('opening');
    document.body.classList.remove('intro-open');
    const t0 = performance.now(), DURATION = 1700;
    (function grow(now) {
      const k = Math.min(1, (now - t0) / DURATION);
      const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      intro.style.setProperty('--hole', (ease * 130).toFixed(2) + 'vmax');
      if (k < 1) requestAnimationFrame(grow);
      else {
        intro.hidden = true;
        document.getElementById('situation').focus({ preventScroll: true });
      }
    })(t0);
  }

  // Enter or Escape skips the loading page
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') open();
  });
})();
