/*
 * body.js — the "map" of the body.
 * Coordinates are in a 400 x 800 drawing space (x = left/right, y = top/bottom).
 * Remember: we look at the person from the front, so the person's LEFT side
 * is on the RIGHT of the screen (heart and stomach are drawn on the right).
 */

// Right half of the body outline. Each line = one curve: [control1 x,y, control2 x,y, end x,y].
// The left half is created automatically as a mirror image.
const SILHOUETTE_START = [200, 24];
const SILHOUETTE_RIGHT = [
  [233, 24, 253, 52, 253, 90],     // top and side of the head (round, like a soft 3D figure)
  [253, 126, 240, 148, 224, 157],  // jaw
  [217, 161, 216, 166, 222, 172],  // short neck
  [250, 176, 283, 180, 299, 198],  // neck to shoulder
  [317, 216, 323, 245, 325, 275],  // round shoulder
  [329, 330, 337, 380, 341, 420],  // outer arm
  [345, 452, 347, 482, 331, 496],  // mitten hand (no fingers)
  [314, 508, 297, 493, 295, 470],  // inside of the hand
  [291, 420, 286, 340, 282, 272],  // inner arm up to the armpit
  [280, 310, 270, 340, 270, 370],  // side of the chest to the waist
  [270, 400, 291, 425, 291, 462],  // hip
  [291, 540, 275, 590, 271, 640],  // thigh
  [267, 690, 273, 735, 267, 765],  // calf
  [279, 782, 277, 802, 250, 802],  // round foot
  [229, 802, 223, 789, 225, 770],  // inside of the foot
  [227, 720, 224, 680, 222, 630],  // inner calf
  [220, 570, 212, 515, 206, 488],  // inner thigh
  [204, 480, 202, 476, 200, 474],  // between the legs
];


