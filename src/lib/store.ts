// Single per-user save blob for this game, mirrored locally and pushed to the platform.
// Blob shape: { result, works[], comments[], cheered[] }.
// Cross-user wall/results aggregate every user's blob via listData().
import { QuizResult, WorkEntry, CommentEntry } from '../types';
import { saveData, telegramId } from './platform';

export interface SaveBlob {
  result?: QuizResult;
  works: WorkEntry[];
  comments: CommentEntry[];
  cheered: string[]; // work ids this user cheered
  _lastActive?: number;
}

const KEY = 'gsq-save-v1';

function read(): SaveBlob {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { works: [], comments: [], cheered: [] };
}

// in-memory mirror (source of truth during a session)
let blob: SaveBlob = read();

function commit() {
  blob._lastActive = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
  saveData(blob);
}

export function getBlob(): SaveBlob {
  return blob;
}

/** Stable local id used when running standalone (no telegram id). */
export function selfId(): string {
  if (telegramId) return telegramId;
  let id = localStorage.getItem('gsq-localid');
  if (!id) {
    id = 'local-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gsq-localid', id);
  }
  return id;
}

export function saveResult(result: QuizResult) {
  // keep the best score
  if (!blob.result || result.score > blob.result.score) blob.result = result;
  else blob.result = { ...blob.result, ...{} }; // keep best
  commit();
}

export function addWork(w: WorkEntry) {
  blob.works = [w, ...blob.works];
  commit();
}

export function addComment(c: CommentEntry) {
  blob.comments = [...blob.comments, c];
  commit();
}

export function toggleCheer(workId: string): boolean {
  const has = blob.cheered.includes(workId);
  blob.cheered = has ? blob.cheered.filter((x) => x !== workId) : [...blob.cheered, workId];
  commit();
  return !has;
}

export function hasCheered(workId: string): boolean {
  return blob.cheered.includes(workId);
}

// --- local-only notify dedupe (score-beat etc.) ---
const NK = 'gsq-notified';
export function wasNotified(k: string): boolean {
  try { return (JSON.parse(localStorage.getItem(NK) || '[]') as string[]).includes(k); } catch { return false; }
}
export function markNotified(k: string) {
  try {
    const a = JSON.parse(localStorage.getItem(NK) || '[]') as string[];
    if (!a.includes(k)) { a.push(k); localStorage.setItem(NK, JSON.stringify(a)); }
  } catch { /* ignore */ }
}
