// Colleague-facing results board: lists every player's best score for manual token grants.
// Open with ?view=results. Reads all players' save blobs and extracts their quiz result.
import { useEffect, useState } from 'react';
import { listData, getProfile, isInAigram } from '../lib/platform';
import { SaveBlob, getBlob, selfId } from '../lib/store';
import { QuizResult } from '../types';

interface Row { uid: string; name: string; result: QuizResult; }

export default function Results() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await listData();
      const parsed: { uid: string; blob: SaveBlob }[] = [];
      for (const r of raw) {
        if (!r.user_id || !r.resource_data) continue;
        try { parsed.push({ uid: String(r.user_id), blob: JSON.parse(r.resource_data) }); } catch { /* */ }
      }
      // include local self
      if (!parsed.some((p) => p.uid === selfId())) parsed.push({ uid: selfId(), blob: getBlob() });

      const out: Row[] = [];
      for (const { uid, blob } of parsed) {
        if (!blob.result) continue;
        let name = blob.result.name || 'Player';
        if (isInAigram) {
          const p = await getProfile(uid);
          if (p?.name) name = p.name;
        }
        out.push({ uid, name, result: blob.result });
      }
      out.sort((a, b) => b.result.score - a.result.score);
      setRows(out);
    })();
  }, []);

  const csv = () => {
    if (!rows) return;
    const head = 'rank,name,uid,score,correct,total,accuracy_pct,max_combo,time_sec\n';
    const body = rows.map((r, i) =>
      [i + 1, JSON.stringify(r.name), r.uid, r.result.score, r.result.correctCount, r.result.total,
        Math.round((r.result.correctCount / r.result.total) * 100), r.result.maxCombo,
        Math.round(r.result.timeMs / 1000)].join(',')).join('\n');
    const blob = new Blob([head + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'game-sense-results.csv';
    a.click();
  };

  return (
    <div className="app crt" style={{ padding: 16, overflowY: 'auto' }}>
      <h2 className="arcade" style={{ color: 'var(--cyan)', fontSize: 16 }}>RESULTS BOARD</h2>
      <p style={{ color: 'var(--dim)', fontSize: 13 }}>
        Best score per player. Use this for manual token grants. Token conversion is done separately.
      </p>
      {!rows ? <p style={{ color: 'var(--dim)' }}>Loading…</p> : (
        <>
          <button className="btn yel" onClick={csv} style={{ marginBottom: 14 }}>⤓ Export CSV</button>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--magenta)', textAlign: 'left' }}>
                  <th style={{ padding: 6 }}>#</th><th style={{ padding: 6 }}>Name</th>
                  <th style={{ padding: 6 }}>Score</th><th style={{ padding: 6 }}>Acc</th>
                  <th style={{ padding: 6 }}>Combo</th><th style={{ padding: 6 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} style={{ padding: 14, color: 'var(--dim)' }}>No submissions yet.</td></tr>}
                {rows.map((r, i) => (
                  <tr key={r.uid} style={{ borderTop: '1px solid rgba(140,134,201,0.2)' }}>
                    <td style={{ padding: 6, color: 'var(--yellow)' }}>{i + 1}</td>
                    <td style={{ padding: 6 }}>{r.name}</td>
                    <td style={{ padding: 6, color: 'var(--cyan)' }}>{r.result.score}</td>
                    <td style={{ padding: 6 }}>{Math.round((r.result.correctCount / r.result.total) * 100)}%</td>
                    <td style={{ padding: 6 }}>x{r.result.maxCombo}</td>
                    <td style={{ padding: 6 }}>{Math.round(r.result.timeMs / 1000)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
