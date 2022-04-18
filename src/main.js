import Vue from 'vue'
import App from './App.vue'
import VueQriously from 'vue-qriously'
import BaiduMap from 'vue-baidu-map'
import router from './router'
import store from './store'
import '../theme/index.css'
import './assets/svg/index'
import 'animate.css';

Vue.use(VueQriously)
Vue.use(BaiduMap, {
  ak: '3ir7Me02noxXv0O6HGLVhf23gLolCOuO'
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
