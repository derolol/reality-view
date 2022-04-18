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
import geometryUtil from "@/store/geometryUtil";
import data from "@/store/data";
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
      areaGeometry: [],
      areaMaterial: [],
      areaMesh: [],
      areaGroup: null,
      colorSet: data.AreaType,
    };
  },
  created() {
    this.initAreaGeometry();
    this.initAreaMaterial();
    this.initAreaGroup();
    this.initAreaMesh();
  },
  beforeDestroy() {
    this.$store.commit("removeMapAreaMesh", ...this.areaMesh);
    this.scene.remove(this.areaGroup);
    this.areaGroup.clear();
  },
  computed: {
    refs() {
      return this.$store.state.mapObjectRefs;
    },
    scene() {
      return this.$store.state.mapScene;
    },
  },
  methods: {
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
      for (let key in this.colorSet) {
        this.areaMaterial.push(
          new MeshLambertMaterial({
            color: this.colorSet[key].color,
            side: DoubleSide,
          })
        );
      }
    },
    initAreaMesh() {
      this.areaMesh.splice(0, this.areaMesh);
      for (let i = 0, len = this.areaGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.areaGeometry[i],
          this.areaType() == 0 || this.areaType()
            ? this.areaMaterial[+this.areaType()]
            : this.areaMaterial[
                +this.areaId() % Object.keys(this.colorSet).length
              ]
        );
        mesh.position.set(0, 0, 0.01);
        mesh.name = `area${this.areaId()}-three${mesh.id}`;
        this.$store.commit("addMapAreaMesh", mesh);
        this.areaMesh.push(mesh);
        this.areaGroup.add(mesh);
      }
    },
    initAreaGroup() {
      this.areaGroup = new Group();
    },
    updateAreaGeometry(geometry) {
      this.areaGeometryObject(geometry);
      this.rerenderMesh();
    },
    rerenderMesh() {
      this.areaGroup.remove(...this.areaMesh);
      this.$store.commit("removeMapAreaMesh", ...this.areaMesh);
      this.initAreaGeometry();
      this.initAreaMesh();
    },
    setMeshColor(type) {
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

    updateAreaInfo(info) {
      Object.assign(this.areaInfo.properties, info);
    },

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