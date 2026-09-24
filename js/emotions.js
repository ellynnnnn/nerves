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
    words: ['happy', 'happiness', 'joy', 'excited', 'exciting', 'great', 'amazing', 'awesome', 'fun', 'laugh', 'laughing', 'laughter', 'party', 'celebrat*', 'glad', 'heureux', 'heureuse', 'joie', 'génial'],
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
  focus: {
    label: 'Focus', colors: ['#3a5bd9', '#7fd1e8', '#dfe7ff', '#6c4ee0', '#a8f0ff'], dot: '#bfe6ff', ink: '#2f4fc4', sparkle: 8, drift: 0,
    pulse: 0.3, wave: 'sine', speed: 90, pattern: 'single', interval: 1.4,
    hotspots: ['prefrontal', 'eyeL', 'eyeR', 'hippocampus'],
    routes: [
      R('Your eyes jump from word to word and send them to the visual cortex.', ['eyeL', 'thalamus', 'visual'], ['eyeR', 'thalamus']),
      R('The brain turns the letters into sounds and meaning.', ['visual', 'prefrontal', 'auditory']),
      R('The hippocampus builds images and links the story to your memories: you imagine the scene.', ['prefrontal', 'hippocampus', 'prefrontal']),
      R('Curiosity: a little dopamine makes you want to know what happens next.', ['thalamus', 'reward', 'prefrontal']),
      R('The story touches you: the emotional brain reacts as if it were real.', ['prefrontal', 'amygdala', 'hypothalamus', 'brainstem', 'throat', 'heart']),
      R('The body is still and calm: slow breathing.', ['brainstem', 'throat', 'lungL'], ['throat', 'lungR']),
    ],
    steps: [
      'The eyes send the words to the visual cortex, and the brain turns them into sounds and meaning.',
      'The prefrontal cortex keeps your attention, while the hippocampus creates images and links them to your memories.',
      'Curiosity releases a little dopamine: you want to know what happens next.',
      'The emotional brain reacts to the story as if it were real, while the body stays calm and still.',
    ],
    words: ['reading', 'read', 'book*', 'novel', 'stud*', 'concentrat*', 'focus*', 'puzzle*', 'learn*', 'lire', 'livre*', 'lecture', 'roman'],
  },

  pain: {
    label: 'Pain', colors: ['#ff3b30', '#ff9f0a', '#7a0a1f', '#ffd60a', '#c2185b'], dot: '#ff8a7a', ink: '#d0021b', sparkle: 6, drift: 0,
    pulse: 1.1, wave: 'sharp', speed: 260, pattern: 'burst', interval: 0.65,
    hotspots: ['kneeL', 'insula', 'thalamus'],
    routes: [], steps: [],   // built by buildPain(), depending on WHERE it hurts
    words: ['pain*', 'hurt*', 'ache*', 'aching', 'injur*', 'bleed*', 'bled', 'sprain*', 'burn*', 'bruise*', 'headache', 'migraine', 'toothache', 'broke my', 'broken arm', 'broken leg', 'douleur', 'mal', 'blessé*', 'blessure'],
  },

  tiredness: {
    label: 'Tiredness', colors: ['#8e9aaf', '#cbc0d3', '#5c6784', '#efd3d7', '#3d4a6b'], dot: '#cbc0d3', ink: '#5c6784', sparkle: 4, drift: 1,
    pulse: 0.15, wave: 'sine', speed: 40, pattern: 'single', interval: 2.4,
    hotspots: ['eyeL', 'eyeR', 'prefrontal', 'kneeL', 'kneeR'],
    routes: [
      R('Adenosine builds up in the brain all day long: the pressure to sleep grows.', ['prefrontal', 'thalamus', 'hypothalamus']),
      R('The prefrontal cortex slows down: it is hard to concentrate and to remember.', ['prefrontal', 'hippocampus']),
      R('Heavy eyelids, you yawn.', ['brainstem', 'eyeL'], ['brainstem', 'eyeR'], ['brainstem', 'mouth']),
      R('A big yawn brings in more air.', ['brainstem', 'throat', 'lungL'], ['throat', 'lungR']),
      R('Your muscles feel heavy and slow.', LEGS[0], LEGS[1], ARMS[0]),
    ],
    steps: [
      'During the day, a molecule called adenosine builds up in the brain: it creates the need to sleep.',
      'The hypothalamus (your inner clock) tells the body it is time to rest.',
      'The prefrontal cortex slows down: concentration and memory become harder.',
      'Heavy eyelids, yawns, slow and heavy muscles.',
    ],
    words: ['tired', 'exhausted', 'sleepy', 'fatigue*', 'no energy', 'long day', "didn't sleep", "couldn't sleep", 'insomnia', 'yawn*', 'fatigué*', 'épuisé*', 'sommeil', 'crevé*'],
  },

  jealousy: {
    label: 'Jealousy', colors: ['#3fae4f', '#1b5e20', '#c6ff00', '#6a1b9a', '#ffb300'], dot: '#b7f07a', ink: '#2e7d32', sparkle: 8, drift: 0,
    pulse: 0.9, wave: 'wobble', speed: 170, pattern: 'parallel', interval: 0.9,
    hotspots: ['stomach', 'heart', 'amygdala'],
    routes: [
      R('The brain compares you with someone else.', ['prefrontal', 'insula', 'amygdala']),
      R('The reward system feels that something is missing.', ['reward', 'prefrontal']),
      R('Stress hormones are released.', ['amygdala', 'hypothalamus', 'brainstem', 'spineC', 'spineT', 'adrenal']),
      R('A tight chest and a knot in the stomach.', ['brainstem', 'throat', 'heart', 'stomach']),
      R('The same thoughts come back again and again.', ['hippocampus', 'prefrontal', 'hippocampus']),
    ],
    steps: [
      'The prefrontal cortex and the insula compare your situation with someone else’s.',
      'The reward system feels a lack, and the amygdala sees it as a threat.',
      'Stress hormones: a tight chest, a knot in the stomach.',
      'The same thoughts loop between memory and the thinking brain.',
    ],
    words: ['jealous*', 'envy', 'envious', 'jaloux', 'jalouse', 'jalousie'],
  },

  pride: {
    label: 'Pride', colors: ['#ffb703', '#fb8500', '#8338ec', '#ffd166', '#ff006e'], dot: '#ffd166', ink: '#d97706', sparkle: 22, drift: -1,
    pulse: 0.6, wave: 'sine', speed: 150, pattern: 'parallel', interval: 1.0,
    hotspots: ['heart', 'reward', 'shoulderL', 'shoulderR'],
    routes: [
      R('Dopamine and serotonin: the reward of a job well done.', ['thalamus', 'reward', 'prefrontal']),
      R('You stand taller: shoulders open, chest out.', ['spineC', 'shoulderL'], ['spineC', 'shoulderR'], ['spineC', 'spineT']),
      R('A deep breath of satisfaction.', ['brainstem', 'throat', 'lungL'], ['throat', 'lungR']),
      R('Warmth in the chest.', ['hypothalamus', 'brainstem', 'throat', 'heart']),
      R('The hippocampus remembers the success: it will motivate you next time.', ['reward', 'hippocampus']),
      R('You smile.', ['reward', 'hypothalamus', 'mouth']),
    ],
    steps: [
      'The reward system releases dopamine and serotonin: the feeling of a job well done.',
      'The body opens: you stand taller, shoulders back, chest out, a deep breath.',
      'The hippocampus stores the success, which gives you motivation for next time.',
    ],
    words: ['proud', 'pride', 'achiev*', 'accomplish*', 'fier', 'fière', 'finally did it', 'finally finished'],
  },

  boredom: {
    label: 'Boredom', colors: ['#b0b7c3', '#d8d2c4', '#9aa5b1', '#e8e3d9', '#7d8597'], dot: '#d8d2c4', ink: '#6b7280', sparkle: 3, drift: 0,
    pulse: 0.12, wave: 'sine', speed: 35, pattern: 'single', interval: 3.0,
    hotspots: ['prefrontal'],
    routes: [
      R('Nothing new: the reward system gets almost no dopamine.', ['thalamus', 'reward']),
      R('Attention wanders: the brain looks for something else to do.', ['prefrontal', 'visual', 'auditory', 'prefrontal']),
      R('You yawn and fidget.', ['brainstem', 'mouth'], ARMS[0]),
      R('Time seems to pass very slowly.', ['prefrontal', 'hippocampus']),
    ],
    steps: [
      'Nothing new happens: the reward system receives almost no dopamine.',
      'The prefrontal cortex looks for something more interesting: attention wanders.',
      'The body gets restless: yawns, fidgeting, and time seems very slow.',
    ],
    words: ['bored', 'boring', 'nothing to do', 'ennui', "m'ennuie", 'ennuy*'],
  },
};

