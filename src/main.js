import Vue from 'vue'
import App from './App.vue'
import VueQriously from 'vue-qriously'
import router from './router'
import store from './store'
import '../theme/index.css'
import './assets/svg/index'
import 'animate.css';

Vue.use(VueQriously)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
