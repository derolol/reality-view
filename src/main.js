import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '../theme/index.css'
import './assets/svg/index'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
