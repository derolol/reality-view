<template></template>

<script>
import { Group, ExtrudeGeometry, MeshLambertMaterial, Mesh } from "three";
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
      let wallHeight =
        this.wallInfo.properties.wall_floor_height *
        data.ThreeObjectConfig.floorMargin;
      let wallThick =
        this.wallInfo.properties.wall_thick_list[
          +this.wallInfo.properties.wall_thick
        ];
      let shapes = utils.getShape(this.wallInfo.geometries, wallThick);
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
      let level = this.wallInfo.properties.wall_floor_level;
      let height =
        this.wallInfo.properties.wall_floor_height *
        data.ThreeObjectConfig.zScale;
      let z = level * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.wallMesh = [];
      for (let i = 0, len = this.wallGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.wallGeometry[i],
          this.wallMaterial[i % this.wallMaterial.length]
        );
        mesh.position.set(0, 0, z);
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
  },
};
</script>

<style>
</style>