export interface QOption { en: string; zh: string; }
export interface Question {
  id: string;
  cat: 'core' | 'ixd' | 'feel' | 'feed' | 'eng' | 'social';
  diff: 'B' | 'A';
  multi: boolean;
  q: QOption;
  options: QOption[];
  correct: number[];
  explain: QOption;
}

/** A question with its options pre-shuffled for display. */
export interface ShuffledQuestion extends Question {
  shuffled: { opt: QOption; isCorrect: boolean }[];
}

export interface QuizResult {
  name: string;
  score: number;
  correctCount: number;
  total: number;
  maxCombo: number;
  timeMs: number;
  answers: { id: string; correct: boolean; ms: number }[];
}

export interface WorkEntry {
  id: string;          // unique work id
  title: string;
  url: string;
  note?: string;
  authorId: string;    // telegram id (or local id when standalone)
  authorName: string;
  ts: number;
  cheers: number;
}

export interface CommentEntry {
  workId: string;
  authorId: string;
  authorName: string;
  text: string;
  ts: number;
}

export type Screen = 'start' | 'quiz' | 'result' | 'wall';
