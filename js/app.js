/*
 * app.js — draws the body and runs the animation.
 * You normally don't need to change this file: colours, speeds and journeys
 * are all in emotions.js, and body positions are in body.js.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const svg = $('#body');
  const VB = { x: -60, y: -20, w: 520, h: 850 };   // must match the viewBox in index.html

  const PHASE_SECONDS = 8;       // how long each emotion leads
  const PERCEPTION_SECONDS = 5.5;
  const MIX_SECONDS = 10;
  const MAX_DOTS = 40;
  const BLOB_COUNT = 11;
  const SPARKLE_POOL = 40;
  const MAX_PULSE_HZ = 1.4;      // never pulse faster than this (comfort for the eyes)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f = (n) => n.toFixed(1);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isDark = () => document.documentElement.dataset.theme === 'dark';

  /* ---------- Colours ---------- */
  const hexCache = {};
  const hex = (h) => hexCache[h] || (hexCache[h] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  const lerpRGB = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(3)})`;

  /* ---------- Silhouette ---------- */
  function silhouettePath() {
    const mirror = (x) => 400 - x;
    let d = `M${SILHOUETTE_START[0]},${SILHOUETTE_START[1]}`;
    for (const s of SILHOUETTE_RIGHT) d += ` C${s.join(',')}`;
    for (let i = SILHOUETTE_RIGHT.length - 1; i >= 0; i--) {
      const s = SILHOUETTE_RIGHT[i];
      const end = i > 0 ? SILHOUETTE_RIGHT[i - 1].slice(4) : SILHOUETTE_START;
      d += ` C${mirror(s[2])},${s[3]},${mirror(s[0])},${s[1]},${mirror(end[0])},${end[1]}`;
    }
    return d + 'Z';
  }
  const BODY_D = silhouettePath();
  ['#clipShape', '#clipShapeLayer', '#bodyBase', '#bodyRim'].forEach((id) => $(id).setAttribute('d', BODY_D));

  /* ---------- Nerve edges (each connection is one curve) ---------- */
  const EDGES = {};
  const key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  const P = (n) => NODES[n];

  // Smooth curve through a chain of nodes (Catmull-Rom spline).
  function addChain(names, width) {
    const pts = names.map(P);
    for (let i = 0; i < pts.length - 1; i++) {
      const k = key(names[i], names[i + 1]);
      if (EDGES[k]) continue;
      let c1, c2;
      if (pts.length === 2) {
        [c1, c2] = bentControls(names[0], names[1]);
      } else {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
        c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      }
      EDGES[k] = { a: names[i], b: names[i + 1], c1, c2, width: width || 0.9 };
    }
  }
  // A gently curved line between two nodes (the same curve in both directions).
  function bentControls(na, nb) {
    const a = P(na), b = P(nb);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const side = (na < nb ? 1 : -1) * 0.12 * len;
    const nx = (-dy / len) * side, ny = (dx / len) * side;
    return [
      { x: a.x + dx / 3 + nx, y: a.y + dy / 3 + ny },
      { x: a.x + (2 * dx) / 3 + nx, y: a.y + (2 * dy) / 3 + ny },
    ];
  }

  CHAINS.forEach((c) => addChain(c.nodes, c.width));
  // Make sure every journey in emotions.js follows a drawn nerve.
  const allRouteSets = Object.values(EMOTIONS).concat(Object.keys(SENSES).map((s) => buildPerception([s])));
  allRouteSets.forEach((e) => e.routes.forEach((r) => r.paths.forEach((p) => {
    for (let i = 0; i < p.length - 1; i++) if (!EDGES[key(p[i], p[i + 1])]) addChain([p[i], p[i + 1]]);
  })));

  const nervesG = $('#nerves');
  Object.values(EDGES).forEach((e) => {
    const a = P(e.a), b = P(e.b);
    el('path', {
      d: `M${a.x},${a.y} C${f(e.c1.x)},${f(e.c1.y)} ${f(e.c2.x)},${f(e.c2.y)} ${b.x},${b.y}`,
      fill: 'none', 'stroke-width': e.width, 'stroke-linecap': 'round',
    }, nervesG);
  });

  /* ---------- Fine decorative nerves (the "web") ---------- */
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const rand = rng(7);
  function bez(a, c1, c2, b, t) {
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
      y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
    };
  }
  let fine = '';
  function twig(x, y, ang, len, depth) {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    const bend = (rand() - 0.5) * len * 0.5;
    const mx = (x + ex) / 2 - Math.sin(ang) * bend, my = (y + ey) / 2 + Math.cos(ang) * bend;
    fine += `M${f(x)},${f(y)} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)} `;
    if (depth > 0) {
      twig(mx, my, ang + 0.7 + rand() * 0.3, len * 0.55, depth - 1);
      twig(ex, ey, ang - 0.4 - rand() * 0.3, len * 0.5, depth - 1);
    }
  }
  Object.values(EDGES).forEach((e) => {
    const a = P(e.a), b = P(e.b);
    if (a.type === 'brain' && b.type === 'brain') return;
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    const count = Math.floor(L / 22);
    for (let i = 1; i <= count; i++) {
      const t = i / (count + 1);
      const p = bez(a, e.c1, e.c2, b, t), q = bez(a, e.c1, e.c2, b, t + 0.01);
      const ang = Math.atan2(q.y - p.y, q.x - p.x) + (i % 2 ? 1 : -1) * (1.1 + rand() * 0.5);
      twig(p.x, p.y, ang, 10 + rand() * 16, 2);
    }
  });
  for (let y = 214; y < 360; y += 15) {           // nerves between the ribs
    const w = 64 - (y - 214) * 0.08;
    fine += `M200,${y} Q${200 + w * 0.6},${y - 4} ${f(200 + w)},${y + 14} M200,${y} Q${200 - w * 0.6},${y - 4} ${f(200 - w)},${y + 14} `;
  }
  const brainPts = [];                              // web of neurons in the brain
  for (let i = 0; i < 90; i++) {
    const t = rand() * Math.PI * 2, r = Math.sqrt(rand());
    brainPts.push({ x: 200 + Math.cos(t) * r * 42, y: 86 + Math.sin(t) * r * 50 });
  }
  brainPts.forEach((p, i) => {
    brainPts.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
      .filter((o) => o.j > i).sort((m, n) => m.d - n.d).slice(0, 2)
      .forEach((o) => { const q = brainPts[o.j]; fine += `M${f(p.x)},${f(p.y)} L${f(q.x)},${f(q.y)} `; });
  });
  el('path', { d: fine, fill: 'none', 'stroke-width': 0.5 }, $('#fine'));

  /* ---------- Bundles of nerve strands (see BUNDLES in body.js) ---------- */
  const strandD = buildNerveStrands().map((line) => 'M' + line.map((p) => `${f(p.x)},${f(p.y)}`).join(' L')).join(' ');
  el('path', { d: strandD, fill: 'none', 'stroke-width': 0.55, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $('#strands'));

  /* ---------- Glow inside the body (like the reference: light coming from within) ---------- */
  const defs = svg.querySelector('defs');
  function radial(id) {
    const g = el('radialGradient', { id, cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    return [
      el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 1 }, g),
      el('stop', { offset: 0.45, 'stop-color': '#fff', 'stop-opacity': 0.55 }, g),
      el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, g),
    ];
  }
  const innerG = $('#innerGlow');
  const coreStops = radial('coreColor');
  const core = el('ellipse', { cx: 200, cy: 300, rx: 95, ry: 175, fill: 'url(#coreColor)', opacity: 0 }, innerG);
  const headStops = radial('headColor');
  const headGlow = el('ellipse', { cx: 200, cy: 92, rx: 52, ry: 58, fill: 'url(#headColor)', opacity: 0 }, innerG);

  /* ---------- Nodes, labels ---------- */
  const nodeState = {};
  const nodesG = $('#nodes'), labelsG = $('#labels');
  const tooltip = $('#tooltip');
  Object.entries(NODES).forEach(([name, n], idx) => {
    const r = n.type === 'organ' ? 3.4 : n.type === 'nerve' ? 2 : 2.5;
    const g = el('g', {}, nodesG);
    const halo = el('circle', { cx: n.x, cy: n.y, r: 7, fill: '#fff', opacity: 0, filter: 'url(#glow)' }, g);
    const coreDot = el('circle', {
      cx: n.x, cy: n.y, r, class: n.type === 'sense' ? 'node-ring' : 'node-core', 'stroke-width': 1,
    }, g);
    const hit = el('circle', { cx: n.x, cy: n.y, r: 9, fill: 'transparent', style: 'cursor:help' }, g);
    hit.addEventListener('mouseenter', () => showTip(n));
    hit.addEventListener('mouseleave', () => { tooltip.hidden = true; });

    const right = n.x >= 200;
    const label = el('text', {
      x: n.x + (right ? 8 : -8), y: n.y + 3, 'text-anchor': right ? 'start' : 'end', class: 'node-label', opacity: 0,
    }, labelsG);
    label.textContent = n.label;

    const stops = radial('hot-' + name);
    const hot = el('circle', { cx: n.x, cy: n.y, r: n.type === 'organ' ? 38 : 24, fill: `url(#hot-${name})`, opacity: 0 }, innerG);
    nodeState[name] = { halo, core: coreDot, label, hot, stops, flare: 0, labelT: 0, heat: 0, r, idx, color: [255, 255, 255] };
  });

  function showTip(n) {
    const pt = svg.createSVGPoint();
    pt.x = n.x; pt.y = n.y;
    const s = pt.matrixTransform(svg.getScreenCTM());
    tooltip.innerHTML = `<strong>${n.label}</strong>${n.role}`;
    tooltip.hidden = false;
    const w = tooltip.offsetWidth;
    tooltip.style.left = (s.x + 14 + w > innerWidth ? s.x - 14 - w : s.x + 14) + 'px';
    tooltip.style.top = s.y - 12 + 'px';
  }

  /* ---------- Aura clouds (many colours at the same time) ---------- */
  const auraEl = $('#aura');
  const ANCHORS = [[200, 70], [200, 220], [140, 300], [260, 300], [200, 390], [95, 430], [305, 430],
    [170, 540], [235, 610], [200, 740], [200, 150]];
  const SIZES = [380, 460, 380, 380, 480, 340, 340, 420, 420, 380, 320];
  const blobs = ANCHORS.map(([x, y], i) => {
    const d = document.createElement('div');
    d.className = 'blob';
    d.style.width = (SIZES[i] / VB.w) * 100 + '%';
    d.style.aspectRatio = '1';
    d.style.left = ((x - VB.x) / VB.w) * 100 + '%';
    d.style.top = ((y - VB.y) / VB.h) * 100 + '%';
    auraEl.appendChild(d);
    return { el: d, x, y, color: [200, 210, 240], alpha: 0, seed: i * 1.7, owner: null };
  });
  // how the aura is shaped for each emotion (from the "aura forms" reference)
  const SHAPE = {
    love: { spread: 0.75, sink: 0 }, joy: { spread: 1.3, sink: -10 }, calm: { spread: 1.2, sink: 0 },
    surprise: { spread: 1.2, sink: -15 }, sadness: { spread: 0.95, sink: 30 }, fear: { spread: 0.9, sink: 0 },
    anger: { spread: 1.05, sink: -10 }, shame: { spread: 0.85, sink: -20 },
  };
  let pxPerUnit = 1;
  const measureFigure = () => { pxPerUnit = $('#figure').clientWidth / VB.w; };
  window.addEventListener('resize', measureFigure);
  measureFigure();

  /* ---------- Floating sparkles ---------- */
  const sparkG = $('#sparkles');
  sparkG.setAttribute('filter', 'url(#glow)');
  const sparkles = Array.from({ length: SPARKLE_POOL }, () => ({
    el: el('circle', { r: 2, opacity: 0 }, sparkG), live: false,
  }));

  /* ---------- Journeys ---------- */
  const measure = el('path', { fill: 'none', stroke: 'none' }, svg);
  const routeCache = {};
  function buildRoute(names) {
    const k = names.join('>');
    if (routeCache[k]) return routeCache[k];
    let d = `M${P(names[0]).x},${P(names[0]).y}`;
    const stops = [];
    for (let i = 0; i < names.length - 1; i++) {
      const e = EDGES[key(names[i], names[i + 1])];
      const fwd = e.a === names[i];
      const [c1, c2] = fwd ? [e.c1, e.c2] : [e.c2, e.c1];
      const end = P(names[i + 1]);
      d += ` C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${end.x},${end.y}`;
      measure.setAttribute('d', d);
      stops.push({ at: measure.getTotalLength(), node: names[i + 1] });
    }
    return (routeCache[k] = { d, total: stops[stops.length - 1].at, stops, first: names[0] });
  }

  // A tapered comet tail: 3 layers, from a long faint one to a short bright one.
  const TAIL = [{ len: 64, w: 0.8, o: 0.28 }, { len: 34, w: 1.5, o: 0.55 }, { len: 12, w: 2.6, o: 0.95 }];
  const TAIL_MAX = 64;
  const dots = [];
  const trailsG = $('#trails'), afterG = $('#afterglow');
  function launchPath(names, emo, delay) {
    if (dots.length >= MAX_DOTS) return;
    const route = buildRoute(names);
    const color = isDark() ? emo.dot : emo.ink;
    const after = el('path', {
      d: route.d, fill: 'none', stroke: color, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0,
      'stroke-dasharray': `${route.total} ${route.total + 10}`, 'stroke-dashoffset': route.total,
    }, afterG);
    const g = el('g', { opacity: 0 }, trailsG);
    const tails = TAIL.map((t) => el('path', {
      d: route.d, fill: 'none', stroke: color, 'stroke-width': t.w, 'stroke-linecap': 'round', opacity: t.o,
      'stroke-dasharray': `${t.len} ${route.total + t.len * 2}`,
    }, g));
    const halo = el('circle', { r: 6, fill: color, opacity: 0.3, filter: 'url(#glow)' }, g);
    const head = el('circle', { r: 2.3, fill: isDark() ? '#fff' : color, filter: 'url(#glow)' }, g);
    dots.push({ route, g, after, tails, halo, head, color, s: 0, delay: delay || 0, next: 0, fade: 0,
      speed: emo.speed * (0.85 + Math.random() * 0.3) * (reduceMotion ? 0.7 : 1), started: false });
  }
  function launch(route, emo, delay) {
    route.paths.forEach((p, i) => launchPath(p, emo, (delay || 0) + i * 0.05));
    if (route.caption) setCaption(route.caption);
  }

  /* ---------- Ripples & synapse sparks when a signal arrives ---------- */
  const ripplesG = $('#ripples');
  const ripples = [];
  function ripple(name, color, big) {
    if (ripples.length > 70) return;
    const n = P(name);
    ripples.push({ el: el('circle', { cx: n.x, cy: n.y, r: 3, fill: 'none', stroke: color, 'stroke-width': 1 }, ripplesG),
      t: 0, dur: big ? 1.2 : 0.8, max: big ? 22 : 13, type: 'ring' });
    if (!big) return;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
      ripples.push({ el: el('circle', { cx: n.x, cy: n.y, r: 1.2, fill: color }, ripplesG),
        t: 0, dur: 0.7, type: 'spark', x: n.x, y: n.y, dx: Math.cos(a), dy: Math.sin(a), dist: 12 + Math.random() * 10 });
    }
  }

  /* ---------- Caption ---------- */
  const captionEl = $('#caption'), capEmo = $('#captionEmotion'), capText = $('#captionText');
  let captionTimer = null;
  function setCaption(text) {
    if (capText.textContent === text && captionEl.classList.contains('show')) return;
    captionEl.classList.remove('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => {
      capEmo.textContent = current().label;
      capText.textContent = text;
      captionEl.classList.add('show');
    }, 350);
  }

  /* ---------- Pulse shapes ---------- */
  const WAVES = {
    sine: (p) => 0.5 + 0.5 * Math.sin(p * Math.PI * 2),
    heartbeat: (p) => { const x = p % 1; return Math.min(1, Math.exp(-(((x - 0.12) / 0.08) ** 2)) + 0.6 * Math.exp(-(((x - 0.36) / 0.08) ** 2))); },
    flicker: (p) => clamp(0.5 + 0.3 * Math.sin(p * 6.283) + 0.12 * Math.sin(p * 11.1 + 1) + 0.08 * Math.sin(p * 17.3 + 2), 0, 1),
    sharp: (p) => { const x = p % 1; return x < 0.25 ? x / 0.25 : Math.exp(-(x - 0.25) * 3); },
    wobble: (p) => 0.5 + 0.5 * Math.sin(p * 6.283 + 0.9 * Math.sin(p * 3.1)),
    spike: (p) => Math.exp(-(p % 1) * 3.5),
  };
  // Faster rhythm = smaller brightness change, so it never flashes in your eyes.
  const safeAmp = (hz) => clamp(0.34 / (1 + Math.max(0, hz - 0.4) * 1.8), 0.07, 0.34) * (reduceMotion ? 0.5 : 1);

  /* ---------- Timeline ---------- */
  const S = {
    phases: [], index: 0, loopFrom: 0, phaseT: 0, time: 0, drift: 0,
    hz: 0.15, fromHz: 0.15, pulsePhase: 0, wave: 'sine', fromWave: 'sine', blend: 1,
    spawnT: 0, routeIdx: 0, weights: {}, order: [], perception: null,
  };
  let paused = false, namesOn = true, emotionKeys = [];

  const emoOf = (k) => (k === 'perception' ? S.perception : EMOTIONS[k]);
  function current() { return S.phases[S.index]; }

  function setTimeline(phases, loopFrom, order) {
    S.phases = phases; S.loopFrom = loopFrom; S.index = 0; S.order = order;
    dots.splice(0).forEach((d) => { d.g.remove(); d.after.remove(); });
    enterPhase();
  }
  function enterPhase() {
    S.fromHz = S.hz; S.fromWave = S.wave; S.wave = current().emo.wave;
    S.phaseT = 0; S.spawnT = 0.2; S.routeIdx = 0;
    updateSidePanel();
    if (current().key !== 'idle') setCaption(current().emo.routes[0].caption);
  }
  function nextPhase() {
    S.index = S.index + 1 < S.phases.length ? S.index + 1 : S.loopFrom;
    enterPhase();
  }
  function targetWeights() {
    const ph = current(), t = {};
    S.order.forEach((k) => { t[k] = 0; });
    if (ph.key === 'idle') t.idle = 1;
    else if (ph.key === 'perception') { t.perception = 1; emotionKeys.forEach((k) => { t[k] = 0.12; }); }
    else if (ph.mix) emotionKeys.forEach((k) => { t[k] = 0.8; });
    else { emotionKeys.forEach((k) => { t[k] = 0.32; }); t[ph.key] = 1; }
    return t;
  }

  function spawn(dt) {
    const ph = current();
    S.spawnT -= dt;
    if (S.spawnT > 0) return;
    let emo = ph.emo;
    if (ph.mix) emo = EMOTIONS[ph.mix[Math.floor(Math.random() * ph.mix.length)]];
    S.spawnT = (ph.mix ? 0.65 : emo.interval) * (0.85 + Math.random() * 0.3) * (reduceMotion ? 1.6 : 1);
    const routes = emo.routes;
    const pick = () => (ph.mix ? routes[Math.floor(Math.random() * routes.length)] : routes[S.routeIdx++ % routes.length]);
    switch (emo.pattern) {
      case 'parallel': launch(pick(), emo); launch(pick(), emo, 0.3); break;
      case 'burst': launch(pick(), emo); launch(pick(), emo, 0.12); if (Math.random() < 0.5) launch(pick(), emo, 0.25); break;
      case 'pairs': { const r = pick(); launch(r, emo); r.paths.forEach((p) => launchPath(p, emo, 0.28)); break; }
      default: launch(pick(), emo);
    }
  }

  function update(dt) {
    S.time += dt;
    S.phaseT += dt;
    if (S.phaseT >= current().dur) nextPhase();
    const ph = current(), emo = ph.emo;

    // rhythm: fades from the previous emotion, and speeds up a little ("slowly, then faster")
    const k = Math.min(1, S.phaseT / 1.8);
    S.blend = k * k * (3 - 2 * k);
    const ramp = 0.8 + 0.4 * Math.min(1, S.phaseT / ph.dur);
    S.hz = Math.min(MAX_PULSE_HZ, (S.fromHz + (emo.pulse - S.fromHz) * S.blend) * ramp) * (reduceMotion ? 0.5 : 1);
    S.pulsePhase += dt * S.hz;
    S.drift += dt * (0.25 + 0.45 * Math.min(1, S.hz));

    // how much of each emotion is in the aura right now
    const tw = targetWeights();
    for (const key of S.order) {
      const w = S.weights[key] || 0;
      S.weights[key] = w + ((tw[key] || 0) - w) * Math.min(1, dt * 0.8);
    }

    spawn(dt);

    // dots
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      if (d.delay > 0) { d.delay -= dt; continue; }
      if (!d.started) { d.started = true; d.g.setAttribute('opacity', 1); flare(d.route.first, d.color, false); }
      d.s += d.speed * dt;
      while (d.next < d.route.stops.length && d.s >= d.route.stops[d.next].at) {
        const last = d.next === d.route.stops.length - 1;
        flare(d.route.stops[d.next].node, d.color, last);
        d.next++;
      }
      if (d.s > d.route.total) d.fade += dt;
      if (d.fade > 1.6) { d.g.remove(); d.after.remove(); dots.splice(i, 1); }
    }

    // ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.t += dt;
      if (r.t >= r.dur) { r.el.remove(); ripples.splice(i, 1); }
    }

    // sparkles
    updateSparkles(dt);

    // nodes: arrival flashes and the "hot" places of each emotion
    const heatTarget = {};
    for (const key of S.order) {
      const w = S.weights[key] || 0;
      if (w < 0.02) continue;
      const e = emoOf(key);
      (e.hotspots || []).forEach((n) => {
        if (!heatTarget[n] || heatTarget[n].w < w) heatTarget[n] = { w, emo: e };
      });
    }
    for (const [name, st] of Object.entries(nodeState)) {
      st.flare = Math.max(0, st.flare - dt * 1.4);
      st.labelT = Math.max(0, st.labelT - dt * 0.45);
      const h = heatTarget[name];
      st.heat += ((h ? h.w : 0) - st.heat) * Math.min(1, dt * 1.2);
      if (h) st.color = lerpRGB(st.color, hex(h.emo.colors[st.idx % h.emo.colors.length]), Math.min(1, dt * 1.5));
    }
  }

  function flare(name, color, isEnd) {
    const st = nodeState[name];
    st.flare = 1;
    ripple(name, color, isEnd);
    if (isEnd) st.labelT = 1;
  }

  function updateSparkles(dt) {
    let wanted = 0;
    for (const key of S.order) wanted += (S.weights[key] || 0) * (emoOf(key).sparkle || 0);
    wanted = Math.min(SPARKLE_POOL, wanted * (reduceMotion ? 0.5 : 1));
    let live = 0;
    for (const p of sparkles) {
      if (!p.live) continue;
      live++;
      p.t += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.t >= p.life) { p.live = false; p.el.setAttribute('opacity', 0); }
    }
    if (live < wanted && Math.random() < dt * 8) {
      const p = sparkles.find((q) => !q.live);
      const key = pickWeighted();
      if (!p || !key) return;
      const e = emoOf(key);
      const a = Math.random() * Math.PI * 2, r = 0.55 + Math.random() * 0.5;
      p.x = 200 + Math.cos(a) * 180 * r; p.y = 400 + Math.sin(a) * 400 * r;
      const drift = e.drift || 0;
      p.vx = (Math.random() - 0.5) * 8;
      p.vy = drift === 0 ? (Math.random() - 0.5) * 10 : drift * (10 + Math.random() * 18);
      p.t = 0; p.life = 3 + Math.random() * 3; p.live = true;
      p.r = 1 + Math.random() * 2.6;
      p.el.setAttribute('fill', e.colors[Math.floor(Math.random() * e.colors.length)]);
    }
  }
  function pickWeighted() {
    const list = S.order.filter((k) => (S.weights[k] || 0) > 0.05);
    const total = list.reduce((s, k) => s + S.weights[k], 0);
    let r = Math.random() * total;
    for (const k of list) { r -= S.weights[k]; if (r <= 0) return k; }
    return list[0];
  }

  // Share the aura clouds between the emotions, according to their weight.
  const BLOB_ORDER = [1, 4, 0, 7, 2, 9, 5, 3, 8, 6, 10];
  function assignBlobs() {
    const list = S.order.filter((k) => (S.weights[k] || 0) > 0.03);
    if (!list.length) return;
    const total = list.reduce((s, k) => s + S.weights[k], 0);
    const exact = list.map((k) => (S.weights[k] / total) * BLOB_COUNT);
    const counts = exact.map(Math.floor);
    let left = BLOB_COUNT - counts.reduce((a, b) => a + b, 0);
    exact.map((v, i) => [v - counts[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { counts[i]++; left--; } });
    let b = 0;
    list.forEach((k, li) => {
      for (let j = 0; j < counts[li]; j++, b++) {
        const blob = blobs[BLOB_ORDER[b]];
        const e = emoOf(k);
        blob.owner = k;
        blob.target = hex(e.colors[(j + BLOB_ORDER[b]) % e.colors.length]);
      }
    });
  }

  function render(dt) {
    const emo = current().emo;
    const wNow = WAVES[S.wave] || WAVES.sine, wOld = WAVES[S.fromWave] || WAVES.sine;
    const wave = (p) => wOld(p) * (1 - S.blend) + wNow(p) * S.blend;
    const pulse = wave(S.pulsePhase);
    const amp = safeAmp(S.hz);
    const dark = isDark();

    // aura clouds
    assignBlobs();
    let spread = 0, sink = 0, wsum = 0;
    for (const k of S.order) {
      const w = S.weights[k] || 0, sh = SHAPE[k] || { spread: 1, sink: 0 };
      spread += sh.spread * w; sink += sh.sink * w; wsum += w;
    }
    spread = wsum ? spread / wsum : 1; sink = wsum ? sink / wsum : 0;
    const base = dark ? 0.6 : 0.95;
    blobs.forEach((b, i) => {
      if (b.target) b.color = lerpRGB(b.color, b.target, Math.min(1, dt * 1.2));
      const w = S.weights[b.owner] || 0;
      b.alpha += ((0.35 + 0.65 * Math.min(1, w)) - b.alpha) * Math.min(1, dt * 1.2);
      const p = wave(S.pulsePhase - i * 0.07);          // a ripple through the clouds
      const D = 16 + 26 * Math.min(1, S.hz);
      const dx = (b.x - 200) * (spread - 1) + Math.sin(S.drift * 0.9 + b.seed) * D;
      const dy = (b.y - 400) * (spread - 1) * 0.6 + sink + Math.cos(S.drift * 0.7 + b.seed * 1.3) * D;
      const sc = 1 + amp * 0.35 * p;
      const a = base * b.alpha * (1 - amp + amp * p);
      b.el.style.transform = `translate(-50%,-50%) translate(${f(dx * pxPerUnit)}px,${f(dy * pxPerUnit)}px) scale(${sc.toFixed(3)})`;
      b.el.style.background = `radial-gradient(closest-side, ${rgba(b.color, a)}, ${rgba(b.color, a * 0.6)} 45%, ${rgba(b.color, 0)})`;
    });

    // page tint + glow inside the body
    const lead = blobs[BLOB_ORDER[0]].color;
    document.body.style.setProperty('--glow', rgba(lead, 1));
    const inner = (1 - amp + amp * pulse) * (dark ? 0.55 : 0.7);
    const lc = hex(emo.colors[0]), hc = hex(emo.colors[2] || emo.colors[0]);
    coreStops.forEach((s) => s.setAttribute('stop-color', rgba(lc, 1)));
    headStops.forEach((s) => s.setAttribute('stop-color', rgba(hc, 1)));
    const lw = Math.min(1, S.weights[current().key] || 0);
    core.setAttribute('opacity', (inner * 0.55 * lw).toFixed(3));
    headGlow.setAttribute('opacity', (inner * 0.45 * lw).toFixed(3));

    // dots
    for (const d of dots) {
      if (!d.started) continue;
      const s = Math.min(d.s, d.route.total);
      const pt = d.tails[0].getPointAtLength(s);
      d.head.setAttribute('cx', f(pt.x)); d.head.setAttribute('cy', f(pt.y));
      d.halo.setAttribute('cx', f(pt.x)); d.halo.setAttribute('cy', f(pt.y));
      d.halo.setAttribute('r', f(5 + Math.sin(S.time * 10 + d.speed) * 1.2));
      d.tails.forEach((t, j) => t.setAttribute('stroke-dashoffset', f(TAIL[j].len - d.s)));
      d.after.setAttribute('stroke-dashoffset', f(d.route.total - s));
      d.after.setAttribute('opacity', (0.35 * (1 - d.fade / 1.6)).toFixed(3));
      if (d.s > d.route.total) {
        d.head.setAttribute('opacity', Math.max(0, 1 - d.fade * 3).toFixed(2));
        d.halo.setAttribute('opacity', Math.max(0, 0.3 - d.fade).toFixed(2));
      }
    }

    // ripples
    for (const r of ripples) {
      const k = r.t / r.dur, ease = 1 - (1 - k) ** 3;
      if (r.type === 'ring') {
        r.el.setAttribute('r', f(3 + ease * r.max));
        r.el.setAttribute('opacity', ((1 - k) * 0.7).toFixed(3));
      } else {
        r.el.setAttribute('cx', f(r.x + r.dx * r.dist * ease));
        r.el.setAttribute('cy', f(r.y + r.dy * r.dist * ease));
        r.el.setAttribute('opacity', (1 - k).toFixed(3));
      }
    }

    // sparkles
    for (const p of sparkles) {
      if (!p.live) continue;
      const life = Math.sin(Math.PI * (p.t / p.life));
      p.el.setAttribute('cx', f(p.x)); p.el.setAttribute('cy', f(p.y));
      p.el.setAttribute('r', f(p.r));
      p.el.setAttribute('opacity', (life * (dark ? 0.75 : 0.85)).toFixed(3));
    }

    // nodes
    for (const st of Object.values(nodeState)) {
      st.halo.setAttribute('opacity', (st.flare * 0.8).toFixed(3));
      st.halo.setAttribute('r', f(4 + st.flare * 5));
      st.halo.setAttribute('fill', rgba(lead, 1));
      st.core.setAttribute('r', f(st.r + st.flare * 1.4));
      if (st.heat > 0.01) st.stops.forEach((s) => s.setAttribute('stop-color', rgba(st.color, 1)));
      st.hot.setAttribute('opacity', (st.heat * (dark ? 0.6 : 0.75) * (1 - amp + amp * pulse)).toFixed(3));
      st.label.setAttribute('opacity', namesOn ? Math.min(1, st.labelT * 2).toFixed(3) : 0);
    }
  }

  /* ---------- Drawer content ---------- */
  function updateSidePanel() {
    const ph = current();
    document.querySelectorAll('.emotion').forEach((e) => {
      e.classList.toggle('active', ph.mix ? true : e.dataset.key === ph.key);
    });
    document.querySelectorAll('#steps li').forEach((li) => {
      li.classList.toggle('active', li.dataset.phase === ph.key || (!!ph.mix && li.dataset.phase !== 'perception'));
    });
  }

  function run(text) {
    const result = analyseSituation(text);
    emotionKeys = result.emotions;
    S.perception = buildPerception(result.senses);

    const phases = [{ key: 'perception', label: 'The information arrives', emo: S.perception, dur: PERCEPTION_SECONDS }];
    emotionKeys.forEach((k) => phases.push({ key: k, label: EMOTIONS[k].label, emo: EMOTIONS[k], dur: PHASE_SECONDS }));
    if (emotionKeys.length > 1) {
      phases.push({
        key: 'mix', label: emotionKeys.map((k) => EMOTIONS[k].label).join(' · '), mix: emotionKeys, dur: MIX_SECONDS,
        emo: { ...EMOTIONS[emotionKeys[0]], pulse: Math.max(...emotionKeys.map((k) => EMOTIONS[k].pulse)), wave: 'flicker' },
      });
    }

    const note = $('#note');
    note.hidden = !result.guessed;
    note.textContent = result.guessed
      ? 'I could not find clear emotion words. Try adding how you feel (sad, happy, scared, angry, disgusted…).' : '';
    $('#emotions').innerHTML = emotionKeys.map((k) => {
      const c = EMOTIONS[k].colors;
      return `<span class="emotion" data-key="${k}"><span class="swatch" style="background:radial-gradient(circle at 30% 30%, ${c[3]}, ${c[0]} 45%, ${c[1]} 70%, ${c[2]})"></span>${EMOTIONS[k].label}</span>`;
    }).join('');

    let html = `<li class="group-title" data-phase="perception">1 · The information arrives</li>`;
    html += S.perception.steps.map((s) => `<li data-phase="perception">${s}</li>`).join('');
    emotionKeys.forEach((k, i) => {
      html += `<li class="group-title" data-phase="${k}">${i + 2} · ${EMOTIONS[k].label}</li>`;
      html += EMOTIONS[k].steps.map((s) => `<li data-phase="${k}">${s}</li>`).join('');
    });
    $('#steps').innerHTML = html;
    $('#drawerToggle').hidden = false;
    clampCard();

    setTimeline(phases, 1, ['idle', 'perception', ...emotionKeys]);
  }

  /* ---------- Theme (light by default) ---------- */
  const themeBtn = $('#theme');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('nerves-theme', t); } catch (e) { /* storage unavailable */ }
  }
  try { if (localStorage.getItem('nerves-theme') === 'dark') setTheme('dark'); } catch (e) { /* ignore */ }
  themeBtn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));

  /* ---------- The floating card: drag it anywhere ---------- */
  const card = $('#card'), handle = $('#handle');
  const pos = innerWidth < 760 ? { left: 16, bottom: 16 } : { left: 24, bottom: 24 };
  try {
    const saved = JSON.parse(localStorage.getItem('nerves-card') || 'null');
    if (saved) Object.assign(pos, saved);
  } catch (e) { /* ignore */ }
  function clampCard() {
    const w = card.offsetWidth;
    pos.left = clamp(pos.left, 8, Math.max(8, innerWidth - w - 8));
    pos.bottom = clamp(pos.bottom, 8, Math.max(8, innerHeight - 240));
    card.style.left = pos.left + 'px';
    card.style.bottom = pos.bottom + 'px';
    card.style.maxHeight = innerHeight - pos.bottom - 80 + 'px';   // stay below the top buttons
  }
  let drag = null;
  handle.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, left: pos.left, bottom: pos.bottom };
    handle.setPointerCapture(e.pointerId);
    card.classList.add('dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag) return;
    pos.left = drag.left + (e.clientX - drag.x);
    pos.bottom = drag.bottom - (e.clientY - drag.y);
    clampCard();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    card.classList.remove('dragging');
    try { localStorage.setItem('nerves-card', JSON.stringify(pos)); } catch (e) { /* ignore */ }
  };
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', clampCard);
  clampCard();

  /* ---------- Drawer (closed by default) ---------- */
  const drawerBtn = $('#drawerToggle'), drawer = $('#drawer');
  drawerBtn.addEventListener('click', () => {
    const open = drawerBtn.getAttribute('aria-expanded') !== 'true';
    drawerBtn.setAttribute('aria-expanded', open);
    drawer.hidden = !open;
    clampCard();
  });

  /* ---------- Controls ---------- */
  const input = $('#situation');
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) run(input.value); else input.focus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#form').requestSubmit(); }
  });
  document.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    input.value = b.dataset.text;
    run(input.value);
  }));
  $('#pause').addEventListener('click', (e) => {
    paused = !paused;
    e.currentTarget.textContent = paused ? 'Play' : 'Pause';
    e.currentTarget.setAttribute('aria-pressed', paused);
  });
  $('#replay').addEventListener('click', () => { if (emotionKeys.length) run(input.value); });
  $('#names').addEventListener('click', (e) => {
    namesOn = !namesOn;
    e.currentTarget.setAttribute('aria-pressed', namesOn);
  });

  /* ---------- Start ---------- */
  S.weights.idle = 1;
  setTimeline([{ key: 'idle', label: '', emo: EMOTIONS.idle, dur: 1e9 }], 0, ['idle']);
  blobs.forEach((b) => { b.alpha = 1; });
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.body.classList.contains('intro-open')) {   // wait until the home page is closed
      if (!paused) update(dt);
      render(paused ? 0 : dt);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
