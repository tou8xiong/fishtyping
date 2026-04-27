const BEGINNER_PROGRESS_KEY = 'fishtyping_beginner_progress';
const LETTERS_THRESHOLD = 100; // Number of letters to type before transitioning to words
const ACCURACY_THRESHOLD = 80; // Minimum accuracy percentage required

export type BeginnerPhase = 'letters' | 'words';

interface BeginnerProgress {
  totalLettersTyped: number;
  totalCorrectLetters: number;
  lastUpdated: string;
}

/**
 * Get the current beginner phase based on progress
 */
export function getBeginnerPhase(): BeginnerPhase {
  const progress = getProgress();

  if (progress.totalLettersTyped >= LETTERS_THRESHOLD) {
    const accuracy = (progress.totalCorrectLetters / progress.totalLettersTyped) * 100;
    if (accuracy >= ACCURACY_THRESHOLD) {
      return 'words';
    }
  }

  return 'letters';
}

/**
 * Get letter practice text based on progression
 */
export function getLetterPracticeText(language: 'english' | 'lao'): string {
  const progress = getProgress();

  if (language === 'lao') {
    // Lao letter practice - common consonants and vowels
    if (progress.totalLettersTyped < 30) {
      return 'ກ ຂ ຄ ງ ຈ ສ ດ ຕ ທ ນ ບ ປ ຜ ຝ ພ ຟ ມ ຢ ຣ ລ ວ ຫ ອ ຮ';
    } else if (progress.totalLettersTyped < 60) {
      return 'ກາ ຂາ ຄາ ງາ ຈາ ສາ ດາ ຕາ ທາ ນາ ບາ ປາ ມາ ຢາ ລາ ວາ ຫາ ອາ';
    } else {
      return 'ກິນ ນອນ ຢູ່ ໄປ ມາ ດີ ງາມ ສະບາຍ ຂອບໃຈ ສະບາຍດີ';
    }
  }

  // English letter practice
  if (progress.totalLettersTyped < 30) {
    // Home row only
    return 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj';
  } else if (progress.totalLettersTyped < 60) {
    // Add top row
    return 'asdf jkl; qwer uiop asdf jkl; qwer uiop fdsa ;lkj';
  } else {
    // All rows with simple words
    return 'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs';
  }
}

/**
 * Track beginner progress after completing a typing session
 */
export function trackBeginnerProgress(lettersTyped: number, correctLetters: number): void {
  const progress = getProgress();

  progress.totalLettersTyped += lettersTyped;
  progress.totalCorrectLetters += correctLetters;
  progress.lastUpdated = new Date().toISOString();

  saveProgress(progress);
}

/**
 * Get current progress from localStorage
 */
function getProgress(): BeginnerProgress {
  if (typeof window === 'undefined') {
    return { totalLettersTyped: 0, totalCorrectLetters: 0, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(BEGINNER_PROGRESS_KEY);
  if (!stored) {
    return { totalLettersTyped: 0, totalCorrectLetters: 0, lastUpdated: new Date().toISOString() };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { totalLettersTyped: 0, totalCorrectLetters: 0, lastUpdated: new Date().toISOString() };
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress: BeginnerProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BEGINNER_PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Reset beginner progress (for testing or user request)
 */
export function resetBeginnerProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BEGINNER_PROGRESS_KEY);
}

/**
 * Get progress stats for display
 */
export function getProgressStats(): { lettersTyped: number; accuracy: number; phase: BeginnerPhase } {
  const progress = getProgress();
  const accuracy = progress.totalLettersTyped > 0
    ? (progress.totalCorrectLetters / progress.totalLettersTyped) * 100
    : 0;

  return {
    lettersTyped: progress.totalLettersTyped,
    accuracy: Math.round(accuracy),
    phase: getBeginnerPhase()
  };
}
