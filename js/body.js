/*
 * body.js — the "map" of the body.
 * Coordinates are in a 400 x 800 drawing space (x = left/right, y = top/bottom).
 * Remember: we look at the person from the front, so the person's LEFT side
 * is on the RIGHT of the screen (heart and stomach are drawn on the right).
 */

// Right half of the body outline. Each line = one curve: [control1 x,y, control2 x,y, end x,y].
// The left half is created automatically as a mirror image.
const SILHOUETTE_START = [200, 30];
const SILHOUETTE_RIGHT = [
  [228, 30, 248, 52, 248, 88],     // top and side of the head
  [248, 118, 236, 140, 222, 150],  // jaw
  [218, 156, 218, 162, 220, 170],  // neck
  [240, 178, 270, 182, 288, 192],  // neck to shoulder
  [304, 200, 310, 220, 312, 245],  // shoulder
  [316, 300, 322, 350, 326, 400],  // outer arm
  [328, 425, 334, 450, 332, 478],  // hand (outside)
  [330, 494, 314, 496, 310, 482],  // finger tips
  [306, 460, 302, 430, 300, 405],  // hand (inside)
  [296, 360, 290, 310, 284, 262],  // inner arm up to the armpit
  [282, 300, 268, 330, 266, 360],  // side of the chest to the waist
  [266, 395, 284, 420, 284, 450],  // hip
  [284, 520, 268, 570, 262, 620],  // thigh
  [258, 670, 262, 720, 256, 760],  // calf
  [262, 775, 268, 788, 250, 790],  // foot
  [236, 792, 228, 786, 230, 770],  // inside of the foot
  [232, 720, 226, 670, 226, 620],  // inner calf
  [224, 570, 214, 520, 206, 480],  // inner thigh
  [204, 474, 202, 470, 200, 468],  // between the legs
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