// Every point where information goes. type: brain | sense | organ | nerve
const NODES = {
  // --- Brain ---
  prefrontal:   { x: 200, y: 46,  type: 'brain', label: 'Prefrontal cortex', role: 'Thinks, understands the meaning of what happened and tries to control emotions.' },
  visual:       { x: 170, y: 62,  type: 'brain', label: 'Visual cortex', role: 'Builds the image of what your eyes see (in reality it is at the back of the brain).' },
  auditory:     { x: 230, y: 62,  type: 'brain', label: 'Auditory cortex', role: 'Makes sense of sounds, voices and words.' },
  thalamus:     { x: 200, y: 78,  type: 'brain', label: 'Thalamus', role: 'The relay station: it sends information from the senses to the right parts of the brain.' },
  insula:       { x: 226, y: 104, type: 'brain', label: 'Insula', role: 'Feels what happens inside the body. It is the centre of disgust.' },
  amygdala:     { x: 174, y: 104, type: 'brain', label: 'Amygdala', role: 'The alarm system: decides very fast if something is dangerous or important.' },
  hippocampus:  { x: 214, y: 118, type: 'brain', label: 'Hippocampus', role: 'Links the moment to your memories and stores new ones.' },
  reward:       { x: 186, y: 119, type: 'brain', label: 'Reward system', role: 'Releases dopamine: pleasure, motivation, wanting more.' },
  hypothalamus: { x: 200, y: 124, type: 'brain', label: 'Hypothalamus', role: 'The body’s control centre: hormones, heart rate, temperature, hunger.' },
  brainstem:    { x: 200, y: 152, type: 'nerve', label: 'Brainstem', role: 'Connects the brain to the body. Controls breathing and heartbeat automatically.' },

  // --- Senses & face ---
  eyeL:     { x: 182, y: 88,  type: 'sense', label: 'Eye', role: 'Captures light and images. Also produces tears.' },
  eyeR:     { x: 218, y: 88,  type: 'sense', label: 'Eye', role: 'Captures light and images. Also produces tears.' },
  earL:     { x: 153, y: 98,  type: 'sense', label: 'Ear', role: 'Captures sounds and voices. Ears can go red when you blush.' },
  earR:     { x: 247, y: 98,  type: 'sense', label: 'Ear', role: 'Captures sounds and voices. Ears can go red when you blush.' },
  nose:     { x: 200, y: 102, type: 'sense', label: 'Nose', role: 'Smells go almost directly to the emotional brain.' },
  mouth:    { x: 200, y: 138, type: 'sense', label: 'Mouth & face', role: 'Taste, smiles, grimaces, clenched jaw, blushing cheeks.' },
  templeL:  { x: 157, y: 76,  type: 'sense', label: 'Temple', role: 'Muscle tension here can cause headaches or migraines.' },
  templeR:  { x: 243, y: 76,  type: 'sense', label: 'Temple', role: 'Muscle tension here can cause headaches or migraines.' },

  // --- Body ---
  throat:    { x: 208, y: 174, type: 'organ', label: 'Throat', role: 'The "lump in the throat" when you hold back tears.' },
  spineC:    { x: 200, y: 192, type: 'nerve', label: 'Spinal cord (neck)', role: 'The information highway between the brain and the body.' },
  shoulderL: { x: 132, y: 208, type: 'nerve', label: 'Shoulder', role: 'Stress and fear make shoulders tense.' },
  shoulderR: { x: 268, y: 208, type: 'nerve', label: 'Shoulder', role: 'Stress and fear make shoulders tense.' },
  lungL:     { x: 164, y: 238, type: 'organ', label: 'Lung', role: 'Breathing speeds up, slows down or gets stuck with emotions.' },
  lungR:     { x: 240, y: 232, type: 'organ', label: 'Lung', role: 'Breathing speeds up, slows down or gets stuck with emotions.' },
  heart:     { x: 214, y: 256, type: 'organ', label: 'Heart', role: 'Beats faster with fear, anger and love; feels heavy with sadness.' },
  spineT:    { x: 200, y: 282, type: 'nerve', label: 'Spinal cord (back)', role: 'Sends orders to the organs and the muscles.' },
  elbowL:    { x: 95,  y: 330, type: 'nerve', label: 'Arm nerves', role: 'Carry orders to the arm muscles.' },
  elbowR:    { x: 305, y: 330, type: 'nerve', label: 'Arm nerves', role: 'Carry orders to the arm muscles.' },
  stomach:   { x: 222, y: 314, type: 'organ', label: 'Stomach', role: 'Butterflies, knots, nausea: the stomach is very sensitive to emotions.' },
  adrenal:   { x: 178, y: 338, type: 'organ', label: 'Adrenal glands', role: 'Release adrenaline and cortisol, the hormones of alarm and stress.' },
  gut:       { x: 192, y: 374, type: 'organ', label: 'Gut', role: 'Sometimes called the "second brain": it has millions of nerve cells.' },
  spineL:    { x: 200, y: 394, type: 'nerve', label: 'Spinal cord (lower back)', role: 'Sends orders to the legs.' },
  sacrum:    { x: 200, y: 446, type: 'nerve', label: 'Base of the spine', role: 'Where the big nerves of the legs start.' },
  handL:     { x: 82,  y: 458, type: 'sense', label: 'Hand', role: 'Hands can sweat, shake or clench into fists.' },
  handR:     { x: 318, y: 458, type: 'sense', label: 'Hand', role: 'Hands can sweat, shake or clench into fists.' },
  hipL:      { x: 162, y: 480, type: 'nerve', label: 'Sciatic nerve', role: 'The biggest nerve of the body, going down the leg.' },
  hipR:      { x: 238, y: 480, type: 'nerve', label: 'Sciatic nerve', role: 'The biggest nerve of the body, going down the leg.' },
  kneeL:     { x: 156, y: 620, type: 'nerve', label: 'Leg nerves', role: 'Legs can feel weak, heavy, or ready to run.' },
  kneeR:     { x: 244, y: 620, type: 'nerve', label: 'Leg nerves', role: 'Legs can feel weak, heavy, or ready to run.' },
  footL:     { x: 156, y: 772, type: 'sense', label: 'Foot', role: 'Ready to run away, or frozen to the ground.' },
  footR:     { x: 244, y: 772, type: 'sense', label: 'Foot', role: 'Ready to run away, or frozen to the ground.' },
};

// Main nerve lines that are always drawn. Long chains become smooth curves.
const CHAINS = [
  // spinal cord and vagus nerve
  { nodes: ['brainstem', 'spineC', 'spineT', 'spineL', 'sacrum'], width: 2.2 },
  { nodes: ['brainstem', 'throat', 'heart', 'stomach', 'gut'], width: 1.3 },
  { nodes: ['throat', 'lungL'] }, { nodes: ['throat', 'lungR'] },
  { nodes: ['spineT', 'adrenal'] },
  // arms and legs
  { nodes: ['spineC', 'shoulderL', 'elbowL', 'handL'], width: 1.4 },
  { nodes: ['spineC', 'shoulderR', 'elbowR', 'handR'], width: 1.4 },
  { nodes: ['sacrum', 'hipL', 'kneeL', 'footL'], width: 1.6 },
  { nodes: ['sacrum', 'hipR', 'kneeR', 'footR'], width: 1.6 },
  // senses to brain
  { nodes: ['eyeL', 'thalamus'] }, { nodes: ['eyeR', 'thalamus'] },
  { nodes: ['earL', 'thalamus'] }, { nodes: ['earR', 'thalamus'] },
  { nodes: ['nose', 'amygdala'] }, { nodes: ['nose', 'insula'] },
  { nodes: ['mouth', 'insula'] }, { nodes: ['brainstem', 'mouth'] },
  { nodes: ['eyeL', 'templeL'] }, { nodes: ['eyeR', 'templeR'] },
  // inside the brain
  { nodes: ['thalamus', 'visual'] }, { nodes: ['thalamus', 'auditory'] },
  { nodes: ['visual', 'prefrontal'] }, { nodes: ['auditory', 'prefrontal'] },
  { nodes: ['thalamus', 'prefrontal'] }, { nodes: ['thalamus', 'amygdala'] },
  { nodes: ['thalamus', 'insula'] }, { nodes: ['thalamus', 'reward'] },
  { nodes: ['amygdala', 'hypothalamus'] }, { nodes: ['amygdala', 'hippocampus'] },
  { nodes: ['amygdala', 'prefrontal'] }, { nodes: ['hippocampus', 'prefrontal'] },
  { nodes: ['reward', 'prefrontal'] }, { nodes: ['reward', 'hypothalamus'] },
  { nodes: ['insula', 'hypothalamus'] }, { nodes: ['insula', 'prefrontal'] },
  { nodes: ['hypothalamus', 'brainstem'] },
];

