import Vue from 'vue'
import Vuex from 'vuex'
import data from './data'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    menuItems: data.MenuItems, // 菜单
    activeMenuItem: 1,
    currentUser: null, // 登录状态
    currentUserImagePath: null, // 用户头像存储目录
    currentInfo: null, // 用户信息
  },
  getters: {
    getActiveItem(state) {
      return Object.keys(state.menuItems)[state.activeMenuItem];
    },
  },
  mutations: {
    setActiveItem(state, data) {
      state.activeMenuItem = Object.keys(state.menuItems).indexOf(data);
    },
    setUser(state, userInfo) {
      state.currentUser = userInfo.user_name;
      state.currentUserImagePath = data.Server + "static/profile/" + userInfo.user_image_path;
      state.currentInfo = Object.assign({}, userInfo);
    }
  },
  actions: {
  },
  modules: {
  }
});
