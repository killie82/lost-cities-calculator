import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreExpedition, scorePlayer, createRounds } from './scoring.js';

test('untouched expeditions score zero', () => {
  assert.equal(scoreExpedition({ numbers: [], wagers: 0 }).score, 0);
});
test('wagers multiply negative expedition scores, including wagers alone', () => {
  assert.equal(scoreExpedition({ numbers: [], wagers: 3 }).score, -80);
  assert.equal(scoreExpedition({ numbers: [2, 3], wagers: 1 }).score, -30);
});
test('eight-card bonus counts wagers and is added after multiplication', () => {
  assert.equal(scoreExpedition({ numbers: [6, 7, 8, 9, 10], wagers: 3 }).score, 100);
  assert.equal(scoreExpedition({ numbers: [7, 8, 9, 10], wagers: 3 }).score, 56);
  assert.equal(scoreExpedition({ numbers: [2, 3, 4, 5, 6, 7, 8, 9], wagers: 0 }).score, 44);
});
test('player totals include positive, negative, and untouched colors', () => {
  assert.equal(scorePlayer([{ numbers: [8, 9, 10], wagers: 0 }, { numbers: [2], wagers: 1 }, { numbers: [], wagers: 0 }]), -29);
});
test('three rounds contain independent player and expedition records', () => {
  const rounds = createRounds();
  rounds[0][0][0].numbers.push(10);
  assert.equal(rounds.length, 3);
  assert.equal(rounds[0].length, 2);
  assert.equal(rounds[0][0].length, 5);
  assert.deepEqual(rounds[0][1][0].numbers, []);
  assert.deepEqual(rounds[1][0][0].numbers, []);
});
