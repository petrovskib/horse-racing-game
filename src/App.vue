<template>
  <div id="app">
    <header class="app-header">
      <h1>Horse Racing</h1>
      <div class="app-controls">

        <button
          class="btn btn--primary"
          @click="generateProgram"
          :disabled="isRacing"
        >
          GENERATE PROGRAM
        </button>

        <button
          class="btn btn--secondary"
          @click="toggleRace"
          :disabled="!isGenerated || isFinished"
        >
          {{ raceButtonLabel }}
        </button>

      </div>
    </header>

    <main class="app-body">
      <HorseList />
      <RaceTrack />
      <RaceProgram />
      <RaceResults />
    </main>
  </div>
</template>

<script>
import HorseList   from './components/HorseList/HorseList.vue'
import RaceTrack   from './components/RaceTrack/RaceTrack.vue'
import RaceProgram from './components/RaceProgram/RaceProgram.vue'
import RaceResults from './components/RaceResults/RaceResults.vue'
import { TOTAL_ROUNDS } from './constants/raceConfig'

export default {
  name: 'App',
  components: { HorseList, RaceTrack, RaceProgram, RaceResults },

  computed: {
    isRacing() {
      return this.$store.getters['race/isRacing']
    },
    isGenerated() {
      return this.$store.getters['race/isGenerated']
    },
    isPaused() {
      return this.$store.getters['race/isPaused']
    },
    results() {
      return this.$store.getters['race/results']
    },

    // True when all 6 rounds have finished
    isFinished() {
      return Object.keys(this.results).length === TOTAL_ROUNDS
    },

    // Button label changes based on race state
    raceButtonLabel() {
      if (this.isFinished)  return 'FINISHED'
      if (this.isRacing)    return 'PAUSE'
      if (this.isPaused)    return 'RESUME'
      return 'START'
    }
  },

  methods: {
    generateProgram() {
      this.$store.dispatch('horses/initHorses')
      this.$store.dispatch('race/generateSchedule')
    },
    toggleRace() {
      this.$store.dispatch('race/toggleRace')
    }
  }
}
</script>

<style>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #e8e8e8;
  min-height: 100vh;
}

/* ── Header ── */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #c0392b;
  color: white;
  padding: 10px 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.app-header h1 {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ── Buttons ── */
.app-controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 7px 18px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn--primary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn--secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn:not(:disabled):hover {
  background-color: #bdc3c7;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* ── Main Layout ── */
.app-body {
  display: flex;
  gap: 10px;
  padding: 12px;
  align-items: flex-start;
  min-height: calc(100vh - 48px);
}
</style>