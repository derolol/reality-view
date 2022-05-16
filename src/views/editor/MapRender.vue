<template>
  <!-- ------------------------------------------------------
    ###########################################################
         
                            场景渲染
    
    ###########################################################
    ------------------------------------------------------- -->
  <three-render
    ref="render"
    :width="mapRenderWidth"
    :height="mapRenderHeight"
    @controllerRotation="controllerRotation"
    @onMouseClick="onMouseClick"
  >
    <map-object
      :ref="'map' + map.properties.map_id"
      v-if="map !== null"
      :mapInfo="map"
    />
    <building-object
      :ref="'building' + building.properties.building_id"
      v-for="building in buildings"
      :key="'building' + building.properties.building_id"
      :buildingInfo="building"
    />
    <floor-object
      :ref="'floor' + floor.properties.floor_id"
      v-for="floor in floors"
      :key="'floor' + floor.properties.floor_id"
      :floorInfo="floor"
    />
    <wall-object
      :ref="'wall' + wall.properties.wall_id"
      v-for="wall in walls"
      :key="'wall' + wall.properties.wall_id"
      :wallInfo="wall"
    />
    <area-object
      :ref="'area' + area.properties.area_id"
      v-for="area in areas"
      :key="'area' + area.properties.area_id"
      :areaInfo="area"
    />
    <poi-object
      :ref="'poi' + poi.properties.poi_id"
      v-for="poi in pois"
      :key="'poi' + poi.properties.poi_id"
      :poiInfo="poi"
    />
    <pipe-object
      :ref="'pipe' + pipe.properties.pipe_id"
      v-for="pipe in pipes"
      :key="'pipe' + pipe.properties.pipe_id"
      :pipeInfo="pipe"
    />
  </three-render>
</template>

<script>
import api from "@/request/editor";
import data from "@/utils/data";
import fullScreenMixin from "@/components/FullScreenMixin.vue";

import ThreeRender from "@/components/ThreeRender.vue";
import MapObject from "@/components/three-object/MapObject.vue";
import BuildingObject from "@/components/three-object/BuildingObject.vue";
import FloorObject from "@/components/three-object/FloorObject.vue";
import WallObject from "@/components/three-object/WallObject.vue";
import PipeObject from "@/components/three-object/PipeObject.vue";
import AreaObject from "@/components/three-object/AreaObject.vue";
import PoiObject from "@/components/three-object/POIObject.vue";

