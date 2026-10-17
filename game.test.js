import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, startGame, toggleCard, goNext, goBack, resetGame, isValidGame } from './game.js';
import { createGameStorage } from './storage.js';

for (const count of [5, 6]) {
  test(`${count} expeditions: all three rounds, previous-round editing, and reset`, () => {
    const game = createGame();
    startGame(game, [' Alice ', 'Bob'], count);
    toggleCard(game, 'numbers', 10);
    toggleCard(game, 'wagers', 1);
    for (let step = 0; step < count; step++) goNext(game);
    toggleCard(game, 'numbers', 10);
    toggleCard(game, 'wagers', 1);
    assert.deepEqual(game.rounds[0][1][0], { numbers: [], wagers: [] });
    for (let step = count; step < count * 2; step++) goNext(game);
    assert.equal(game.screen, 'summary');
    goNext(game);
    assert.equal(game.round, 1);
    goBack(game);
    assert.equal(game.round, 0);
    assert.equal(game.screen, 'summary');
    goBack(game);
    assert.equal(game.step, count * 2 - 1);
    goNext(game);
    goNext(game);
    for (let step = 0; step < count * 2; step++) goNext(game);
    goNext(game);
    for (let step = 0; step < count * 2; step++) goNext(game);
    assert.equal(game.round, 2);
    assert.equal(game.screen, 'summary');
    assert.equal(isValidGame(game), true);
    goNext(game);
    assert.equal(game.round, 2);
    resetGame(game);
    assert.deepEqual(game, createGame(['Alice', 'Bob'], count));
  });
}

test('changing edition resets scores; same edition preserves scores', () => {
  const game = createGame();
  startGame(game, ['', ' B '], 6);
  toggleCard(game, 'numbers', 8);
  toggleCard(game, 'numbers', 8);
  assert.deepEqual(game.rounds[0][0][0].numbers, []);
  toggleCard(game, 'numbers', 9);
  goBack(game);
  startGame(game, game.names, 6);
  assert.deepEqual(game.rounds[0][0][0].numbers, [9]);
  startGame(game, game.names, 5);
  assert.deepEqual(game.rounds[0][0][0].numbers, []);
  assert.deepEqual(game.names, ['Player 1', 'B']);
});

test('saving snapshots restores cards and navigation in order', async () => {
  let saved;
  const storage = createGameStorage({ get: async () => saved, set: async (_, value) => { saved = value; } });
  const game = createGame();
  startGame(game, ['A', 'B'], 6);
  toggleCard(game, 'numbers', 10);
  const first = storage.save(game);
  goNext(game);
  toggleCard(game, 'wagers', 3);
  const last = storage.save(game);
  await Promise.all([first, last]);
  assert.deepEqual(await storage.load(), game);
  resetGame(game);
  await storage.save(game);
  assert.deepEqual(await storage.load(), game);
});

test('malformed, incompatible, and conflicting saves fall back to a new game', async () => {
  const invalidGames = [];
  for (const change of [
    game => { game.round = 3; },
    game => { game.rounds[0][0][0].numbers = [1]; },
    game => { game.rounds[0][0][0].wagers = [1, 1]; },
    game => { game.rounds[0][0][0].numbers = [10]; game.rounds[0][1][0].numbers = [10]; },
    game => { game.rounds = [null]; },
  ]) {
    const game = createGame(); change(game);
    invalidGames.push(JSON.stringify({ version: 1, game }));
  }
  for (const value of [null, '{bad json', '{"version":2}', ...invalidGames]) {
    const storage = createGameStorage({ get: async () => value });
    assert.deepEqual(await storage.load(), createGame());
  }
});

test('unavailable storage does not break play and failed writes can recover', async () => {
  let unavailable = true;
  const storage = createGameStorage({
    get: async () => { throw new Error('unavailable'); },
    set: async () => { if (unavailable) throw new Error('full'); },
  });
  assert.deepEqual(await storage.load(), createGame());
  assert.equal(await storage.save(createGame()), false);
  unavailable = false;
  assert.equal(await storage.save(createGame()), true);
});
