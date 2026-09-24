/*
 * emotions.js — what each emotion looks like.
 *
 *  colors   : the 5 colours of the aura (they are mixed together)
 *  dot      : colour of the travelling dots in dark mode
 *  ink      : colour of the travelling dots in light mode
 *  sparkle  : how many little lights float around the body
 *  drift    : -1 the lights rise, 1 they fall (like tears), 0 they float
 *  pulse    : how many aura "breaths" per second (0.2 = slow, 2 = very fast)
 *  wave     : shape of the pulse: sine | heartbeat | flicker | sharp | wobble | spike
 *  speed    : speed of the dots
 *  pattern  : single (one dot at a time) | parallel (a few together)
 *             | burst (many, fast) | pairs (dots travelling two by two)
 *  interval : seconds between new dots
 *  hotspots : body parts that glow while you feel this emotion
 *  routes   : the journeys of the information. R('caption', [path], [path]…)
 *  steps    : the explanation shown in the left panel
 *  words    : words that trigger this emotion (a * means "any ending": cry* = cry, crying, cried)
 */

function R(caption, ...paths) { return { caption, paths }; }

const ARMS = [['spineC', 'shoulderL', 'elbowL', 'handL'], ['spineC', 'shoulderR', 'elbowR', 'handR']];
const LEGS = [['spineT', 'spineL', 'sacrum', 'hipL', 'kneeL', 'footL'], ['spineT', 'spineL', 'sacrum', 'hipR', 'kneeR', 'footR']];

