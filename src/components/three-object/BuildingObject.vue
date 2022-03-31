<template></template>

<script>
import {
  ExtrudeGeometry,
  MeshLambertMaterial,
  Mesh,
  Group,
  Scene,
} from "three";
import utils from "@/store/utils";
import data from "@/store/data";
export default {
  name: "buildingObject",
  props: {
    buildingInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      scene: null,
      buildingGeometry: null,
      buildingMaterial: null,
      buildingMesh: null,
      buildingGroup: null,
    };
  },
  created() {
    this.initBuildingGeometry();
    this.initBuildingMaterial();
    this.initBuildingMesh();
    this.initBuildingGroup();
  },
  computed: {
    refs() {
      return this.$store.state.mapObjectRefs;
    },
  },
  methods: {
    setScene(scene) {
      this.scene = scene;
    },
    initGroupObjects() {
      let floors = this.buildingInfo.properties.building_attach_floor;
      for (let i = 0, len = floors.length; i < len; i++) {
        this.refs[`floor${floors[i]}`][0].initGroupObjects();
        let floor = this.refs["floor" + floors[i]][0].getFloorGroup();
        this.buildingGroup.add(floor);
      }
      this.buildingGroup.add(this.buildingMesh);
    },
    getBuildingGroup() {
      return this.buildingGroup;
    },
    initBuildingGeometry() {
      // 根据最高和最低楼层计算建筑轮廓高度
      let min = this.buildingInfo.properties.building_floor_level_min;
      let max = this.buildingInfo.properties.building_floor_level_max;
      let height =
        this.buildingInfo.properties.building_floor_height *
        data.ThreeObjectConfig.zScale;
      let depth =
        (max - min + 1) * (height + 2 * data.ThreeObjectConfig.floorMargin);
      let shape = utils.getShape(this.buildingInfo.geometry, -3);
      this.buildingGeometry = new ExtrudeGeometry(shape, {
        steps: 1,
        depth,
        bevelEnabled: false,
      });
    },
    initBuildingMaterial() {
      this.buildingMaterial = new MeshLambertMaterial({
        color: 0xf4f1fb,
        opacity: 0.2,
        transparent: true,
      });
    },
    initBuildingMesh() {
      let min = this.buildingInfo.properties.building_floor_level_min;
      let height =
        this.buildingInfo.properties.building_floor_height *
        data.ThreeObjectConfig.zScale;
      let z =
        min * (height + 2 * data.ThreeObjectConfig.floorMargin) -
        data.ThreeObjectConfig.floorMargin;
      this.buildingMesh = new Mesh(
        this.buildingGeometry,
        this.buildingMaterial
      );
      this.buildingMesh.position.set(0, 0, z);
      this.buildingMesh.renderOrder = 1;
    },
    initBuildingGroup() {
      this.buildingGroup = new Group();
    },
    /**
     * 控制建筑轮廓的显示与隐藏
     */
    updateBuildingMeshVisible(visible) {
      this.buildingMesh.visible = visible;
    },
    /**
     * 更新建筑楼层高度
     */
    updateBuildingFloorHeightChange(height) {
      this.buildingInfo.properties.building_floor_height = height;
      this.buildingGroup.remove(this.buildingMesh);
      this.initBuildingGeometry();
      this.initBuildingMesh();
      this.buildingGroup.add(this.buildingMesh);
    },
  },
};
</script>

<style>
</style>