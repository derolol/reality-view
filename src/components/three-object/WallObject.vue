<template></template>

<script>
import {
  Group,
  ExtrudeGeometry,
  MeshLambertMaterial,
  Mesh,
  Shape,
  Path,
} from "three";
import data from "@/store/data";
import utils from "@/store/utils";
export default {
  name: "wallObject",
  props: {
    wallInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      scene: null,
      wallGeometry: [],
      wallMaterial: [],
      wallMesh: [],
      wallGroup: null,
    };
  },
  created() {
    this.initWallGeometry();
    this.initWallMaterial();
    this.initWallGroup();
    this.initWallMesh();
  },
  methods: {
    setScene(scene) {
      this.scene = scene;
    },
    getWallObject() {
      return this.wallGroup;
    },
    initWallGeometry() {
      let { zScale } = data.ThreeObjectConfig;
      let wallHeight = this.wallFloorHeight() * zScale;
      let wallThick = this.wallThickList()[this.wallThick()];
      // 构建墙体GeoJSON
      let geometryObject = utils.generateWallGeometryObject(
        this.wallGeometryObject(),
        wallThick
      );
      // 构建shape列表
      let shapes = utils.getShape(geometryObject);
      // 构建墙体形状
      this.wallGeometry = [];
      for (let shape of shapes) {
        this.wallGeometry.push(
          new ExtrudeGeometry(shape, {
            steps: 1,
            depth: wallHeight,
            bevelEnabled: false,
          })
        );
      }
    },
    initWallMaterial() {
      this.wallMaterial.push(
        new MeshLambertMaterial({
          opacity: 0.8,
          transparent: true,
          color: 0x9f85dd,
        })
      );
    },
    initWallMesh() {
      this.wallMesh = [];
      for (let i = 0, len = this.wallGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.wallGeometry[i],
          this.wallMaterial[i % this.wallMaterial.length]
        );
        mesh.position.set(0, 0, 0);
        this.wallMesh.push(mesh);
        this.wallGroup.add(mesh);
      }
    },
    initWallGroup() {
      this.wallGroup = new Group();
    },
    updateWallFloorHeightChange(height) {
      this.wallInfo.properties.wall_floor_height = height;
      this.wallGroup.remove(...this.wallMesh);
      this.initWallGeometry();
      this.initWallMesh();
    },

    updateWallGeometry(geometry) {
      this.wallInfo.geometries[0] = geometry;
      this.wallGroup.remove(...this.wallMesh);
      this.initWallGeometry();
      this.initWallMesh();
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    wallId(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_id = value;
      }
      return this.wallInfo.properties.wall_id;
    },

    wallThick(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_thick = value;
      }
      return this.wallInfo.properties.wall_thick;
    },

    wallFloorHeight(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_floor_height = value;
      }
      return this.wallInfo.properties.wall_floor_height;
    },

    wallFloorLevel(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_floor_level = value;
      }
      return this.wallInfo.properties.wall_floor_level;
    },

    wallThickList(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_thick_list = value;
      }
      return this.wallInfo.properties.wall_thick_list;
    },

    wallBelongFloor(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_belong_floor = value;
      }
      return this.wallInfo.properties.wall_belong_floor;
    },

    wallAttachArea(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_attach_area = value;
      }
      return this.wallInfo.properties.wall_attach_area;
    },

    wallAttachPipe(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_attach_pipe = value;
      }
      return this.wallInfo.properties.wall_attach_pipe;
    },

    wallGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.geometries[0] = value;
      }
      return this.wallInfo.geometries[0];
    },

    wallInsideGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.geometries[1] = value;
      }
      return this.wallInfo.geometries[1];
    },
  },
};
</script>

<style>
</style>