<template></template>

<script>
import {
  ShapeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  DoubleSide,
  Color,
} from "three";
import geometryUtil from "@/utils/geometryUtil";
import data from "@/utils/data";
import { mapState, mapMutations } from "vuex";
export default {
  name: "areaObject",
  props: {
    areaInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      previousGroup: null,
      areaGeometry: [],
      areaMaterial: [],
      areaMesh: [],
      areaGroup: null,
      colorSet: data.AreaType,
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
     * 初始化功能区对象
     */
    addAreaObject(previousGroup) {
      this.previousGroup = previousGroup;
      this.initAreaGeometry();
      this.initAreaMaterial();
      this.initAreaGroup();
      this.initAreaMesh();
      this.initGroupObjects();
      this.previousGroup.add(this.areaGroup);
    },

    /**
     * 初始化功能区组
     */
    initGroupObjects() {
      // 添加组件
      let components = this.areaAttachComponent();
      for (let i = 0, len = components.length; i < len; i++) {
        this.mapObjectRefs[`component${components[i]}`].addComponentObject(
          this.areaGroup
        );
      }
    },

    /**
     * 初始化功能区结构
     */
    initAreaGeometry() {
      // 获取功能区形状
      let shapes = geometryUtil.getShapeByCoordinates(
        this.areaGeometryObject().coordinates
      );
      // 清空已有功能区形状
      this.areaGeometry.splice(0, this.areaGeometry.length);
      for (let shape of shapes) {
        this.areaGeometry.push(new ShapeGeometry(shape));
      }
    },

    /**
     * 初始化功能区材质
     */
    initAreaMaterial() {
      for (let key in this.colorSet) {
        this.areaMaterial.push(
          new MeshLambertMaterial({
            color: this.colorSet[key].color,
            side: DoubleSide,
          })
        );
      }
    },

    /**
     * 初始化功能区组
     */
    initAreaGroup() {
      this.areaGroup = new Group();
    },

    /**
     * 初始化功能区物体
     */
    initAreaMesh() {
      // 清除已有物体
      this.areaMesh.splice(0, this.areaMesh.length);
      // 根据功能区类型获取当前渲染材质
      let material =
        this.areaType() == 0 || this.areaType()
          ? this.areaMaterial[+this.areaType()]
          : this.areaMaterial[
              +this.areaId() % Object.keys(this.colorSet).length
            ];
      for (let i = 0, len = this.areaGeometry.length; i < len; i++) {
        let mesh = new Mesh(this.areaGeometry[i], material);
        mesh.position.set(0, 0, 0.01);
        mesh.name = `area${this.areaId()}three${mesh.id}`;
        this.addMapClickableObjects(mesh);
        this.areaMesh.push(mesh);
        this.areaGroup.add(mesh);
      }
    },

    /**
     * 清除功能区
     */
    clearObject() {
      for (let i = 0, len = this.areaMesh; i < len; i++) {
        this.removeMapClickableObjects(this.areaMesh[i]);
      }
      this.previousGroup.remove(this.areaGroup);
      this.areaGroup.clear();
    },

    /**
     * 重新渲染功能区
     */
    rerenderMesh() {
      this.areaGroup.remove(...this.areaMesh);
      this.removeMapClickableObjects(...this.areaMesh);
      this.initAreaGeometry();
      this.initAreaMesh();
      this.previousGroup.add(this.areaGroup);
    },

    /**
     * 更新功能区信息
     */
    updateAreaInfo(info) {
      Object.assign(this.areaInfo.properties, info);
    },

    /**
     * 更新当前功能区的颜色
     */
    setMeshColor() {
      let type = this.areaType();
      // 功能区类型为过道
      for (let obj of this.areaMesh) {
        obj.material.color = new Color(this.colorSet[type].color);
      }
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

    areaId(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_id = value;
      }
      return this.areaInfo.properties.area_id;
    },

    areaName(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_name = value;
      }
      return this.areaInfo.properties.area_name;
    },

    areaType(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_type = value;
        // 更新当前功能区颜色
        this.setMeshColor();
      }
      return this.areaInfo.properties.area_type;
    },

    areaBelongFloor(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_belong_floor = value;
      }
      return this.areaInfo.properties.area_belong_floor;
    },

    areaAttachPOI(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_attach_poi = value;
      }
      return this.areaInfo.properties.area_attach_poi;
    },

    areaAttachPipe(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_attach_pipe = value;
      }
      return this.areaInfo.properties.area_attach_pipe;
    },

    areaAttachWall(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_attach_wall = value;
      }
      return this.areaInfo.properties.area_attach_wall;
    },

    areaAttachComponent(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_attach_component = value;
      }
      return this.areaInfo.properties.area_attach_component;
    },

    areaOwner(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_owner = value;
      }
      return this.areaInfo.properties.area_owner;
    },

    areaAccessLevel(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_access_level = value;
      }
      return this.areaInfo.properties.area_access_level;
    },

    areaAccessWList(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_access_w_list = value;
      }
      return this.areaInfo.properties.area_access_w_list;
    },

    areaAccessRList(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_access_r_list = value;
      }
      return this.areaInfo.properties.area_access_r_list;
    },

    areaAccessWGroup(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_access_w_group = value;
      }
      return this.areaInfo.properties.area_access_w_group;
    },

    areaAccessRGroup(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.properties.area_access_r_group = value;
      }
      return this.areaInfo.properties.area_access_r_group;
    },

    areaGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.areaInfo.geometry = value;
        this.rerenderMesh();
      }
      return this.areaInfo.geometry;
    },
  },
};
</script>

<style>
a {
  color: #e3dfdf;
  color: #c2e7fb;
  color: #ffc6cc;
  color: #ffd5b8;
  color: #b4e6e3;
  color: #bae0c6;
  color: #d9caf9;
  color: #f5e9bb;
}
</style>