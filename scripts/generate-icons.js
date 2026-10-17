// Reuses the favicon's city motif. Run after `npx playwright install chromium`.
import { chromium } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const svg = await readFile(new URL('../assets/app-icon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  async function render(path, width, height = width, splash = false) {
    await page.setViewportSize({ width, height });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:#132338}body{display:grid;place-items:center}svg{width:${splash ? '28%' : '100%'};height:${splash ? '28%' : '100%'}}</style>${svg}`);
    await page.screenshot({ path });
  }
  const res = new URL('../android/app/src/main/res/', import.meta.url);
  for (const [density, size, foreground] of [['mdpi', 48, 108], ['hdpi', 72, 162], ['xhdpi', 96, 216], ['xxhdpi', 144, 324], ['xxxhdpi', 192, 432]]) {
    for (const name of ['ic_launcher', 'ic_launcher_round']) await render(fileURLToPath(new URL(`mipmap-${density}/${name}.png`, res)), size);
    await render(fileURLToPath(new URL(`mipmap-${density}/ic_launcher_foreground.png`, res)), foreground);
  }
  // Match each generated launch image's original dimensions.
  for (const directory of await readdir(res)) {
    if (!directory.startsWith('drawable')) continue;
    const file = new URL(`${directory}/splash.png`, res);
    try {
      const png = await readFile(file);
      await render(fileURLToPath(file), png.readUInt32BE(16), png.readUInt32BE(20), true);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const iosAssets = new URL('../ios/App/App/Assets.xcassets/', import.meta.url);
  await render(fileURLToPath(new URL('AppIcon.appiconset/AppIcon-512@2x.png', iosAssets)), 1024);
  for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
    await render(fileURLToPath(new URL(`Splash.imageset/${name}`, iosAssets)), 2732, 2732, true);
  }
} finally {
  await browser.close();
}
