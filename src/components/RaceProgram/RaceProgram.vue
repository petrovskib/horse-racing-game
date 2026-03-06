<template>
  <div class="race-program">
    <!-- Header -->
    <div class="race-program__header">
      <h2>Program</h2>
    </div>

    <!-- Empty state -->
    <div v-if="!schedule.length" class="race-program__empty">
      <p>Generate a program to see the schedule</p>
    </div>

    <!-- Scrollable rounds list -->
    <div v-else class="race-program__body">
      <div
        v-for="round in schedule"
        :key="round.round"
        class="race-program__round"
        :class="{ 'race-program__round--active': round.round === currentRound }"
      >
        <!-- Round title row -->
        <div class="race-program__round-header">
          <span>{{ ordinal(round.round) }} Lap — {{ round.distance }}m</span>
        </div>

        <!-- Horse table for this round -->
        <table class="race-program__table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(horse, index) in round.horses" :key="horse.id">
              <td>{{ index + 1 }}</td>
              <td>
                <!--  Color dot + name -->
                <span
                  class="race-program__dot"
                  :style="{ backgroundColor: horse.color.toLowerCase() }"
                ></span>
                {{ horse.name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { toOrdinal } from '../../utils/horseUtils'

export default {
  name: 'RaceProgram',

  computed: {
    schedule() {
      return this.$store.getters['race/schedule']
    },
    currentRound() {
      return this.$store.getters['race/currentRound']
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
.race-program {
  flex-shrink: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.race-program__header {
  background-color: #f0c040;
  padding: 8px 12px;
  text-align: center;
}

.race-program__header h2 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

/* ── Empty state ── */
.race-program__empty {
  padding: 24px 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

/* ── Scrollable body ── */
.race-program__body {
  overflow-y: auto;
  max-height: 600px;
  flex: 1;
}

/* ── Single round block ── */
.race-program__round {
  border-bottom: 2px solid #ddd;
}

/* Highlight the currently running round */
.race-program__round--active {
  background-color: #fffbee;
  border-left: 3px solid #e8a838;
}

/* ── Round title ── */
.race-program__round-header {
  background-color: #4a90d9;
  color: white;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: bold;
}

/* ── Table ── */
.race-program__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.race-program__table th {
  background: #f5f5f5;
  padding: 4px 8px;
  text-align: left;
  color: #666;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.race-program__table td {
  padding: 4px 8px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
  vertical-align: middle;
}

.race-program__table tr:hover td {
  background-color: #fafafa;
}

/* ── Color dot ── */
.race-program__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  vertical-align: middle;
}

/* Fixed width on desktop, full width on mobile */
@media (max-width: 768px) {
  .race-program {
    /* or .race-results */
    width: 100%;
  }
}

/* Side by side on tablet */
@media (min-width: 481px) and (max-width: 768px) {
  .race-program {
    /* or .race-results */
    width: calc(50% - 5px);
  }
}
</style>
