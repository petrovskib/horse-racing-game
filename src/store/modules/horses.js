import { generateHorses } from '../../utils/horseUtils'

const state = () => ({
  horses: [],
})

const getters = {
  allHorses: (state) => state.horses,
}

const mutations = {
  SET_HORSES(state, horses) {
    state.horses = horses
  },
}

const actions = {
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
