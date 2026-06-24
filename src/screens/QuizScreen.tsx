import { useMemo, useRef, useState } from 'react';
import questionsData from '../data/questions.json';
import { Question, ShuffledQuestion, QuizResult } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';
import { burst, floatScore } from '../lib/fx';
import { hitShout, missShout, streakShout } from '../lib/shouts';
import SliderQ from '../widgets/SliderQ';
import DragQ from '../widgets/DragQ';
import DialQ from '../widgets/DialQ';
import LeverQ from '../widgets/LeverQ';
import Boundary from '../widgets/Boundary';

const NUM = 14;
const Q_TIME = 18000;
const KEYS = ['A', 'B', 'C', 'D', 'E'];
const CAT_LABEL: Record<string, string> = {
  core: 'CORE DESIGN', ixd: 'INTERACTION', feel: 'GAME FEEL',
  feed: 'FEED UX', eng: 'ENGINEERING', social: 'SOCIAL',
};
const IMG_BASE = import.meta.env.BASE_URL + 'q/';
const isMcq = (q: Question) => !q.type || q.type === 'mcq';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(): ShuffledQuestion[] {
  const all = questionsData as Question[];
  const inter = shuffle(all.filter((q) => !isMcq(q)));
  const mcq = shuffle(all.filter(isMcq));
  // ensure the interactive questions show up, then fill with random mcq
  const chosen = shuffle([...inter, ...mcq.slice(0, Math.max(0, NUM - inter.length))]).slice(0, NUM);
  return chosen.map((q) => ({
    ...q,
    shuffled: q.options
      ? shuffle(q.options.map((opt, i) => ({ opt, isCorrect: (q.correct || []).includes(i) })))
      : [],
  }));
}

interface Burst { word: string; front: string; mid: string; ray: string; rot: number; shape: number; id: number; }

function ComicBurst({ b }: { b: Burst | null }) {
  if (!b) return null;
  return (
    <div className="cburst" key={b.id} style={{ ['--rot' as any]: b.rot + 'deg' }}>
      <div className="cburstInner">
        <div className="rays" style={{ background: `repeating-conic-gradient(from 0deg, ${b.ray} 0deg 7deg, transparent 7deg 15deg)` }} />
        <div className={'star back s' + b.shape} />
        <div className={'star mid s' + b.shape} style={{ background: b.mid }} />
        <div className={'star front s' + b.shape} style={{ background: b.front }} />
        <div className="word">{b.word}</div>
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={'spark sp' + i}>★</span>)}
      </div>
    </div>
  );
}

