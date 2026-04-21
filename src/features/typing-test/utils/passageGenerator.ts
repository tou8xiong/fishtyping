export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Length = 'short' | 'medium' | 'long';
export type Theme = 'technology' | 'nature' | 'science' | 'history' | 'general';
export type ChallengeType = 'standard' | 'punctuation' | 'numbers' | 'speed';
export type Language = 'english' | 'lao';

const LAO_PASSAGES = [
  'ສະບາຍດີ ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບການຝຶກພິມພາສາລາວ ທີ່ທັນສະໄຫມທີ່ສຸດ.',
  'ປະເທດລາວ ເປັນປະເທດທີ່ມີຄວາມສວຍງາມທາງທຳມະຊາດ ແລະ ວັດທະນະທຳທີ່ເປັນເອກະລັກ.',
  'ການຮຽນຮູ້ສິ່ງໃຫມ່ໆ ຕ້ອງໃຊ້ຄວາມພະຍາຍາມ ແລະ ຄວາມອົດທົນຢ່າງຕໍ່ເນື່ອງ.',
  'ອາຫານລາວ ມີລົດຊາດທີ່ແຊບຊ້ອຍ ແລະ ເປັນທີ່ນິຍົມຂອງຄົນທົ່ວໂລກ.',
  'ພວກເຮົາຮັກສາຄວາມສະອາດ ແລະ ສິ່ງແວດລ້ອມ ເພື່ອອະນາຄົດທີ່ດີຂອງລູກຫຼານ.',
  'ການພັດທະນາຕົນເອງ ແມ່ນການລົງທຶນທີ່ມີຄຸນຄ່າທີ່ສຸດໃນຊີວິດຂອງພວກເຮົາ.',
  'ຄວາມສາມັກຄີ ແມ່ນພະລັງທີ່ຍິ່ງໃຫຍ່ ໃນການສ້າງສາພັດທະນາປະເທດຊາດ.',
  'ເຕັກໂນໂລຊີ ຊ່ວຍໃຫ້ການຕິດຕໍ່ສື່ສານສະດວກ ແລະ ວ່ອງໄວຂຶ້ນຫຼາຍ.',
  'ວັດທະນະທຳລາວ ມີຄວາມອ່ອນຊ້ອຍ ແລະ ສວຍງາມ ໂດຍສະເພາະແມ່ນການນຸ່ງຖື.',
  'ການທ່ອງທ່ຽວໃນລາວ ຊ່ວຍສ້າງລາຍຮັບໃຫ້ແກ່ປະຊາຊົນທ້ອງຖິ່ນຢ່າງຫຼວງຫຼາຍ.',
];

const THEMES: Record<Theme, string[]> = {
  technology: [
    'The laptop screen glowed softly in the dim room as the programmer typed away.',
    'Software updates keep your devices running smoothly and securely every day.',
    'Cloud computing has revolutionized how businesses store and process data.',
    'Artificial intelligence helps machines learn from experience like humans do.',
    'The smartphone contains more computing power than the early computers.',
    'Digital signals travel at incredible speeds through fiber optic cables.',
    'Cybersecurity experts work tirelessly to protect sensitive information online.',
    'The internet connects billions of devices across the globe seamlessly.',
  ],
  nature: [
    'The gentle breeze rustled through the leaves of the old oak tree.',
    'Birds sang beautifully as the sun rose over the peaceful meadow.',
    'The ocean waves crashed against the rocky shore with magnificent force.',
    'Flowers bloom in vibrant colors when spring arrives after the cold winter.',
    'A curious squirrel darted across the forest floor searching for acorns.',
    'The mountain peaks were covered in a pristine layer of sparkling snow.',
    'Wild animals roam freely in their natural habitats across the landscape.',
    'The rainbow appeared after the rain, painting the sky with brilliant colors.',
  ],
  science: [
    'Scientists conduct experiments to discover new knowledge about the universe.',
    'The scientific method helps researchers test theories systematically.',
    'Astronomers use powerful telescopes to study distant galaxies.',
    'Chemical reactions happen when different substances combine together.',
    'Biology is the study of living organisms and how they function.',
    'Physics explains the fundamental laws that govern all matter and energy.',
    'Medical research leads to new treatments and cures for various diseases.',
    'The periodic table organizes all known elements by their properties.',
  ],
  history: [
    'Ancient civilizations built remarkable structures that still stand today.',
    'The industrial revolution transformed society through new technologies.',
    'World war two shaped the modern political landscape across the globe.',
    'Explorers traveled across oceans to discover new lands and cultures.',
    'The roman empire left lasting contributions to law and architecture.',
    'Historical documents help us understand the events of the past.',
    'Revolutionary leaders inspired movements that changed the world.',
    'Archaeologists uncover artifacts that reveal stories of ancient peoples.',
  ],
  general: [
    'The morning sun crept through the curtains, casting long golden stripes across the wooden floor.',
    'She walked down the quiet street, enjoying the peaceful silence of early morning.',
    'Books provide knowledge and entertainment through the power of written words.',
    'Music has the ability to evoke strong emotions in listeners of all ages.',
    'A warm cup of coffee is the perfect way to start a busy work day.',
    'People gather together to celebrate special occasions and milestones.',
    'The city came alive at night with lights from thousands of windows.',
    'Learning new skills takes time, patience, and dedicated practice.',
  ],
};

