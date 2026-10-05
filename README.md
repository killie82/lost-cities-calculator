# Lost Cities Calculator

A beginner-friendly, mobile-ready scorekeeper for the classic two-player, five-color Lost Cities card game.

## Current flow

1. Start a game and enter two player names.
2. Tap Player 1’s cards for each color, then repeat for Player 2.
3. Review the round breakdown and start the next round.
4. After three rounds, see the cumulative totals and winner (or tie).

Back lets you correct entries, including previous rounds. Number cards cannot be entered for both players in the same color/round, and only three wager cards are available between them. Empty colors score zero. Scores are held in memory; refreshing the page clears the game.

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

This starter supports the classic five-expedition game. Six-expedition variants and Lost Cities: The Board Game use different scope and are not included. This is an unofficial fan project, with no copied game artwork or affiliation with the publisher.
