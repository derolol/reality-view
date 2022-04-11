<template></template>

<script>
import { Group, ExtrudeGeometry, MeshLambertMaterial, Mesh } from "three";
import data from "@/store/data";
import geometryUtil from "@/store/geometryUtil";
export default {
  name: "floorObject",
  props: {
    floorInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      scene: null,
      floorGeometry: [],
      floorMaterial: [],
      floorMesh: [],
      floorGroup: null,
      floorDepth: 0.2,
    };
  },
  created() {
    this.initFloorGeometry();
    this.initFloorMaterial();
    this.initFloorGroup();
    this.initFloorMesh();
    this.initGroupPosition();
  },
  computed: {
    refs() {
      return this.$store.state.mapObjectRefs;
    },
  },
  beforeDestroy() {
    this.scene.remove(this.floorGroup);
    this.floorGroup.clear();
  },
  methods: {
    setScene(scene) {
      this.scene = scene;
    },
    initGroupObjects() {
      // 墙体对象初始化
      let wall = this.floorAttachWall();
      this.floorGroup.add(this.refs[`wall${wall}`][0].getWallObject());
      // 功能区对象初始化
      let areas = this.floorAttachArea();
      for (let i = 0, len = areas.length; i < len; i++) {
        this.refs[`area${areas[i]}`][0].initGroupObjects();
        let area = this.refs[`area${areas[i]}`][0].getAreaGroup();
        this.floorGroup.add(area);
      }
      // POI对象初始化
      let pois = this.floorAttachPOI();
      pois = !pois ? [] : pois;
      for (let i = 0, len = pois.length; i < len; i++) {
        let poi = this.refs[`poi${pois[i]}`][0].getPOIObject();
        this.floorGroup.add(poi);
      }
    },
    getFloorGroup() {
      return this.floorGroup;
    },
    addAreaGroupObject() {
      // 功能区对象初始化
      let areas = this.floorAttachArea();
      for (let i = 0, len = areas.length; i < len; i++) {
        this.refs[`area${areas[i]}`][0].initGroupObjects();
        this.refs[`area${areas[i]}`][0].setScene(this.scene);
        let area = this.refs[`area${areas[i]}`][0].getAreaGroup();
        this.floorGroup.add(area);
      }
    },
    initFloorGeometry() {
      let shapes = geometryUtil.getShapeByCoordinates(
        this.floorGeometryObject().coordinates
      );
      this.floorGeometry.splice(0, this.floorGeometry.length);
      for (let shape of shapes) {
        this.floorGeometry.push(
          new ExtrudeGeometry(shape, {
            steps: 1,
            depth: this.floorDepth,
            bevelEnabled: false,
          })
        );
      }
    },
    initFloorMaterial() {
      this.floorMaterial.push(
        new MeshLambertMaterial({
          color: 0xdfd6f4,
        })
      );
    },
    initFloorMesh() {
      this.floorMesh = [];
      for (let i = 0, len = this.floorGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.floorGeometry[i],
          this.floorMaterial[i % this.floorMaterial.length]
        );
        mesh.position.set(0, 0, -this.floorDepth);
        mesh.name = `floor${this.floorId()}-three${i}`;
        this.floorMesh.push(mesh);
        this.floorGroup.add(mesh);
      }
    },
    initFloorGroup() {
      this.floorGroup = new Group();
    },
    initGroupPosition() {
      let level = this.floorLevel();
      let height = this.floorHeight() * data.ThreeObjectConfig.zScale;
      let z = level * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.floorGroup.position.set(0, 0, z);
    },
    updateBuildingFloorHeightChange(height) {
      this.floorHeight(height);

      this.initGroupPosition();
    },
    floorLevelChange(level) {
      this.floorLevel(level);

      this.initGroupPosition();
    },
    setFloorMeshVisible(visible) {
      for (let i = 0, len = this.floorMesh.length; i < len; i++) {
        this.floorMesh[i].visible = visible;
      }
    },
    updateFloorGeometry(geometry) {
      this.floorGeometryObject(geometry);

      this.floorGroup.remove(...this.floorMesh);
      this.initFloorGeometry();
      this.initFloorMesh();
    },
    /**
     * 控制楼层轮廓的显示与隐藏
     */
    setFloorGroupVisible(visible) {
      this.floorGroup.visible = visible;
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    updateFloorInfo(info) {
      Object.assign(this.floorInfo.properties, info);
    },

    floorId(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_id = value;
      }
      return this.floorInfo.properties.floor_id;
    },
    floorName(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_name = value;
      }
      return this.floorInfo.properties.floor_name;
    },
    floorLevel(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_level = value;
      }
      return this.floorInfo.properties.floor_level;
    },
    floorHeight(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_height = value;
      }
      return this.floorInfo.properties.floor_height;
    },
    floorBelongBuilding(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_belong_building = value;
      }
      return this.floorInfo.properties.floor_belong_building;
    },
    floorAttachWall(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_attach_wall = value;
      }
      return this.floorInfo.properties.floor_attach_wall;
    },
    floorAttachArea(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_attach_area = value;
      }
      return this.floorInfo.properties.floor_attach_area;
    },
    floorAttachPOI(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_attach_poi = value;
      }
      return this.floorInfo.properties.floor_attach_poi;
    },
    floorOwner(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_owner = value;
      }
      return this.floorInfo.properties.floor_owner;
    },
    floorAccessLevel(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_access_level = value;
      }
      return this.floorInfo.properties.floor_access_level;
    },
    floorAccessWList(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_access_w_list = value;
      }
      return this.floorInfo.properties.floor_access_w_list;
    },
    floorAccessRList(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_access_r_list = value;
      }
      return this.floorInfo.properties.floor_access_r_list;
    },
    floorAccessWGroup(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_access_w_group = value;
      }
      return this.floorInfo.properties.floor_access_w_group;
    },
    floorAccessRGroup(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_access_r_group = value;
      }
      return this.floorInfo.properties.floor_access_r_group;
    },
    floorGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.geometry = value;
      }
      return this.floorInfo.geometry;
    },
  },
};
</script>

<style>
</style>