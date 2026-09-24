/*
 * app.js — draws the body and runs the animation.
 * You normally don't need to change this file: colours, speeds and journeys
 * are all in emotions.js, and body positions are in body.js.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const svg = $('#body');
  const TRAIL = 46;            // length of the glowing tail behind each dot
  const PHASE_SECONDS = 8;     // how long each emotion is shown
  const PERCEPTION_SECONDS = 5.5;
  const MIX_SECONDS = 9;
  const FADE_SECONDS = 1.6;    // colour transition between emotions
  const MAX_DOTS = 42;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f = (n) => n.toFixed(1);

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
  $('#clipShape').setAttribute('d', BODY_D);

  const auraG = $('#aura');
  const auraWide = el('path', { d: BODY_D, fill: 'url(#auraGrad)', 'fill-opacity': 0.18, stroke: 'url(#auraGrad)', 'stroke-width': 34, filter: 'url(#auraBlur)' }, auraG);
  const auraEdge = el('path', { d: BODY_D, fill: 'none', stroke: 'url(#auraGrad)', 'stroke-width': 5, filter: 'url(#edgeBlur)' }, auraG);
  el('path', { d: BODY_D, fill: 'rgba(8,12,24,0.55)', stroke: 'rgba(220,230,255,0.22)', 'stroke-width': 0.8 }, $('#silhouette'));

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
  // A gently curved line between two nodes (always the same curve in both directions).
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
  // intercostal nerves (between the ribs)
  for (let y = 214; y < 360; y += 15) {
    const w = 64 - (y - 214) * 0.08;
    fine += `M200,${y} Q${200 + w * 0.6},${y - 4} ${f(200 + w)},${y + 14} M200,${y} Q${200 - w * 0.6},${y - 4} ${f(200 - w)},${y + 14} `;
  }
  // brain web
  const brainPts = [];
  for (let i = 0; i < 90; i++) {
    const t = rand() * Math.PI * 2, r = Math.sqrt(rand());
    brainPts.push({ x: 200 + Math.cos(t) * r * 42, y: 86 + Math.sin(t) * r * 50 });
  }
  brainPts.forEach((p, i) => {
    brainPts.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
      .filter((o) => o.j > i).sort((m, n) => m.d - n.d).slice(0, 2)
      .forEach((o) => { const q = brainPts[o.j]; fine += `M${f(p.x)},${f(p.y)} L${f(q.x)},${f(q.y)} `; });
  });
  el('path', { d: fine, fill: 'none', stroke: 'rgba(170,195,255,0.13)', 'stroke-width': 0.5 }, $('#fine'));

  /* ---------- Nodes, labels, hotspots ---------- */
  const nodeState = {};
  const nodesG = $('#nodes'), labelsG = $('#labels'), hotG = $('#hotspots');
  const tooltip = $('#tooltip');
  Object.entries(NODES).forEach(([name, n]) => {
    const r = n.type === 'organ' ? 3.6 : n.type === 'nerve' ? 2.2 : 2.6;
    const g = el('g', {}, nodesG);
    const halo = el('circle', { cx: n.x, cy: n.y, r: 7, fill: '#fff', opacity: 0, filter: 'url(#glow)' }, g);
    const core = el('circle', {
      cx: n.x, cy: n.y, r,
      fill: n.type === 'sense' ? 'none' : 'rgba(220,230,255,0.7)',
      stroke: n.type === 'sense' ? 'rgba(220,230,255,0.75)' : 'none', 'stroke-width': 1,
    }, g);
    const hit = el('circle', { cx: n.x, cy: n.y, r: 9, fill: 'transparent', style: 'cursor:help' }, g);
    hit.addEventListener('mouseenter', () => showTip(n));
    hit.addEventListener('mouseleave', () => { tooltip.hidden = true; });

    const right = n.x >= 200;
    const label = el('text', {
      x: n.x + (right ? 8 : -8), y: n.y + 3, 'text-anchor': right ? 'start' : 'end',
      class: 'node-label', opacity: 0,
    }, labelsG);
    label.textContent = n.label;

    const hot = el('circle', { cx: n.x, cy: n.y, r: n.type === 'organ' ? 22 : 14, fill: 'url(#hotGrad)', opacity: 0 }, hotG);
    nodeState[name] = { halo, core, label, hot, flare: 0, labelT: 0, heat: 0, r };
  });

  function showTip(n) {
    const box = svg.getBoundingClientRect(), stage = $('#stage').getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(box.width / vb.width, box.height / vb.height);
    const offX = box.left - stage.left + (box.width - vb.width * scale) / 2;
    const offY = box.top - stage.top + (box.height - vb.height * scale) / 2;
    tooltip.innerHTML = `<strong>${n.label}</strong>${n.role}`;
    tooltip.style.left = offX + (n.x - vb.x) * scale + 14 + 'px';
    tooltip.style.top = offY + (n.y - vb.y) * scale - 10 + 'px';
    tooltip.hidden = false;
  }

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

  const dots = [];
  const trailsG = $('#trails');
  function launchPath(names, emo, delay) {
    if (dots.length >= MAX_DOTS) return;
    const route = buildRoute(names);
    const g = el('g', { opacity: 0 }, trailsG);
    const trail = el('path', {
      d: route.d, fill: 'none', stroke: emo.dot, 'stroke-width': 1.8, 'stroke-linecap': 'round',
      'stroke-dasharray': `${TRAIL} ${route.total + TRAIL * 2}`, filter: 'url(#glow)',
    }, g);
    const glow = el('circle', { r: 6, fill: emo.dot, opacity: 0.35 }, g);
    const head = el('circle', { r: 2.3, fill: '#fff', filter: 'url(#glow)' }, g);
    dots.push({ route, g, trail, glow, head, s: 0, delay: delay || 0, next: 0,
      speed: emo.speed * (0.85 + Math.random() * 0.3), started: false });
  }
  function launch(route, emo, delay) {
    route.paths.forEach((p, i) => launchPath(p, emo, (delay || 0) + i * 0.05));
    if (route.caption) setCaption(route.caption);
  }

  /* ---------- Caption ---------- */
  const captionEl = $('#caption');
  let captionTimer = null;
  function setCaption(text) {
    if (!namesOn) return;
    if (captionEl.textContent === text && captionEl.classList.contains('show')) return;
    captionEl.classList.remove('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => {
      captionEl.textContent = text;
      captionEl.classList.add('show');
    }, 250);
  }

  /* ---------- Colours ---------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

  const WAVES = {
    sine: (p) => 0.5 + 0.5 * Math.sin(p * Math.PI * 2),
    heartbeat: (p) => { const x = p % 1; return Math.min(1, Math.exp(-(((x - 0.1) / 0.06) ** 2)) + 0.65 * Math.exp(-(((x - 0.32) / 0.06) ** 2))); },
    flicker: (p) => Math.max(0, Math.min(1, 0.5 + 0.25 * Math.sin(p * 6.283) + 0.17 * Math.sin(p * 17.1 + 1) + 0.12 * Math.sin(p * 33.3 + 2))),
    sharp: (p) => { const x = p % 1; return x < 0.15 ? x / 0.15 : Math.exp(-(x - 0.15) * 4); },
    wobble: (p) => 0.5 + 0.5 * Math.sin(p * 6.283 + 0.9 * Math.sin(p * 3.1)),
    spike: (p) => Math.exp(-(p % 1) * 5),
  };

  /* ---------- Timeline ---------- */
  const auraStops = [...document.querySelectorAll('#auraGrad stop')];
  const haloStops = [...document.querySelectorAll('#haloGrad stop')];
  const hotStops = [...document.querySelectorAll('#hotGrad stop')];
  const stageEl = $('#stage');

  const S = {
    phases: [], index: 0, loopFrom: 0, phaseT: 0,
    from: null,              // look at the start of the fade
    colors: EMOTIONS.idle.colors.map(hex), hz: EMOTIONS.idle.pulse, curWave: 'sine',
    pulsePhase: 0, angle: 0, spawnT: 0, routeIdx: 0, pending: [],
  };
  let paused = false, namesOn = true, emotionKeys = [];

  function setTimeline(phases, loopFrom) {
    S.phases = phases; S.loopFrom = loopFrom; S.index = 0;
    dots.splice(0).forEach((d) => d.g.remove());
    S.pending = [];
    enterPhase();
  }
  function current() { return S.phases[S.index]; }
  function enterPhase() {
    S.from = { colors: S.colors.map((c) => c.slice()), hz: S.hz, wave: S.curWave };
    S.curWave = current().emo.wave;
    S.phaseT = 0; S.spawnT = 0.2; S.routeIdx = 0;
    updateSidePanel();
  }
  function nextPhase() {
    S.index = S.index + 1 < S.phases.length ? S.index + 1 : S.loopFrom;
    enterPhase();
  }

  function spawn(dt) {
    const ph = current();
    S.spawnT -= dt;
    if (S.spawnT > 0) return;
    let emo = ph.emo;
    if (ph.mix) emo = EMOTIONS[ph.mix[Math.floor(Math.random() * ph.mix.length)]];
    S.spawnT = (ph.mix ? 0.6 : emo.interval) * (0.85 + Math.random() * 0.3);
    const routes = emo.routes;
    const pick = () => ph.mix ? routes[Math.floor(Math.random() * routes.length)] : routes[S.routeIdx++ % routes.length];
    switch (emo.pattern) {
      case 'parallel': launch(pick(), emo); launch(pick(), emo, 0.3); break;
      case 'burst': launch(pick(), emo); launch(pick(), emo, 0.12); if (Math.random() < 0.5) launch(pick(), emo, 0.25); break;
      case 'pairs': { const r = pick(); launch(r, emo); r.paths.forEach((p) => launchPath(p, emo, 0.28)); break; }
      default: launch(pick(), emo);
    }
  }

  function update(dt) {
    const ph = current();
    S.phaseT += dt;
    if (S.phaseT >= ph.dur) nextPhase();

    // colour + pulse transitions
    const emo = current().emo;
    const k = Math.min(1, S.phaseT / FADE_SECONDS);
    const ease = k * k * (3 - 2 * k);
    const target = emo.colors.map(hex);
    S.colors = S.from.colors.map((c, i) => mix(c, target[i], ease));
    // "slowly then faster": the pulse accelerates a little during each phase
    const ramp = 0.8 + 0.4 * Math.min(1, S.phaseT / current().dur);
    S.hz = (S.from.hz + (emo.pulse - S.from.hz) * ease) * ramp;
    S.pulsePhase += dt * S.hz;
    S.angle += dt * (0.15 + S.hz * 0.25);
    S.blend = ease;

    spawn(dt);

    // dots
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      if (d.delay > 0) { d.delay -= dt; continue; }
      if (!d.started) { d.started = true; d.g.setAttribute('opacity', 1); flare(d.route.first); }
      d.s += d.speed * dt;
      while (d.next < d.route.stops.length && d.s >= d.route.stops[d.next].at) {
        flare(d.route.stops[d.next].node, d.next === d.route.stops.length - 1);
        d.next++;
      }
      if (d.s > d.route.total + TRAIL) { d.g.remove(); dots.splice(i, 1); }
    }

    // nodes
    const hot = new Set(current().mix ? current().mix.flatMap((m) => EMOTIONS[m].hotspots) : emo.hotspots);
    for (const [name, st] of Object.entries(nodeState)) {
      st.flare = Math.max(0, st.flare - dt * 1.6);
      st.labelT = Math.max(0, st.labelT - dt * 0.5);
      st.heat += ((hot.has(name) ? 1 : 0) - st.heat) * Math.min(1, dt * 1.5);
    }
  }

  function flare(name, isEnd) {
    const st = nodeState[name];
    st.flare = 1;
    if (isEnd) st.labelT = 1;
  }

  function render() {
    const emo = current().emo;
    const wNow = WAVES[emo.wave] || WAVES.sine;
    const wOld = WAVES[S.from.wave] || WAVES.sine;
    const pulse = wOld(S.pulsePhase) * (1 - S.blend) + wNow(S.pulsePhase) * S.blend;
    const [c0, c1, c2] = S.colors.map(rgb);

    // aura
    auraStops[0].setAttribute('stop-color', c0);
    auraStops[1].setAttribute('stop-color', c1);
    auraStops[2].setAttribute('stop-color', c2);
    const grad = $('#auraGrad');
    const ax = Math.cos(S.angle) * 320, ay = Math.sin(S.angle) * 420;
    grad.setAttribute('x1', f(200 + ax)); grad.setAttribute('y1', f(410 + ay));
    grad.setAttribute('x2', f(200 - ax)); grad.setAttribute('y2', f(410 - ay));
    const sc = 1 + 0.025 * pulse;
    auraG.setAttribute('transform', `translate(200 410) scale(${sc.toFixed(4)}) translate(-200 -410)`);
    auraG.setAttribute('opacity', (0.35 + 0.6 * pulse).toFixed(3));
    auraWide.setAttribute('stroke-width', f(26 + 22 * pulse));
    auraEdge.setAttribute('opacity', (0.4 + 0.6 * pulse).toFixed(3));

    haloStops.forEach((s) => s.setAttribute('stop-color', c0));
    haloStops[0].setAttribute('stop-opacity', (0.12 + 0.3 * pulse).toFixed(3));
    hotStops.forEach((s) => s.setAttribute('stop-color', c1));

    stageEl.style.setProperty('--glow', c0);
    svg.style.setProperty('--nerve', `rgba(${S.colors[1].map(Math.round).join(',')},${(0.22 + 0.18 * pulse).toFixed(2)})`);

    // dots
    for (const d of dots) {
      if (!d.started) continue;
      const s = Math.min(d.s, d.route.total);
      const pt = d.trail.getPointAtLength(s);
      d.head.setAttribute('cx', f(pt.x)); d.head.setAttribute('cy', f(pt.y));
      d.glow.setAttribute('cx', f(pt.x)); d.glow.setAttribute('cy', f(pt.y));
      d.trail.setAttribute('stroke-dashoffset', f(TRAIL - d.s));
      if (d.s > d.route.total) d.g.setAttribute('opacity', (1 - (d.s - d.route.total) / TRAIL).toFixed(2));
    }

    // nodes
    for (const st of Object.values(nodeState)) {
      st.halo.setAttribute('opacity', (st.flare * 0.9).toFixed(3));
      st.halo.setAttribute('r', f(4 + st.flare * 6));
      st.halo.setAttribute('fill', c1);
      st.core.setAttribute('r', f(st.r + st.flare * 1.5));
      st.hot.setAttribute('opacity', (st.heat * (0.25 + 0.6 * pulse)).toFixed(3));
      st.label.setAttribute('opacity', namesOn ? Math.min(1, st.labelT * 2).toFixed(3) : 0);
    }
  }

  /* ---------- Left panel ---------- */
  function updateSidePanel() {
    const ph = current();
    document.querySelectorAll('.emotion').forEach((e) => {
      e.classList.toggle('active', ph.mix ? true : e.dataset.key === ph.key);
    });
    document.querySelectorAll('#steps li').forEach((li) => {
      li.classList.toggle('active', li.dataset.phase === ph.key || (ph.mix && li.dataset.phase !== 'perception'));
    });
  }

  function run(text) {
    const result = analyseSituation(text);
    emotionKeys = result.emotions;
    const perception = buildPerception(result.senses);

    const phases = [{ key: 'perception', emo: perception, dur: PERCEPTION_SECONDS }];
    emotionKeys.forEach((k) => phases.push({ key: k, emo: EMOTIONS[k], dur: PHASE_SECONDS }));
    if (emotionKeys.length > 1) {
      // all the feelings together, the aura shows them all
      const mixEmo = {
        ...EMOTIONS[emotionKeys[0]],
        colors: emotionKeys.map((k) => EMOTIONS[k].colors[0]).concat(EMOTIONS[emotionKeys[0]].colors[1]).slice(0, 3),
        pulse: Math.max(...emotionKeys.map((k) => EMOTIONS[k].pulse)),
        wave: 'flicker',
      };
      phases.push({ key: 'mix', emo: mixEmo, mix: emotionKeys, dur: MIX_SECONDS });
    }

    // left panel
    $('#result').hidden = false;
    const note = $('#note');
    note.hidden = !result.guessed;
    note.textContent = result.guessed
      ? 'I could not find clear emotion words. Try adding how you feel (sad, happy, scared, angry, disgusted…).' : '';
    $('#emotions').innerHTML = emotionKeys.map((k) => {
      const c = EMOTIONS[k].colors;
      return `<span class="emotion" data-key="${k}"><span class="swatch" style="background:radial-gradient(circle at 35% 35%, ${c[1]}, ${c[0]} 60%, ${c[2]})"></span>${EMOTIONS[k].label}</span>`;
    }).join('');

    let html = `<li class="group-title" data-phase="perception">1 · The information arrives</li>`;
    html += perception.steps.map((s) => `<li data-phase="perception">${s}</li>`).join('');
    emotionKeys.forEach((k, i) => {
      html += `<li class="group-title" data-phase="${k}">${i + 2} · ${EMOTIONS[k].label}</li>`;
      html += EMOTIONS[k].steps.map((s) => `<li data-phase="${k}">${s}</li>`).join('');
    });
    $('#steps').innerHTML = html;

    setTimeline(phases, 1);
    if (window.matchMedia('(max-width: 860px)').matches) stageEl.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Controls ---------- */
  const input = $('#situation');
  $('#go').addEventListener('click', () => { if (input.value.trim()) run(input.value); else input.focus(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) $('#go').click();
  });
  document.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    input.value = b.dataset.text;
    run(input.value);
  }));
  $('#pause').addEventListener('click', (e) => {
    paused = !paused;
    e.target.textContent = paused ? 'Play' : 'Pause';
  });
  $('#replay').addEventListener('click', () => {
    if (emotionKeys.length) run(input.value);
  });
  $('#names').addEventListener('change', (e) => {
    namesOn = e.target.checked;
    if (!namesOn) captionEl.classList.remove('show');
  });

  /* ---------- Start ---------- */
  setTimeline([{ key: 'idle', emo: EMOTIONS.idle, dur: 1e9 }], 0);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
