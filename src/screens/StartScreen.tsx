import { useEffect, useState } from 'react';
import { t, lang, setLang } from '../i18n';
import { sfx, unlockAudio } from '../lib/audio';
import { isInAigram, telegramId, getProfile } from '../lib/platform';

export default function StartScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState(localStorage.getItem('gsq-name') || '');
  const [, force] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  // In the feed (Aigram), we already know the player — auto-name, no setup screen.
  useEffect(() => {
    if (isInAigram && telegramId) {
      getProfile(telegramId).then((p) => p?.name && setProfileName(p.name));
    }
  }, []);

  const begin = (n: string) => {
    const nm = (n || 'Player').trim() || 'Player';
    localStorage.setItem('gsq-name', nm);
    unlockAudio();
    sfx.start();
    onStart(nm);
  };

  const onTap = () => {
    if (showCard) return;
    unlockAudio();
    sfx.tap();
    if (isInAigram) {
      // instant-play: no name input inside the feed
      begin(profileName || name || 'Player');
    } else {
      setShowCard(true);
    }
  };

  const pick = (l: 'en' | 'zh') => { setLang(l); force((x) => x + 1); };

  return (
    <div className="start" onClick={onTap}>
      <div className="logo">
        <span className="l1">GAME</span>
        <span className="l2">SENSE</span>
      </div>
      <div className="tagline">{t('subtitle')}</div>

      {!showCard ? (
        <>
          <div className="finger">👆</div>
          <div className="coin">{t('tapToStart')}</div>
        </>
      ) : (
        <div className="startCard" onClick={(e) => e.stopPropagation()}>
          <div className="langRow">
            <button className={'langBtn' + (lang === 'en' ? ' on' : '')} onClick={() => pick('en')}>EN</button>
            <button className={'langBtn' + (lang === 'zh' ? ' on' : '')} onClick={() => pick('zh')}>中文</button>
          </div>
          <label>{t('enterName')}</label>
          <input
            autoFocus
            value={name}
            maxLength={20}
            placeholder={t('namePlaceholder')}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && begin(name)}
          />
          <button className="btn mag big" onClick={() => begin(name)}>{t('begin')}</button>
        </div>
      )}
    </div>
  );
}
