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
    mapPreviewBasePath: data.Server + "static/preview/", // 地图预览基路径
    mapObjectRefs: null,
    mapScene: null,
    mapMeshList: [],
    mapPOIImageList: {},
    mapPOIResList: {},
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
    },
    initMapObjectRefs(state, refs) {
      state.mapObjectRefs = refs;
    },
    initMapScene(state, scene) {
      state.mapScene = scene;
    },
    addMapAreaMesh(state, ...mesh) {
      state.mapMeshList.push(...mesh);
    },
    removeMapAreaMesh(state, ...mesh) {
      for (let m of mesh) {
        let index = state.mapMeshList.indexOf(m);
        state.mapMeshList.splice(index, 1);
      }
    },
    initMapPOIImageList(state, res) {
      state.mapPOIImageList = res;
    },
    initMapPOIResList(state, res) {
      state.mapPOIResList = res;
    }
  },
  actions: {
  },
  modules: {
  }
});
