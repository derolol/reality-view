<template></template>

<script>
import { Group, ExtrudeGeometry, MeshLambertMaterial, Mesh } from "three";
import data from "@/store/data";
import utils from "@/store/utils";
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
      // 墙体对象初始化
      let wall = this.floorInfo.properties.floor_attach_wall;
      this.floorGroup.add(this.refs[`wall${wall}`][0].getWallObject());
      // 功能区对象初始化
      let areas = this.floorInfo.properties.floor_attach_area;
      for (let i = 0, len = areas.length; i < len; i++) {
        this.refs[`area${areas[i]}`][0].initGroupObjects();
        let area = this.refs[`area${areas[i]}`][0].getAreaGroup();
        this.floorGroup.add(area);
      }
      // POI对象初始化
      let pois = this.floorInfo.properties.floor_attach_poi;
      pois = !pois ? [] : pois;
      for (let i = 0, len = pois.length; i < len; i++) {
        let poi = this.refs[`poi${pois[i]}`][0].getPOIObject();
        this.floorGroup.add(poi);
      }
    },
    getFloorGroup() {
      return this.floorGroup;
    },
    getFloorAttachWall() {
      return this.floorInfo.properties.floor_attach_wall;
    },
    getProperties() {
      return this.floorInfo.properties;
    },
    initFloorGeometry() {
      let shapes = utils.getShape(this.floorInfo.geometry);
      this.floorGeometry = [];
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
      let level = this.floorInfo.properties.floor_level;
      let height =
        this.floorInfo.properties.floor_height * data.ThreeObjectConfig.zScale;
      let z = level * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.floorMesh = [];
      for (let i = 0, len = this.floorGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.floorGeometry[i],
          this.floorMaterial[i % this.floorMaterial.length]
        );
        mesh.position.set(0, 0, z - this.floorDepth);
        this.floorMesh.push(mesh);
        this.floorGroup.add(mesh);
      }
    },
    initFloorGroup() {
      this.floorGroup = new Group();
    },
    updateBuildingFloorHeightChange(height) {
      this.floorInfo.properties.floor_height = height;
      this.floorGroup.remove(...this.floorMesh);
      this.initFloorGeometry();
      this.initFloorMesh();
    },
  },
};
</script>

<style>
</style>