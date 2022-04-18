<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { SpriteMaterial, Sprite, CanvasTexture } from "three";
import data from "@/store/data";
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
  watch: {
    floorGroup() {
      if (Object.keys(this.resList).length <= 0) return;
      if (Object.keys(this.imageList).length <= 0) return;
      this.initPOIImage();
    },
  },
  created() {},
  beforeDestroy() {
    this.$store.commit("removeMapAreaMesh", this.poiMesh);
    this.floorGroup.remove(this.poiMesh);
  },
  computed: {
    scene() {
      return this.$store.state.mapScene;
    },
    imageList() {
      return this.$store.state.mapPOIImageList;
    },
    resList() {
      return this.$store.state.mapPOIResList;
    },
    resInfo() {
      let poiNo = +("" + this.poiRes())[0];
      let poiType = this.poiRes();
      return this.resList[poiNo].types[poiType];
    },
    poiTextFormat() {
      return `${this.poiFontSize}px Arial`;
    },
    poiScaleBase() {
      return this.poiCanvasWidth / 12;
    },
  },
  methods: {
    setFloorGroup(floorGroup) {
      this.floorGroup = floorGroup;
    },
    getPOIObject() {
      return this.poiMesh;
    },
    initPOIImage() {
      if (Object.keys(this.imageList).length <= 0) return;
      if (Object.keys(this.resList).length <= 0) return;
      let path = this.resInfo.path;
      let image = this.imageList[path];
      this.poiImage = new Image();
      this.poiImage.onload = () => {
        this.initPOICanvas();
        this.initPOIMaterial();
        this.initPOIMesh();
        this.floorGroup.add(this.poiMesh);
      };
      this.poiImage.src = image;
    },
    initPOICanvas() {
      this.poiCanvas = document.createElement("canvas");
      let context = this.poiCanvas.getContext("2d");
      this.measureCanvas(context);
      this.poiCanvas.width = this.poiCanvasWidth;
      this.poiCanvas.height = this.poiCanvasHeight;
      this.drawPOICanvasImage(context);
      this.drawPOICanvasText(context);
    },
    measureCanvas(context) {
      context.font = this.poiTextFormat;
      this.poiCanvasWidth =
        this.desImageSize +
        this.poiMargin * 2 +
        +context.measureText(this.poiName()).width;
      this.poiCanvasHeight =
        this.poiFontSize > this.desImageSize
          ? this.poiFontSize
          : this.desImageSize;
    },
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
    drawPOICanvasText(context) {
      context.font = this.poiTextFormat;
      context.textBaseline = "middle";
      context.strokeStyle = "black";
      context.lineWidth = 6;
      context.lineJoin = "round";
      context.strokeText(
        this.poiName(),
        this.desImageSize + this.poiMargin,
        this.poiCanvasHeight / 2
      );
      context.fillStyle = "white";
      context.fillText(
        this.poiName(),
        this.desImageSize + this.poiMargin,
        this.poiCanvasHeight / 2
      );
    },
    initPOIMaterial() {
      const texture = new CanvasTexture(this.poiCanvas);
      texture.needsUpdate = true;
      this.poiMaterial = new SpriteMaterial({
        map: texture,
        transparent: true,
        // sizeAttenuation: false,
      });
    },
    initPOIMesh() {
      let coordinates = this.poiGeometryObject().coordinates;
      let height = this.poiHeight() * data.ThreeObjectConfig.zScale;
      this.poiMesh = new Sprite(this.poiMaterial);
      this.poiMesh.position.set(coordinates[0], coordinates[1], height);
      this.poiMesh.scale.set(
        this.poiScaleBase,
        (this.poiCanvasHeight / this.poiCanvasWidth) * this.poiScaleBase,
        this.poiScaleBase
      );
      this.poiMesh.renderOrder = 1;
      this.poiMesh.name = `poi${this.poiId()}-three${this.poiMesh.id}`;
      this.$store.commit("addMapAreaMesh", this.poiMesh);
    },
    updatePOIInfo(info) {
      Object.assign(this.poiInfo.properties, info);
    },
    updatePOIName(name) {
      this.poiName(name);
      this.floorGroup.remove(this.poiMesh);
      this.initPOIImage();
    },
    updatePOIRes(res) {
      this.poiRes(res);
      this.floorGroup.remove(this.poiMesh);
      this.initPOIImage();
    },
    updatePOIPosition(x, y) {
      this.poiGeometryObject().coordinates[0] = x;
      this.poiGeometryObject().coordinates[1] = y;
      let height = this.poiHeight() * data.ThreeObjectConfig.zScale;
      this.poiMesh.position.set(x, y, height);
    },
    updatePOIHeight(height) {
      this.poiHeight(height);
      height *= data.ThreeObjectConfig.zScale;
      let coordinates = this.poiGeometryObject().coordinates;
      this.poiMesh.position.set(coordinates[0], coordinates[1], height);
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    poiId(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_id = value;
      }
      return this.poiInfo.properties.poi_id;
    },

    poiRes(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_res = value;
      }
      return this.poiInfo.properties.poi_res;
    },

    poiName(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_name = value;
      }
      return this.poiInfo.properties.poi_name;
    },

    poiHeight(value) {
      if (value !== undefined && value !== null) {
        this.poiInfo.properties.poi_height = value;
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
        this.poiInfo.geometry = value;
      }
      return this.poiInfo.geometry;
    },
  },
};
</script>

<style>
</style>