// Public score leaderboard, aggregated from every player's save blob (best score).
// Reuses the same cross-user data as the wall — no separate rank backend.
import { listData, getProfile, isInAigram, notify } from './platform';
import { SaveBlob, getBlob, selfId, wasNotified, markNotified } from './store';

export interface BoardRow {
  uid: string;
  name: string;
  score: number;
  head?: string;
  isMe: boolean;
}

export async function loadBoard(): Promise<BoardRow[]> {
  const raw = await listData();
  const parsed: { uid: string; blob: SaveBlob }[] = [];
  for (const r of raw) {
    if (!r.user_id || !r.resource_data) continue;
    try { parsed.push({ uid: String(r.user_id), blob: JSON.parse(r.resource_data) }); } catch { /* */ }
  }
  const me = selfId();
  const mine = parsed.findIndex((p) => p.uid === me);
  if (mine >= 0) parsed[mine] = { uid: me, blob: getBlob() };
  else parsed.push({ uid: me, blob: getBlob() });

  const rows: BoardRow[] = parsed
    .filter((p) => p.blob.result)
    .map((p) => ({ uid: p.uid, name: p.blob.result!.name || 'Player', score: p.blob.result!.score, isMe: p.uid === me }));
  rows.sort((a, b) => b.score - a.score);

  if (isInAigram) {
    await Promise.all(rows.map(async (r) => {
      const pr = await getProfile(r.uid);
      if (pr) { r.name = pr.name || r.name; r.head = pr.head_url; }
    }));
  }
  return rows;
}

/** Notify the single nearest rival this player just overtook (score-beat). Dedupes per rival. */
export function fireScoreBeat(board: BoardRow[]) {
  const mi = board.findIndex((r) => r.isMe);
  if (mi < 0) return;
  const rival = board[mi + 1];
  if (!rival || rival.isMe || rival.score <= 0) return;
  const key = 'beat:' + rival.uid;
  if (wasNotified(key)) return;
  notify('score_beat:' + rival.uid, {
    targetUserId: rival.uid,
    template: '{sender_name} just passed your score on Game Sense.',
  });
  markNotified(key);
}
