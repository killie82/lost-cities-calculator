import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'github-pages', use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:4174/lost-cities-calculator/' } },
  ],
  webServer: [
    { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
    { command: 'npm run preview -- --port 4174 --base /lost-cities-calculator/', url: 'http://127.0.0.1:4174/lost-cities-calculator/', reuseExistingServer: false },
  ],
});
