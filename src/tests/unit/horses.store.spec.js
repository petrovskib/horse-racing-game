import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import horsesModule from '../../store/modules/horses.js'
import { TOTAL_HORSES } from '../../constants/raceConfig.js'

// Helper: creates a fresh isolated store for each test
function createTestStore() {
  return createStore({
    modules: {
      horses: { ...horsesModule },
    },
  })
}

describe('horses store module', () => {
  let store

  beforeEach(() => {
    // Fresh store before every test — no shared state between tests
    store = createTestStore()
  })

  // ── State ──
  describe('initial state', () => {
    it('starts with an empty horses array', () => {
      expect(store.getters['horses/allHorses']).toEqual([])
    })
  })

  // ── Actions ──
  describe('initHorses action', () => {
    it('populates the store with 20 horses', async () => {
      await store.dispatch('horses/initHorses')
      expect(store.getters['horses/allHorses']).toHaveLength(TOTAL_HORSES)
    })

    it('each horse has id, name, color and condition', async () => {
      await store.dispatch('horses/initHorses')
      const horses = store.getters['horses/allHorses']
      horses.forEach((horse) => {
        expect(horse).toHaveProperty('id')
        expect(horse).toHaveProperty('name')
        expect(horse).toHaveProperty('color')
        expect(horse).toHaveProperty('condition')
      })
    })

    it('replaces horses on repeated calls', async () => {
      await store.dispatch('horses/initHorses')
      const firstConditions = store.getters['horses/allHorses'].map((h) => h.condition).join(',')

      await store.dispatch('horses/initHorses')
      const secondConditions = store.getters['horses/allHorses'].map((h) => h.condition).join(',')

      // Conditions are random — extremely unlikely to be identical
      expect(firstConditions).not.toBe(secondConditions)
    })
  })

  // ── Mutations ──
  describe('SET_HORSES mutation', () => {
    it('sets horses directly via mutation', () => {
      const mockHorses = [{ id: 1, name: 'Test Horse', color: 'Red', condition: 80 }]
      store.commit('horses/SET_HORSES', mockHorses)
      expect(store.getters['horses/allHorses']).toEqual(mockHorses)
    })
  })
})