const EMOTIONS = {
  idle: {
    label: 'Waiting', colors: ['#9ad0ec', '#c7b8ea', '#f4c7d9', '#bde0fe', '#b8e8e0'], dot: '#c9d6ff', ink: '#7d8fc0', sparkle: 6, drift: -1,
    pulse: 0.15, wave: 'sine', speed: 60, pattern: 'single', interval: 2.6, hotspots: [],
    routes: [
      R('', ['brainstem', 'spineC', 'spineT', 'spineL', 'sacrum']),
      R('', ['thalamus', 'prefrontal']),
      R('', ['brainstem', 'throat', 'heart']),
      R('', ['throat', 'lungL'], ['throat', 'lungR']),
    ],
    steps: [], words: [],
  },

  sadness: {
    label: 'Sadness', colors: ['#2f5bff', '#7fb2ff', '#3b2a8f', '#bcd9ff', '#1b2f7a'], dot: '#9cc3ff', ink: '#2446c9', sparkle: 10, drift: 1,
    pulse: 0.22, wave: 'sine', speed: 65, pattern: 'single', interval: 1.6,
    hotspots: ['heart', 'throat', 'eyeL', 'eyeR', 'templeL', 'templeR'],
    routes: [
      R('The hippocampus links the news to your memories: that is why it hurts so much.', ['hippocampus', 'amygdala', 'hypothalamus']),
      R('The vagus nerve carries the sadness down: a lump in the throat, an ache in the chest.', ['hypothalamus', 'brainstem', 'throat', 'heart']),
      R('The tear glands are activated: you start to cry.', ['brainstem', 'eyeL'], ['brainstem', 'eyeR']),
      R('Crying tightens the muscles around the eyes and the head: headache at the temples.', ['eyeL', 'templeL'], ['eyeR', 'templeR']),
      R('Breathing becomes irregular: sobs and deep sighs.', ['throat', 'lungL'], ['throat', 'lungR']),
      R('Your energy drops: arms and legs feel heavy.', LEGS[0], ARMS[1]),
    ],
    steps: [
      'The amygdala and the hippocampus connect the news to your memories and to how much it matters to you.',
      'The vagus nerve carries the signal down: a lump in the throat and a pain in the chest (a real "heartache").',
      'Tears and sobs tense the muscles of the face and head, which can cause a headache at the temples.',
      'The body slows down: low energy, heavy arms and legs.',
    ],
    words: ['sad', 'sadness', 'cry*', 'cried', 'tears', 'lonely', 'alone', 'miss', 'missing', 'depress*', 'upset', 'heartbroken', 'grief', 'unhappy', 'triste*', 'pleur*', 'seul', 'seule'],
  },

  anger: {
    label: 'Anger', colors: ['#b3122e', '#3a0010', '#ff4d2e', '#6b0f2a', '#ff8a3d'], dot: '#ff5364', ink: '#a3102a', sparkle: 8, drift: -1,
    pulse: 1.4, wave: 'sharp', speed: 230, pattern: 'burst', interval: 0.55,
    hotspots: ['handL', 'handR', 'heart', 'mouth', 'templeL', 'templeR'],
    routes: [
      R('The amygdala sounds the alarm and alerts the hypothalamus.', ['amygdala', 'hypothalamus', 'brainstem']),
      R('Through the spinal cord, the adrenal glands release adrenaline.', ['brainstem', 'spineC', 'spineT', 'adrenal']),
      R('The heart beats faster and blood pressure rises: you feel hot.', ['brainstem', 'throat', 'heart']),
      R('Muscles get ready to fight: clenched fists, tight shoulders.', ...ARMS),
      R('The jaw clenches and pressure builds in the head.', ['brainstem', 'mouth'], ['amygdala', 'templeL'], ['insula', 'templeR']),
      R('Fast, short breathing.', ['throat', 'lungL'], ['throat', 'lungR']),
      R('The prefrontal cortex tries to calm the alarm… but it needs a few seconds!', ['prefrontal', 'amygdala']),
    ],
    steps: [
      'The amygdala sounds the alarm and the hypothalamus activates the body.',
      'The adrenal glands release adrenaline: the heart races, blood pressure rises, you feel hot.',
      'Muscles tense: clenched jaw and fists, tight shoulders, pressure in the head.',
      'The prefrontal cortex (the thinking brain) tries to calm the amygdala down. It is slower than the alarm.',
    ],
    words: ['angry', 'anger', 'furious', 'rage', 'unfair', 'mad', 'hate', 'annoy*', 'insult*', 'stole', 'stolen', 'lied', 'liar', 'betray*', 'yell*', 'shout*', 'bully', 'bullied', 'bullying', 'cheat*', 'énervé*', 'colère', 'injuste'],
  },

  disbelief: {
    label: 'Disbelief', colors: ['#ffffff', '#c9d6ff', '#8f98b8', '#e4defa', '#aab4d4'], dot: '#ffffff', ink: '#5d6788', sparkle: 6, drift: 0,
    pulse: 1.8, wave: 'flicker', speed: 120, pattern: 'parallel', interval: 1.2,
    hotspots: ['prefrontal', 'stomach', 'kneeL', 'kneeR'],
    routes: [
      R('"This can’t be true!": the brain compares the news with what it knows, again and again.', ['prefrontal', 'hippocampus', 'thalamus', 'prefrontal']),
      R('The shock freezes you for a moment: your legs feel weak.', LEGS[0], LEGS[1]),
      R('Your stomach "drops".', ['brainstem', 'throat', 'heart', 'stomach']),
      R('Numbness: the signals from the body feel far away.', ['handL', 'elbowL', 'shoulderL', 'spineC'], ['handR', 'elbowR', 'shoulderR', 'spineC']),
    ],
    steps: [
      'The prefrontal cortex and the hippocampus replay the information again and again: "this can’t be true".',
      'Shock: the body freezes for a moment, the legs feel weak, the stomach "drops".',
      'Feelings can go numb for a while: it is a way the brain protects you.',
    ],
    words: ["can't believe", 'cannot believe', "couldn't believe", 'unbelievable', 'no way', 'shock*', 'impossible', 'not real', 'incroyable', 'choqué*'],
  },

  fear: {
    label: 'Fear', colors: ['#6a2cff', '#b28dff', '#2a1466', '#4ad4ff', '#8e5cff'], dot: '#d9c2ff', ink: '#5a22d6', sparkle: 12, drift: 0,
    pulse: 1.7, wave: 'heartbeat', speed: 280, pattern: 'burst', interval: 0.45,
    hotspots: ['heart', 'stomach', 'handL', 'handR', 'amygdala'],
    routes: [
      R('The fast route: the thalamus sends the danger straight to the amygdala, before you even think!', ['thalamus', 'amygdala']),
      R('Hypothalamus → spinal cord → adrenal glands: rush of adrenaline.', ['amygdala', 'hypothalamus', 'brainstem', 'spineC', 'spineT', 'adrenal']),
      R('Your heart pounds and you breathe faster to get more oxygen.', ['brainstem', 'throat', 'heart'], ['throat', 'lungL'], ['throat', 'lungR']),
      R('Blood rushes to the legs: ready to run away.', ...LEGS),
      R('Hands sweat and shake.', ...ARMS),
      R('Digestion stops: a knot in the stomach.', ['heart', 'stomach', 'gut']),
    ],
    steps: [
      'The fast route: the thalamus sends the danger directly to the amygdala, in a fraction of a second.',
      'The hypothalamus activates the adrenal glands: adrenaline floods the body.',
      'Heart pounds, breathing speeds up, hands sweat, the stomach tightens.',
      'The legs get ready: this is the "fight or flight" reaction.',
    ],
    words: ['scared', 'afraid', 'fear', 'terrified', 'terror', 'frighten*', 'panic*', 'spider*', 'snake*', 'dark', 'nightmare*', 'following me', 'followed me', 'attack*', 'danger*', 'horror', 'peur', 'effrayé*', 'terrifié*'],
  },

  joy: {
    label: 'Joy', colors: ['#ffd23f', '#ff9f1c', '#fff17a', '#ff7b54', '#ffe9a8'], dot: '#ffe27a', ink: '#e07b00', sparkle: 30, drift: -1,
    pulse: 0.7, wave: 'sine', speed: 170, pattern: 'parallel', interval: 0.9,
    hotspots: ['reward', 'mouth', 'heart'],
    routes: [
      R('The reward system releases dopamine: you feel pleasure.', ['thalamus', 'reward', 'prefrontal']),
      R('Your face muscles smile.', ['reward', 'hypothalamus', 'brainstem', 'mouth']),
      R('Warmth and lightness in the chest.', ['hypothalamus', 'brainstem', 'throat', 'heart']),
      R('Energy! You want to move, jump, dance.', ...ARMS, ...LEGS),
      R('Laughter shakes your lungs and your diaphragm.', ['throat', 'lungL'], ['throat', 'lungR']),
      R('The hippocampus records this happy memory.', ['reward', 'hippocampus']),
    ],
    steps: [
      'The reward system releases dopamine and endorphins: pleasure and energy.',
      'The face smiles, the chest feels warm and light, laughter shakes the lungs.',
      'Energy flows to the arms and legs: you want to move.',
      'The hippocampus records the moment as a happy memory.',
    ],
    words: ['happy', 'happiness', 'joy', 'excited', 'exciting', 'great', 'amazing', 'awesome', 'fun', 'laugh', 'laughing', 'laughter', 'party', 'celebrat*', 'glad', 'proud', 'heureux', 'heureuse', 'joie', 'génial'],
  },

  love: {
    label: 'Love', colors: ['#ff3d7f', '#ff9ecb', '#ff7a59', '#ffd1e3', '#c21e56'], dot: '#ffc2dc', ink: '#d81b60', sparkle: 14, drift: -1,
    pulse: 0.9, wave: 'heartbeat', speed: 110, pattern: 'pairs', interval: 1.4,
    hotspots: ['heart', 'mouth', 'stomach'],
    routes: [
      R('Oxytocin and dopamine: the chemicals of attachment and reward.', ['prefrontal', 'reward', 'hypothalamus']),
      R('Your heart beats faster when you think of the person.', ['hypothalamus', 'brainstem', 'throat', 'heart']),
      R('Butterflies in the stomach.', ['heart', 'stomach', 'gut']),
      R('You blush and smile.', ['hypothalamus', 'mouth']),
      R('You want to be close: warmth in the arms (hug!).', ...ARMS),
      R('The alarm system calms down: you feel safe.', ['prefrontal', 'amygdala']),
    ],
    steps: [
      'The brain releases oxytocin (attachment) and dopamine (reward).',
      'The heart beats faster, the cheeks blush, butterflies in the stomach.',
      'The amygdala calms down: you feel safe and want to be close to the person.',
    ],
    words: ['love', 'loved', 'loving', 'crush', 'kiss*', 'in love', 'hug*', 'boyfriend', 'girlfriend', 'married', 'wedding', 'baby', 'cuddle*', 'amour', 'amoureux', 'amoureuse', 'bisou*', 'câlin*'],
  },

  disgust: {
    label: 'Disgust', colors: ['#8fd400', '#3fae4f', '#d8ff5a', '#5b6f00', '#b5e61d'], dot: '#c8f25a', ink: '#4f8a00', sparkle: 8, drift: 0,
    pulse: 0.9, wave: 'wobble', speed: 140, pattern: 'parallel', interval: 1.1,
    hotspots: ['stomach', 'throat', 'mouth', 'insula'],
    routes: [
      R('Smell and taste go to the insula, the "disgust detector".', ['nose', 'insula'], ['mouth', 'insula']),
      R('The eyes send the image to the brain.', ['eyeL', 'thalamus', 'insula'], ['eyeR', 'thalamus']),
      R('Nausea: the insula tells the stomach to reject what is bad.', ['insula', 'hypothalamus', 'brainstem', 'throat', 'stomach']),
      R('Your face grimaces: the nose wrinkles, the lip lifts.', ['insula', 'mouth'], ['insula', 'nose']),
      R('The throat closes: gag reflex.', ['brainstem', 'throat']),
      R('You step back and push it away.', ...ARMS),
    ],
    steps: [
      'The insula receives smells, tastes and images: it is the brain’s "disgust detector".',
      'It sends the signal to the stomach and the throat: nausea, gag reflex.',
      'The face grimaces and the body steps back: it is a protection against poison and germs.',
    ],
    words: ['disgust*', 'gross', 'rotten', 'vomit*', 'puke', 'stink*', 'smell*', 'dirty', 'cockroach*', 'rat', 'rats', 'worm*', 'mould*', 'mold*', 'slimy', 'hair in', 'yuck', 'dégoût*', 'dégueu*', 'beurk'],
  },

  surprise: {
    label: 'Surprise', colors: ['#00e5ff', '#7df9ff', '#3d7bff', '#ffffff', '#b6fffa'], dot: '#bff9ff', ink: '#0088cc', sparkle: 20, drift: -1,
    pulse: 2.0, wave: 'spike', speed: 320, pattern: 'burst', interval: 0.55,
    hotspots: ['eyeL', 'eyeR', 'heart', 'lungL', 'lungR'],
    routes: [
      R('Your eyes open wide to take in more information.', ['thalamus', 'eyeL'], ['thalamus', 'eyeR']),
      R('The amygdala checks very fast: is it good or bad?', ['thalamus', 'amygdala', 'prefrontal']),
      R('Gasp! A quick breath in.', ['brainstem', 'throat', 'lungL'], ['throat', 'lungR']),
      R('Your heart jumps.', ['brainstem', 'throat', 'heart']),
      R('The whole body jolts.', ...ARMS, ...LEGS),
    ],
    steps: [
      'Eyes and eyebrows go up: the brain wants more information.',
      'The amygdala decides very quickly if the surprise is good or bad.',
      'A gasp, a jump of the heart, a jolt in the whole body.',
    ],
    words: ['surprise*', 'suddenly', 'unexpected*', 'out of nowhere', 'wow', 'surpris*'],
  },

  stress: {
    label: 'Stress', colors: ['#ff7a00', '#ffc27a', '#ff4d4d', '#8a3a00', '#ffe08a'], dot: '#ffb35c', ink: '#d45f00', sparkle: 10, drift: 0,
    pulse: 1.1, wave: 'sine', speed: 200, pattern: 'parallel', interval: 0.8,
    hotspots: ['stomach', 'shoulderL', 'shoulderR', 'templeL', 'templeR'],
    routes: [
      R('Hypothalamus → adrenal glands: cortisol, the stress hormone, is released.', ['hypothalamus', 'brainstem', 'spineC', 'spineT', 'adrenal']),
      R('Your neck and shoulders tighten.', ['spineC', 'shoulderL'], ['spineC', 'shoulderR']),
      R('Tension headache.', ['brainstem', 'mouth'], ['eyeL', 'templeL'], ['eyeR', 'templeR']),
      R('Stomach ache and butterflies.', ['brainstem', 'throat', 'heart', 'stomach', 'gut']),
      R('Your thoughts go round in circles.', ['prefrontal', 'hippocampus', 'amygdala', 'prefrontal']),
      R('Your heart beats faster.', ['brainstem', 'throat', 'heart']),
    ],
    steps: [
      'The hypothalamus tells the adrenal glands to release cortisol, the stress hormone.',
      'Neck and shoulders tighten, which can give you a headache.',
      'The stomach is affected: butterflies, stomach ache.',
      'Thoughts loop between the prefrontal cortex, the memory and the alarm.',
    ],
    words: ['exam*', 'test', 'deadline*', 'late', 'homework', 'presentation', 'speech', 'interview', 'stress*', 'pressure', 'too much', 'oral', 'overwhelm*', 'contrôle', 'devoirs', 'retard'],
  },

  shame: {
    label: 'Embarrassment', colors: ['#ff4d6d', '#b5179e', '#ffc2cc', '#ff8fa3', '#7b2cbf'], dot: '#ff9bb0', ink: '#d6264a', sparkle: 8, drift: -1,
    pulse: 0.9, wave: 'sine', speed: 150, pattern: 'parallel', interval: 1.0,
    hotspots: ['mouth', 'earL', 'earR', 'stomach'],
    routes: [
      R('The brain imagines what the others think of you.', ['prefrontal', 'insula', 'amygdala']),
      R('Hot face and red ears: you blush.', ['hypothalamus', 'mouth'], ['thalamus', 'earL'], ['thalamus', 'earR']),
      R('You want to hide: shoulders curl, eyes look down.', ['spineC', 'shoulderL'], ['spineC', 'shoulderR'], ['brainstem', 'eyeL'], ['brainstem', 'eyeR']),
      R('A knot in the stomach.', ['brainstem', 'throat', 'heart', 'stomach']),
      R('You replay the moment again and again.', ['hippocampus', 'prefrontal', 'hippocampus']),
    ],
    steps: [
      'The prefrontal cortex and the insula imagine what other people think of you.',
      'Blood rushes to the face and ears: you blush.',
      'The body wants to hide: shoulders curl, eyes look down, knot in the stomach.',
    ],
    words: ['embarrass*', 'ashamed', 'shame', 'laughed at', 'tripped', 'humiliat*', 'blush*', 'awkward', 'everyone saw', 'honte', 'gêné*'],
  },

  calm: {
    label: 'Calm', colors: ['#2ec4b6', '#7ae582', '#b8f2e6', '#48cae4', '#1d8a8a'], dot: '#b8f2e6', ink: '#138a80', sparkle: 12, drift: -1,
    pulse: 0.18, wave: 'sine', speed: 55, pattern: 'single', interval: 2.0,
    hotspots: ['lungL', 'lungR', 'heart'],
    routes: [
      R('The prefrontal cortex calms the amygdala: no danger here.', ['prefrontal', 'amygdala']),
      R('Slow, deep breaths.', ['brainstem', 'throat', 'lungL'], ['throat', 'lungR']),
      R('The vagus nerve slows your heart down.', ['brainstem', 'throat', 'heart']),
      R('Digestion starts again.', ['heart', 'stomach', 'gut']),
      R('Your muscles relax.', ...ARMS, ...LEGS),
    ],
    steps: [
      'The prefrontal cortex tells the amygdala that everything is safe.',
      'The vagus nerve slows the heart and the breathing down.',
      'Digestion starts again and the muscles relax.',
    ],
    words: ['relax*', 'calm*', 'peace*', 'beach', 'meditat*', 'breath*', 'relief', 'relieved', 'safe', 'nature', 'bath', 'cosy', 'cozy', 'quiet', 'sunset', 'waves', 'soulag*', 'tranquille'],
  },
};

