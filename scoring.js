// An untouched expedition costs nothing. Wagers alone start an expedition.
export function scoreExpedition({ numbers, wagers }) {
  const count = numbers.length + wagers;
  const sum = numbers.reduce((total, card) => total + card, 0);
  const multiplier = wagers + 1;
  const bonus = count >= 8 ? 20 : 0;
  const score = count === 0 ? 0 : (sum - 20) * multiplier + bonus;
  return { score, sum, count, multiplier, bonus };
}

export function scorePlayer(expeditions) {
  return expeditions.reduce((total, expedition) => total + scoreExpedition(expedition).score, 0);
}

export function createRounds() {
  // Every expedition has its own array: changes never leak between players/rounds.
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 2 }, () =>
      Array.from({ length: 5 }, () => ({ numbers: [], wagers: 0 }))));
}
