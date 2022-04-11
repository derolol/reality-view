<template></template>

<script>
import {
  ShapeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  DoubleSide,
} from "three";
import geometryUtil from "@/store/geometryUtil";
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
      scene: null,
      areaGeometry: [],
      areaMaterial: [],
      areaMesh: [],
      areaGroup: null,
    };
  },
  created() {
    this.initAreaGeometry();
    this.initAreaMaterial();
    this.initAreaGroup();
    this.initAreaMesh();
  },
  beforeDestroy() {
    this.scene.remove(this.areaGroup);
    this.areaGroup.clear();
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
      let components = this.areaAttachComponent();
      for (let i = 0, len = components.length; i < len; i++) {
        let component =
          this.refs[`component${components[i]}`].getComponentObject();
        this.areaGroup.add(component);
      }
    },
    getAreaGroup() {
      return this.areaGroup;
    },
    initAreaGeometry() {
      let shapes = geometryUtil.getShapeByCoordinates(
        this.areaGeometryObject().coordinates
      );
      this.areaGeometry.splice(0, this.areaGeometry.length);
      for (let shape of shapes) {
        this.areaGeometry.push(new ShapeGeometry(shape));
      }
    },
    initAreaMaterial() {
      this.areaMaterial.push(
        new MeshLambertMaterial({
          color: 0x86e0dd,
          side: DoubleSide,
        }),
        new MeshLambertMaterial({
          color: 0xe6a23c,
          side: DoubleSide,
        }),
        new MeshLambertMaterial({
          color: 0xf27b7b,
          side: DoubleSide,
        }),
        new MeshLambertMaterial({
          color: 0x81a5ed,
          side: DoubleSide,
        })
      );
    },
    initAreaMesh() {
      this.areaMesh.splice(0, this.areaMesh);
      for (let i = 0, len = this.areaGeometry.length; i < len; i++) {
        let mesh = new Mesh(this.areaGeometry[i], this.areaMaterial[0]);
        mesh.position.set(0, 0, 0.01);
        mesh.name = `area${this.areaId()}-three${i}`;
        this.areaMesh.push(mesh);
        this.areaGroup.add(mesh);
      }
    },
    initAreaGroup() {
      this.areaGroup = new Group();
    },
    updateAreaGeometry(geometry) {
      this.areaGeometryObject(geometry);
      this.areaGroup.remove(this.areaMesh);
      this.initAreaGeometry();
      this.initAreaMesh();
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

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
      }
      return this.areaInfo.geometry;
    },
  },
};
</script>

<style>
</style>