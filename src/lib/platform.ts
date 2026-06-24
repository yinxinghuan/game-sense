// Thin wrapper over the Aigram platform data + notify endpoints.
// All endpoints are CORS-open (`*`), so we fetch them directly — works inside the
// Aigram iframe AND when opened standalone in any browser (degrades to read-only / local).
import { getGameUuid } from '../game-id';

const params = new URLSearchParams(window.location.search);

/** Backend origin passed by Aigram on launch; falls back to the public host for standalone. */
const API_ORIGIN = decodeURIComponent(params.get('api_origin') || '') || 'https://chat.aiwaves.tech';

/** Current player's platform id (only present when launched inside Aigram). */
export const telegramId: string | null = params.get('telegram_id');

/** True only when launched inside Aigram with a real identity. */
export const isInAigram: boolean = !!params.get('api_origin') && !!telegramId;

export interface SaveRow {
  user_id: string;
  time: string;
  resource_data: string;
}

export interface AigramResponse<T> {
  retcode?: number;
  data?: T;
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, { method: 'GET' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function apiPost(path: string, body: object): void {
  // fire-and-forget
  try {
    fetch(`${API_ORIGIN}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Persist this player's save blob (cloud). Local mirror is the caller's job. */
export function saveData(resource: object): void {
  const session = getGameUuid();
  if (!isInAigram || !session) return;
  apiPost('/note/aigram/ai/game/save/data', {
    session_id: session,
    resource_data: JSON.stringify(resource),
  });
}

/** List the latest save blob of recent players for this game (cross-user wall source). */
export async function listData(): Promise<SaveRow[]> {
  const session = getGameUuid();
  if (!session) return [];
  const res = await apiGet<AigramResponse<SaveRow[]>>(
    `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(session)}`,
  );
  return Array.isArray(res?.data) ? res!.data! : [];
}

export interface ProfileInfo {
  name?: string;
  head_url?: string;
}

/** Resolve a platform user's display name + avatar. */
export async function getProfile(uid: string): Promise<ProfileInfo | null> {
  const res = await apiGet<AigramResponse<ProfileInfo>>(
    `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(uid)}`,
  );
  return res?.data ?? null;
}

export interface NotifyOptions {
  targetUserId: string;
  template: string; // e.g. "{sender_name} commented on your game."
  imageRefUrl?: string; // public absolute URL (poster of the work)
}

/**
 * Fire a cross-user push notification via record/play -> config_json.actions[].type='notify'.
 * Caller MUST self-guard (never notify yourself) and dedupe before calling.
 */
export function notify(event: string, opts: NotifyOptions): void {
  const session = getGameUuid();
  if (!isInAigram || !session) return;
  if (!opts.targetUserId || opts.targetUserId === telegramId) return;

  const action: any = {
    type: 'notify',
    target_user_id: opts.targetUserId,
    message: { template: opts.template, variables: ['sender_name'] },
  };
  if (opts.imageRefUrl) action.image = { ref_url: opts.imageRefUrl };

  apiPost('/note/aigram/ai/game/record/play', {
    session_id: session,
    event,
    config_json: JSON.stringify({ actions: [action] }),
  });
}

/** Open another player's Aigram profile (no-op outside Aigram). */
export function openProfile(uid: string): void {
  if (!uid) return;
  try {
    (window as any).AW?.PROFILE?.OPEN?.(uid);
    window.parent?.postMessage({ type: 'AW.PROFILE.OPEN', payload: { telegram_id: uid } }, '*');
  } catch {
    /* ignore */
  }
}
