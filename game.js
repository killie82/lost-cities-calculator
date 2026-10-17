import { createRounds } from './scoring.js';

export function createGame(names = ['Player 1', 'Player 2'], expeditionCount = 6) {
  return { names: [...names], expeditionCount, rounds: createRounds(expeditionCount), round: 0, step: 0, screen: 'start' };
}

export function hasCards(game) {
  return game.rounds.some(round => round.some(player => player.some(expedition => expedition.numbers.length || expedition.wagers.length)));
}

export function startGame(game, names, expeditionCount) {
  if (expeditionCount !== game.expeditionCount) Object.assign(game, createGame(names, expeditionCount));
  game.names = names.map((name, index) => name.trim().slice(0, 30) || `Player ${index + 1}`);
  game.screen = 'entry';
}

export function resetGame(game) {
  Object.assign(game, createGame(game.names, game.expeditionCount));
}

export function toggleCard(game, kind, value) {
  if (game.screen !== 'entry' || !['numbers', 'wagers'].includes(kind)) return;
  if (!Number.isInteger(value) || value < (kind === 'numbers' ? 2 : 1) || value > (kind === 'numbers' ? 10 : 3)) return;
  const player = Math.floor(game.step / game.expeditionCount);
  const color = game.step % game.expeditionCount;
  const expedition = game.rounds[game.round][player][color];
  const opponent = game.rounds[game.round][1 - player][color];
  if (opponent[kind].includes(value)) return;
  expedition[kind] = expedition[kind].includes(value)
    ? expedition[kind].filter(card => card !== value)
    : [...expedition[kind], value].sort((a, b) => a - b);
}

export function goBack(game) {
  if (game.screen === 'summary') {
    game.step = game.expeditionCount * 2 - 1;
    game.screen = 'entry';
  } else if (game.screen === 'entry') {
    if (game.step > 0) game.step--;
    else if (game.round > 0) { game.round--; game.screen = 'summary'; }
    else game.screen = 'start';
  }
}

export function goNext(game) {
  if (game.screen === 'entry') {
    if (game.step === game.expeditionCount * 2 - 1) game.screen = 'summary';
    else game.step++;
  } else if (game.screen === 'summary' && game.round < 2) {
    game.round++; game.step = 0; game.screen = 'entry';
  }
}

// Saved data is untrusted: reject incomplete, incompatible, or conflicting games.
export function isValidGame(game) {
  if (!game || ![5, 6].includes(game.expeditionCount)) return false;
  if (!Array.isArray(game.names) || game.names.length !== 2 || !game.names.every(name => typeof name === 'string' && name.length <= 30)) return false;
  if (!Number.isInteger(game.round) || game.round < 0 || game.round > 2) return false;
  if (!Number.isInteger(game.step) || game.step < 0 || game.step >= game.expeditionCount * 2) return false;
  if (!['start', 'entry', 'summary'].includes(game.screen)) return false;
  const validCards = (cards, min, max) => Array.isArray(cards) && new Set(cards).size === cards.length && cards.every(card => Number.isInteger(card) && card >= min && card <= max);
  return Array.isArray(game.rounds) && game.rounds.length === 3 && game.rounds.every(round =>
    Array.isArray(round) && round.length === 2 && round.every(player =>
      Array.isArray(player) && player.length === game.expeditionCount && player.every(expedition =>
        expedition && validCards(expedition.numbers, 2, 10) && validCards(expedition.wagers, 1, 3))) &&
    round[0].every((expedition, color) => ['numbers', 'wagers'].every(kind =>
      !expedition[kind].some(card => round[1][color][kind].includes(card)))));
}
