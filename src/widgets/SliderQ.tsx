import { useRef, useState } from 'react';
import { Question } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';

export default function SliderQ({
  q, answered, onResolve,
}: {
  q: Question;
  answered: boolean;
  onResolve: (right: boolean, ev?: { x: number; y: number }) => void;
}) {
  const cfg = q.slider!;
  const [val, setVal] = useState(cfg.start);
  const [grabbed, setGrabbed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastTick = useRef(0);

  const setFromX = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    let f = (clientX - r.left) / r.width;
    f = Math.max(0, Math.min(1, f));
    let v = cfg.min + f * (cfg.max - cfg.min);
    v = Math.round(v / cfg.step) * cfg.step;
    v = Math.max(cfg.min, Math.min(cfg.max, v));
    setVal((prev) => {
      if (v !== prev) {
        const now = Date.now();
        if (now - lastTick.current > 30) { sfx.tick(); lastTick.current = now; }
        haptic(4);
      }
      return v;
    });
  };

  const onDown = (e: React.PointerEvent) => {
    if (answered) return;
    setGrabbed(true);
    setFromX(e.clientX);
    const mv = (ev: PointerEvent) => setFromX(ev.clientX);
    const up = () => {
      setGrabbed(false);
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const frac = (val - cfg.min) / (cfg.max - cfg.min);
  const inRange = val >= cfg.target[0] && val <= cfg.target[1];
  const tLoFrac = (cfg.target[0] - cfg.min) / (cfg.max - cfg.min);
  const tHiFrac = (cfg.target[1] - cfg.min) / (cfg.max - cfg.min);

  // live preview reaction (guides without revealing exact bounds)
  let face = '🤔';
  if (cfg.preview === 'zone' || cfg.preview === 'size') {
    if (inRange) face = '🤩';
    else if (val < cfg.target[0]) face = '😴';
    else face = '😰';
  }

  const confirm = (e: React.MouseEvent) => {
    sfx.tap();
    onResolve(inRange, { x: e.clientX, y: e.clientY });
  };

  const sizePx = cfg.preview === 'size' ? Math.max(20, Math.min(96, val)) : 0;

  return (
    <div className="sliderQ">
      <div className="sliderPreview">
        {cfg.preview === 'size' ? (
          <div className="sizeWrap">
            <button className="sizeBox" style={{ width: sizePx, height: sizePx }} tabIndex={-1}>👆</button>
          </div>
        ) : (
          <div className="zoneFace">{face}</div>
        )}
      </div>

      <div className="trackWrap">
        <span className="endLabel">{loc(cfg.low)}</span>
        <div className="track" ref={trackRef} onPointerDown={onDown}>
          {answered && (
            <div className="targetBand" style={{ left: `${tLoFrac * 100}%`, width: `${(tHiFrac - tLoFrac) * 100}%` }} />
          )}
          <div className="trackFill" style={{ width: `${frac * 100}%` }} />
          <div className={'thumb' + (grabbed ? ' grab' : '') + (answered ? (inRange ? ' ok' : ' no') : '')}
               style={{ left: `${frac * 100}%` }} />
        </div>
        <span className="endLabel">{loc(cfg.high)}</span>
      </div>

      <div className="valReadout">{val}{cfg.unit || ''}</div>

      {!answered && (
        <button className="btn yel big slideConfirm" onClick={confirm}>{t('confirm')}</button>
      )}
    </div>
  );
}
