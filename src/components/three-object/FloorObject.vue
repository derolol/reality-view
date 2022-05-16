<template></template>

<script>
import { Group, ExtrudeGeometry, MeshLambertMaterial, Mesh } from "three";
import data from "@/utils/data";
import geometryUtil from "@/utils/geometryUtil";
import { mapState } from "vuex";
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
      previousGroup: null,
      floorGeometry: [],
      floorMaterial: [],
      floorMesh: [],
      floorGroup: null,
      floorDepth: 0.2,
    };
  },
  created() {},
  computed: {
    ...mapState("mapEditorStore", {
      mapScene: (state) => state.mapScene,
      mapObjectRefs: (state) => state.mapObjectRefs,
    }),
  },
  beforeDestroy() {},
  methods: {
    /**
     * 渲染楼层
     */
    addFloorObject(previousGroup) {
      this.previousGroup = previousGroup;
      this.initFloorGeometry();
      this.initFloorMaterial();
      this.initFloorGroup();
      this.initFloorMesh();
      this.initGroupPosition();
      this.initGroupObjects();
      this.previousGroup.add(this.floorGroup);
    },

    /**
     * 增加渲染功能区
     */
    addAreaGroupObject(areaId) {
      this.mapObjectRefs[`area${areaId}`][0].addAreaObject(this.floorGroup);
    },

    /**
     * 增加渲染POI
     */
    addPOIObject(newPOIId) {
      this.mapObjectRefs[`poi${newPOIId}`][0].setFloorGroup(this.floorGroup);
    },

    /**
     * 初始化楼层结构
     */
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

    /**
     * 初始化材质
     */
    initFloorMaterial() {
      this.floorMaterial.push(
        new MeshLambertMaterial({
          color: 0xdfd6f4,
        })
      );
    },

    /**
     * 初始化组
     */
    initFloorGroup() {
      this.floorGroup = new Group();
    },

    /**
     * 初始化物体
     */
    initFloorMesh() {
      this.floorMesh = [];
      for (let i = 0, len = this.floorGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.floorGeometry[i],
          this.floorMaterial[i % this.floorMaterial.length]
        );
        mesh.position.set(0, 0, -this.floorDepth);
        mesh.name = `floor${this.floorId()}three${mesh.id}`;
        this.floorMesh.push(mesh);
        this.floorGroup.add(mesh);
      }
    },

    /**
     * 初始化楼层位置
     */
    initGroupPosition() {
      let level = this.floorLevel();
      let height = this.floorHeight() * data.ThreeObjectConfig.zScale;
      let z = level * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.floorGroup.position.set(0, 0, z);
    },

    /**
     * 初始化楼层组
     */
    initGroupObjects() {
      // 墙体对象初始化
      let wall = this.floorAttachWall();
      this.mapObjectRefs[`wall${wall}`][0].addWallObject(this.floorGroup);
      // 功能区对象初始化
      let areas = this.floorAttachArea();
      for (let i = 0, len = areas.length; i < len; i++) {
        this.mapObjectRefs[`area${areas[i]}`][0].addAreaObject(this.floorGroup);
      }
      // POI对象初始化
      let pois = this.floorAttachPOI();
      pois = !pois ? [] : pois;
      for (let i = 0, len = pois.length; i < len; i++) {
        this.mapObjectRefs[`poi${pois[i]}`][0].setFloorGroup(this.floorGroup);
      }
    },

    /**
     * 设置楼层底板是否可见
     */
    setFloorMeshVisible(visible) {
      for (let i = 0, len = this.floorMesh.length; i < len; i++) {
        this.floorMesh[i].visible = visible;
      }
    },

    /**
     * 控制楼层轮廓的显示与隐藏
     */
    setFloorGroupVisible(visible) {
      this.floorGroup.visible = visible;
    },

    /**
     * 清除楼层对象
     */
    clearObject() {
      this.previous.remove(this.floorGroup);
      this.floorGroup.remove(...this.floorMesh);
    },

    /**
     * 重新渲染
     */
    rerenderObject() {
      this.clearObject();
      this.initFloorGeometry();
      this.initFloorMaterial();
      this.initFloorMesh();
      this.initGroupPosition();
      this.previousGroup.add(this.floorGroup);
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
        this.initGroupPosition();
      }
      return this.floorInfo.properties.floor_level;
    },
    floorHeight(value) {
      if (value !== undefined && value !== null) {
        this.floorInfo.properties.floor_height = value;
        this.initGroupPosition();
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
        this.rerenderObject();
      }
      return this.floorInfo.geometry;
    },
  },
};
</script>

<style>
</style>