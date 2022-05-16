<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { SpriteMaterial, Sprite, CanvasTexture } from "three";
import data from "@/utils/data";
import { mapState, mapMutations } from "vuex";
export default {
  name: "poiObject",
  props: {
    poiInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      floorGroup: null,

      poiImage: null,
      srcImageSize: 60,
      desImageSize: 60,
      poiCanvas: null,
      poiCanvasWidth: 60,
      poiCanvasHeight: 60,
      poiFontSize: 30,
      poiMargin: 10,

      poiMaterial: [],
      poiMesh: null,
    };
  },
  created() {},
  beforeDestroy() {
    this.clearPOIObject();
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapPOIImageList: (state) => state.mapPOIImageList,
      mapPOIResList: (state) => state.mapPOIResList,
      currentPOI: (state) => state.currentPOI,
      currentFloor: (state) => state.currentFloor,
      poiRef: (state) => state.poiRef,
      floorRef: (state) => state.floorRef,
      buildingRef: (state) => state.buildingRef,
    }),

    /**
     * 获取资源信息
     */
    resInfo() {
      let poiNo = +("" + this.poiRes())[0];
      let poiType = this.poiRes();
      return this.mapPOIResList[poiNo].types[poiType];
    },

    /**
     * 字体格式
     */
    poiTextFormat() {
      return `${this.poiFontSize}px Arial`;
    },

    /**
     * 放缩基础值
     */
    poiScaleBase() {
      return this.poiCanvasWidth / 12;
    },
  },
  methods: {
    /**
     * 设置POI所在楼层组
     */
    setFloorGroup(floorGroup) {
      this.floorGroup = floorGroup;
      // 开始初始化
      this.initPOIImage();
    },

    /**
     * 初始化POI图片
     */
    initPOIImage() {
      // 若不存在资源则退出
      if (Object.keys(this.mapPOIImageList).length <= 0) return;
      if (Object.keys(this.mapPOIResList).length <= 0) return;
      // 获取资源路径
      let path = this.resInfo.path;
      // 获取资源图片
      let image = this.mapPOIImageList[path];
      this.poiImage = new Image();
      // 图片加载
      this.poiImage.onload = () => {
        this.initPOICanvas(); // 准备画布并绘制内容
        this.initPOIMaterial(); // 准备材质
        this.initPOIMesh(); // 渲染物体
        // 渲染POI对象
        this.floorGroup.add(this.poiMesh);
      };
      this.poiImage.src = image;
    },

    /**
     * 初始化画布
     */
    initPOICanvas() {
      this.poiCanvas = document.createElement("canvas");
      let context = this.poiCanvas.getContext("2d");
      this.measureCanvas(context);
      // 创建大小刚好的画布
      this.poiCanvas.width = this.poiCanvasWidth;
      this.poiCanvas.height = this.poiCanvasHeight;
      // 在画布绘制内容
      this.drawPOICanvasImage(context);
      this.drawPOICanvasText(context);
    },

    /**
     * 判断画布大小
     */
    measureCanvas(context) {
      // 设置字体
      context.font = this.poiTextFormat;
      // 画布宽 = 图片大小 + 2倍边距 + 文字宽
      this.poiCanvasWidth =
        this.desImageSize +
        this.poiMargin * 2 +
        +context.measureText(this.poiName()).width;
      // 画布高 = Min.max(字体大小, 图片大小)
      this.poiCanvasHeight =
        this.poiFontSize > this.desImageSize
          ? this.poiFontSize
          : this.desImageSize;
    },

    /**
     * 绘制POI图片
     */
    drawPOICanvasImage(context) {
      context.drawImage(
        this.poiImage,
        +this.resInfo.offsetX * this.srcImageSize,
        +this.resInfo.offsetY * this.srcImageSize,
        this.srcImageSize,
        this.srcImageSize,
        0,
        0,
        this.desImageSize,
        this.desImageSize
      );
    },

    /**
     * 绘制POI文字
     */
    drawPOICanvasText(context) {
      context.font = this.poiTextFormat;
      context.textBaseline = "middle";
      context.strokeStyle = "black";
      context.lineWidth = 6;
      context.lineJoin = "round";
      // 黑底
      context.strokeText(
        this.poiName(),
        this.desImageSize + this.poiMargin,
        this.poiCanvasHeight / 2
      );
      context.fillStyle = "white";
      // 白字
      context.fillText(
        this.poiName(),
        this.desImageSize + this.poiMargin,
        this.poiCanvasHeight / 2
      );
    },

    /**
     * 初始化POI的材质
     */
    initPOIMaterial() {
      // 根据画布创建精灵纹理
      const texture = new CanvasTexture(this.poiCanvas);
      texture.needsUpdate = true;
      this.poiMaterial = new SpriteMaterial({
        map: texture,
        transparent: true,
      });
    },

    /**
     * 初始化POI精灵
     */
    initPOIMesh() {
      let coordinates = this.poiGeometryObject().coordinates;
      let height = this.poiHeight() * data.ThreeObjectConfig.zScale;
      // 创建精灵
      this.poiMesh = new Sprite(this.poiMaterial);
      // 设置精灵位置
      this.poiMesh.position.set(coordinates[0], coordinates[1], height);
      // 设置精灵放缩大小
      this.poiMesh.scale.set(
        this.poiScaleBase,
        (this.poiCanvasHeight / this.poiCanvasWidth) * this.poiScaleBase,
        this.poiScaleBase
      );
      // 让POI精灵的渲染不被透明物体影响
      this.poiMesh.renderOrder = 1;
      this.poiMesh.name = `poi${this.poiId()}three${this.poiMesh.id}`;
      // 添加到可被选中列表
      this.addMapClickableObjects(this.poiMesh);
    },

    /**
     * 清除POI
     */
    clearPOIObject() {
      this.removeMapClickableObjects(this.poiMesh);
      this.floorGroup.remove(this.poiMesh);
    },

    /**
     * POI物体重新渲染
     */
    poiObjectRerender() {
      this.clearPOIObject();
      this.initPOIImage();
    },

    /**
     * 批量更新属性
     */
    updatePOIInfo(info) {
      Object.assign(this.poiInfo.properties, info);
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    ...mapMutations("mapEditorStore", [
      "addMapClickableObjects",
      "removeMapClickableObjects",
    ]),

    poiId(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_id = value;
      }
      return this.poiInfo.properties.poi_id;
    },

    poiRes(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_res = value;
        this.poiObjectRerender();
      }
      return this.poiInfo.properties.poi_res;
    },

    poiName(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_name = value;
        this.poiObjectRerender();
      }
      return this.poiInfo.properties.poi_name;
    },

    poiHeight(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_height = value;
        let height = value * data.ThreeObjectConfig.zScale;
        let coordinates = this.poiGeometryObject().coordinates;
        this.poiMesh.position.set(coordinates[0], coordinates[1], height);
      }
      return this.poiInfo.properties.poi_height;
    },

    poiBelongFloor(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_belong_floor = value;
      }
      return this.poiInfo.properties.poi_belong_floor;
    },

    poiBelongArea(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_belong_area = value;
      }
      return this.poiInfo.properties.poi_belong_area;
    },

    poiGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.geometry.coordinates = value;
        let height = this.poiHeight() * data.ThreeObjectConfig.zScale;
        this.poiMesh.position.set(value[0], value[1], height);
      }
      return this.poiInfo.geometry;
    },
  },
};
</script>

<style>
</style>