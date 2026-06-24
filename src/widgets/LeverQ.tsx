import { useRef, useState } from 'react';
import { Question } from '../types';
import { loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';

const MAX_PULL = 64;
const THRESH = 42;

export default function LeverQ({
  q, answered, onResolve,
}: {
  q: Question;
  answered: boolean;
  onResolve: (right: boolean, ev?: { x: number; y: number }) => void;
}) {
  const cfg = q.lever!;
  const [dy, setDy] = useState<{ idx: number; y: number } | null>(null);
  const [pulled, setPulled] = useState<number | null>(null);
  const startY = useRef(0);

  const onDown = (idx: number, e: React.PointerEvent) => {
    if (answered || pulled !== null) return;
    sfx.tap();
    try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } catch { /* */ }
    startY.current = e.clientY;
    setDy({ idx, y: 0 });
    const mv = (ev: PointerEvent) => {
      const d = Math.max(0, Math.min(MAX_PULL, ev.clientY - startY.current));
      setDy({ idx, y: d });
      haptic(3);
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
    const up = (ev: PointerEvent) => {
      cleanup();
      const d = Math.max(0, Math.min(MAX_PULL, ev.clientY - startY.current));
      if (d >= THRESH) {
        setPulled(idx);
        setDy({ idx, y: MAX_PULL });
        sfx.combo(3); haptic([12, 30, 12]);
        setTimeout(() => onResolve(cfg.machines[idx].correct, { x: ev.clientX, y: ev.clientY }), 380);
      } else {
        setDy(null);
      }
    };
    const cancel = () => { cleanup(); setDy(null); };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  };

  const handleY = (idx: number) => (dy && dy.idx === idx ? dy.y : pulled === idx ? MAX_PULL : 0);

  return (
    <div className="leverQ">
      <div className="machines" style={{ gridTemplateColumns: `repeat(${cfg.machines.length}, 1fr)` }}>
        {cfg.machines.map((m, i) => {
          const spinning = pulled === i;
          const showRight = answered && m.correct;
          const showWrongPick = answered && pulled === i && !m.correct;
          return (
            <div key={i} className={'machine' + (showRight ? ' right' : '') + (showWrongPick ? ' wrong' : '')}>
              <div className="mlabel">{loc(m.label)}</div>
              <div className="reels">
                <span className={'reel' + (spinning ? ' spin' : '')}>{answered ? (m.correct ? '💰' : '💀') : '❓'}</span>
                <span className={'reel' + (spinning ? ' spin' : '')}>{answered ? (m.correct ? '💰' : '💀') : '❓'}</span>
                <span className={'reel' + (spinning ? ' spin' : '')}>{answered ? (m.correct ? '💰' : '💀') : '❓'}</span>
              </div>
              <div className="leverTrack">
                <div className="leverArm" style={{ transform: `translateY(${handleY(i)}px)` }}
                     onPointerDown={(e) => onDown(i, e)}>
                  <span className="leverBall" />
                </div>
              </div>
              {showRight && <span className="mflag">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
