import { useEffect, useRef, useState } from 'react';
import { QuizResult } from '../types';
import { t } from '../i18n';
import { sfx } from '../lib/audio';
import { burst } from '../lib/fx';
import { saveResult } from '../lib/store';
import { loadBoard, fireScoreBeat, BoardRow } from '../lib/leaderboard';
import { openProfile } from '../lib/platform';

function rank(pct: number): { key: any; color: string } {
  if (pct >= 0.9) return { key: 'rankMaster', color: '#ffe83b' };
  if (pct >= 0.75) return { key: 'rankPro', color: '#ff2bd6' };
  if (pct >= 0.5) return { key: 'rankPlayer', color: '#21f3ff' };
  return { key: 'rankNovice', color: '#28ff9a' };
}

export default function ResultScreen({
  result,
  onReplay,
  onWall,
}: {
  result: QuizResult;
  onReplay: () => void;
  onWall: () => void;
}) {
  const [shown, setShown] = useState(0);
  const [board, setBoard] = useState<BoardRow[] | null>(null);
  const pct = result.correctCount / result.total;
  const r = rank(pct);
  const saved = useRef(false);

  useEffect(() => {
    if (!saved.current) {
      saved.current = true;
      saveResult(result);
      loadBoard().then((b) => { setBoard(b); fireScoreBeat(b); });
    }
    // count-up
    sfx.win();
    const dur = 1100;
    const start = Date.now();
    const iv = setInterval(() => {
      const f = Math.min(1, (Date.now() - start) / dur);
      setShown(Math.round(result.score * (1 - Math.pow(1 - f, 3))));
      if (f >= 1) clearInterval(iv);
    }, 40);
    // celebration bursts for good scores
    if (pct >= 0.75) {
      let n = 0;
      const cv = setInterval(() => {
        burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.6, 12);
        if (++n >= 5) clearInterval(cv);
      }, 220);
      return () => { clearInterval(iv); clearInterval(cv); };
    }
    return () => clearInterval(iv);
  }, []);

  const secs = Math.round(result.timeMs / 1000);
  const share = () => {
    sfx.tap();
    const text = `I scored ${result.score} on GAME SENSE — the arcade game-design quiz! Rank: ${t(r.key)}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="result crt">
      <div className="rankBadge arcade" style={{ color: r.color, border: `2px solid ${r.color}`, boxShadow: `0 0 24px ${r.color}66`, textShadow: `0 0 14px ${r.color}` }}>
        {t(r.key)}
      </div>
      <div className="arcade" style={{ fontSize: 10, color: 'var(--dim)' }}>{t('finalScore')}</div>
      <div className="bigScore">{shown}</div>

      <div className="statRow">
        <div className="stat"><span className="v">{Math.round(pct * 100)}%</span><span className="k">{t('accuracy')}</span></div>
        <div className="stat"><span className="v">x{result.maxCombo}</span><span className="k">{t('maxCombo')}</span></div>
        <div className="stat"><span className="v">{secs}s</span><span className="k">{t('time')}</span></div>
      </div>

      {board && board.length > 0 && (
        <div className="board">
          <div className="boardTitle arcade">🏆 {t('leaderboard')}</div>
          {(() => {
            const mi = board.findIndex((x) => x.isMe);
            const top = board.slice(0, 5);
            const rows = [...top];
            if (mi >= 5) rows.push(board[mi]); // always show my row
            return rows.map((row) => {
              const pos = board.indexOf(row) + 1;
              return (
                <div className={'boardRow' + (row.isMe ? ' me' : '')} key={row.uid}
                  onClick={() => !row.isMe && openProfile(row.uid)}>
                  <span className="bpos">{pos}</span>
                  <span className="avatar sm">{row.head ? <img src={row.head} alt="" /> : (row.name[0]?.toUpperCase() || '?')}</span>
                  <span className="bname">{row.isMe ? t('you') : row.name}</span>
                  <span className="bscore">{row.score}</span>
                </div>
              );
            });
          })()}
        </div>
      )}

      <div className="resBtns">
        <button className="btn mag big" onClick={onWall}>{t('toWall')}</button>
        <button className="btn big" onClick={onReplay}>{t('playAgain')}</button>
        <button className="btn ghost" onClick={share}>{t('share')}</button>
      </div>
    </div>
  );
}
