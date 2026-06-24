// Lightweight bilingual strings. English is the default (user-facing standard);
// ?lang=zh (or device default) switches to Chinese as an alternate.
export type Lang = 'en' | 'zh';

const params = new URLSearchParams(window.location.search);
const urlLang = params.get('lang') as Lang | null;
const stored = (localStorage.getItem('gsq-lang') as Lang | null) || null;
const device = navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';

export let lang: Lang = urlLang || stored || (device as Lang) || 'en';

export function setLang(l: Lang) {
  lang = l;
  localStorage.setItem('gsq-lang', l);
}

type Dict = Record<string, { en: string; zh: string }>;

const S: Dict = {
  title: { en: 'GAME SENSE', zh: 'GAME SENSE' },
  subtitle: { en: 'How good is your game brain?', zh: '你的游戏脑有多强？' },
  tapToStart: { en: 'TAP TO PLAY!', zh: '点一下开玩！' },
  enterName: { en: 'Drop a name for the board', zh: '留个名字上榜' },
  namePlaceholder: { en: 'Your player tag', zh: '你的玩家代号' },
  begin: { en: "LET'S GO ▸", zh: '开整 ▸' },
  question: { en: 'Q', zh: '第' },
  of: { en: 'of', zh: '/' },
  combo: { en: 'COMBO', zh: '连击' },
  correct: { en: 'NAILED IT!', zh: '答对啦！' },
  wrong: { en: 'NOPE!', zh: '差一点！' },
  multiHint: { en: 'Pick all the right ones, then go', zh: '把对的都选上，再确认' },
  confirm: { en: 'LOCK IT IN ▸', zh: '就这些 ▸' },
  next: { en: 'NEXT ▸', zh: '下一题 ▸' },
  finish: { en: 'HOW DID I DO? ▸', zh: '我考得咋样 ▸' },
  finalScore: { en: 'YOUR SCORE', zh: '你的得分' },
  accuracy: { en: 'Accuracy', zh: '正确率' },
  maxCombo: { en: 'Best combo', zh: '最高连击' },
  time: { en: 'Time', zh: '用时' },
  rank: { en: 'RANK', zh: '段位' },
  playAgain: { en: 'RUN IT BACK', zh: '再来一局' },
  toWall: { en: 'WORKS WALL ▸', zh: '作品墙 ▸' },
  share: { en: 'BRAG ABOUT IT', zh: '炫一下' },
  // ranks (cheeky)
  rankNovice: { en: 'BUTTON MASHER', zh: '手忙脚乱' },
  rankPlayer: { en: 'GOT GAME', zh: '有点东西' },
  rankPro: { en: 'BIG BRAIN', zh: '脑子很灵' },
  rankMaster: { en: 'GAME GOD', zh: '游戏之神' },
  // wall
  wallTitle: { en: 'WORKS WALL', zh: '作品墙' },
  wallEmpty: { en: 'No games posted yet. Be the first!', zh: '还没有人发布作品，来当第一个！' },
  submitWork: { en: '+ POST YOUR GAME', zh: '+ 发布你的游戏' },
  workTitle: { en: 'Game title', zh: '游戏标题' },
  workUrl: { en: 'Playable URL (https://…)', zh: '可玩链接 (https://…)' },
  workNote: { en: 'One line about it (optional)', zh: '一句话介绍（可选）' },
  post: { en: 'POST ▸', zh: '发布 ▸' },
  cancel: { en: 'Cancel', zh: '取消' },
  play: { en: '▶ PLAY', zh: '▶ 试玩' },
  comments: { en: 'Discussion', zh: '讨论' },
  commentPlaceholder: { en: 'Leave a comment…', zh: '留个评论…' },
  send: { en: 'Send', zh: '发送' },
  cheer: { en: 'Cheer', zh: '点赞' },
  back: { en: '‹ Back', zh: '‹ 返回' },
  by: { en: 'by', zh: '作者' },
  needName: { en: 'Type a name first', zh: '先输入名字' },
  needUrl: { en: 'Title and URL required', zh: '标题和链接必填' },
  leaderboard: { en: 'LEADERBOARD', zh: '排行榜' },
  you: { en: 'YOU', zh: '你' },
  noScores: { en: 'No scores yet — you\'re first!', zh: '还没有分数——你是第一个！' },
};

export function t(key: keyof typeof S): string {
  return S[key]?.[lang] ?? S[key]?.en ?? String(key);
}

/** Pick a localized field from a {en, zh} object. */
export function loc(obj: { en: string; zh: string } | undefined): string {
  if (!obj) return '';
  return obj[lang] ?? obj.en;
}
