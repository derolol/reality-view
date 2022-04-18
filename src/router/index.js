import Vue from 'vue'
import VueRouter from 'vue-router'
import api from '@/request/user'
import store from '@/store'

const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function push(location) {
  return originalReplace.call(this, location).catch(err => err);
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('@/views/frame/Frame.vue'),
    children: [
      {
        path: '/',
        name: 'homepage',
        component: () => import('@/views/home/Homepage.vue'),
      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginPage.vue'),
  },
  {
    path: '/entry',
    name: 'entry',
    component: () => import('@/views/frame/Frame.vue'),
    children: [
      {
        path: 'maps',
        name: 'maps',
        component: () => import('@/views/map/MapList.vue'),
      },
      {
        path: 'society',
        name: 'society',
        component: () => import('@/views/society/MapSociety.vue'),
      },
      {
        path: 'sdk',
        name: 'sdk',
        component: () => import('@/views/sdk/MapSDK.vue'),
      },
    ],
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('@/views/editor/WorkSpace.vue'),
    children: [
      {
        path: 'maps/:id/editor',
        name: 'mapEditor',
        component: () => import('@/views/editor/MapEditor.vue'),
      },
      {
        path: 'maps/:id/preview',
        name: 'mapPreview',
        component: () => import('@/views/map/MapPreview.vue'),
      },
      {
        path: 'palette',
        name: 'palette',
        component: () => import('@/components/palette/ShapePalette.vue'),
      },
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  // 判断用户访问页面的权力
  if (to.name !== "login") {
    let check = await api.userAuthorization(to.name);
    // 无访问权限重定向到登录页面
    if (Math.floor(check.code / 1000) === 401) {
      next({ name: "login", params: { before: to.name } });
      return;
    }
  }
  // 重新设置用户信息到 Vuex 中
  const userInfo = JSON.parse(localStorage.getItem("reality_user_info"));
  if (userInfo !== null) {
    store.commit("setUser", userInfo);
  }
  // 判断是否从地图编辑器到地图列表页面
  if (from.name === "mapEditor" && to.name === "maps" && !from.meta.allowNext) {
    router.replace(from);
    from.meta.saveData(320, 200);
    from.meta.to = to;
    return;
  }
  // 路由放行
  next();
})

export default router
