<template></template>

<script>
import { ExtrudeGeometry, MeshLambertMaterial, Mesh, Group } from "three";
import data from "@/utils/data";
import clipperUtil from "@/utils/clipperUtil";
import geometryUtil from "@/utils/geometryUtil";
import { mapState } from "vuex";
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
      previousGroup: null,
      buildingGeometry: [],
      buildingMaterial: null,
      buildingMesh: [],
      buildingGroup: null,
      buildingMeshVisible: false,
    };
  },
  created() {},
  beforeDestroy() {
    this.clearObject();
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapScene: (state) => state.mapScene,
      mapObjectRefs: (state) => state.mapObjectRefs,
    }),
  },
  methods: {
    /**
     * 渲染建筑
     */
    addBuildingObject(previousGroup) {
      this.previousGroup = previousGroup;
      this.initBuildingGeometry();
      this.initBuildingMaterial();
      this.initBuildingGroup();
      this.initBuildingMesh();
      this.initGroupObjects();
      this.previousGroup.add(this.buildingGroup);
    },

    /**
     * 初始化组对象
     */
    initGroupObjects() {
      // 获取楼层对象
      let floors = this.buildingAttachFloor();
      for (let i = 0, len = floors.length; i < len; i++) {
        // 插入楼层组对象
        this.mapObjectRefs[`floor${floors[i]}`][0].addFloorObject(
          this.buildingGroup
        );
      }
      // 获取对象
      let pipes = this.buildingAttachPipe();
      for (let i = 0, len = pipes.length; i < len; i++) {
        // 插入连通区域对象
        this.mapObjectRefs[`pipe${pipes[i]}`][0].addPipeObject(
          this.buildingGroup
        );
      }
    },

    /**
     * 初始化建筑架构
     */
    initBuildingGeometry() {
      // 根据最高和最低楼层计算建筑轮廓高度
      let min = this.buildingFloorLevelMin();
      let max = this.buildingFloorLevelMax();
      let height = this.buildingFloorHeight() * data.ThreeObjectConfig.zScale;
      let depth =
        (max - min + 1) * (height + 2 * data.ThreeObjectConfig.floorMargin);
      // 扩张建筑点集
      let scaleCoordinates = clipperUtil.coordinatesPolygonOffset(
        this.buildingGeometryObject().coordinates,
        3
      );
      let shapes = geometryUtil.getShapeByCoordinates(scaleCoordinates);
      this.buildingGeometry.splice(0, this.buildingGeometry.length);
      for (let shape of shapes) {
        this.buildingGeometry.push(
          new ExtrudeGeometry(shape, {
            steps: 1,
            depth,
            bevelEnabled: false,
          })
        );
      }
    },

    /**
     * 初始化建筑材质
     */
    initBuildingMaterial() {
      this.buildingMaterial = new MeshLambertMaterial({
        color: 0xf4f1fb,
        opacity: 0.2,
        transparent: true,
      });
    },

    /**
     * 初始化建筑组
     */
    initBuildingGroup() {
      this.buildingGroup = new Group();
    },

    /**
     * 初始化建筑物体
     */
    initBuildingMesh() {
      let min = this.buildingFloorLevelMin();
      let height = this.buildingFloorHeight() * data.ThreeObjectConfig.zScale;
      let z =
        min * (height + 2 * data.ThreeObjectConfig.floorMargin) -
        data.ThreeObjectConfig.floorMargin;
      this.buildingMesh.splice(0, this.buildingMesh.length);
      for (let i = 0, len = this.buildingGeometry.length; i < len; i++) {
        let mesh = new Mesh(this.buildingGeometry[i], this.buildingMaterial);
        mesh.position.set(0, 0, z);
        mesh.renderOrder = 2;
        mesh.name = `building${this.buildingId()}three${mesh.id}`;
        mesh.visible = false;
        this.buildingMesh.push(mesh);
        this.buildingGroup.add(mesh);
      }
    },

    /**
     * 控制建筑轮廓的显示与隐藏
     */
    updateBuildingMeshVisible(visible) {
      if (this.buildingMeshVisible === visible) return;
      this.buildingMeshVisible = visible;
      for (let mesh of this.buildingMesh) {
        mesh.visible = visible;
      }
    },

    /**
     * 建筑内部楼层改变
     */
    floorLevelChange(max, min) {
      this.buildingFloorLevelMax(max);
      this.buildingFloorLevelMin(min);
      this.rerenderBuildingMesh();
    },

    /**
     * 重新渲染建筑轮廓
     */
    rerenderBuildingMesh() {
      this.buildingGroup.remove(...this.buildingMesh);
      this.initBuildingGeometry();
      this.initBuildingMesh();
      this.updateBuildingMeshVisible(this.buildingMeshVisible);
    },

    /**
     * 新增渲染建筑对象
     */
    addFloorGroupObject(floorId) {
      this.mapObjectRefs[`floor${floorId}`][0].addFloorObject(
        this.buildingGroup
      );
    },

    /**
     * 新增包含的连通区域对象
     */
    addPipeObject(pipeId) {
      // 插入连通区域对象
      this.mapObjectRefs[`pipe${pipeId}`][0].addPipeObject(this.buildingGroup);
    },

    /**
     * 清除对象
     */
    clearObject() {},

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    updateBuildingInfo(info) {
      Object.assign(this.buildingInfo.properties, info);
    },
    buildingId(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_id = value;
      }
      return this.buildingInfo.properties.building_id;
    },
    buildingName(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_name = value;
      }
      return this.buildingInfo.properties.building_name;
    },
    buildingType(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_type = value;
      }
      return this.buildingInfo.properties.building_type;
    },
    buildingCenterLng(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_center_lng = value;
      }
      return this.buildingInfo.properties.building_center_lng;
    },
    buildingCenterLat(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_center_lat = value;
      }
      return this.buildingInfo.properties.building_center_lat;
    },
    buildingFloorHeight(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_floor_height = value;
        this.rerenderBuildingMesh();
      }
      return this.buildingInfo.properties.building_floor_height;
    },
    buildingFloorLevelMax(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_floor_level_max = value;
      }
      return this.buildingInfo.properties.building_floor_level_max;
    },
    buildingFloorLevelMin(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_floor_level_min = value;
      }
      return this.buildingInfo.properties.building_floor_level_min;
    },
    buildingFloorLevelList(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_floor_level_list = value;
      }
      return this.buildingInfo.properties.building_floor_level_list;
    },
    buildingFloorLevelMap(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_floor_level_map = value;
      }
      return this.buildingInfo.properties.building_floor_level_map;
    },
    buildingBelongMap(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_belong_map = value;
      }
      return this.buildingInfo.properties.building_belong_map;
    },
    buildingAttachFloor(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_attach_floor = value;
      }
      return this.buildingInfo.properties.building_attach_floor;
    },
    buildingAttachPipe(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_attach_pipe = value;
      }
      return this.buildingInfo.properties.building_attach_pipe;
    },
    buildingOwner(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_owner = value;
      }
      return this.buildingInfo.properties.building_owner;
    },
    buildingAccessLevel(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_access_level = value;
      }
      return this.buildingInfo.properties.building_access_level;
    },
    buildingAccessWList(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_access_w_list = value;
      }
      return this.buildingInfo.properties.building_access_w_list;
    },
    buildingAccessRList(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_access_r_list = value;
      }
      return this.buildingInfo.properties.building_access_r_list;
    },
    buildingAccessWGroup(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_access_w_group = value;
      }
      return this.buildingInfo.properties.building_access_w_group;
    },
    buildingAccessRGroup(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.properties.building_access_r_group = value;
      }
      return this.buildingInfo.properties.building_access_r_group;
    },
    buildingGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.buildingInfo.geometry = value;
      }
      return this.buildingInfo.geometry;
    },
  },
};
</script>

<style>
</style>