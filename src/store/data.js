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

export default {
  Server,
  MenuItems,
  MapAccessLevelList,
}