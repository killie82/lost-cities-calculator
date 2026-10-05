# Lost Cities Calculator

A beginner-friendly, mobile-ready scorekeeper for the two-player Lost Cities card game, with traditional five-expedition and expanded six-expedition modes. Expanded mode (including purple) is selected by default.

## Current flow

1. Enter two player names, choose five or six expeditions, and start a game.
2. Tap Player 1’s cards for each color, then repeat for Player 2.
3. Review the round breakdown and start the next round.
4. After three rounds, see the cumulative totals and winner (or tie).

Back lets you correct entries, including previous rounds. Tap number cards or any of the three individual wager cards to select them; tap again to remove them. Cards selected by one player are unavailable to the other player in the same color/round. Wager labels 1–3 distinguish the three copies; each has the same scoring effect. Empty colors score zero.

The Reset game button below the calculator opens a confirmation dialog. Keep playing (or Escape) cancels without changing scores; confirming clears all three rounds and returns to setup, keeping player names and the selected edition. Switching editions after entering cards also asks before clearing scores. Scores are held in memory; refreshing the page clears the game.

## Clone and run

Install a current Node.js LTS version, then:

```sh
git clone https://github.com/killie82/lost-cities-calculator.git
cd lost-cities-calculator
npm start
```

Open http://127.0.0.1:4173. No npm install or dependencies are needed.

```sh
npm test
```

## Where to start learning

- `index.html`: page structure.
- `styles.css`: layout, colors, and phone sizing.
- `scoring.js`: isolated scoring logic and round data.
- `app.js`: screens, card selection, and navigation.
- `scoring.test.js`: scoring examples checked automatically.
- `server.js`: small local preview server; not needed by GitHub Pages.
- `assets/cards/`: original illustrated card sheets; `prompts.json` records the generation prompts.

## Original card artwork

Each color has a twelve-panel WebP illustration sheet. The first nine panels are cards 2–10, progressing toward the goal; the final three are wager preparation scenes. The browser shows the appropriate panel inside each card and adds readable rank labels independently of the artwork. Selected cards have a checkmark and colored outline; cards used by the other player show a Used label and muted artwork.

- Yellow: desert expedition discovering pyramids.
- White: arctic expedition uncovering mammoth remains.
- Blue: underwater expedition discovering Atlantis.
- Green: jungle expedition finding El Dorado.
- Red: volcano expedition finding a ruby twice the height of a person.
- Purple: alien expedition finding a huge cracked rock monolith glowing purple.

Artwork was made with the built-in image generator using the prompts in `assets/cards/prompts.json`. The images are bundled locally, with no external image service needed at runtime. Restart the local server after updating `server.js` so it can serve the new artwork. GitHub Pages serves these assets directly.

## Scoring

An empty expedition scores 0. Otherwise:

`(sum of number cards − 20) × (wager count + 1) + eight-card bonus`

The bonus is 20 for at least eight cards, including wagers, and is added after multiplying. Wagers alone count as a started expedition. The overall score is the sum of all three rounds.

Reference: [publisher’s rulebook](https://www.thamesandkosmos.com/manuals/full/691820_lostcities2p_manual.pdf).

## Publish on GitHub Pages

In the repository, open **Settings → Pages**. Choose **Deploy from a branch**, select **main** and **/(root)**, and save. GitHub will display the published URL when deployment finishes:

https://killie82.github.io/lost-cities-calculator/

See [GitHub’s Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Scope

This calculator supports the traditional five-expedition and expanded six-expedition card game. Lost Cities: The Board Game is not included. This is an unofficial fan project, with no copied game artwork or affiliation with the publisher.
