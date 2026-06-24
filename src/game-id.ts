// Permanent game UUID (session id for platform data / leaderboard / notify).
(window as any).__GAME_UUID__ = (window as any).__GAME_UUID__ || '83e9b6ce-aae1-481f-940c-34d0a590b341';

export function getGameUuid(): string {
  return (window as any).__GAME_UUID__ || '';
}