/* ---------- Pain depends on where it hurts ---------- */
const PAIN_PARTS = {
  leg:     { words: ['knee*', 'leg*', 'foot', 'feet', 'ankle*', 'toe*', 'genou*', 'jambe*', 'pied*', 'cheville*'],
             up: ['footL', 'kneeL', 'hipL', 'sacrum', 'spineL', 'spineT', 'spineC', 'brainstem', 'thalamus'],
             reflex: ['spineL', 'sacrum', 'hipL', 'kneeL', 'footL'], spot: 'kneeL', where: 'leg' },
  arm:     { words: ['hand*', 'arm*', 'finger*', 'wrist*', 'elbow*', 'main*', 'bras', 'doigt*', 'poignet*'],
             up: ['handR', 'elbowR', 'shoulderR', 'spineC', 'brainstem', 'thalamus'],
             reflex: ['spineC', 'shoulderR', 'elbowR', 'handR'], spot: 'handR', where: 'hand' },
  head:    { words: ['head*', 'migraine', 'tête', 'crâne'],
             up: ['templeL', 'eyeL', 'thalamus'], up2: ['templeR', 'eyeR', 'thalamus'], spot: 'templeL', spot2: 'templeR', where: 'head' },
  stomach: { words: ['stomach*', 'belly', 'tummy', 'ventre', 'estomac'],
             up: ['gut', 'stomach', 'heart', 'throat', 'brainstem', 'thalamus'], spot: 'stomach', where: 'stomach' },
  tooth:   { words: ['tooth', 'teeth', 'toothache', 'mouth', 'dent*'],
             up: ['mouth', 'brainstem', 'thalamus'], spot: 'mouth', where: 'mouth' },
  back:    { words: ['back', 'dos'],
             up: ['sacrum', 'spineL', 'spineT', 'spineC', 'brainstem', 'thalamus'], spot: 'spineL', where: 'back' },
};

