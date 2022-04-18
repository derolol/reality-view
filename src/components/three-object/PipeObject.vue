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
  computed: {
    scene() {
      return this.$store.state.mapScene;
    },
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