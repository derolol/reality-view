<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "poiObject",
  props: {},
  data() {
    return {
      scene: null,
      poiGeometry: null,
      poiMaterial: [],
      poiMesh: null,
    };
  },
  created() {
    this.initPOIGeometry();
    this.initPOIMaterial();
    this.initPOIMesh();
  },
  methods: {
    setScene(scene) {
      this.scene = scene;
    },
    getPOIObject() {
      return this.poiMesh;
    },
    initPOIGeometry() {},
    initPOIMaterial() {},
    initPOIMesh() {},
  },
};
</script>

<style>
</style>