// Situations that usually bring SEVERAL emotions, in this order.
const SCENARIOS = [
  { words: ['lost', 'lose', 'losing', 'died', 'dead', 'death', 'passed away', 'funeral', 'killed', 'run over', 'put down', 'perdu*', 'mort', 'morte', 'décéd*'], emotions: ['sadness', 'anger', 'disbelief'] },
  { words: ['broke up', 'break up', 'breakup', 'dumped', 'divorce*', 'cheated on', 'left me', 'rompu', 'quitté*'], emotions: ['sadness', 'anger', 'disbelief'] },
  { words: ['failed', 'fail', 'bad grade', 'bad mark', 'rejected', 'raté', 'échou*'], emotions: ['disbelief', 'shame', 'sadness'] },
  { words: ['won', 'win', 'winning', 'passed my', 'got the job', 'accepted', 'gagné', 'réussi'], emotions: ['surprise', 'joy'] },
  { words: ['birthday', 'gift', 'present', 'holiday*', 'vacation', 'anniversaire', 'cadeau', 'vacances'], emotions: ['surprise', 'joy'] },
];

// How the information ENTERS the body.
const SENSES = {
  eyes:  { label: 'eyes', cortex: 'visual', paths: [['eyeL', 'thalamus'], ['eyeR', 'thalamus']],
           words: ['saw', 'see', 'seen', 'seeing', 'watch*', 'look*', 'read', 'text*', 'message*', 'photo*', 'video*', 'vu', 'regard*'] },
  ears:  { label: 'ears', cortex: 'auditory', paths: [['earL', 'thalamus'], ['earR', 'thalamus']],
           words: ['heard', 'hear*', 'told', 'tell*', 'said', 'say*', 'call*', 'phone*', 'voice', 'listen*', 'music', 'noise', 'scream*', 'shout*', 'yell*', 'laughed at', 'entendu', 'dit'] },
  nose:  { label: 'nose', cortex: 'insula', paths: [['nose', 'insula']],
           words: ['smell*', 'stink*', 'odour', 'odor', 'perfume', 'odeur'] },
  mouth: { label: 'mouth', cortex: 'insula', paths: [['mouth', 'insula']],
           words: ['taste*', 'ate', 'eat*', 'soup', 'food', 'drink*', 'goût*', 'mangé'] },
  touch: { label: 'skin', cortex: 'prefrontal', paths: [['handL', 'elbowL', 'shoulderL', 'spineC', 'brainstem', 'thalamus']],
           words: ['touch*', 'hug*', 'kiss*', 'hit', 'punch*', 'fell', 'tripped', 'hurt', 'pain', 'cold', 'hot', 'câlin*'] },
};

