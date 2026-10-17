import { test, expect } from '@playwright/test';

test('cards, names, navigation, artwork, and scores survive reopening', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await page.getByRole('textbox', { name: 'Player 1', exact: true }).fill('Alice');
  await page.getByRole('textbox', { name: 'Player 2', exact: true }).fill('Bob');
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Yellow 10', exact: true }).click();
  await expect(page.locator('.score strong')).toHaveText('-10');
  await page.getByRole('button', { name: 'Yellow wager 1', exact: true }).click();
  await expect(page.locator('.score strong')).toHaveText('-20');
  await expect(page.locator('#storage-status')).toContainText('saved automatically');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Yellow 10', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.eyebrow')).toContainText('Alice');
  await expect(page.locator('.score strong')).toHaveText('-20');
  await expect.poll(() => page.locator('.card-art img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: /Next color|Next player/ }).click();
  await expect(page.locator('.eyebrow')).toContainText('Bob');
  await expect(page.getByRole('button', { name: 'Yellow 10', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Yellow wager 1', exact: true })).toBeDisabled();
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: /Next color|Show round results/ }).click();
  await expect(page.getByRole('heading', { name: 'Round results' })).toBeVisible();
  await expect(page.locator('table').first().locator('.total-row td').first()).toHaveText('-20');
  await page.getByRole('button', { name: 'Start round 2' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Round results' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Round results' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset game', exact: true }).click();
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await expect(page.getByRole('heading', { name: 'Round results' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset game', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset game' }).click();
  await expect(page.getByRole('textbox', { name: 'Player 1', exact: true })).toHaveValue('Alice');
  await page.reload();
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.locator('.score strong')).toHaveText('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('traditional edition completes three rounds and changing editions asks first', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('radio', { name: /Traditional/ }).check();
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Yellow 10', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('radio', { name: /Expanded/ }).check();
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await page.getByRole('radio', { name: /Traditional/ }).check();
  await page.getByRole('button', { name: 'Start game' }).click();
  for (let round = 0; round < 3; round++) {
    for (let step = 0; step < 10; step++) await page.getByRole('button', { name: /Next color|Next player|Show round results/ }).click();
    if (round < 2) await page.getByRole('button', { name: `Start round ${round + 2}` }).click();
  }
  await expect(page.getByRole('heading', { name: 'Final scores' })).toBeVisible();
  await expect(page.locator('.intro')).toHaveText('Player 2 wins!');
  await expect(page.locator('.progress')).toHaveCount(0);
  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset game' }).click();
  await expect(page.getByRole('radio', { name: /Traditional/ })).toBeChecked();
});

test('invalid saved data and unavailable browser storage still allow play', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('lost-cities.game.v1', '{broken'); });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Start game' })).toBeVisible();
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Yellow 8', exact: true }).click();
  await expect(page.locator('.score strong')).toHaveText('-12');
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
  });
  await page.reload();
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Yellow 9', exact: true }).click();
  await expect(page.locator('.score strong')).toHaveText('-11');
  await expect(page.locator('#storage-status')).toContainText('could not be saved');
});