const PUNCTUATION_PASSAGES = [
  'The cat—fluffy, orange, and utterly fearless—stared at the dog; the dog, surprised, backed away slowly.',
  'She loved three things: reading, writing, and traveling; but money (unfortunately) was scarce.',
  'The solution worked—no errors, no bugs—just pure efficiency; amazing, truly amazing.',
  'He arrived (unexpectedly) at noon; the meeting had already started, yet he remained calm.',
  'This is it: the end, the final chapter, the last word—he thought, and smiled.',
];

const NUMBER_PASSAGES = [
  'The $150 billion project affected 8 million people across 50 different countries worldwide.',
  'Test scores increased by 25% in just 3 months; the improvement was significant.',
  'Temperature dropped to -15°C overnight, making the 100-mile drive quite dangerous.',
  'Out of 1,000 participants, 750 completed the full course with a 92% success rate.',
  'The 2024 model includes 50 new features, costs $299, and weighs only 1.5 pounds.',
];

const SPEED_PASSAGES = [
  'The sun is hot. The sky is blue. I like to run. We have fun.',
  'She can type fast. He writes code well. They work hard. Come see us.',
  'Time flies by. Work is good. Life is great. Try your best.',
  'The dog runs fast. Cats like to nap. Birds fly south. Fish swim free.',
  'Read more books. Write every day. Think positive. Stay strong and be kind.',
];

const BEGINNER_WORDS = ['the', 'is', 'it', 'we', 'you', 'they', 'he', 'she', 'a', 'can', 'run', 'walk', 'see', 'like', 'make', 'come', 'have', 'get', 'work', 'time', 'good', 'great', 'fast', 'new', 'first', 'last'];

const ADVANCED_WORDS = ['sophisticated', 'eloquent', 'ephemeral', 'paradigm', 'ubiquitous', 'pragmatic', 'serendipity', 'quintessential', 'juxtaposition', 'esoteric', 'cacophony', 'perspicacious', 'magnanimous', 'surreptitious', 'idiosyncratic'];

const EXPERT_WORDS = [' sesquipedalian', 'lofty', 'grandiloquent', 'circumlocution', 'perspicuous', 'apotheosis', 'quixotic', 'lachrymose', 'ebullient', 'insouciant', 'perfunctory', 'pulchritudinous', 'vicissitude', 'ineffable', 'supercilious'];

const COMPLEX_SENTENCES = [
  'The aforementioned contention, whilst ostensibly pragmatic, ultimately proved deleterious to the verisimilitude of the empirical findings.',

  'In as much as the protagonist deprecated the vicissitudes of fortune, one cannot cogently dismiss the profound implications of such an avaricious disposition.',

  "Notwithstanding the ostensibly inexorable trajectory of the narrative, the denouement remained irrevocably ambiguous due to the author's penchant for esotericism.",

  'The verisimilitude of the situation was undermined by the protuberant obstinacy of those who insisted upon the most perfunctory of interpretations.',

  "His sesquipedalian prose, whilst intellectually impressive, ultimately served to obfuscate rather than elucidate the fundamental tenets of the discourse.",
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getWordList(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case 'beginner':
      return BEGINNER_WORDS;
    case 'intermediate':
      return [...BEGINNER_WORDS, 'about', 'would', 'could', 'people', 'some', 'into', 'year', 'your', 'going', 'know'];
    case 'advanced':
      return [...BEGINNER_WORDS, ...ADVANCED_WORDS];
    case 'expert':
      return [...BEGINNER_WORDS, ...ADVANCED_WORDS, ...EXPERT_WORDS];
    default:
      return BEGINNER_WORDS;
  }
}

