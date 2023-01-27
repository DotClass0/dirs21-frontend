import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const API_URL = process.env.VUE_APP_API_URL

export default new Vuex.Store({
    state: {
        dishes: null
    },
    getters: {
        dishes: (state) => state.dishes,
        byCategory: (state) => state.dishes.reduce((result, element) => {
            const category = result[element.category] || []
            category.push(element)
            category.sort((e1, e2) => {
                const result = (e1.subcategory ?? '').localeCompare(e2.subcategory ?? '')
                return result === 0 ? e1.price - e2.price : result
            })
            result[element.category] = category
            return result
        }, {})
    },
    actions: {
        async fetchDishes({ commit }) {
            const response = await axios.get(`${API_URL}/dishes`)
            commit('setDishes', response.data.data)
        },

        async clearDishes({ commit }) {
            await axios.get(`${API_URL}/dishes/clear`)
            commit('setDishes', [])
        },

        async insertDish({ commit }, payload) {
            const response = await axios.put(`${API_URL}/dishes`, payload)
            commit(payload._id ? 'updateDish' : 'addDish', response.data.data)
        },

        async deleteDish({ commit }, { _id }) {
            commit('removeDish', { _id })
            await axios.delete(`${API_URL}/dishes/${_id}`)
        }
    },
    mutations: {
        setDishes: (state, dishes) => state.dishes = dishes,
        addDish: (state, dish) => state.dishes.push(dish),
        updateDish: (state, dish) => {
            state.dishes[state.dishes.findIndex(e => e._id === dish._id)] = dish
            state.dishes = [...state.dishes]
        },
        removeDish: (state, dish) => state.dishes = state.dishes.filter(value => value._id !== dish._id)
    }
})