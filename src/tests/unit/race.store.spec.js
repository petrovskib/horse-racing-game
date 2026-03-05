import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import horsesModule from '../../store/modules/horses.js'
import raceModule from '../../store/modules/race.js'
import { TOTAL_ROUNDS, ROUND_DISTANCES } from '../../constants/raceConfig.js'

function createTestStore() {
  return createStore({
    modules: {
      horses: { ...horsesModule },
      race: { ...raceModule },
    },
  })
}

describe('race store module', () => {
  let store

  beforeEach(async () => {
    store = createTestStore()
    // Always have horses ready before race tests
    await store.dispatch('horses/initHorses')
  })

  // ── Initial State ──
  describe('initial state', () => {
    it('starts with empty schedule', () => {
      expect(store.getters['race/schedule']).toEqual([])
    })

    it('starts with empty results', () => {
      expect(store.getters['race/results']).toEqual({})
    })

    it('starts at round 0', () => {
      expect(store.getters['race/currentRound']).toBe(0)
    })

    it('starts not racing', () => {
      expect(store.getters['race/isRacing']).toBe(false)
    })

    it('starts not generated', () => {
      expect(store.getters['race/isGenerated']).toBe(false)
    })
  })

  // ── generateSchedule ──
  describe('generateSchedule action', () => {
    beforeEach(async () => {
      await store.dispatch('race/generateSchedule')
    })

    it('creates exactly 6 rounds', () => {
      expect(store.getters['race/schedule']).toHaveLength(TOTAL_ROUNDS)
    })

    it('assigns correct distance to each round', () => {
      const schedule = store.getters['race/schedule']
      schedule.forEach((round, index) => {
        expect(round.distance).toBe(ROUND_DISTANCES[index])
      })
    })

    it('each round has 10 horses', () => {
      const schedule = store.getters['race/schedule']
      schedule.forEach((round) => {
        expect(round.horses).toHaveLength(10)
      })
    })

    it('sets isGenerated to true', () => {
      expect(store.getters['race/isGenerated']).toBe(true)
    })

    it('resets results when called again', async () => {
      // Manually add a fake result
      store.commit('race/SET_RESULT', {
        round: 1,
        result: [{ id: 1, position: 1 }],
      })
      expect(Object.keys(store.getters['race/results'])).toHaveLength(1)

      // Re-generate should wipe it
      await store.dispatch('race/generateSchedule')
      expect(store.getters['race/results']).toEqual({})
    })

    it('each round number matches its index + 1', () => {
      const schedule = store.getters['race/schedule']
      schedule.forEach((round, index) => {
        expect(round.round).toBe(index + 1)
      })
    })
  })

  // ── Mutations ──
  describe('mutations', () => {
    it('SET_CURRENT_ROUND updates currentRound', () => {
      store.commit('race/SET_CURRENT_ROUND', 3)
      expect(store.getters['race/currentRound']).toBe(3)
    })

    it('SET_IS_RACING updates isRacing', () => {
      store.commit('race/SET_IS_RACING', true)
      expect(store.getters['race/isRacing']).toBe(true)
    })

    it('SET_RESULT stores result for a round', () => {
      const mockResult = [{ id: 1, name: 'Horse', position: 1 }]
      store.commit('race/SET_RESULT', { round: 2, result: mockResult })
      expect(store.getters['race/results'][2]).toEqual(mockResult)
    })

    it('RESET_RACE clears all state', async () => {
      await store.dispatch('race/generateSchedule')
      store.commit('race/SET_CURRENT_ROUND', 3)
      store.commit('race/SET_IS_RACING', true)

      store.commit('race/RESET_RACE')

      expect(store.getters['race/schedule']).toEqual([])
      expect(store.getters['race/results']).toEqual({})
      expect(store.getters['race/currentRound']).toBe(0)
      expect(store.getters['race/isRacing']).toBe(false)
      expect(store.getters['race/isGenerated']).toBe(false)
    })
  })

  // ── currentHorses getter ──
  describe('currentHorses getter', () => {
    it('returns round 1 horses when no round is active', async () => {
      await store.dispatch('race/generateSchedule')
      const schedule = store.getters['race/schedule']
      const currentHorses = store.getters['race/currentHorses']
      expect(currentHorses).toEqual(schedule[0].horses)
    })

    it('returns empty array when schedule is empty', () => {
      expect(store.getters['race/currentHorses']).toEqual([])
    })

    it('returns correct horses for current round', async () => {
      await store.dispatch('race/generateSchedule')
      store.commit('race/SET_CURRENT_ROUND', 3)
      const schedule = store.getters['race/schedule']
      expect(store.getters['race/currentHorses']).toEqual(schedule[2].horses)
    })
  })
})
