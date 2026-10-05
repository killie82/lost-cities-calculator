import { createRounds, scoreExpedition, scorePlayer } from './scoring.js';

const allColors = ['Yellow', 'Blue', 'White', 'Green', 'Red', 'Purple'];
const app = document.querySelector('#app');
let game = { names: ['Player 1', 'Player 2'], expeditionCount: 6, rounds: createRounds(), round: 0, step: 0, screen: 'start' };

function confirmReset(onConfirm = () => {
  game = { names: game.names, expeditionCount: game.expeditionCount, rounds: createRounds(game.expeditionCount), round: 0, step: 0, screen: 'start' };
  render();
}, message = 'This clears all cards and scores from all three rounds. Your player names and game edition will be kept.') {
  const previousFocus = document.activeElement;
  const dialog = element('dialog', undefined, 'reset-dialog');
  dialog.setAttribute('aria-labelledby', 'reset-title');
  dialog.setAttribute('aria-describedby', 'reset-description');
  const title = element('h2', 'Reset game?'); title.id = 'reset-title';
  const description = element('p', message); description.id = 'reset-description';
  const actions = element('div', undefined, 'navigation');
  const cancel = button('Keep playing', () => dialog.close(), 'secondary');
  cancel.autofocus = true;
  actions.append(cancel, button('Reset game', () => { dialog.close(); onConfirm(); }, 'danger'));
  dialog.append(title, description, actions);
  document.body.append(dialog);
  dialog.addEventListener('close', () => { dialog.remove(); if (previousFocus?.isConnected) previousFocus.focus(); });
  dialog.showModal();
}

// Build dynamic text with textContent, including user-entered names.
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, action, className = '') {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

// Each illustration sheet contains 3 columns × 4 rows. Slots 0–8 are 2–10;
// slots 9–11 are wagers. Only the chosen cell is visible inside each button.
function addCardArtwork(card, color, slot, label) {
  card.replaceChildren();
  const art = element('span', undefined, 'card-art');
  art.setAttribute('aria-hidden', 'true');
  const image = document.createElement('img');
  image.src = `assets/cards/${color.toLowerCase()}.webp`;
  image.alt = '';
  image.decoding = 'async';
  image.draggable = false;
  image.style.left = `${-(slot % 3) * 100}%`;
  image.style.top = `${-Math.floor(slot / 3) * 100}%`;
  art.append(image);
  const top = element('span', label, 'card-rank rank-top');
  const bottom = element('span', label, 'card-rank rank-bottom');
  top.setAttribute('aria-hidden', 'true'); bottom.setAttribute('aria-hidden', 'true');
  const state = element('span', card.disabled ? 'Used' : '✓', 'card-state');
  state.setAttribute('aria-hidden', 'true');
  card.append(art, top, bottom, state);
}
function render(moveFocus = true) {
  app.replaceChildren();
  if (game.screen === 'start') renderStart();
  else if (game.screen === 'entry') renderEntry();
  else renderSummary();
  if (game.screen !== 'start') app.append(button('Reset game', () => confirmReset(), 'reset-button secondary'));
  if (moveFocus) {
    const title = app.querySelector('h1');
    title.tabIndex = -1;
    title.focus();
  }
}

function renderStart() {
  app.append(element('p', 'TWO PLAYERS / THREE ROUNDS', 'eyebrow'));
  app.append(element('h1', 'Every expedition counts.'));
  app.append(element('p', 'Enter your cards one color at a time. We’ll take care of the scores.', 'intro'));
  const form = element('form', undefined, 'panel start-panel');
  game.names.forEach((name, index) => {
    const label = element('label', `Player ${index + 1}`);
    const input = document.createElement('input');
    input.name = `player${index}`;
    input.value = name;
    input.maxLength = 30;
    input.autocomplete = 'off';
    label.append(input);
    form.append(label);
  });
  const editions = element('fieldset', undefined, 'editions');
  editions.append(element('legend', 'Game edition'));
  [6, 5].forEach(count => {
    const label = element('label', undefined, 'edition-option');
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'edition'; input.value = String(count);
    input.checked = count === game.expeditionCount;
    label.append(input, element('span', count === 6 ? 'Expanded · 6 expeditions (includes purple)' : 'Traditional · 5 expeditions'));
    editions.append(label);
  });
  form.append(editions);
  const start = element('button', 'Start game', 'primary');
  start.type = 'submit';
  form.append(start);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const names = [0, 1].map(index => form.elements[`player${index}`].value.trim() || `Player ${index + 1}`);
    const count = Number(form.elements.edition.value);
    const startGame = () => {
      game.names = names;
      if (count !== game.expeditionCount) {
        game.expeditionCount = count; game.rounds = createRounds(count); game.round = 0; game.step = 0;
      }
      game.screen = 'entry'; render();
    };
    const hasCards = game.rounds.some(round => round.some(player => player.some(expedition => expedition.numbers.length || expedition.wagers.length)));
    if (count !== game.expeditionCount && hasCards) confirmReset(startGame, 'Changing the game edition clears the current cards and scores from all three rounds.');
    else startGame();
  });
  app.append(form);
}

