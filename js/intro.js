/*
 * intro.js — the home / loading page.
 * A close-up of the body that slowly zooms out, with glowing dots
 * travelling along the nerves, then an "Enter" button.
 */
(function () {
  const intro = document.getElementById('intro');
  const canvas = document.getElementById('introCanvas');
  const ctx = canvas.getContext('2d');
  const VB = { x: -60, y: -20, w: 520, h: 850 };
  const LOAD_SECONDS = 3.6;   // minimum time the loading bar takes

  /* ---------- The glowing body shape ---------- */
  (function drawShape() {
    const mirror = (x) => 400 - x;
    let d = `M${SILHOUETTE_START.join(',')}`;
    for (const s of SILHOUETTE_RIGHT) d += ` C${s.join(',')}`;
    for (let i = SILHOUETTE_RIGHT.length - 1; i >= 0; i--) {
      const s = SILHOUETTE_RIGHT[i];
      const end = i > 0 ? SILHOUETTE_RIGHT[i - 1].slice(4) : SILHOUETTE_START;
      d += ` C${mirror(s[2])},${s[3]},${mirror(s[0])},${s[1]},${mirror(end[0])},${end[1]}`;
    }
    document.getElementById('introShape').setAttribute('d', d + 'Z');
  })();

  /* ---------- Nerves to draw ---------- */
  const strands = buildNerveStrands();
  // a small web of neurons in the head
  let seed = 5;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pts = Array.from({ length: 38 }, () => {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand());
    return { x: 200 + Math.cos(a) * r * 42, y: 86 + Math.sin(a) * r * 50 };
  });
  pts.forEach((p, i) => {
    pts.map((q, j) => ({ q, d: Math.hypot(p.x - q.x, p.y - q.y), j }))
      .filter((o) => o.j > i).sort((a, b) => a.d - b.d).slice(0, 2)
      .forEach((o) => strands.push([p, o.q]));
  });

  // length of each strand, to move the dots at a constant speed
  const lines = strands.map((pts) => {
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts, acc, len: acc[acc.length - 1] };
  }).filter((l) => l.len > 4);
  const totalLen = lines.reduce((s, l) => s + l.len, 0);
  function randomLine() {
    let r = Math.random() * totalLen;
    for (const l of lines) { r -= l.len; if (r <= 0) return l; }
    return lines[0];
  }
  function pointAt(l, s) {
    let i = 1;
    while (i < l.acc.length - 1 && l.acc[i] < s) i++;
    const a = l.pts[i - 1], b = l.pts[i];
    const t = (s - l.acc[i - 1]) / ((l.acc[i] - l.acc[i - 1]) || 1);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /* ---------- Glowing dot images (drawn once, reused) ---------- */
  const COLORS = ['#ffffff', '#ffd6a5', '#ffadc6', '#a0c4ff', '#bdb2ff', '#b9f3d0'];
  const sprites = COLORS.map((c) => {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.18, c);
    grad.addColorStop(0.45, c + '66');
    grad.addColorStop(1, c + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  });

  const dots = Array.from({ length: 110 }, () => newDot(true));
  function newDot(anywhere) {
    const l = randomLine();
    const back = Math.random() < 0.4;   // some signals go up to the brain, some go down
    return {
      l, back, s: anywhere ? Math.random() * l.len : 0,
      speed: 25 + Math.random() * 70, size: 5 + Math.random() * 7,
      sprite: sprites[Math.floor(Math.random() * sprites.length)],
    };
  }

  /* ---------- Drawing ---------- */
  const staticLayer = document.createElement('canvas');
  let scale = 1;
  function resize() {
    // extra resolution, because the page starts zoomed in
    const ratio = Math.min(3, (window.devicePixelRatio || 1) * 1.8);
    const box = canvas.parentElement;   // offsetWidth ignores the zoom animation
    canvas.width = staticLayer.width = Math.round(box.offsetWidth * ratio);
    canvas.height = staticLayer.height = Math.round(box.offsetHeight * ratio);
    scale = canvas.width / VB.w;
    drawStatic();
  }
  function toCanvas(g) { g.setTransform(scale, 0, 0, scale, -VB.x * scale, -VB.y * scale); }
  function drawStatic() {
    const g = staticLayer.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, staticLayer.width, staticLayer.height);
    toCanvas(g);
    const dark = document.documentElement.dataset.theme === 'dark';
    g.strokeStyle = dark ? 'rgba(255,255,255,0.32)' : 'rgba(110,95,160,0.32)';
    g.lineWidth = 0.6;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    for (const l of lines) {
      g.moveTo(l.pts[0].x, l.pts[0].y);
      for (let i = 1; i < l.pts.length; i++) g.lineTo(l.pts[i].x, l.pts[i].y);
    }
    g.stroke();
  }

  let running = true, last = performance.now();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(staticLayer, 0, 0);
    toCanvas(ctx);
    ctx.globalCompositeOperation = document.documentElement.dataset.theme === 'dark' ? 'lighter' : 'source-over';
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.s += d.speed * dt;
      if (d.s > d.l.len) { dots[i] = newDot(false); continue; }
      const fade = Math.min(1, d.s / 12, (d.l.len - d.s) / 12);
      // small tail behind each dot
      for (let k = 3; k >= 0; k--) {
        const s = d.s - k * 3;
        if (s < 0) continue;
        const p = pointAt(d.l, d.back ? d.l.len - s : s);
        const r = d.size * (1 - k * 0.2);
        ctx.globalAlpha = fade * (1 - k * 0.24);
        ctx.drawImage(d.sprite, p.x - r / 2, p.y - r / 2, r, r);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  new MutationObserver(drawStatic).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  requestAnimationFrame(frame);

  /* ---------- Loading bar, then "Enter" ---------- */
  const fill = document.getElementById('loaderFill'), pct = document.getElementById('loaderPct');
  const loader = document.getElementById('loader'), enter = document.getElementById('enter');
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  let ready = false;
  fontsReady.then(() => { ready = true; });
  const start = performance.now();
  (function progress(now) {
    const k = Math.min(1, (now - start) / (LOAD_SECONDS * 1000));
    const eased = 1 - Math.pow(1 - k, 2.2);
    const shown = ready ? eased : Math.min(eased, 0.92);
    fill.style.width = (shown * 100).toFixed(1) + '%';
    pct.textContent = Math.round(shown * 100) + '%';
    if (shown >= 1) {
      loader.classList.add('done');
      enter.hidden = false;
      return;
    }
    requestAnimationFrame(progress);
  })(start);

  function leave() {
    if (enter.hidden || intro.classList.contains('leaving')) return;
    intro.classList.add('leaving');
    document.body.classList.remove('intro-open');
    setTimeout(() => {
      running = false;
      intro.hidden = true;
      document.getElementById('situation').focus({ preventScroll: true });
    }, 1500);
  }
  enter.addEventListener('click', leave);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !intro.hidden && document.body.classList.contains('intro-open')) leave();
  });
})();
