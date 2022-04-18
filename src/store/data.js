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
  zScale: 2,
  floorMargin: 18,
}

const AreaType = {
  0: {
    no: 0,
    type: "走廊",
    color: 0xe3dfdf,
  },
  1: {
    no: 1,
    type: "基础设施",
    color: 0xc2e7fb,
  },
  2: {
    no: 2,
    type: "服务",
    color: 0xffc6cc,
  },
  3: {
    no: 3,
    type: "餐饮",
    color: 0xffd5b8,
  },
  4: {
    no: 4,
    type: "办公",
    color: 0xb4e6e3,
  },
  5: {
    no: 5,
    type: "活动",
    color: 0xbae0c6,
  },
  6: {
    no: 6,
    type: "购物",
    color: 0xd9caf9,
  },
  7: {
    no: 7,
    type: "居住",
    color: 0xf5e9bb,
  },
}

const POIType = {
  100: {
    label: "基础设施",
    color: 0xDCDCDC,
    types: {
      100001: {
        label: "基础设施",
        option: "走道",
        no: "999001",
      },
      999002: {
        label: "基础设施",
        option: "防火通道",
        no: "999002",
      },
      999003: {
        label: "基础设施",
        option: "休息区",
        no: "999003",
      },
      999004: {
        label: "基础设施",
        option: "广播大屏",
        no: "999004"
      }
    }
  },
  100: {
    label: "餐饮",
    color: 0xFDB685,
    types: {
      100001: {
        label: "餐饮",
        option: "中餐",
        no: "100001",
      },
      100002: {
        label: "餐饮",
        option: "西餐",
        no: "100002",
      },
      100003: {
        label: "餐饮",
        option: "快餐",
        no: "100003",
      },
      100004: {
        label: "餐饮",
        option: "甜品",
        no: "100004",
      },
      100005: {
        label: "餐饮",
        option: "其它料理",
        no: "100005",
      },
    },
  },
  200: {
    label: "购物",
    color: 0xD5C3FC,
    types: {
      200001: {
        label: "购物",
        option: "童装",
        no: "200001",
      },
      200002: {
        label: "购物",
        option: "女装",
        no: "200002",
      },
      200003: {
        label: "购物",
        option: "男装",
        no: "200003",
      },
      200004: {
        label: "购物",
        option: "日用品",
        no: "200004",
      },
      200005: {
        label: "购物",
        option: "食品",
        no: "200005",
      },
      200006: {
        label: "购物",
        option: "酒水饮品",
        no: "200006",
      },
      200007: {
        label: "购物",
        option: "珠宝饰品",
        no: "200007",
      },
      200008: {
        label: "购物",
        option: "美容护肤",
        no: "200008",
      },
      200009: {
        label: "购物",
        option: "鞋帽箱包",
        no: "200009",
      },
      200010: {
        label: "购物",
        option: "数码电器",
        no: "200010",
      },
      200011: {
        label: "购物",
        option: "医疗健康",
        no: "200011",
      },
    },
  },
  300: {
    label: "生活服务",
    color: 0xF96B7A,
    types: {
      300001: {
        label: "生活服务",
        option: "教育培训",
        no: "300001",
      },
      300002: {
        label: "生活服务",
        option: "医疗健康",
        no: "300002",
      },
      300003: {
        label: "生活服务",
        option: "运动健身",
        no: "300003",
      },
      300004: {
        label: "生活服务",
        option: "美容美发",
        no: "300004",
      },
      300005: {
        label: "生活服务",
        option: "图书借阅",
        no: "300005",
      },
      300006: {
        label: "生活服务",
        option: "人像摄影",
        no: "300006",
      },
    },
  },
  400: {
    label: "娱乐",
    color: 0x86CA9D,
    types: {
      400001: {
        label: "娱乐",
        option: "儿童娱乐",
        no: "400001",
      },
      400002: {
        label: "娱乐",
        option: "桌游电玩",
        no: "400002",
      },
      400003: {
        label: "娱乐",
        option: "电影院",
        no: "400003",
      },
      400004: {
        label: "娱乐",
        option: "室内运动",
        no: "400004",
      },
      400005: {
        label: "娱乐",
        option: "手工DIY",
        no: "400005",
      },
    },
  },
  500: {
    label: "大众服务",
    color: 0xF96B7A,
    types: {
      500001: {
        label: "大众服务",
        option: "咨询台",
        no: "500001",
      },
      500002: {
        label: "大众服务",
        option: "卫生间",
        no: "500002",
      },
      500003: {
        label: "大众服务",
        option: "停车场",
        no: "500003",
      },
      500004: {
        label: "大众服务",
        option: "收银台",
        no: "500004",
      },
      500005: {
        label: "大众服务",
        option: "母婴区",
        no: "500005",
      },
      500006: {
        label: "大众服务",
        option: "饮水区",
        no: "500006",
      },
      500007: {
        label: "大众服务",
        option: "物品存放",
        no: "500007",
      },
    },
  },
  600: {
    label: "办公",
    color: 0x7ECCCA,
  },
  700: {
    label: "居住",
    color: 0xFFD430,
  }
}

export default {
  Server,
  MenuItems,
  MapTagList,
  MapAccessLevelList,
  BuildingType,
  AreaType,
  POIType,
  ThreeObjectConfig,
}