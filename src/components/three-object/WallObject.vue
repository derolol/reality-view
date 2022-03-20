<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "wallObject",
  props: {},
  data() {
    return {};
  },
  created() {
    console.log("wall");
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