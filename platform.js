import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { createGameStorage } from './storage.js';

export const gameStorage = createGameStorage({
  async get(key) {
    if (Capacitor.isNativePlatform()) return (await Preferences.get({ key })).value;
    return localStorage.getItem(key);
  },
  async set(key, value) {
    if (Capacitor.isNativePlatform()) await Preferences.set({ key, value });
    else localStorage.setItem(key, value);
  },
});

export async function setupPlatform({ onBack, onPause }) {
  if (!Capacitor.isNativePlatform()) return;
  await App.addListener('appStateChange', ({ isActive }) => { if (!isActive) onPause(); });
  if (Capacitor.getPlatform() === 'android') {
    await App.addListener('backButton', () => {
      if (!onBack()) void App.minimizeApp();
    });
  }
}
