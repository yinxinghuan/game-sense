import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkEntry, CommentEntry } from '../types';
import { t, loc } from '../i18n';
import { sfx, haptic } from '../lib/audio';
import { listData, getProfile, notify, openProfile, isInAigram } from '../lib/platform';
import { SaveBlob, getBlob, selfId, addWork, addComment, toggleCheer, hasCheered } from '../lib/store';

interface WallData {
  works: WorkEntry[];
  commentsByWork: Record<string, CommentEntry[]>;
  cheersByWork: Record<string, number>;
  profiles: Record<string, { name?: string; head_url?: string }>;
}

function parseRows(rows: { user_id: string; resource_data: string }[]): { uid: string; blob: SaveBlob }[] {
  const out: { uid: string; blob: SaveBlob }[] = [];
  for (const row of rows) {
    if (!row.user_id || !row.resource_data) continue;
    try {
      out.push({ uid: String(row.user_id), blob: JSON.parse(row.resource_data) });
    } catch {
      /* skip */
    }
  }
  return out;
}

async function loadWall(): Promise<WallData> {
  const parsed = parseRows(await listData());
  // ensure our own (possibly unsynced / standalone) blob is represented
  const me = selfId();
  if (!parsed.some((p) => p.uid === me)) parsed.push({ uid: me, blob: getBlob() });
  else parsed[parsed.findIndex((p) => p.uid === me)] = { uid: me, blob: getBlob() };

  const works: WorkEntry[] = [];
  const commentsByWork: Record<string, CommentEntry[]> = {};
  const cheersByWork: Record<string, number> = {};

  for (const { blob } of parsed) {
    for (const w of blob.works || []) works.push(w);
    for (const c of blob.comments || []) (commentsByWork[c.workId] ||= []).push(c);
    for (const id of blob.cheered || []) cheersByWork[id] = (cheersByWork[id] || 0) + 1;
  }
  works.sort((a, b) => b.ts - a.ts);
  Object.values(commentsByWork).forEach((arr) => arr.sort((a, b) => a.ts - b.ts));

  // resolve profiles (only meaningful inside Aigram)
  const profiles: Record<string, { name?: string; head_url?: string }> = {};
  if (isInAigram) {
    const ids = Array.from(new Set([
      ...works.map((w) => w.authorId),
      ...Object.values(commentsByWork).flat().map((c) => c.authorId),
    ]));
    await Promise.all(ids.map(async (id) => {
      const p = await getProfile(id);
      if (p) profiles[id] = p;
    }));
  }
  return { works, commentsByWork, cheersByWork, profiles };
}

function Avatar({ id, name, profiles }: { id: string; name: string; profiles: WallData['profiles'] }) {
  const p = profiles[id];
  return (
    <span className="avatar" onClick={(e) => { e.stopPropagation(); openProfile(id); }}>
      {p?.head_url ? <img src={p.head_url} alt="" /> : (name?.[0]?.toUpperCase() || '?')}
    </span>
  );
}

