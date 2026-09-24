/*
 * intro.js — the loading page.
 * Colour glows + flying dots in the background, and in the centre an ASCII
 * animation: a body builds itself, becomes a beating heart, then the word
 * NERVES, which melts into the real title. Then the page opens.
 */
(function () {
  const intro = document.getElementById('intro');
  const pre = document.getElementById('ascii');
  const words = document.getElementById('introWords');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Timeline, in seconds (change these to make the intro faster or slower)
  const T = {
    build: [0.2, 3.0],     // the body builds itself, from the feet to the head
    toHeart: [3.8, 5.2],   // the body turns into a heart
    beat: [5.2, 7.0],      // the heart beats
    toText: [7.0, 8.4],    // the heart turns into the word NERVES
    title: 9.4,            // the ASCII melts into the real title
    open: 11.6,            // the page opens
  };
  if (reduceMotion) Object.assign(T, { build: [0, 0.1], toHeart: [0.1, 0.2], beat: [0.2, 0.3], toText: [0.3, 0.4], title: 0.4, open: 2.6 });

  /* ---------- ASCII grid ---------- */
  const COLS = 64, ROWS = 46;
  const CW = 6, CH = 10;                  // a character is about 6 wide for 10 high
  const W = COLS * CW, H = ROWS * CH;
  const N = COLS * ROWS;
  const CHARS = ' .,:;!*+a2S$0Q%&8@';
  const SCRAMBLE = '!*+a2S$0Q%&8@#?/\\<>';

  // Draw a shape on a hidden canvas, then measure how much of each character cell it covers.
  function mask(draw) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    draw(g);
    const data = g.getImageData(0, 0, W, H).data;
    const out = new Float32Array(N);
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        let sum = 0;
        for (let y = r * CH; y < (r + 1) * CH; y += 2) {
          for (let x = col * CW; x < (col + 1) * CW; x += 2) sum += data[(y * W + x) * 4 + 3];
        }
        out[r * COLS + col] = sum / (255 * (CW / 2) * (CH / 2));
      }
    }
    return out;
  }

  function silhouette() {
    const mirror = (x) => 400 - x;
    let d = `M${SILHOUETTE_START.join(',')}`;
    for (const s of SILHOUETTE_RIGHT) d += ` C${s.join(',')}`;
    for (let i = SILHOUETTE_RIGHT.length - 1; i >= 0; i--) {
      const s = SILHOUETTE_RIGHT[i];
      const end = i > 0 ? SILHOUETTE_RIGHT[i - 1].slice(4) : SILHOUETTE_START;
      d += ` C${mirror(s[2])},${s[3]},${mirror(s[0])},${s[1]},${mirror(end[0])},${end[1]}`;
    }
    return new Path2D(d + 'Z');
  }

  const bodyMask = mask((g) => {
    const sc = (H - 16) / 778;              // the body is 778 units tall (y 24 → 802)
    g.translate(W / 2 - 200 * sc, 8 - 24 * sc);
    g.scale(sc, sc);
    g.fill(silhouette());
  });

  function heart(scale) {
    return mask((g) => {
      const k = 9.2 * scale;
      g.translate(W / 2, H / 2 - 10);
      g.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        g.lineTo(x * k, -y * k);
      }
      g.fill();
    });
  }
  const heartSmall = heart(1), heartBig = heart(1.1);

  const textMask = mask((g) => {
    g.font = '900 100px system-ui, "Arial Black", sans-serif';
    const w = g.measureText('NERVES').width;
    const size = 100 * (W - 20) / w;
    g.font = `900 ${size}px system-ui, "Arial Black", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.translate(W / 2, H / 2);
    g.scale(1, 2.4);                        // tall letters, like an ASCII banner
    g.fillText('NERVES', 0, 0);
    g.lineWidth = size * 0.06;              // thicker letters, easier to read in characters
    g.lineJoin = 'round';
    g.strokeText('NERVES', 0, 0);
  });

  // Each cell changes shape at its own moment: it looks organic, not mechanical.
  const rnd = () => Math.random();
  const switchAt = [
    Float32Array.from({ length: N }, (_, i) => {
      const fromBottom = 1 - Math.floor(i / COLS) / ROWS;       // build from the feet up
      return T.build[0] + (T.build[1] - T.build[0]) * (0.75 * fromBottom + 0.25 * rnd());
    }),
    Float32Array.from({ length: N }, () => T.toHeart[0] + (T.toHeart[1] - T.toHeart[0]) * rnd()),
    Float32Array.from({ length: N }, () => T.toText[0] + (T.toText[1] - T.toText[0]) * rnd()),
  ];
  const noise = Float32Array.from({ length: N }, rnd);

  function heartbeat(t) {
    const x = (t * 1.2) % 1;
    return Math.exp(-(((x - 0.1) / 0.07) ** 2)) + 0.7 * Math.exp(-(((x - 0.32) / 0.07) ** 2));
  }

  function shapeValue(k, i, t) {
    if (k === 1) return bodyMask[i];
    if (k === 2) return (t > T.beat[0] && heartbeat(t - T.beat[0]) > 0.5 ? heartBig : heartSmall)[i];
    if (k === 3) return textMask[i];
    return 0;
  }

  function renderAscii(t) {
    let out = '';
    for (let i = 0; i < N; i++) {
      if (i && i % COLS === 0) out += '\n';
      let k = 0, since = 99;
      for (let s = switchAt.length - 1; s >= 0; s--) {
        if (t >= switchAt[s][i]) { k = s + 1; since = t - switchAt[s][i]; break; }
      }
      const v = shapeValue(k, i, t);
      const before = k > 0 ? shapeValue(k - 1, i, t) : 0;
      if (since < 0.22 && (v > 0.1 || before > 0.1)) {
        out += SCRAMBLE[Math.floor(rnd() * SCRAMBLE.length)];       // the character is "changing"
      } else if (v > 0.12) {
        const d = v * (0.35 + 0.65 * noise[i]);
        out += CHARS[1 + Math.floor(d * (CHARS.length - 2))];
      } else {
        out += ' ';
      }
    }
    pre.textContent = out;
    // a few characters shimmer
    for (let j = 0; j < 60; j++) noise[Math.floor(rnd() * N)] = rnd();
  }

  function fitAscii() {
    const size = Math.min(13, (innerWidth - 32) / (COLS * 0.61), (innerHeight * 0.7) / ROWS);
    pre.style.fontSize = size.toFixed(2) + 'px';
  }
  fitAscii();
  window.addEventListener('resize', fitAscii);

  /* ---------- Flying dots in the background ---------- */
  const canvas = document.getElementById('introCanvas');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#ffffff', '#ffd23f', '#ff7aa8', '#7fb2ff', '#b28dff', '#2ec4b6'];
  const sprites = COLORS.map((c) => {
    const s = document.createElement('canvas');
    s.width = s.height = 48;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, c);
    grad.addColorStop(0.5, c + '55');
    grad.addColorStop(1, c + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, 48, 48);
    return s;
  });
  let dpr = 1;
  function resizeCanvas() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  const flyers = Array.from({ length: 80 }, () => ({
    x: rnd() * innerWidth, y: rnd() * innerHeight,
    speed: 30 + rnd() * 90, size: 4 + rnd() * 9, phase: rnd() * 10,
    sprite: sprites[Math.floor(rnd() * sprites.length)],
  }));

  function renderDots(dt, time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // fade the previous frame a little: this leaves a trail behind each dot
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = document.documentElement.dataset.theme === 'dark' ? 'lighter' : 'source-over';
    for (const f of flyers) {
      // they follow invisible, curving currents (like signals in the nerves)
      const a = Math.sin(f.y * 0.004 + time * 0.25 + f.phase) + Math.cos(f.x * 0.003 - time * 0.2);
      f.x += Math.cos(a * 1.6) * f.speed * dt;
      f.y += Math.sin(a * 1.6) * f.speed * dt;
      if (f.x < -20) f.x = innerWidth + 20; else if (f.x > innerWidth + 20) f.x = -20;
      if (f.y < -20) f.y = innerHeight + 20; else if (f.y > innerHeight + 20) f.y = -20;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(f.sprite, f.x - f.size / 2, f.y - f.size / 2, f.size, f.size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- Timeline ---------- */
  let start = performance.now(), last = start, lastAscii = 0, running = true, opening = false, titleShown = false;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - start) / 1000;
    renderDots(dt, t);
    if (!titleShown && now - lastAscii > 50) {          // the ASCII changes 20 times per second
      renderAscii(t);
      lastAscii = now;
    }
    if (!titleShown && t >= T.title) {
      titleShown = true;
      pre.classList.add('fade');
      words.classList.add('show');
    }
    if (!opening && t >= T.open) open();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

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
        running = false;
        intro.hidden = true;
        document.getElementById('situation').focus({ preventScroll: true });
      }
    })(t0);
  }

  document.getElementById('skip').addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === 'Escape') && !opening) open();
  });
})();
