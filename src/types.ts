export interface QOption { en: string; zh: string; }

export type QType = 'mcq' | 'slider' | 'drag' | 'dial' | 'lever';

/** Slider: drag a value into the correct range. Optional live preview reacts as you slide. */
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  start: number;
  target: [number, number]; // correct range (inclusive)
  unit?: string;
  low: QOption;             // left-end label
  high: QOption;            // right-end label
  preview?: 'size' | 'zone';
}

/** Drag-to-bucket: classify each item into the YES or NO bucket. */
export interface DragItem { label: QOption; correct: boolean; } // correct = belongs in the YES bucket
export interface DragConfig {
  items: DragItem[];
  yes: QOption; // YES / first bucket label
  no: QOption;  // NO / second bucket label
}

/** Dial: rotate a knob to a value within the correct range. */
export interface DialConfig {
  min: number;
  max: number;
  step: number;
  start: number;
  target: [number, number];
  unit?: string;
  preview?: 'count'; // show that-many dots as you turn
}

/** Lever: pull the handle of the right machine to answer. */
export interface LeverMachine { label: QOption; correct: boolean; }
export interface LeverConfig { machines: LeverMachine[]; }

export interface Question {
  id: string;
  cat: 'core' | 'ixd' | 'feel' | 'feed' | 'eng' | 'social';
  diff: 'B' | 'A';
  type?: QType;          // default 'mcq'
  multi?: boolean;       // mcq only
  q: QOption;
  options?: QOption[];   // mcq only
  correct?: number[];    // mcq only
  slider?: SliderConfig; // slider only
  drag?: DragConfig;     // drag only
  dial?: DialConfig;     // dial only
  lever?: LeverConfig;   // lever only
  explain: QOption;
  img?: string;
}

/** An mcq question with its options pre-shuffled for display. */
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
  id: string;
  title: string;
  url: string;
  note?: string;
  authorId: string;
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
