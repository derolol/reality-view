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
    return {};
  },
  created() {
    console.log("poi");
  },
  methods: {
    addObjects(scene) {
      console.log("start pipe add objects");
    },
  },
};
</script>

<style>
</style>