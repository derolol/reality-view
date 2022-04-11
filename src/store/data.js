const Server = "http://127.0.0.1:3000/";

const MenuItems = {
  homepage: {
    index: "homepage",
    icon: "home",
    text: "首页",
    routeName: "home",
  },
  maps: {
    index: "maps",
    icon: "map",
    text: "地图列表",
    routeName: "maps",
  },
  society: {
    index: "society",
    icon: "planet",
    text: "地图社区",
    routeName: "mapSociety",
  },
  sdk: {
    index: "sdk",
    icon: "portfolio",
    text: "地图SDK",
    routeName: "mapSDK",
  },
};

const MapAccessLevelList = [
  {
    accessLevel: 1,
    accessDesc: "Owner读写",
  },
  {
    accessLevel: 2,
    accessDesc: "Owner读写|Group读",
  },
  {
    accessLevel: 3,
    accessDesc: "Owner读写|Group读写",
  },
  {
    accessLevel: 4,
    accessDesc: "Owner读写|Group读写|Other读",
  },
  {
    accessLevel: 5,
    accessDesc: "Owner读写|Group读写|Other读写",
  },
]

const MapTagList = ["室内", "大型商场", "停车场", "医院", "学校", "游戏", "景点"];

const BuildingType = {
  100: {
    label: "商业建筑",
    types: {
      100001: {
        label: "商业建筑",
        option: "商场",
        no: "100001",
      },
      100002: {
        label: "商业建筑",
        option: "写字楼",
        no: "100002",
      },
      100003: {
        label: "商业建筑",
        option: "超市",
        no: "100003",
      },
      100004: {
        label: "商业建筑",
        option: "菜市场",
        no: "100004",
      },
      100005: {
        label: "商业建筑",
        option: "停车场",
        no: "100005",
      },
    },
  },
  200: {
    label: "便民建筑",
    types: {
      200001: {
        label: "便民建筑",
        option: "医院",
        no: "200001",
      },
      200002: {
        label: "便民建筑",
        option: "学校",
        no: "200002",
      },
      200003: {
        label: "便民建筑",
        option: "图书馆",
        no: "200003",
      },
      200004: {
        label: "便民建筑",
        option: "科技馆",
        no: "200004",
      },
      200005: {
        label: "便民建筑",
        option: "火车站",
        no: "200005",
      },
      200006: {
        label: "便民建筑",
        option: "飞机场",
        no: "200006",
      },
      200007: {
        label: "便民建筑",
        option: "公园",
        no: "200007",
      },
      200008: {
        label: "便民建筑",
        option: "银行",
        no: "200008",
      },
    },
  },
  300: {
    label: "居住建筑",
    types: {
      300001: {
        label: "居住建筑",
        option: "住宅",
        no: "300001",
      },
      300002: {
        label: "居住建筑",
        option: "酒店",
        no: "300002",
      },
    },
  },
};

const ThreeObjectConfig = {
  zScale: 3,
  floorMargin: 15,
}

export default {
  Server,
  MenuItems,
  MapTagList,
  MapAccessLevelList,
  BuildingType,
  ThreeObjectConfig,
}