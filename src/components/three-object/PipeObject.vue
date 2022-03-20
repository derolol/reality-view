<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "pipeObject",
  props: {},
  data() {
    return {};
  },
  created() {
    console.log("pipe");
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