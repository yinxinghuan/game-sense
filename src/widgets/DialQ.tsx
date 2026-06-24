import { useRef, useState } from 'react';
import { Question } from '../types';
import { t } from '../i18n';
import { sfx, haptic } from '../lib/audio';

export default function DialQ({
  q, answered, onResolve,
}: {
  q: Question;
  answered: boolean;
  onResolve: (right: boolean, ev?: { x: number; y: number }) => void;
}) {
  const cfg = q.dial!;
  const [val, setVal] = useState(cfg.start);
  const [grab, setGrab] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const lastTick = useRef(0);

  const setFromPointer = (cx: number, cy: number) => {
    const r = knobRef.current?.getBoundingClientRect();
    if (!r) return;
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height / 2;
    let a = (Math.atan2(cx - ox, -(cy - oy)) * 180) / Math.PI; // 0 = up, + clockwise
    a = Math.max(-135, Math.min(135, a));
    const f = (a + 135) / 270;
    let v = cfg.min + f * (cfg.max - cfg.min);
    v = Math.round(v / cfg.step) * cfg.step;
    v = Math.max(cfg.min, Math.min(cfg.max, v));
    setVal((prev) => {
      if (v !== prev) {
        const now = Date.now();
        if (now - lastTick.current > 28) { sfx.tick(); lastTick.current = now; }
        haptic(4);
      }
      return v;
    });
  };

  const onDown = (e: React.PointerEvent) => {
    if (answered) return;
    try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } catch { /* */ }
    setGrab(true);
    setFromPointer(e.clientX, e.clientY);
    const mv = (ev: PointerEvent) => setFromPointer(ev.clientX, ev.clientY);
    const end = () => {
      setGrab(false);
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const frac = (val - cfg.min) / (cfg.max - cfg.min);
  const angle = frac * 270 - 135;
  const inRange = val >= cfg.target[0] && val <= cfg.target[1];

  const confirm = (e: React.MouseEvent) => {
    sfx.tap();
    onResolve(inRange, { x: e.clientX, y: e.clientY });
  };

  const dots = cfg.preview === 'count' ? Math.max(0, Math.min(14, Math.round(val))) : 0;

  return (
    <div className="dialQ">
      {cfg.preview === 'count' && (
        <div className="dialDots">
          {Array.from({ length: dots }).map((_, i) => <span key={i} className="ddot" />)}
        </div>
      )}

      <div className={'knob' + (grab ? ' grab' : '') + (answered ? (inRange ? ' ok' : ' no') : '')}
           ref={knobRef} onPointerDown={onDown}>
        <div className="knobFace" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="knobNotch" />
        </div>
        {answered && (
          <>
            <span className="dialTarget lo" style={{ transform: `rotate(${((cfg.target[0] - cfg.min) / (cfg.max - cfg.min)) * 270 - 135}deg)` }} />
            <span className="dialTarget hi" style={{ transform: `rotate(${((cfg.target[1] - cfg.min) / (cfg.max - cfg.min)) * 270 - 135}deg)` }} />
          </>
        )}
      </div>

      <div className="valReadout">{val}{cfg.unit || ''}</div>

      {!answered && (
        <button className="btn yel big" style={{ width: '100%' }} onClick={confirm}>{t('confirm')}</button>
      )}
    </div>
  );
}
