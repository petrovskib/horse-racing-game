import { generateHorses } from '../../utils/horseUtils'

const state = () => ({
  // The full list of 20 horses
  horses: [],
})

const getters = {
  // Returns the full horse list
  allHorses: (state) => state.horses,
}

const mutations = {
  // Replaces the horse list with a freshly generated one
  SET_HORSES(state, horses) {
    state.horses = horses
  },
}

const actions = {
  // Generates horses and commits them to state
  initHorses({ commit }) {
    const horses = generateHorses()
    commit('SET_HORSES', horses)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