function renderEntry() {
  const colors = allColors.slice(0, game.expeditionCount);
  const player = Math.floor(game.step / game.expeditionCount);
  const color = game.step % game.expeditionCount;
  const expedition = game.rounds[game.round][player][color];
  const opponent = game.rounds[game.round][1 - player][color];
  app.append(element('p', `ROUND ${game.round + 1} OF 3 · ${game.names[player]}`, 'eyebrow'));
  app.append(element('h1', `${colors[color]} expedition`));
  const progress = element('div', undefined, 'progress');
  progress.setAttribute('aria-label', `Player ${player + 1}, color ${color + 1} of ${game.expeditionCount}`);
  colors.forEach((name, index) => {
    const item = element('span', name, `color-${index}${index === color ? ' active' : ''}`);
    if (index === color) item.setAttribute('aria-current', 'step');
    progress.append(item);
  });
  app.append(progress);
  const panel = element('section', undefined, `panel expedition color-${color}`);
  panel.append(element('p', 'Tap the cards you played. Tap again to remove.', 'hint'));
  panel.append(element('h2', 'Wager cards'));
  const wagers = element('div', undefined, 'wagers');
  for (let value = 1; value <= 3; value++) {
    const selected = expedition.wagers.includes(value);
    const card = button('Wager', () => {
      expedition.wagers = selected ? expedition.wagers.filter(wager => wager !== value) : [...expedition.wagers, value];
      render(false);
      app.querySelector(`[data-wager="${value}"]`).focus();
    }, `card wager-card${selected ? ' selected' : ''}`);
    card.dataset.wager = value;
    card.setAttribute('aria-label', `${colors[color]} wager ${value}`);
    card.setAttribute('aria-pressed', String(selected));
    card.disabled = opponent.wagers.includes(value);
    addCardArtwork(card, colors[color], value + 8, 'W');
    const caption = element('span', `Wager ${value}`, 'wager-caption');
    caption.setAttribute('aria-hidden', 'true'); card.append(caption);
    wagers.append(card);
  }
  panel.append(wagers, element('p', `${expedition.wagers.length} wager${expedition.wagers.length === 1 ? '' : 's'} selected · ×${expedition.wagers.length + 1} multiplier`, 'hint'), element('h2', 'Number cards'));
  const cards = element('div', undefined, 'cards');
  for (let value = 2; value <= 10; value++) {
    const selected = expedition.numbers.includes(value);
    const card = button(String(value), () => {
      expedition.numbers = selected ? expedition.numbers.filter(number => number !== value) : [...expedition.numbers, value].sort((a, b) => a - b);
      render(false);
      app.querySelector(`[data-card="${value}"]`).focus();
    }, `card${selected ? ' selected' : ''}`);
    card.dataset.card = value;
    card.setAttribute('aria-label', `${colors[color]} ${value}`);
    card.setAttribute('aria-pressed', String(selected));
    card.disabled = opponent.numbers.includes(value);
    addCardArtwork(card, colors[color], value - 2, String(value));
    cards.append(card);
  }
  panel.append(cards, element('p', 'Cards used by the other player are unavailable.', 'hint'));
  const result = scoreExpedition(expedition);
  const score = element('div', undefined, 'score');
  score.setAttribute('role', 'status');
  score.append(element('span', 'Expedition score'), element('strong', String(result.score)));
  panel.append(score);
  panel.append(element('p', result.count ? `(${result.sum} − 20) × ${result.multiplier} + ${result.bonus} bonus · ${result.count} cards` : 'No cards selected · no expedition cost', 'hint'));
  app.append(panel);
  const nav = element('div', undefined, 'navigation');
  nav.append(button('Back', () => {
    if (game.step > 0) game.step--;
    else if (game.round > 0) { game.round--; game.screen = 'summary'; }
    else game.screen = 'start';
    render();
  }, 'secondary'));
  const nextLabel = game.step === game.expeditionCount * 2 - 1 ? 'Show round results' : color === game.expeditionCount - 1 ? 'Next player' : 'Next color';
  nav.append(button(nextLabel, () => {
    if (game.step === game.expeditionCount * 2 - 1) game.screen = 'summary';
    else game.step++;
    render();
  }, 'primary'));
  app.append(nav);
}

