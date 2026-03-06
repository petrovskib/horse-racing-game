# 🏇 Horse Racing Game

An interactive horse racing game built with Vue 3 and Vuex, developed as a front-end case study. Features animated horse races across 6 rounds, real-time results, and a clean component-based architecture.

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat&logo=vue.js)
![Vuex](https://img.shields.io/badge/Vuex-4.x-42b883?style=flat&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat&logo=vite)
![Vitest](https://img.shields.io/badge/Vitest-1.x-6e9f18?style=flat&logo=vitest)
![Cypress](https://img.shields.io/badge/Cypress-13.x-17202c?style=flat&logo=cypress)

---

## 📋 Table of Contents

- [Demo](#-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Game Rules](#-game-rules)
- [Architecture Decisions](#-architecture-decisions)
- [State Management](#-state-management)
- [Composables](#-composables)
- [Testing](#-testing)

---

## ✨ Features

- 🎲 Randomly generates between 10 and 20 horses per program
- 🏁 6-round race schedule with increasing distances (1200m → 2200m)
- 🐎 Smooth horse animations using `requestAnimationFrame`
- ⏸️ Pause and resume race at any time
- 📊 Live results panel updated after each round
- 🏆 Winner highlighted with trophy in results
- 🎨 Each horse has a unique color identifier
- 📋 Race program shows scheduled horses per round

---

## 🛠 Tech Stack

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Vue 3      | UI framework (Options API) |
| Vuex 4     | Global state management    |
| Vite       | Build tool and dev server  |
| Vitest     | Unit testing               |
| Cypress    | End-to-end testing         |

---

## 📁 Project Structure

```
src/
├── composables/
│   ├── useRaceAnimation.js   # requestAnimationFrame loop, horse progress tracking
│   └── useGallop.js          # Galloping emoji animation, auto cleanup
│
├── components/
│   ├── HorseList/
│   │   └── HorseList.vue     # Displays all generated horses with color and condition
│   ├── RaceTrack/
│   │   ├── RaceTrack.vue     # Orchestrates animation, watches store changes
│   │   └── RaceLane.vue      # Single animated horse lane
│   ├── RaceProgram/
│   │   └── RaceProgram.vue   # Shows 6-round schedule with assigned horses
│   └── RaceResults/
│       └── RaceResults.vue   # Displays finishing order after each round
│
├── store/
│   ├── index.js              # Vuex store entry point
│   └── modules/
│       ├── horses.js         # Horse list state, generation action
│       └── race.js           # Schedule, results, round management
│
├── constants/
│   └── raceConfig.js         # All game configuration values
│
├── utils/
│   └── horseUtils.js         # Pure helper functions (generate, shuffle, calculate)
│
├── App.vue                   # Root component, header, button controls
└── main.js                   # App entry point, Vuex registration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Clone the repository
git clone https://gitlab.com/petrovski.bagi/horse-racing-game.git

# Navigate to project folder
cd horse-racing-game

# Install dependencies
npm install
```

### Running the App

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 🎮 Game Rules

1. Click **GENERATE PROGRAM** to create a race schedule
   - Between 10 and 20 horses are randomly generated
   - Each horse receives a unique color and condition score (1–100)
   - 6 rounds are scheduled with 10 random horses each

2. Click **START** to begin the race
   - Rounds run sequentially, one at a time
   - Each round uses a different track distance:

| Round   | Distance |
| ------- | -------- |
| Round 1 | 1200m    |
| Round 2 | 1400m    |
| Round 3 | 1600m    |
| Round 4 | 1800m    |
| Round 5 | 2000m    |
| Round 6 | 2200m    |

3. Click **PAUSE** to freeze the race mid-round
   - Horses stop exactly where they are
   - Click **RESUME** to continue from the same position

4. Results appear in the right panel as each round finishes
   - 🏆 marks the winner of each round

---

## 🏗 Architecture Decisions

### Single Source of Truth for Race Results

A key design decision is that `calculateRaceResult()` is called **exactly once per round** in the Vuex store before the animation begins. The result — including each horse's normalized speed — is stored in `currentRoundResult` and shared with both:

- The **animation** (`useRaceAnimation`) which uses `speed` to move horses
- The **results panel** (`RaceResults`) which uses `position` to display finishing order

This guarantees the horse that visually wins always matches the horse shown as winner in the results panel.

```
race.js: calculateRaceResult() called once
    ├──► currentRoundResult (speed)  ──► useRaceAnimation ──► visual positions
    └──► results[round] (position)   ──► RaceResults      ──► results panel
```

### Fisher-Yates Shuffle

`selectRandomHorses()` uses the Fisher-Yates algorithm instead of the common `sort(() => Math.random() - 0.5)` approach. The sort-based method produces a biased distribution — some permutations are statistically more likely than others. Fisher-Yates guarantees every permutation has equal probability.

### Pauseable Animation

The `useRaceAnimation` composable accumulates elapsed time delta-by-delta on every `requestAnimationFrame` call:

```javascript
elapsedMs += timestamp - lastTimestamp
```

This means pausing (cancelling the rAF loop) naturally preserves `elapsedMs`. When resumed, the next frame continues adding to the same accumulated value — horses pick up from exactly the same position.

---

## 🗄 State Management

The Vuex store is split into two namespaced modules:

### `horses` module

|              |                                              |
| ------------ | -------------------------------------------- |
| **State**    | `horses[]` — the generated horse list        |
| **Action**   | `initHorses` — generates 10–20 random horses |
| **Mutation** | `SET_HORSES`                                 |

### `race` module

|                |                                                                                     |
| -------------- | ----------------------------------------------------------------------------------- |
| **State**      | `schedule`, `results`, `currentRound`, `isRacing`, `isPaused`, `currentRoundResult` |
| **Actions**    | `generateSchedule`, `toggleRace`, `runAllRounds`, `runSingleRound`                  |
| **Key getter** | `currentRoundResult` — pre-calculated speeds for animation                          |

---

## 🎣 Composables

### `useRaceAnimation`

Manages the `requestAnimationFrame` loop for horse movement.

```javascript
const {
  horseProgress, // { [horseId]: 0→1 } — current position of each horse
  prepareRound, // loads pre-calculated speeds from store result
  resetProgress, // snaps all horses back to start line
  startAnimation, // begins rAF loop
  stopAnimation, // cancels rAF loop, preserves elapsed time
} = useRaceAnimation()
```

### `useGallop`

Manages the galloping emoji animation for a single horse lane.

```javascript
const {
  emojiFrame, // ref — alternates between 🐎 and 🐴
  startGallop, // begins interval
  stopGallop, // clears interval, resets to 🐴
} = useGallop()
```

Both composables automatically clean up their timers/loops via `onUnmounted`.

---

## 🧪 Testing

### Unit Tests (Vitest)

Tests cover pure utility functions and Vuex store modules in isolation.

```bash
# Run unit tests in watch mode
npm run test

# Run once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage
```

**Coverage:**

- `horseUtils.js` — horse generation, shuffle, race result calculation, ordinal helper
- `horses` store module — state, actions, mutations
- `race` store module — schedule generation, result saving, getters

### End-to-End Tests (Cypress)

Tests simulate real user interactions in a browser.

```bash
# Open Cypress UI
npm run test:e2e:open

# Run headlessly (CI)
npm run test:e2e
```

**Scenarios covered:**

- Initial page load state
- Generate program flow
- Race execution and animation
- Pause and resume behavior
- Full race completion

> **Note:** Make sure the dev server is running (`npm run dev`) before running E2E tests.

---

## 📝 Available Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Start development server     |
| `npm run build`         | Build for production         |
| `npm run test`          | Run unit tests in watch mode |
| `npm run test:run`      | Run unit tests once          |
| `npm run test:coverage` | Run unit tests with coverage |
| `npm run test:e2e:open` | Open Cypress UI              |
| `npm run test:e2e`      | Run E2E tests headlessly     |
