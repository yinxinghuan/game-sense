import { useState } from 'react';
import { Question } from '../types';
import { sfx, haptic } from '../lib/audio';

export default function SizePickQ({
  q, answered, onResolve,
}: {
  q: Question;
  answered: boolean;
  onResolve: (right: boolean, ev?: { x: number; y: number }) => void;
}) {
  const cfg = q.pick!;
  const [picked, setPicked] = useState<number | null>(null);

  const tap = (i: number, e: React.MouseEvent) => {
    if (answered) return;
    sfx.tap(); haptic(10);
    setPicked(i);
    onResolve(i === cfg.correct, { x: e.clientX, y: e.clientY });
  };

  return (
    <div className="sizepickQ">
      <div className="sizeRow">
        {cfg.sizes.map((s, i) => {
          const right = answered && i === cfg.correct;
          const wrong = answered && picked === i && i !== cfg.correct;
          return (
            <div className="sizeCol" key={i}>
              <button
                className={'sizeTarget' + (right ? ' right' : '') + (wrong ? ' wrong' : '')}
                style={{ width: s, height: s }}
                onClick={(e) => tap(i, e)}
              >
                {right ? '✓' : wrong ? '✕' : ''}
              </button>
              <span className="sizeLabel">{s}{cfg.unit || 'px'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