function renderSummary() {
  const colors = allColors.slice(0, game.expeditionCount);
  const final = game.round === 2;
  const totals = [0, 1].map(player => game.rounds.slice(0, game.round + 1).reduce((total, round) => total + scorePlayer(round[player]), 0));
  app.append(element('p', final ? 'THREE ROUNDS COMPLETE' : `ROUND ${game.round + 1} COMPLETE`, 'eyebrow'));
  app.append(element('h1', final ? 'Final scores' : 'Round results'));
  if (final) app.append(element('p', totals[0] === totals[1] ? 'It’s a tie!' : `${game.names[totals[0] > totals[1] ? 0 : 1]} wins!`, 'intro'));
  const panel = element('section', undefined, 'panel');
  const table = element('table');
  const caption = element('caption', `Expedition scores for round ${game.round + 1}`);
  const header = element('tr');
  ['Expedition', ...game.names].forEach(name => { const cell = element('th', name); cell.scope = 'col'; header.append(cell); });
  const head = element('thead'); head.append(header);
  const body = element('tbody');
  colors.forEach((name, color) => {
    const row = element('tr');
    const label = element('th', name, `color-label color-${color}`); label.scope = 'row';
    row.append(label);
    [0, 1].forEach(player => row.append(element('td', String(scoreExpedition(game.rounds[game.round][player][color]).score))));
    body.append(row);
  });
  const roundRow = element('tr', undefined, 'total-row');
  roundRow.append(element('th', 'Round total'));
  [0, 1].forEach(player => roundRow.append(element('td', String(scorePlayer(game.rounds[game.round][player])))));
  body.append(roundRow);
  table.append(caption, head, body); panel.append(table);
  const history = element('table', undefined, 'history');
  history.append(element('caption', final ? 'Game totals' : 'Game so far'));
  const historyBody = element('tbody');
  game.rounds.slice(0, game.round + 1).forEach((round, index) => {
    const row = element('tr'); row.append(element('th', `Round ${index + 1}`));
    [0, 1].forEach(player => row.append(element('td', String(scorePlayer(round[player])))));
    historyBody.append(row);
  });
  const totalRow = element('tr', undefined, 'total-row');
  totalRow.append(element('th', 'Overall total'));
  totals.forEach(total => totalRow.append(element('td', String(total))));
  historyBody.append(totalRow);
  const historyHead = head.cloneNode(true);
  historyHead.querySelector('th').textContent = 'Round';
  history.append(historyHead, historyBody); panel.append(history);
  app.append(panel);
  const nav = element('div', undefined, 'navigation');
  nav.append(button('Back to cards', () => { game.step = game.expeditionCount * 2 - 1; game.screen = 'entry'; render(); }, 'secondary'));
  nav.append(button(final ? 'New game' : `Start round ${game.round + 2}`, () => {
    if (final) {
      confirmReset(); return;
    } else { game.round++; game.step = 0; game.screen = 'entry'; }
    render();
  }, 'primary'));
  app.append(nav);
}

render(false);
