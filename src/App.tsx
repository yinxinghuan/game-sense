import { useState } from 'react';
import './game-id';
import StartScreen from './screens/StartScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import Wall from './screens/Wall';
import Results from './screens/Results';
import { Screen, QuizResult } from './types';

export default function App() {
  // colleague dashboard route
  if (new URLSearchParams(window.location.search).get('view') === 'results') {
    return <Results />;
  }

  const [screen, setScreen] = useState<Screen>('start');
  const [name, setName] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);

  return (
    <div className="app crt">
      {screen === 'start' && (
        <StartScreen onStart={(n) => { setName(n); setScreen('quiz'); }} />
      )}
      {screen === 'quiz' && (
        <QuizScreen name={name} onFinish={(r) => { setResult(r); setScreen('result'); }} />
      )}
      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          onReplay={() => setScreen('quiz')}
          onWall={() => setScreen('wall')}
        />
      )}
      {screen === 'wall' && (
        <Wall playerName={name || 'Player'} onBack={() => setScreen(result ? 'result' : 'start')} />
      )}
    </div>
  );
}
