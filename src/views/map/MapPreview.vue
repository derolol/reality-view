<template>
  <div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            场景渲染
    
    ###########################################################
    ------------------------------------------------------- -->

    <three-render
      ref="render"
      :width="fullScreenWidth"
      :height="fullScreenHeight"
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
    </three-render>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            楼层选择器
    
    ###########################################################
    ------------------------------------------------------- -->
    <floor-choose
      ref="floorChoose"
      class="floor-choose-container"
      :floors="floors"
      :currentFloor="currentFloor"
      @floorChange="handleChooseFloorChange"
    ></floor-choose>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            返回按钮
    
    ###########################################################
    ------------------------------------------------------- -->

    <div class="back-button-container">
      <el-button
        type="primary"
        @click="handleReturnMapList"
      >返回地图列表</el-button>
    </div>

  </div>
</template>

<script>
import fullScreenMixin from "@/components/FullScreenMixin.vue";
import ThreeRender from "@/components/ThreeRender.vue";
import MapObject from "@/components/three-object/MapObject.vue";
import BuildingObject from "@/components/three-object/BuildingObject.vue";
import FloorObject from "@/components/three-object/FloorObject.vue";
import WallObject from "@/components/three-object/WallObject.vue";
import PipeObject from "@/components/three-object/PipeObject.vue";
import AreaObject from "@/components/three-object/AreaObject.vue";
import PoiObject from "@/components/three-object/POIObject.vue";
import api from "@/request/editor";
import FloorChoose from "@/views/editor/FloorChoose.vue";
import data from "@/store/data";
import geometryUtil from "@/store/geometryUtil";
export default {
  name: "mapPreview",
  components: {
    ThreeRender,
    MapObject,
    BuildingObject,
    FloorObject,
    AreaObject,
    WallObject,
    PipeObject,
    PoiObject,
    FloorChoose,
  },
  mixins: [fullScreenMixin],
  data() {
    return {
      map: null,
      buildings: [],
      floors: [],
      walls: [],
      areas: [],
      pois: [],
      pipes: [],
      components: [],
    };
  },
  created() {
    this.initObject();
    this.initPOIResources();
  },
  computed: {
    buildingRef() {
      return this.$refs[`building${this.currentBuilding}`][0];
    },
    floorRef() {
      return this.$refs[`floor${this.currentFloor}`][0];
    },
    wallRef() {
      let wall = this.floorRef.floorAttachWall();
      return this.$refs[`wall${wall}`][0];
    },
    areaRef() {
      if (this.currentArea === -1) return null;
      return this.$refs[`area${this.currentArea}`][0];
    },
    poiRef() {
      if (this.currentPOI === -1) return null;
      return this.$refs[`poi${this.currentPOI}`][0];
    },
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**        地图对象数据加载和初始化         **/
    /**                                       **/
    /*******************************************/

    async initObject() {
      const mapId = this.$route.params.id;
      let res = await api.findMapById(mapId);
      if (res.code !== 200) return;
      const mapData = res.data.map;
      let level = 0;
      if (typeof mapData === "object") {
        // map 数据初始化
        this.map = mapData.mapObject;
        // building 数据初始化
        for (let building of mapData.buildingObjects) {
          this.buildings.push(building);
        }
        // 设置当前默认的 building id
        let buildingInfo = this.buildings[0].properties;
        this.currentBuilding = buildingInfo.building_id;
        // floor 数据初始化
        for (let floor of mapData.floorObjects) {
          this.floors.push(floor);
        }
        // 设置当前默认 floor id，位于中间的楼层
        let levelList = buildingInfo.building_floor_level_list;
        level = levelList[Math.floor(levelList.length / 2)];
        this.currentFloor = buildingInfo.building_floor_level_map[level];
        // wall 数据初始化
        for (let wall of mapData.wallObjects) {
          this.walls.push(wall);
        }
        // area 数据初始化
        for (let area of mapData.areaObjects) {
          this.areas.push(area);
        }
        // poi 数据初始化
        for (let poi of mapData.poiObjects) {
          this.pois.push(poi);
        }
      }
      this.$nextTick(() => {
        this.$store.commit("initMapObjectRefs", this.$refs);
        this.$refs.render.startRender();
        this.$store.commit("initMapScene", this.$refs.render.mapScene);
        // 根据当前楼层对网格位置初始化
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = level * (height + 2 * floorMargin);
        // 设置当前观察建筑的楼层多边形外矩形
        this.$refs.render.setFloorHeight(height);
        this.$refs.render.setFloorBox(
          geometryUtil.getCoordinatesBox(
            this.buildingRef.buildingGeometryObject().coordinates
          )
        );
        // 更新三维场景物体位置
        this.$refs.render.moveRenderPosition(0, 0, z);
      });
    },

    async initPOIResources() {
      let res = await api.getPOIResources();
      if (res.code !== 200) return;
      this.$store.commit("initMapPOIResList", res.data.resList);
      this.$store.commit("initMapPOIImageList", res.data.resImageList);
    },

    /**
     * 用户点击切换当前楼层
     */
    handleChooseFloorChange(floorId) {
      // 设置当前楼层id
      this.currentFloor = floorId;
      let currentLevel = this.floorRef.floorLevel();
      // 根据楼层显示状态控制当前楼层的显示
      this.handleAllFloorVisibleChange();
      // 更新网格和相机的位置
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = currentLevel * (height + 2 * floorMargin);
      this.$refs.render.moveRenderPosition(0, 0, z);
    },
    handleReturnMapList() {
      this.$router.push({ name: "maps" });
    },
  },
};
</script>

<style>
.floor-choose-container {
  position: absolute;
  right: 80px;
  bottom: 80px;
}

.back-button-container {
  position: absolute;
  right: 50px;
  top: 50px;
}
</style>