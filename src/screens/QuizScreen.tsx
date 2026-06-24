import { useEffect, useMemo, useRef, useState } from 'react';
import questionsData from '../data/questions.json';
import { Question, ShuffledQuestion, QuizResult } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';
import { burst, floatScore } from '../lib/fx';

const NUM = 14;
const Q_TIME = 18000; // soft timer (ms); affects speed bonus only, never fails
const KEYS = ['A', 'B', 'C', 'D', 'E'];
const CAT_LABEL: Record<string, string> = {
  core: 'CORE DESIGN', ixd: 'INTERACTION', feel: 'GAME FEEL',
  feed: 'FEED UX', eng: 'ENGINEERING', social: 'SOCIAL',
};

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

  const [picked, setPicked] = useState<number[]>([]); // selected option indices (multi)
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [timeFrac, setTimeFrac] = useState(1); // 1 → 0
  const qStartRef = useRef(Date.now());
  const comboRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const q = round[idx];

  // per-question soft timer
  useEffect(() => {
    qStartRef.current = Date.now();
    setTimeFrac(1);
    const iv = setInterval(() => {
      const f = Math.max(0, 1 - (Date.now() - qStartRef.current) / Q_TIME);
      setTimeFrac(f);
    }, 100);
    return () => clearInterval(iv);
  }, [idx]);

  const isSelected = (i: number) => picked.includes(i);

  const toggle = (i: number) => {
    if (answered) return;
    sfx.tap();
    haptic(8);
    if (q.multi) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    } else {
      setPicked([i]);
      judge([i]);
    }
  };

  const judge = (sel: number[], ev?: { x: number; y: number }) => {
    if (answered) return;
    const correctIdx = q.shuffled.map((s, i) => (s.isCorrect ? i : -1)).filter((i) => i >= 0);
    const right = sel.length === correctIdx.length && sel.every((i) => correctIdx.includes(i));
    setAnswered(true);
    setWasRight(right);

    const ms = Date.now() - qStartRef.current;
    answersRef.current.push({ id: q.id, correct: right, ms });

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
      const x = ev?.x ?? window.innerWidth / 2;
      const y = ev?.y ?? window.innerHeight * 0.4;
      burst(x, y, 16);
      floatScore('+' + gained, '#28ff9a');
      if (comboRef.current) {
        comboRef.current.classList.remove('pop');
        void comboRef.current.offsetWidth;
        comboRef.current.classList.add('pop');
      }
    } else {
      setCombo(0);
      sfx.wrong();
      haptic([40, 30, 40]);
      floatScore(t('wrong'), '#ff445e');
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
        <span className="qcount">{t('question')}{idx + 1} {t('of')} {round.length}</span>
        <div className="progress"><i style={{ width: `${((idx + (answered ? 1 : 0)) / round.length) * 100}%` }} /></div>
        <span className="score">{score}</span>
      </div>
      <div className="timerbar"><i className={timeFrac < 0.25 ? 'low' : ''} style={{ width: `${timeFrac * 100}%` }} /></div>
      <div className="combo" ref={comboRef}>
        {combo >= 2 && <span>{t('combo')} <b>x{combo}</b> 🔥</span>}
      </div>

      <div className="qbody">
        <div className="qcard" key={q.id}>
          <div className="qtag arcade">{CAT_LABEL[q.cat]} · {q.diff === 'A' ? 'ADVANCED' : 'BASIC'}</div>
          <div className="qtext">{loc(q.q)}</div>
          {q.multi && <div className="multiHint">◆ {t('multiHint')}</div>}
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
          <div className={'explain' + (wasRight ? ' ok' : '')}>
            <b className={wasRight ? 'neon-cyan' : 'neon-mag'}>{wasRight ? t('correct') : t('wrong')}</b>{' '}
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