/*
 * Extra nerve strands (inspired by old anatomy drawings of the nervous system):
 * bundles of thin nerves along the arms and legs that fan out into the hands and feet,
 * and small pairs of nerves all along the spine.
 *   count  : number of strands in the bundle
 *   spread : how far apart the strands are
 *   fan    : number of little branches at the end (fingers / toes)
 */
const BUNDLES = [
  { nodes: ['brainstem', 'spineC', 'spineT', 'spineL', 'sacrum'], count: 3, spread: 4 },
  { nodes: ['brainstem', 'throat', 'heart', 'stomach', 'gut'], count: 2, spread: 4 },
  { nodes: ['spineC', 'shoulderL', 'elbowL', 'handL'], count: 5, spread: 9, fan: 5, fanLen: 30 },
  { nodes: ['spineC', 'shoulderR', 'elbowR', 'handR'], count: 5, spread: 9, fan: 5, fanLen: 30 },
  { nodes: ['sacrum', 'hipL', 'kneeL', 'footL'], count: 6, spread: 11, fan: 5, fanLen: 24 },
  { nodes: ['sacrum', 'hipR', 'kneeR', 'footR'], count: 6, spread: 11, fan: 5, fanLen: 24 },
];

function buildNerveStrands() {
  let seed = 11;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const strands = [];

  // smooth line through the nodes
  function curve(names, perSegment) {
    const p = names.map((n) => NODES[n]);
    const out = [];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      for (let s = 0; s < perSegment; s++) {
        const t = s / perSegment, t2 = t * t, t3 = t2 * t;
        const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
        out.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) });
      }
    }
    out.push({ x: p[p.length - 1].x, y: p[p.length - 1].y });
    return out;
  }

  BUNDLES.forEach((b) => {
    const base = curve(b.nodes, 12);
    const n = base.length;
    for (let k = 0; k < b.count; k++) {
      const o = b.count === 1 ? 0 : (k / (b.count - 1)) * 2 - 1;
      const wob = rand() * 6;
      const line = base.map((p, i) => {
        const q = base[Math.min(n - 1, i + 1)], r = base[Math.max(0, i - 1)];
        const dx = q.x - r.x, dy = q.y - r.y, len = Math.hypot(dx, dy) || 1;
        const t = i / (n - 1);
        const off = o * b.spread * (0.35 + 0.65 * t) + Math.sin(t * 9 + wob) * 1.2;
        return { x: p.x - (dy / len) * off, y: p.y + (dx / len) * off };
      });
      strands.push(line);
      if (!b.fan || k % 2) continue;
      // fingers / toes
      const end = line[n - 1], prev = line[n - 4];
      const dir = Math.atan2(end.y - prev.y, end.x - prev.x);
      for (let j = 0; j < b.fan; j++) {
        const a = dir + (j - (b.fan - 1) / 2) * 0.2 + o * 0.08;
        const L = b.fanLen * (0.6 + rand() * 0.5);
        const bend = (rand() - 0.5) * 0.3;
        strands.push([0, 0.35, 0.7, 1].map((t) => ({
          x: end.x + Math.cos(a + bend * t) * L * t,
          y: end.y + Math.sin(a + bend * t) * L * t,
        })));
      }
    }
  });

  // pairs of nerves along the spine (like the rungs of a ladder)
  for (let y = 200; y <= 440; y += 12) {
    for (const side of [-1, 1]) {
      const L = 14 + rand() * 12, drop = 4 + rand() * 5;
      strands.push([0, 0.5, 1].map((t) => ({ x: 200 + side * L * t, y: y + drop * t * t })));
    }
  }

  // nerves of the face and head, spreading from the brainstem
  for (let j = 0; j < 9; j++) {
    const a = -Math.PI / 2 + (j - 4) * 0.33;
    const L = 38 + rand() * 18;
    strands.push([0, 0.4, 0.75, 1].map((t) => ({
      x: 200 + Math.cos(a) * L * t * 1.1,
      y: 150 + Math.sin(a) * L * t * 1.6 + t * (1 - t) * 10,
    })));
  }
  return strands;
}
