<template>
  <div class="race-track">
    <div v-if="!isGenerated" class="race-track__empty">
      <p>Press <strong>GENERATE PROGRAM</strong> to begin</p>
    </div>

    <template v-else>
      <div class="race-track__lanes">
        <RaceLane
          v-for="(horse, index) in currentHorses"
          :key="horse.id"
          :horse="horse"
          :lane-number="index + 1"
          :progress="horseProgress[horse.id] || 0"
          :is-running="isRacing"
        />
      </div>

      <div class="race-track__footer">
        <span class="race-track__round-label">
          <transition name="flash" mode="out-in">
            <span v-if="roundComplete" key="complete" class="race-track__complete-badge">
              ✅ Round {{ completedRound }} Complete!
            </span>
            <span v-else key="info">
              <template v-if="currentRound > 0">
                Round {{ currentRound }} — {{ currentDistance }}m
              </template>
              <template v-else> Press START to begin racing </template>
            </span>
          </transition>
        </span>
        <span class="race-track__finish-label" v-if="isGenerated"> FINISH </span>
      </div>
    </template>
  </div>
</template>

<script>
import { useRaceAnimation } from '../../composables/useRaceAnimation'
import RaceLane from './RaceLine.vue'

export default {
  name: 'RaceTrack',
  components: { RaceLane },

  setup() {
    const { horseProgress, prepareRound, resetProgress, startAnimation, stopAnimation } =
      useRaceAnimation()

    return {
      horseProgress,
      prepareRound,
      resetProgress,
      startAnimation,
      stopAnimation,
    }
  },

  data() {
    return {
      roundComplete: false,
      completedRound: 0,
    }
  },

  computed: {
    isGenerated() {
      return this.$store.getters['race/isGenerated']
    },
    isRacing() {
      return this.$store.getters['race/isRacing']
    },
    currentRound() {
      return this.$store.getters['race/currentRound']
    },
    currentHorses() {
      return this.$store.getters['race/currentHorses']
    },
    /*
      This is the key — pre-calculated result from the store.
      Contains speed for each horse calculated ONCE in race.js.
      Animation uses these speeds so visual order matches results.
    */
    currentRoundResult() {
      return this.$store.getters['race/currentRoundResult']
    },
    schedule() {
      return this.$store.getters['race/schedule']
    },
    currentDistance() {
      if (!this.schedule.length || this.currentRound === 0) return 0
      return this.schedule[this.currentRound - 1].distance
    },
  },

  watch: {
    currentRound(newRound, oldRound) {
      this.stopAnimation()

      if (newRound === 0) {
        this.resetProgress([])
        this.roundComplete = false
        return
      }

      if (oldRound > 0) {
        this.roundComplete = true
        this.completedRound = oldRound
        setTimeout(() => {
          this.roundComplete = false
        }, 1500)
      }

      // New round — reset horses to start line
      this.resetProgress(this.currentHorses)
      this.prepareRound(this.currentRoundResult)
      setTimeout(() => {
        this.startAnimation()
      }, 150)
    },

    isRacing(val) {
      if (!val) {
        // Paused — freeze animation, saves elapsed time internally
        this.stopAnimation()
      } else {
        // Resumed — continue from where we left off
        // DO NOT call resetProgress here — horses keep their position
        this.prepareRound(this.currentRoundResult)
        this.startAnimation()
      }
    },

    isGenerated(val) {
      if (val) {
        this.stopAnimation()
        this.resetProgress([])
        this.roundComplete = false
      }
    },
  },
}
</script>

<style scoped>
.race-track {
  flex: 1;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.race-track__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.race-track__lanes {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.race-track__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f9f9f9;
  border-top: 1px solid #ddd;
  font-size: 13px;
  font-weight: bold;
  min-height: 36px;
}

.race-track__round-label {
  color: #555;
  flex: 1;
}

.race-track__finish-label {
  color: #c0392b;
  font-weight: bold;
  font-size: 15px;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.race-track__complete-badge {
  color: #27ae60;
  font-weight: bold;
}

.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.3s ease;
}
.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}
</style>
