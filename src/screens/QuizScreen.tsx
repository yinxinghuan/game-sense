import { useMemo, useRef, useState } from 'react';
import questionsData from '../data/questions.json';
import { Question, ShuffledQuestion, QuizResult } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';
import { burst, floatScore } from '../lib/fx';
import { hitShout, missShout, streakShout, faceRight, faceWrong } from '../lib/shouts';

const NUM = 14;
const Q_TIME = 18000; // internal speed window (ms) — no visible clock, just a hidden speed bonus
const KEYS = ['A', 'B', 'C', 'D', 'E'];
const CAT_LABEL: Record<string, string> = {
  core: 'CORE DESIGN', ixd: 'INTERACTION', feel: 'GAME FEEL',
  feed: 'FEED UX', eng: 'ENGINEERING', social: 'SOCIAL',
};
const IMG_BASE = import.meta.env.BASE_URL + 'q/';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(): ShuffledQuestion[] {
  const picked = shuffle(questionsData as Question[]).slice(0, NUM);
  return picked.map((q) => ({
    ...q,
    shuffled: shuffle(q.options.map((opt, i) => ({ opt, isCorrect: q.correct.includes(i) }))),
  }));
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
  const [face, setFace] = useState('🤔');
  const qStartRef = useRef(Date.now());
  const comboRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const q = round[idx];

  const isSelected = (i: number) => picked.includes(i);

  const toggle = (i: number) => {
    if (answered) return;
    sfx.tap();
    haptic(8);
    if (q.multi) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    }
  };

  const judge = (sel: number[], ev?: { x: number; y: number }) => {
    if (answered) return;
    const correctIdx = q.shuffled.map((s, i) => (s.isCorrect ? i : -1)).filter((i) => i >= 0);
    const right = sel.length === correctIdx.length && sel.every((i) => correctIdx.includes(i));
    setPicked(sel);
    setAnswered(true);
    setWasRight(right);

    const ms = Date.now() - qStartRef.current;
    answersRef.current.push({ id: q.id, correct: right, ms });
    const x = ev?.x ?? window.innerWidth / 2;
    const y = ev?.y ?? window.innerHeight * 0.4;

    if (right) {
      const frac = Math.max(0, 1 - ms / Q_TIME);
      const fast = frac > 0.6;
      const speed = Math.round(50 * frac);
      const gained = 100 + speed + combo * 10;
      setScore((s) => s + gained);
      const nc = combo + 1;
      setCombo(nc);
      maxComboRef.current = Math.max(maxComboRef.current, nc);
      setFace(faceRight());
      sfx.correct(nc);
      if (nc >= 2) sfx.combo(nc);
      haptic([10, 30, 10]);
      burst(x, y, 18);
      floatScore(hitShout() + (fast ? ' ⚡' : ''), '#ffd60a');
      // streak callout at milestones
      if (nc === 3 || nc === 5 || nc === 7 || nc === 10) {
        setTimeout(() => floatScore(streakShout(), '#e63946'), 260);
      }
      if (comboRef.current) {
        comboRef.current.classList.remove('pop');
        void comboRef.current.offsetWidth;
        comboRef.current.classList.add('pop');
      }
    } else {
      setCombo(0);
      setFace(faceWrong());
      sfx.wrong();
      haptic([40, 30, 40]);
      floatScore(missShout(), '#e63946');
      if (stageRef.current) {
        stageRef.current.classList.remove('shake');
        void stageRef.current.offsetWidth;
        stageRef.current.classList.add('shake');
        setTimeout(() => stageRef.current?.classList.remove('shake'), 360);
      }
    }
  };

  const confirmMulti = (ev: React.MouseEvent) => {
    if (!picked.length) return;
    judge(picked, { x: ev.clientX, y: ev.clientY });
  };

  const next = () => {
    if (idx + 1 >= round.length) {
      onFinish({
        name,
        score,
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
    setFace('🤔');
    qStartRef.current = Date.now();
  };

  const optClass = (i: number) => {
    let c = 'opt';
    if (q.shuffled[i].isCorrect && answered) c += ' correct';
    else if (isSelected(i) && answered && !wasRight) c += ' wrong';
    else if (isSelected(i)) c += ' sel';
    if (answered) c += ' disabled';
    return c;
  };

  return (
    <div className="quiz" ref={stageRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="quizTop">
        <span className="qcount">{idx + 1} / {round.length}</span>
        <div className="progress"><i style={{ width: `${((idx + (answered ? 1 : 0)) / round.length) * 100}%` }} /></div>
        <span className="score">{score}</span>
      </div>

      <div className="mascotRow">
        <span className={'mascot ' + (answered ? 'react' : '')} key={face + idx}>{face}</span>
        <div className="combo" ref={comboRef}>
          {combo >= 2 && <span>{t('combo')} <b>x{combo}</b> 🔥</span>}
        </div>
      </div>

      <div className="qbody">
        <div className="qcard" key={q.id}>
          {q.img && <img className="qimg" src={IMG_BASE + q.img} alt="" draggable={false} />}
          <div className="qtag">{CAT_LABEL[q.cat]}</div>
          <div className="qtext">{loc(q.q)}</div>
          {q.multi && <div className="multiHint">✦ {t('multiHint')}</div>}
        </div>

        <div className="opts">
          {q.shuffled.map((s, i) => (
            <button
              key={i}
              className={optClass(i)}
              onClick={(e) => (q.multi ? toggle(i) : judge([i], { x: e.clientX, y: e.clientY }))}
            >
              <span className="key">{KEYS[i]}</span>
              {loc(s.opt)}
              {answered && s.isCorrect && <span className="mark">✓</span>}
              {answered && isSelected(i) && !s.isCorrect && <span className="mark">✕</span>}
            </button>
          ))}
        </div>

        {answered && (
          <div className="explain">
            <b className={wasRight ? 'neon-cyan' : 'neon-mag'}>{wasRight ? t('correct') : t('wrong')}</b>
            {loc(q.explain)}
          </div>
        )}
      </div>

      <div className="qfoot">
        {q.multi && !answered ? (
          <button className="btn yel big" style={{ width: '100%' }} onClick={confirmMulti} disabled={!picked.length}>
            {t('confirm')}
          </button>
        ) : answered ? (
          <button className="btn mag big" style={{ width: '100%' }} onClick={next}>
            {idx + 1 >= round.length ? t('finish') : t('next')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
