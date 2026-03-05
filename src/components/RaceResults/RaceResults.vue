<template>
  <div class="race-results">
    <!-- Header -->
    <div class="race-results__header">
      <h2>Results</h2>
    </div>

    <!-- Empty state — no rounds finished yet -->
    <div v-if="!hasResults" class="race-results__empty">
      <p>Results will appear as each round finishes</p>
    </div>

    <!-- Scrollable results list -->
    <div v-else class="race-results__body">
      <template v-for="round in schedule" :key="round.round">
        <!-- v-if is now on a separate element from v-for -->
        <div v-if="results[round.round]" class="race-results__round">
          <div class="race-results__round-header">
            <span>{{ ordinal(round.round) }} Lap — {{ round.distance }}m</span>
          </div>

          <table class="race-results__table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="horse in results[round.round]"
                :key="horse.id"
                :class="{ 'race-results__row--winner': horse.position === 1 }"
              >
                <td>
                  <span v-if="horse.position === 1">🏆</span>
                  <span v-else>{{ horse.position }}</span>
                </td>
                <td>
                  <span
                    class="race-results__dot"
                    :style="{ backgroundColor: horse.color.toLowerCase() }"
                  ></span>
                  {{ horse.name }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { toOrdinal } from '../../utils/horseUtils'

export default {
  name: 'RaceResults',

  computed: {
    schedule() {
      return this.$store.getters['race/schedule']
    },
    results() {
      return this.$store.getters['race/results']
    },
    currentRound() {
      return this.$store.getters['race/currentRound']
    },

    // True if at least one round has finished
    hasResults() {
      return Object.keys(this.results).length > 0
    },
  },

  methods: {
    ordinal(n) {
      return toOrdinal(n)
    },
  },
}
</script>

<style scoped>
.race-results {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.race-results__header {
  background-color: #f0c040;
  padding: 8px 12px;
  text-align: center;
}

.race-results__header h2 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

/* ── Empty state ── */
.race-results__empty {
  padding: 24px 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

/* ── Scrollable body ── */
.race-results__body {
  overflow-y: auto;
  max-height: 600px;
  flex: 1;
}

/* ── Single round block ── */
.race-results__round {
  border-bottom: 2px solid #ddd;
}

/* ── Round title ── */
.race-results__round-header {
  background-color: #4a90d9;
  color: white;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: bold;
}

/* ── Table ── */
.race-results__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.race-results__table th {
  background: #f5f5f5;
  padding: 4px 8px;
  text-align: left;
  color: #666;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.race-results__table td {
  padding: 4px 8px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
  vertical-align: middle;
}

/* Winner row gets a gold highlight */
.race-results__row--winner td {
  background-color: #fffbdd;
  font-weight: bold;
}

/* ── Color dot ── */
.race-results__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  vertical-align: middle;
}
</style>
