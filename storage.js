import { createGame, isValidGame } from './game.js';

const key = 'lost-cities.game.v1';

// The adapter uses device Preferences on mobile and localStorage on the web.
export function createGameStorage(adapter) {
  let pending = Promise.resolve();
  return {
    async load() {
      try {
        const value = await adapter.get(key);
        const saved = JSON.parse(value);
        if (saved?.version === 1 && isValidGame(saved.game)) return saved.game;
      } catch { /* Missing, unavailable, or invalid storage starts a fresh game. */ }
      return createGame();
    },
    save(game) {
      const value = JSON.stringify({ version: 1, game });
      // Serialize writes so a slower, older save cannot overwrite newer cards.
      pending = pending.then(() => adapter.set(key, value)).then(() => true, () => false);
      return pending;
    },
  };
}
