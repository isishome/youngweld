// store/index.js

const store = {
  state: {
    title: null
  },
  getters: {
    getTitle: (state) => {
      return state.title
    }
  },
  mutations: {
    setTitle: (state, payload) => {
      state.title = payload
    }
  },
  actions: {
    setTitle: (context, payload) => {
      context.commit('setTitle', payload)
    }
  }
}

export default store