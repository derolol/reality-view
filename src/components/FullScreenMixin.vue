<template></template>

<script>
export default {
  data() {
    return {
      fullScreenWidth: 0,
      fullScreenHeight: 0,
    };
  },
  mounted() {
    window.addEventListener("resize", this.windowResize);
    this.windowResize();
  },
  methods: {
    windowResize() {
      this.fullScreenWidth = window.innerWidth;
      this.fullScreenHeight = window.innerHeight - 1;
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.windowResize);
  },
};
</script>

<style>
</style>