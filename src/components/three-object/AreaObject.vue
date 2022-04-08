<template></template>

<script>
import {
  ShapeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  DoubleSide,
} from "three";
import utils from "@/store/utils";
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
      let components = this.areaInfo.properties.area_attach_component;
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
      this.areaGeometry.splice(0, this.areaGeometry.length);
      let shapes = utils.getShape(this.areaInfo.geometry);
      for (let shape of shapes) {
        this.areaGeometry.push(new ShapeGeometry(shape));
      }
    },
    initAreaMaterial() {
      this.areaMaterial.push(
        new MeshLambertMaterial({
          color: 0x86e0dd,
          side: DoubleSide,
        })
      );
    },
    initAreaMesh() {
      this.areaMesh.splice(0, this.areaMesh);
      for (let i = 0, len = this.areaGeometry.length; i < len; i++) {
        let mesh = new Mesh(
          this.areaGeometry[i],
          this.areaMaterial[i % this.areaMaterial.length]
        );
        mesh.position.set(0, 0, 0.01);
        this.areaMesh.push(mesh);
        this.areaGroup.add(mesh);
      }
    },
    initAreaGroup() {
      this.areaGroup = new Group();
    },
    updateAreaGeometry(geometry) {
      this.areaInfo.geometry = geometry;
      this.areaGroup.remove(...this.areaMesh);
      this.initAreaGeometry();
      this.initAreaMesh();
    },
  },
};
</script>

<style>
</style>