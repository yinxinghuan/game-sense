import { useRef, useState } from 'react';
import { Question } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';

type Bucket = 'yes' | 'no';

export default function DragQ({
  q, answered, onResolve,
}: {
  q: Question;
  answered: boolean;
  onResolve: (right: boolean, ev?: { x: number; y: number }) => void;
}) {
  const cfg = q.drag!;
  const [place, setPlace] = useState<(Bucket | null)[]>(() => cfg.items.map(() => null));
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number } | null>(null);
  const dragInfo = useRef<{ idx: number } | null>(null);

  const startDrag = (idx: number, e: React.PointerEvent) => {
    if (answered) return;
    sfx.tap(); haptic(8);
    dragInfo.current = { idx };
    setDrag({ idx, x: e.clientX, y: e.clientY });
    const mv = (ev: PointerEvent) => setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
      const b = el?.closest('[data-bucket]')?.getAttribute('data-bucket') as Bucket | undefined;
      if (b && dragInfo.current) {
        sfx.combo(2); haptic([8, 20]);
        setPlace((p) => p.map((v, i) => (i === dragInfo.current!.idx ? b : v)));
      }
      dragInfo.current = null;
      setDrag(null);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const placedCount = place.filter((p) => p !== null).length;
  const allPlaced = placedCount === cfg.items.length;

  const confirm = (e: React.MouseEvent) => {
    sfx.tap();
    const right = cfg.items.every((it, i) => place[i] === (it.correct ? 'yes' : 'no'));
    onResolve(right, { x: e.clientX, y: e.clientY });
  };

  const chipClass = (i: number) => {
    let c = 'dchip';
    if (drag?.idx === i) c += ' ghost';
    if (answered) c += place[i] === (cfg.items[i].correct ? 'yes' : 'no') ? ' right' : ' wrong';
    return c;
  };

  const inBucket = (b: Bucket) => cfg.items.map((_, i) => i).filter((i) => place[i] === b);
  const tray = cfg.items.map((_, i) => i).filter((i) => place[i] === null);

  const renderChip = (i: number) => (
    <div key={i} className={chipClass(i)} onPointerDown={(e) => startDrag(i, e)}>
      {loc(cfg.items[i].label)}
      {answered && <span className="dmark">{place[i] === (cfg.items[i].correct ? 'yes' : 'no') ? '✓' : '✕'}</span>}
    </div>
  );

  return (
    <div className="dragQ">
      <div className="buckets">
        <div className="bucket yes" data-bucket="yes">
          <div className="bhdr">{loc(cfg.yes)}</div>
          <div className="bitems">{inBucket('yes').map(renderChip)}</div>
        </div>
        <div className="bucket no" data-bucket="no">
          <div className="bhdr">{loc(cfg.no)}</div>
          <div className="bitems">{inBucket('no').map(renderChip)}</div>
        </div>
      </div>

      <div className="tray">
        {tray.length === 0 && !answered && <span className="trayhint">{t('allSorted')}</span>}
        {tray.map(renderChip)}
      </div>

      {!answered && allPlaced && (
        <button className="btn yel big" style={{ width: '100%' }} onClick={confirm}>{t('confirm')}</button>
      )}

      {drag && (
        <div className="dfloat" style={{ left: drag.x, top: drag.y }}>{loc(cfg.items[drag.idx].label)}</div>
      )}
    </div>
  );
}
