import Vue from 'vue'
import App from './App.vue'
import store from './store'
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