function buildPain(partKey) {
  const part = PAIN_PARTS[partKey] || PAIN_PARTS.leg;
  const ups = [part.up].concat(part.up2 ? [part.up2] : []);
  const routes = [
    R(`Pain sensors in your ${part.where} send an alarm up the nerves and the spinal cord.`, ...ups),
    R('The thalamus sends the signal to the insula: you feel how much it hurts.', ['thalamus', 'insula']),
    R('The cortex locates the pain and the amygdala adds the fear of getting hurt again.', ['thalamus', 'prefrontal'], ['thalamus', 'amygdala']),
    R('Your heart beats faster and you breathe quickly.', ['hypothalamus', 'brainstem', 'throat', 'heart'], ['throat', 'lungL']),
    R('Tears can come to your eyes.', ['brainstem', 'eyeL'], ['brainstem', 'eyeR']),
    R('The brain releases endorphins, natural painkillers, that go down the spinal cord to calm the pain.', ['hypothalamus', 'brainstem', 'spineC', 'spineT', 'spineL']),
  ];
  if (part.reflex) routes.splice(1, 0, R('Reflex! The spinal cord makes you pull away before the brain even knows.', part.reflex));
  return {
    ...EMOTIONS.pain,
    hotspots: [part.spot, part.spot2, 'insula', 'thalamus'].filter(Boolean),
    routes,
    steps: [
      `Pain sensors (nociceptors) in your ${part.where} send an electric alarm along the nerves to the spinal cord.`,
      part.reflex ? 'Reflex: the spinal cord answers straight away and makes you pull away, before the brain even knows.' : 'The signal climbs up to the brainstem very fast.',
      'The thalamus sends it to the insula and the cortex: you feel where it hurts and how much.',
      'Heart and breathing speed up. Then the brain releases endorphins, natural painkillers, to calm the pain.',
    ],
  };
}

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
           words: ['saw', 'see', 'seen', 'seeing', 'watch*', 'look*', 'read', 'reading', 'book*', 'text*', 'message*', 'photo*', 'video*', 'vu', 'regard*'] },
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

  // 3. Where does it hurt?
  const painPart = Object.keys(PAIN_PARTS).find((k) => firstMatch(text, PAIN_PARTS[k].words) !== -1) || 'leg';
  EMOTIONS.pain = buildPain(painPart);

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