function generateSimplePassage(difficulty: Difficulty, length: Length, theme: Theme): string {
  const wordList = getWordList(difficulty);
  const targetWords = length === 'short' ? 30 : length === 'medium' ? 60 : 100;
  
  const themePassages = THEMES[theme];
  const mainPassage = sample(themePassages);
  
  const words = mainPassage.split(' ');
  
  let currentLength = words.length;
  const shuffled = shuffle([...wordList]);
  let wordIndex = 0;
  
  while (currentLength < targetWords) {
    const nextWord = shuffled[wordIndex % shuffled.length];
    words.push(nextWord);
    wordIndex++;
    currentLength++;
  }
  
  const result = words.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1) + '.';
}

function generateComplexPassage(difficulty: Difficulty, length: Length): string {
  if (difficulty === 'expert') {
    const targetSentences = length === 'short' ? 2 : length === 'medium' ? 3 : 5;
    const sentences: string[] = [];
    for (let i = 0; i < targetSentences; i++) {
      sentences.push(sample(COMPLEX_SENTENCES));
    }
    return sentences.join(' ');
  }
  
  if (difficulty === 'advanced') {
    const targetSentences = length === 'short' ? 2 : length === 'medium' ? 3 : 5;
    const sentences: string[] = [];
    for (let i = 0; i < targetSentences; i++) {
      sentences.push(sample(THEMES.general));
      sentences.push(sample(THEMES.science));
    }
    return shuffle(sentences).slice(0, targetSentences).join(' ');
  }
  
  return generateSimplePassage(difficulty, length, 'general');
}

export function generatePassage(
  difficulty: Difficulty = 'intermediate',
  length: Length = 'medium',
  theme: Theme = 'general',
  challengeType: ChallengeType = 'standard',
  language: Language = 'english'
): string {
  if (language === 'lao') {
    const targetCount = length === 'short' ? 2 : length === 'medium' ? 4 : 7;
    const shuffled = shuffle([...LAO_PASSAGES]);
    return shuffled.slice(0, targetCount).join(' ');
  }

  if (challengeType === 'punctuation') {
    const targetSentences = length === 'short' ? 2 : length === 'medium' ? 3 : 5;
    const shuffled = shuffle([...PUNCTUATION_PASSAGES]);
    return shuffled.slice(0, targetSentences).join(' ');
  }
  
  if (challengeType === 'numbers') {
    const targetSentences = length === 'short' ? 2 : length === 'medium' ? 3 : 5;
    const shuffled = shuffle([...NUMBER_PASSAGES]);
    return shuffled.slice(0, targetSentences).join(' ');
  }
  
  if (challengeType === 'speed') {
    const targetLines = length === 'short' ? 3 : length === 'medium' ? 5 : 8;
    const shuffled = shuffle([...SPEED_PASSAGES]);
    return shuffled.slice(0, targetLines).join(' ');
  }
  
  if (difficulty === 'expert' || difficulty === 'advanced') {
    return generateComplexPassage(difficulty, length);
  }
  
  return generateSimplePassage(difficulty, length, theme);
}

const usedPassages = new Set<string>();

export function getUniquePassage(
  difficulty: Difficulty = 'intermediate',
  length: Length = 'medium',
  theme: Theme = 'general',
  challengeType: ChallengeType = 'standard',
  language: Language = 'english'
): string {
  let attempts = 0;
  let passage = '';
  
  do {
    passage = generatePassage(difficulty, length, theme, challengeType, language);
    attempts++;
  } while (usedPassages.has(passage) && attempts < 10);
  
  if (usedPassages.size >= 50) {
    usedPassages.clear();
  }
  
  usedPassages.add(passage);
  return passage;
}