/* ---------- Reading the text ---------- */

function makeRegex(word) {
  const prefix = word.endsWith('*');
  const w = (prefix ? word.slice(0, -1) : word)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
  return new RegExp('(?<![\\p{L}\\p{N}])' + w + (prefix ? '' : '(?![\\p{L}\\p{N}])'), 'iu');
}

// Returns the position of the first matching word in the text, or -1.
function firstMatch(text, words) {
  let best = -1;
  for (const word of words) {
    const m = text.match(makeRegex(word));
    if (m && (best === -1 || m.index < best)) best = m.index;
  }
  return best;
}

function analyseSituation(raw) {
  const text = ' ' + raw.toLowerCase().replace(/[’‘]/g, "'") + ' ';

  // 1. Emotions
  const found = [];
  const add = (e) => { if (!found.includes(e)) found.push(e); };

  for (const s of SCENARIOS) {
    if (firstMatch(text, s.words) !== -1) s.emotions.forEach(add);
  }
  Object.entries(EMOTIONS)
    .filter(([key]) => key !== 'idle')
    .map(([key, e]) => ({ key, pos: firstMatch(text, e.words) }))
    .filter((m) => m.pos !== -1)
    .sort((a, b) => a.pos - b.pos)
    .forEach((m) => add(m.key));

  let guessed = false;
  if (found.length === 0) { found.push('surprise', 'calm'); guessed = true; }

  // 2. Senses
  const senses = Object.keys(SENSES).filter((k) => firstMatch(text, SENSES[k].words) !== -1).slice(0, 2);
  if (senses.length === 0) senses.push('eyes', 'ears');

  return { emotions: found.slice(0, 4), senses, guessed };
}

