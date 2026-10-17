# Lost Cities Calculator

A beginner-friendly, mobile-ready scorekeeper for the two-player Lost Cities card game, with traditional five-expedition and expanded six-expedition modes. Expanded mode (including purple) is selected by default.

## Current flow

1. Enter two player names, choose five or six expeditions, and start a game.
2. Tap Player 1’s cards for each color, then repeat for Player 2.
3. Review the round breakdown and start the next round.
4. After three rounds, see the cumulative totals and winner (or tie).

Back lets you correct entries, including previous rounds. Tap number cards or any of the three individual wager cards to select them; tap again to remove them. Cards selected by one player are unavailable to the other player in the same color/round. Wager labels 1–3 distinguish the three copies; each has the same scoring effect. Empty colors score zero.

The Reset game button below the calculator opens a confirmation dialog. Keep playing (or Escape) cancels without changing scores; confirming clears all three rounds and returns to setup, keeping player names and the selected edition. Switching editions after entering cards also asks before clearing scores.

Games save automatically on this device. Refreshing the website or reopening the mobile app restores the current cards, names, edition, and screen. Mobile builds use device Preferences; the website uses browser storage. Clearing app/site data or uninstalling removes the saved game. If storage is unavailable, play still works and the footer explains that scores could not be saved. Games do not sync between devices.

## Clone and run

Install Node.js 22.12 or newer (Node.js 24 LTS recommended), then:

```sh
git clone https://github.com/killie82/lost-cities-calculator.git
cd lost-cities-calculator
npm ci
npm start
```

Open http://127.0.0.1:4173. Vite runs the local development server.

```sh
npm test
npx playwright install chromium
npm run test:web
```

`npm test` checks scoring, game navigation, and saved-game handling. `npm run test:web` builds the production website and runs browser checks at desktop and phone sizes and under a GitHub Pages subdirectory.

To create and preview a production web build:

```sh
npm run build
npm run preview
```

The generated `dist/` folder is the deployable website. Asset paths are relative so it also works under a project URL. Android and iOS package this same build and its local artwork; neither mobile app needs a server or internet connection to calculate scores.

## Where to start learning

- `index.html`: page structure.
- `styles.css`: layout, colors, and phone sizing.
- `scoring.js`: isolated scoring logic and round data.
- `app.js`: screens, card selection, and navigation.
- `game.js`: shared game state, card actions, navigation, and save validation.
- `storage.js`: versioned saved games, recovery, and ordered writes.
- `platform.js`: web/device storage and Android system Back behavior.
- `scoring.test.js`: scoring examples checked automatically.
- `game.test.js` and `tests/web.spec.js`: game-state and browser regression checks.
- `vite.config.js`: shared web build and development server.
- `capacitor.config.json`: mobile application identity and build location.
- `android/` and `ios/`: native projects, icons, and launch screens.
- `assets/cards/`: original illustrated card sheets; `prompts.json` records the generation prompts.

## Original card artwork

Each color has a twelve-panel WebP illustration sheet. The first nine panels are cards 2–10, progressing toward the goal; the final three are wager preparation scenes. The browser shows the appropriate panel inside each card and adds readable rank labels independently of the artwork. Selected cards have a checkmark and colored outline; cards used by the other player show a Used label and muted artwork.

- Yellow: desert expedition discovering pyramids.
- White: arctic expedition uncovering mammoth remains.
- Blue: underwater expedition discovering Atlantis.
- Green: jungle expedition finding El Dorado.
- Red: volcano expedition finding a ruby twice the height of a person.
- Purple: alien expedition finding a huge cracked rock monolith glowing purple.

Artwork was made with the built-in image generator using the prompts in `assets/cards/prompts.json`. The images are bundled locally, with no external image service needed at runtime. Vite includes all six card sheets in the production build.

## Android and iOS

Both native projects are included. After changing the shared application, rebuild and copy it into both projects:

```sh
npm run mobile:sync
```

For Android, install Android Studio with the Android SDK required by `android/variables.gradle` (currently SDK 36), and JDK 21 or newer. Then:

```sh
npm run android
```

This rebuilds/syncs the app and opens Android Studio. Use a connected phone or emulator to run it. Android Studio can create a debug APK or a signed release APK/app bundle. Keep signing keys outside version control.

For iOS, use a Mac with Xcode supported by Capacitor 8 (Xcode 26 or newer), install the repository's Node dependencies there, then:

```sh
npm run ios
```

This rebuilds/syncs and opens the Xcode project. Choose a simulator or configure your signing team for a real device. The project uses Swift Package Manager and includes the Preferences privacy manifest. Windows can prepare and sync the iOS project, but cannot compile or run it.

The initial application ID is `com.kylec.lostcitiescalculator`. Before the first store release, confirm that ID and configure signing, release versions, store listings, screenshots, and privacy information. Changing the ID requires updating the Capacitor config and the corresponding Android application ID/namespace and Xcode bundle identifier. Store submission and physical-device validation are separate from generating the projects.

Android's system Back closes a confirmation dialog first, otherwise follows the calculator's Back flow, and minimizes the app from setup. Safe-area padding keeps the interface clear of screen cutouts and home indicators.

The shared icon source is `assets/app-icon.svg`. To regenerate the native icons and launch images after editing it, install the Playwright Chromium browser and run `node scripts/generate-icons.js`.

Before release, test both mobile apps on actual devices: keyboard/name entry, notches and landscape layout, system Back, background/force-close and restore, reset confirmation, and offline startup. Native compilation and device testing require the platform tools; successful web tests alone do not validate native builds.

See [Capacitor's environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) for platform requirements.

## Scoring

An empty expedition scores 0. Otherwise:

`(sum of number cards − 20) × (wager count + 1) + eight-card bonus`

The bonus is 20 for at least eight cards, including wagers, and is added after multiplying. Wagers alone count as a started expedition. The overall score is the sum of all three rounds.

Reference: [publisher’s rulebook](https://www.thamesandkosmos.com/manuals/full/691820_lostcities2p_manual.pdf).

## Publish on GitHub Pages

In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. The included `.github/workflows/pages.yml` checks and builds changes and deploys the generated `dist/` folder on pushes to `main`. Pull requests run the checks without publishing. You can also run the workflow manually.

The former branch/root publishing mode must be switched to Actions because the source files now need a build. GitHub will display the published URL when deployment finishes:

https://killie82.github.io/lost-cities-calculator/

See [GitHub’s Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Scope

This calculator supports the traditional five-expedition and expanded six-expedition card game. Lost Cities: The Board Game is not included. This is an unofficial fan project, with no copied game artwork or affiliation with the publisher.