export default function Wall({ playerName, onBack }: { playerName: string; onBack: () => void }) {
  const [data, setData] = useState<WallData | null>(null);
  const [detail, setDetail] = useState<WorkEntry | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => { loadWall().then(setData); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const authorName = (w: { authorId: string; authorName: string }) =>
    data?.profiles[w.authorId]?.name || w.authorName || 'Player';

  return (
    <div className="wall crt">
      <div className="wallHead">
        <button className="btn ghost" onClick={onBack}>{t('back')}</button>
        <h2>{t('wallTitle')}</h2>
      </div>

      <div className="wallScroll" ref={scrollRef}>
        {!data ? (
          <div className="wallEmpty">…</div>
        ) : data.works.length === 0 ? (
          <div className="wallEmpty">{t('wallEmpty')}</div>
        ) : (
          data.works.map((w) => (
            <div className="workCard" key={w.id} onClick={() => { sfx.tap(); setDetail(w); }}>
              <div className="workThumb">▶</div>
              <div className="workMeta">
                <div className="wt">{w.title}</div>
                <div className="workAuthor">
                  <Avatar id={w.authorId} name={authorName(w)} profiles={data.profiles} />
                  <span className="an" onClick={(e) => { e.stopPropagation(); openProfile(w.authorId); }}>{authorName(w)}</span>
                </div>
              </div>
              <div className="cheers">★ {data.cheersByWork[w.id] || 0}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '12px 16px' }}>
        <button className="btn yel big" style={{ width: '100%' }} onClick={() => { sfx.tap(); setShowSubmit(true); }}>
          {t('submitWork')}
        </button>
      </div>

      {detail && data && (
        <WorkDetail
          work={detail}
          playerName={playerName}
          authorName={authorName(detail)}
          comments={data.commentsByWork[detail.id] || []}
          cheers={data.cheersByWork[detail.id] || 0}
          profiles={data.profiles}
          onClose={() => { setDetail(null); refresh(); }}
        />
      )}

      {showSubmit && (
        <SubmitSheet
          playerName={playerName}
          onClose={() => setShowSubmit(false)}
          onPosted={() => { setShowSubmit(false); refresh(); }}
        />
      )}
    </div>
  );
}

function WorkDetail({
  work, playerName, authorName, comments, cheers, profiles, onClose,
}: {
  work: WorkEntry; playerName: string; authorName: string;
  comments: CommentEntry[]; cheers: number; profiles: WallData['profiles']; onClose: () => void;
}) {
  const [cheered, setCheered] = useState(hasCheered(work.id));
  const [localCheers, setLocalCheers] = useState(cheers);
  const [text, setText] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const isMine = work.authorId === selfId();

  const cheer = () => {
    if (cheered) return;
    sfx.combo(2); haptic([10, 20, 10]);
    const on = toggleCheer(work.id);
    setCheered(on);
    setLocalCheers((n) => n + (on ? 1 : -1));
    if (on && !isMine) {
      notify(`cheer:${work.id}`, {
        targetUserId: work.authorId,
        template: '{sender_name} cheered your game ' + work.title + '.',
      });
    }
  };

  const send = () => {
    const body = text.trim();
    if (!body) return;
    sfx.tap();
    const c: CommentEntry = { workId: work.id, authorId: selfId(), authorName: playerName, text: body, ts: Date.now() };
    addComment(c);
    setLocalComments((arr) => [...arr, c]);
    setText('');
    if (!isMine) {
      notify(`comment:${work.id}:${c.ts}`, {
        targetUserId: work.authorId,
        template: '{sender_name} commented on your game ' + work.title + '.',
      });
    }
  };

  return (
    <div className="sheet">
      <div className="sheetHead">
        <button className="btn ghost" onClick={onClose}>{t('back')}</button>
        <div className="arcade" style={{ fontSize: 11, color: 'var(--cyan)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{work.title}</div>
      </div>
      <div className="sheetScroll">
        <iframe className="frame" src={work.url} title={work.title} allow="autoplay; fullscreen" />
        <a className="btn mag" style={{ display: 'inline-block', marginTop: 10, textDecoration: 'none' }} href={work.url} target="_blank" rel="noreferrer">{t('play')}</a>
        <div className="detailTitle">{work.title}</div>
        <div className="workAuthor" style={{ marginBottom: 10 }}>
          <Avatar id={work.authorId} name={authorName} profiles={profiles} />
          <span className="an" onClick={() => openProfile(work.authorId)}>{t('by')} {authorName}</span>
        </div>
        {work.note && <div className="detailNote">{work.note}</div>}

        <button className="btn yel" style={{ marginTop: 16 }} onClick={cheer} disabled={cheered}>
          ★ {t('cheer')} · {localCheers}
        </button>

        <div className="detailTitle" style={{ marginTop: 20 }}>{t('comments')} ({localComments.length})</div>
        <div className="commentList">
          {localComments.map((c, i) => (
            <div className="comment" key={i}>
              <div className="ch">
                <Avatar id={c.authorId} name={c.authorName} profiles={profiles} />
                <span className="cn">{profiles[c.authorId]?.name || c.authorName}</span>
              </div>
              <div className="cb">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="commentBar">
        <input value={text} placeholder={t('commentPlaceholder')} maxLength={200}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button className="btn" onClick={send}>{t('send')}</button>
      </div>
    </div>
  );
}

function SubmitSheet({ playerName, onClose, onPosted }: { playerName: string; onClose: () => void; onPosted: () => void; }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const post = () => {
    const ti = title.trim();
    let u = url.trim();
    if (!ti || !u) { setErr(t('needUrl')); return; }
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    sfx.start();
    addWork({
      id: selfId() + '-' + Date.now().toString(36),
      title: ti, url: u, note: note.trim() || undefined,
      authorId: selfId(), authorName: playerName, ts: Date.now(), cheers: 0,
    });
    onPosted();
  };

  return (
    <div className="sheet">
      <div className="sheetHead">
        <button className="btn ghost" onClick={onClose}>{t('cancel')}</button>
        <div className="arcade" style={{ fontSize: 12, color: 'var(--yellow)', flex: 1 }}>{t('submitWork')}</div>
      </div>
      <div className="sheetScroll">
        <div className="field">
          <label>{t('workTitle')}</label>
          <input value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('workUrl')}</label>
          <input value={url} placeholder="https://…" onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('workNote')}</label>
          <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
        </div>
        {err && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button className="btn yel big" style={{ width: '100%' }} onClick={post}>{t('post')}</button>
      </div>
    </div>
  );
}