// The first phase: the information enters and is understood.
function buildPerception(senses) {
  const s = senses.map((k) => SENSES[k]);
  const cortexPaths = [...new Set(s.map((x) => x.cortex))].map((c) => (c === 'prefrontal' ? ['thalamus', c] : ['thalamus', c, 'prefrontal']));
  const senseNames = s.map((x) => x.label).join(' and ');
  return {
    label: 'Perception', colors: ['#e6eeff', '#b8c7ea', '#8aa4d6', '#ffffff', '#cfd8ff'], dot: '#ffffff', ink: '#4b5f96', sparkle: 8, drift: -1,
    pulse: 0.35, wave: 'sine', speed: 150, pattern: 'single', interval: 0.95, hotspots: ['thalamus'],
    routes: [
      R(`Your ${senseNames} capture the information and send it to the thalamus, the relay station.`, ...s.flatMap((x) => x.paths)),
      R('The fast route (0.1 second): thalamus → amygdala, the alarm system.', ['thalamus', 'amygdala']),
      R('The slow route: the cortex analyses the information and understands what it means.', ...cortexPaths),
      R('The hippocampus asks: "Have I lived something like this before?"', ['prefrontal', 'hippocampus', 'amygdala']),
    ],
    steps: [
      `Your ${senseNames} capture the information and send it to the thalamus, the brain’s relay station.`,
      'The fast route: the thalamus alerts the amygdala (the alarm) in a fraction of a second, before you even think.',
      'The slow route: the cortex analyses the information, the hippocampus compares it with your memories.',
    ],
  };
}
