// Comic onomatopoeia shouts — English universal SFX words (used in any locale).
const HIT = ['BAM!', 'POW!', 'BOOM!', 'KAPOW!', 'ZAP!', 'SMASH!', 'WHAM!', 'YEAH!', 'NICE!'];
const MISS = ['WHIFF!', 'CLANG!', 'NOPE!', 'OOPS!', 'THUNK!', 'BONK!', 'AW MAN!'];
const STREAK = ['ON FIRE!', 'UNSTOPPABLE!', 'RED HOT!', 'COMBO KING!', 'BLAZING!'];
const FACE_RIGHT = ['😎', '🤩', '😏', '🥳', '🤘'];
const FACE_WRONG = ['😵', '🫠', '😬', '🙃'];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const hitShout = () => pick(HIT);
export const missShout = () => pick(MISS);
export const streakShout = () => pick(STREAK);
export const faceRight = () => pick(FACE_RIGHT);
export const faceWrong = () => pick(FACE_WRONG);
