import { TOTAL_ROUNDS, ROUND_DISTANCES, RACE_DURATION_MS } from '../../constants/raceConfig'
import { selectRandomHorses, calculateRaceResult } from '../../utils/horseUtils'

const TICK_MS = 100

const state = () => ({
  schedule: [],
  results: {},
  currentRound: 0,
  isRacing: false,
  isGenerated: false,
  isPaused: false,
  currentRoundResult: [],
  elapsedOnPause: 0,
  ticksElapsed: 0,
})

const getters = {
  schedule: (state) => state.schedule,
  results: (state) => state.results,
  currentRound: (state) => state.currentRound,
  isRacing: (state) => state.isRacing,
  isGenerated: (state) => state.isGenerated,
  isPaused: (state) => state.isPaused,
  currentRoundResult: (state) => state.currentRoundResult,
  elapsedOnPause: (state) => state.elapsedOnPause,

  currentHorses: (state) => {
    if (!state.schedule.length) return []
    const index = state.currentRound === 0 ? 0 : state.currentRound - 1
    return state.schedule[index].horses
  },
  ticksElapsed: (state) => state.ticksElapsed,
}

const mutations = {
  SET_SCHEDULE(state, schedule) {
    state.schedule = schedule
  },
  SET_RESULT(state, { round, result }) {
    state.results = { ...state.results, [round]: result }
  },
  SET_CURRENT_ROUND(state, round) {
    state.currentRound = round
  },
  SET_IS_RACING(state, value) {
    state.isRacing = value
  },
  SET_IS_GENERATED(state, value) {
    state.isGenerated = value
  },
  SET_IS_PAUSED(state, value) {
    state.isPaused = value
  },
  SET_CURRENT_ROUND_RESULT(state, result) {
    state.currentRoundResult = result
  },
  RESET_RACE(state) {
    state.schedule = []
    state.results = {}
    state.currentRound = 0
    state.isRacing = false
    state.isPaused = false
    state.isGenerated = false
    state.currentRoundResult = []
    state.elapsedOnPause = 0
    state.ticksElapsed = 0
  },
  SET_ELAPSED_ON_PAUSE(state, value) {
    state.elapsedOnPause = value
  },
  SET_TICKS_ELAPSED(state, value) {
    state.ticksElapsed = value
  },
}

const actions = {
  generateSchedule({ commit, rootGetters }) {
    const allHorses = rootGetters['horses/allHorses']
    const schedule = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
      round: i + 1,
      distance: ROUND_DISTANCES[i],
      horses: selectRandomHorses(allHorses),
    }))
    commit('RESET_RACE')
    commit('SET_SCHEDULE', schedule)
    commit('SET_IS_GENERATED', true)
  },

  toggleRace({ commit, state, dispatch }) {
    if (state.isRacing) {
      // Pause — keep isPaused true so runAllRounds knows it's a resume
      commit('SET_IS_RACING', false)
      commit('SET_IS_PAUSED', true)
    } else {
      // Resume or fresh start
      // NOTE: we do NOT clear isPaused here
      // runAllRounds reads it first, then clears it itself
      dispatch('runAllRounds')
    }
  },

  async runAllRounds({ commit, state, dispatch }) {
    commit('SET_IS_RACING', true)

    const isResuming = state.isPaused
    commit('SET_IS_PAUSED', false)

    const startFrom =
      Array.from({ length: TOTAL_ROUNDS }, (_, i) => i).find((i) => !state.results[i + 1]) ??
      TOTAL_ROUNDS

    for (let i = startFrom; i < TOTAL_ROUNDS; i++) {
      if (!state.isRacing) break

      commit('SET_CURRENT_ROUND', i + 1)

      const shouldReuse = isResuming && i === startFrom

      if (!shouldReuse) {
        const horses = state.schedule[i].horses
        const roundResult = calculateRaceResult(horses)
        commit('SET_CURRENT_ROUND_RESULT', roundResult)
        commit('SET_TICKS_ELAPSED', 0)
      }

      const completed = await dispatch('runSingleRound', {
        roundIndex: i,
        roundResult: state.currentRoundResult,
      })

      if (!completed) break
    }

    if (Object.keys(state.results).length === TOTAL_ROUNDS) {
      commit('SET_IS_RACING', false)
      commit('SET_IS_PAUSED', false)
    }
  },

  runSingleRound({ commit, state }, { roundIndex, roundResult }) {
    return new Promise((resolve) => {
      const totalTicks = RACE_DURATION_MS / TICK_MS

      // Resume from where we left off — not from zero
      let ticks = state.ticksElapsed

      const timer = setInterval(() => {
        if (!state.isRacing) {
          // Save progress before stopping
          commit('SET_TICKS_ELAPSED', ticks)
          clearInterval(timer)
          resolve(false)
          return
        }

        ticks++

        if (ticks >= totalTicks) {
          clearInterval(timer)
          // Reset ticks for next round
          commit('SET_TICKS_ELAPSED', 0)
          commit('SET_RESULT', {
            round: roundIndex + 1,
            result: roundResult.map(({ speed, performance, ...horse }) => horse),
          })
          resolve(true)
        }
      }, TICK_MS)
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