export default function QuizScreen({ name, onFinish }: { name: string; onFinish: (r: QuizResult) => void }) {
  const round = useMemo(buildRound, []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const maxComboRef = useRef(0);
  const answersRef = useRef<QuizResult['answers']>([]);
  const startRef = useRef(Date.now());

  const [picked, setPicked] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [cb, setCb] = useState<Burst | null>(null);
  const cbId = useRef(0);
  const qStartRef = useRef(Date.now());
  const comboRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const q = round[idx];

  const PALETTE: Record<string, { front: string; mid: string; ray: string }> = {
    hit: { front: '#ffd60a', mid: '#e63946', ray: 'rgba(255,214,10,0.5)' },
    miss: { front: '#ffffff', mid: '#e63946', ray: 'rgba(230,57,70,0.4)' },
    streak: { front: '#ff6b9d', mid: '#2c6df4', ray: 'rgba(255,107,157,0.5)' },
  };
  const showBurst = (word: string, kind: 'hit' | 'miss' | 'streak') => {
    cbId.current += 1;
    const id = cbId.current;
    const p = PALETTE[kind];
    setCb({ word, ...p, rot: Math.round(Math.random() * 36 - 18), shape: Math.floor(Math.random() * 3), id });
    setTimeout(() => setCb((c) => (c && c.id === id ? null : c)), 820);
  };

  // shared scoring + juice for every question type
  const resolve = (right: boolean, ev?: { x: number; y: number }) => {
    if (answered) return;
    setAnswered(true);
    setWasRight(right);
    const ms = Date.now() - qStartRef.current;
    answersRef.current.push({ id: q.id, correct: right, ms });
    const x = ev?.x ?? window.innerWidth / 2;
    const y = ev?.y ?? window.innerHeight * 0.4;

    if (right) {
      const frac = Math.max(0, 1 - ms / Q_TIME);
      const speed = Math.round(50 * frac);
      const gained = 100 + speed + combo * 10;
      setScore((s) => s + gained);
      const nc = combo + 1;
      setCombo(nc);
      maxComboRef.current = Math.max(maxComboRef.current, nc);
      sfx.correct(nc);
      if (nc >= 2) sfx.combo(nc);
      haptic([10, 30, 10]);
      burst(x, y, 18);
      showBurst(hitShout() + (frac > 0.6 ? ' ⚡' : ''), 'hit');
      floatScore('+' + gained, '#3fb950');
      if (nc === 3 || nc === 5 || nc === 7 || nc === 10) {
        setTimeout(() => showBurst(streakShout(), 'streak'), 340);
      }
      comboRef.current?.classList.remove('pop');
      void comboRef.current?.offsetWidth;
      comboRef.current?.classList.add('pop');
    } else {
      setCombo(0);
      sfx.wrong();
      haptic([40, 30, 40]);
      showBurst(missShout(), 'miss');
      if (stageRef.current) {
        stageRef.current.classList.remove('shake');
        void stageRef.current.offsetWidth;
        stageRef.current.classList.add('shake');
        setTimeout(() => stageRef.current?.classList.remove('shake'), 360);
      }
    }
  };

  // mcq
  const isSelected = (i: number) => picked.includes(i);
  const toggle = (i: number) => {
    if (answered) return;
    sfx.tap(); haptic(8);
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };
  const judge = (sel: number[], ev?: { x: number; y: number }) => {
    if (answered) return;
    const correctIdx = q.shuffled.map((s, i) => (s.isCorrect ? i : -1)).filter((i) => i >= 0);
    const right = sel.length === correctIdx.length && sel.every((i) => correctIdx.includes(i));
    setPicked(sel);
    resolve(right, ev);
  };
  const confirmMulti = (ev: React.MouseEvent) => {
    if (!picked.length) return;
    judge(picked, { x: ev.clientX, y: ev.clientY });
  };

  const next = () => {
    if (idx + 1 >= round.length) {
      onFinish({
        name, score,
        correctCount: answersRef.current.filter((a) => a.correct).length,
        total: round.length,
        maxCombo: maxComboRef.current,
        timeMs: Date.now() - startRef.current,
        answers: answersRef.current,
      });
      return;
    }
    sfx.tap();
    setIdx((i) => i + 1);
    setPicked([]);
    setAnswered(false);
    qStartRef.current = Date.now();
  };

  const optClass = (i: number) => {
    let c = 'opt';
    if (q.shuffled[i].isCorrect && answered) c += ' correct';
    else if (isSelected(i) && answered && !wasRight) c += ' wrong';
    else if (isSelected(i)) c += ' sel';
    else if (answered) c += ' faded';
    if (answered) c += ' disabled';
    return c;
  };

  const hint = q.type === 'slider' ? t('sliderHint')
    : q.type === 'drag' ? t('dragHint')
    : q.type === 'dial' ? t('dialHint')
    : q.type === 'lever' ? t('leverHint')
    : q.multi ? t('multiHint') : '';

  return (
    <div className="quiz" ref={stageRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ComicBurst b={cb} />

      <div className="quizTop">
        <span className="qcount">{idx + 1} / {round.length}</span>
        <div className="progress"><i style={{ width: `${((idx + (answered ? 1 : 0)) / round.length) * 100}%` }} /></div>
        <span className="score">{score}</span>
      </div>

      {combo >= 2 && (
        <div className="comboChip" ref={comboRef}>{t('combo')} <b>x{combo}</b> 🔥</div>
      )}

      <div className="qbody">
        <Boundary key={q.id} onSkip={next}>
          <div className="qcard">
            {q.img && <img className="qimg" src={IMG_BASE + q.img} alt="" draggable={false} />}
            <div className="qtag">{CAT_LABEL[q.cat]}</div>
            <div className="qtext">{loc(q.q)}</div>
            {hint && <div className="multiHint">✦ {hint}</div>}
          </div>

          {isMcq(q) && (
            <div className="opts">
              {q.shuffled.map((s, i) => (
                <button
                  key={i}
                  className={optClass(i)}
                  style={{ animationDelay: `${i * 0.05}s`, ['--fx' as any]: i % 2 ? '70px' : '-70px', ['--fr' as any]: i % 2 ? '4deg' : '-4deg' }}
                  onClick={(e) => (q.multi ? toggle(i) : judge([i], { x: e.clientX, y: e.clientY }))}
                >
                  <span className="key">{KEYS[i]}</span>
                  {loc(s.opt)}
                  {answered && s.isCorrect && <span className="mark">✓</span>}
                  {answered && isSelected(i) && !s.isCorrect && <span className="mark">✕</span>}
                </button>
              ))}
            </div>
          )}

          {q.type === 'slider' && <SliderQ q={q} answered={answered} onResolve={resolve} />}
          {q.type === 'drag' && <DragQ q={q} answered={answered} onResolve={resolve} />}
          {q.type === 'dial' && <DialQ q={q} answered={answered} onResolve={resolve} />}
          {q.type === 'lever' && <LeverQ q={q} answered={answered} onResolve={resolve} />}

          {answered && (
            <div className="explain">
              <b className={wasRight ? 'neon-cyan' : 'neon-mag'}>{wasRight ? t('correct') : t('wrong')}</b>
              {loc(q.explain)}
            </div>
          )}
        </Boundary>
      </div>

      <div className="qfoot">
        {answered ? (
          <button className="btn mag big" style={{ width: '100%' }} onClick={next}>
            {idx + 1 >= round.length ? t('finish') : t('next')}
          </button>
        ) : isMcq(q) && q.multi ? (
          <button className="btn yel big" style={{ width: '100%' }} onClick={confirmMulti} disabled={!picked.length}>
            {t('confirm')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