import { mapState, mapMutations } from "vuex";
import toolUtil from "@/utils/toolUtil";
import geometryUtil from "@/utils/geometryUtil";
export default {
  name: "mapRender",
  components: {
    ThreeRender,
    MapObject,
    BuildingObject,
    FloorObject,
    AreaObject,
    WallObject,
    PipeObject,
    PoiObject,
  },
  mixins: [fullScreenMixin],
  props: {
    mapId: {
      type: Number,
      require: true,
    },
    mapRenderWidth: {
      type: Number,
      default: 200,
    },
    mapRenderHeight: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      render: null,
    };
  },
  watch: {
    currentFloor(oldFloor, newFloor) {
      this.handleCurrentFloorChange(oldFloor, newFloor);
    },
    buildingMeshVisible(visible) {
      localStorage.setItem("reality-map-editor-building-mesh-visible", visible);
      this.buildingRef.updateBuildingMeshVisible(visible);
    },
    allFloorMeshVisible(visible) {
      console.log("map render watch all floor visible", visible);
      localStorage.setItem(
        "reality-map-editor-all-floor-mesh-visible",
        visible
      );
      this.handleAllFloorVisibleChange();
    },
    floorMeshVisible(visible) {
      console.log("map render watch floor visible", visible);
      localStorage.setItem("reality-map-editor-floor-mesh-visible", visible);
      this.handleFloorVisibleChange();
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      map: (state) => state.map,
      mapClickableObjects: (state) => state.mapClickableObjects,
      buildings: (state) => state.buildings,
      floors: (state) => state.floors,
      walls: (state) => state.walls,
      areas: (state) => state.areas,
      pois: (state) => state.pois,
      pipes: (state) => state.pipes,
      components: (state) => state.components,
      currentBuilding: (state) => state.currentBuilding,
      currentFloor: (state) => state.currentFloor,
      currentWall: (state) => state.currentWall,
      currentArea: (state) => state.currentArea,
      currentPOI: (state) => state.currentPOI,
      currentPipe: (state) => state.currentPipe,
      currentComponent: (state) => state.currentComponent,
      buildingRef: (state) => state.buildingRef,
      floorRef: (state) => state.floorRef,
      wallRef: (state) => state.wallRef,
      areaRef: (state) => state.areaRef,
      poiRef: (state) => state.poiRef,
      pipeRef: (state) => state.pipeRef,
      componentRef: (state) => state.componentRef,
      buildingMeshVisible: (state) => state.buildingMeshVisible,
      allFloorMeshVisible: (state) => state.allFloorMeshVisible,
      floorMeshVisible: (state) => state.floorMeshVisible,
    }),
  },
  created() {
    // 绑定全局引用
    this.setMapObjectRefs(this.$refs);
    this.initObject();
    this.initPOIResources();
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**        地图对象数据加载和初始化         **/
    /**                                       **/
    /*******************************************/

    async initObject() {
      // 获取指定id的地图数据
      let res = await api.findMapById(this.mapId);
      if (res.code !== 200) {
        this.$message.error("地图加载失败");
        return;
      }
      // 地图数据响应
      const mapData = res.data.map;

      // 若返回数据格式正确
      if (typeof mapData === "object") {
        //初始化 map 数据
        this.setMap(mapData.mapObject);

        // 初始化 building 数据
        this.setBuildings(
          toolUtil.arraySimpleDeepCopy(mapData.buildingObjects)
        );
        // 获取当前建筑信息
        const buildingInfo = this.buildings[0].properties;

        // 初始化 floor 数据
        this.setFloors(toolUtil.arraySimpleDeepCopy(mapData.floorObjects));
        // 获取当前排序后的楼层层号列表
        let levelList = buildingInfo.building_floor_level_list;
        // 当前层号对应的楼层id
        let currentLevel = levelList[Math.floor(levelList.length / 2)];

        // 初始化 wall 数据
        this.setWalls(toolUtil.arraySimpleDeepCopy(mapData.wallObjects));

        // 初始化 area 数据
        this.setAreas(toolUtil.arraySimpleDeepCopy(mapData.areaObjects));

        // 初始化 poi 数据
        this.setPOIs(toolUtil.arraySimpleDeepCopy(mapData.poiObjects));

        // 初始化 pipe 数据
        this.setPipes(toolUtil.arraySimpleDeepCopy(mapData.pipeObjects));

        this.$nextTick(() => {
          // 设置当前建筑
          this.setCurrentBuilding(buildingInfo.building_id);

          // 设置当前楼层
          this.setCurrentFloor(
            buildingInfo.building_floor_level_map[currentLevel]
          );

          // 启动场景渲染
          this.render = this.$refs.render;
          this.render.startRender();
          // 将渲染场景设置为全局变量
          this.setMapScene(this.render.mapScene);

          // 根据当前楼层对网格位置初始化
          let { zScale, floorMargin } = data.ThreeObjectConfig;
          let height = this.buildingRef.buildingFloorHeight() * zScale;
          let z = currentLevel * (height + 2 * floorMargin);

          // 设置当前观察建筑的楼层多边形外矩形
          this.render.setFloorBox(
            geometryUtil.getCoordinatesBox(
              this.buildingRef.buildingGeometryObject().coordinates
            )
          );

          // 更新三维场景物体位置
          this.render.moveRenderPosition(0, 0, z);

          // 地图元素可见性
          this.initMapMeshVisible();
        });
      }
    },

    /**
     * 初始化POI资源
     */
    async initPOIResources() {
      let res = await api.getPOIResources();
      if (res.code !== 200) return;
      this.initMapPOIResList(res.data.resList);
      this.initMapPOIImageList(res.data.resImageList);
    },

    /**
     * 控制器旋转回调函数
     */
    controllerRotation(degree) {
      this.$emit("controllerRotation", degree);
    },

    /**
     * 鼠标点击回调函数
     */
    onMouseClick(raycaster) {
      // 检测射线点击的物体
      let meshList = raycaster.intersectObjects(this.mapClickableObjects, true);
      // 获取现实可见的第一个物体
      let i = 0;
      let len = meshList.length;
      for (; i < len; i++) {
        if (this.checkObjectVisible(meshList[i].object)) break;
      }
      // 若点击了一个可见物体
      if (i < len && meshList[i] !== null && meshList[i].object !== null) {
        // 正则匹配获取物体类型和id
        let reg = /([a-zA-Z]+)(\d+)([a-zA-Z]+)(\d+)/;
        if (reg.test(meshList[i].object.name)) {
          this.$emit("onMouseClick", true, RegExp.$1, +RegExp.$2, +RegExp.$4);
          return;
        }
      }
      console.log(false, null, null, null);
      this.$emit("onMouseClick", false, null, null, null);
    },

    /**
     * 判断当前物体是否可见
     */
    checkObjectVisible(object) {
      if (object === null) return true;
      if (object.visible) {
        return this.checkObjectVisible(object.parent);
      }
      return false;
    },

    /*******************************************/
    /**                                       **/
    /**            地图全局属性设置             **/
    /**                                       **/
    /*******************************************/

    ...mapMutations("mapEditorStore", [
      "setMapScene",
      "setMapObjectRefs",
      "setMap",
      "setBuildings",
      "setFloors",
      "setWalls",
      "setAreas",
      "setPOIs",
      "setPipes",
      "setComponents",
      "setCurrentBuilding",
      "setCurrentFloor",
      "setCurrentWall",
      "setCurrentArea",
      "setCurrentPOI",
      "setCurrentPipe",
      "setCurrentComponent",
      "initMapPOIResList",
      "initMapPOIImageList",
      "setBuildingMeshVisible",
      "setAllFloorMeshVisible",
      "setFloorMeshVisible",
    ]),

    /*******************************************/
    /**                                       **/
    /**                 public                **/
    /**                                       **/
    /*******************************************/

    /**
     * 初始化地图元素的可见性
     */
    initMapMeshVisible() {
      // 建筑轮廓可见性
      let buildingVisible = localStorage.getItem(
        "reality-map-editor-building-mesh-visible"
      );
      if (typeof eval(buildingVisible) === "boolean") {
        this.setBuildingMeshVisible(eval(buildingVisible));
      }
      // 所有楼层可见性
      let allFloorVisible = localStorage.getItem(
        "reality-map-editor-all-floor-mesh-visible"
      );
      if (typeof eval(allFloorVisible) === "boolean") {
        console.log("init allFloorVisible", allFloorVisible);
        this.setAllFloorMeshVisible(eval(allFloorVisible));
      }
      // 楼层底板可见性
      let floorVisible = localStorage.getItem(
        "reality-map-editor-floor-mesh-visible"
      );
      if (typeof eval(floorVisible) === "boolean") {
        console.log("init floorVisible", floorVisible);
        this.setFloorMeshVisible(eval(floorVisible));
      }
    },

    /**
     * 控制全部楼层的显示
     */
    handleAllFloorVisibleChange() {
      let floorList = this.buildingRef.buildingAttachFloor();
      for (let floorId of floorList) {
        // 若全部可见则显示全部楼层
        if (this.allFloorMeshVisible) {
          this.$refs[`floor${floorId}`][0].setFloorGroupVisible(true);
        } else {
          // 其余楼层隐藏
          this.$refs[`floor${floorId}`][0].setFloorGroupVisible(false);
        }
      }
      this.floorRef.setFloorGroupVisible(true);
    },

    /**
     * 处理楼层地板显示
     */
    handleFloorVisibleChange() {
      let floorList = this.buildingRef.buildingAttachFloor();
      // 统一设置所有楼层地板的可见性
      for (let floorId of floorList) {
        let floorRef = this.$refs[`floor${floorId}`][0];
        floorRef.setFloorMeshVisible(this.floorMeshVisible);
      }
    },

    /**
     * 当前楼层切换
     */
    handleCurrentFloorChange(oldFloor, newFloor) {
      let currentLevel = this.floorRef.floorLevel();
      // 根据楼层显示状态控制当前楼层的显示
      this.handleAllFloorVisibleChange();
      // 更新网格和相机的位置
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = currentLevel * (height + 2 * floorMargin);
      this.render.moveRenderPosition(0, 0, z);
    },
  },
};
</script>

<style>
</style>