<template></template>

<script>
import { ExtrudeGeometry, MeshLambertMaterial, Mesh, Group } from "three";
import data from "@/store/data";
import clipperUtil from "@/store/clipperUtil";
import geometryUtil from "@/store/geometryUtil";
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
      buildingGeometry: [],
      buildingMaterial: null,
      buildingMesh: [],
      buildingGroup: null,
    };
  },
  created() {
    this.initBuildingGeometry();
    this.initBuildingMaterial();
    this.initBuildingGroup();
    this.initBuildingMesh();
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
      let floors = this.buildingAttachFloor();
      for (let i = 0, len = floors.length; i < len; i++) {
        this.refs[`floor${floors[i]}`][0].initGroupObjects();
        let floor = this.refs[`floor${floors[i]}`][0].getFloorGroup();
        this.buildingGroup.add(floor);
      }
    },
    getBuildingGroup() {
      return this.buildingGroup;
    },
    addFloorGroupObject(floorId) {
      let floors = this.buildingAttachFloor();
      floors.push(floorId);
      this.refs[`floor${floorId}`][0].initGroupObjects();
      this.refs[`floor${floorId}`][0].setScene(this.scene);
      let floorGroup = this.refs[`floor${floorId}`][0].getFloorGroup();
      this.buildingGroup.add(floorGroup);
    },
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
    initBuildingMaterial() {
      this.buildingMaterial = new MeshLambertMaterial({
        color: 0xf4f1fb,
        opacity: 0.2,
        transparent: true,
      });
    },
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
        mesh.renderOrder = 1;
        mesh.name = `building${this.buildingId()}-three${i}`;
        this.buildingMesh.push(mesh);
        this.buildingGroup.add(mesh);
      }
    },
    initBuildingGroup() {
      this.buildingGroup = new Group();
    },
    /**
     * 控制建筑轮廓的显示与隐藏
     */
    updateBuildingMeshVisible(visible) {
      for (let mesh of this.buildingMesh) {
        mesh.visible = visible;
      }
    },
    /**
     * 更新建筑楼层高度
     */
    updateBuildingFloorHeightChange(height) {
      this.buildingFloorHeight(height);

      this.buildingGroup.remove(this.buildingMesh);
      this.initBuildingGeometry();
      this.initBuildingMesh();
    },
    /**
     * 建筑内部楼层改变
     */
    floorLevelChange(max, min) {
      this.buildingFloorLevelMax(max);
      this.buildingFloorLevelMin(min);

      this.buildingGroup.remove(this.buildingMesh);
      this.initBuildingGeometry();
      this.initBuildingMesh();
    },

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