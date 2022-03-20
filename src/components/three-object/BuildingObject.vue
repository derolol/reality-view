<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "buildingObject",
  props: {},
  data() {
    return {};
  },
  created() {
    console.log("building");
  },
  methods: {
    addObjects(scene) {
      console.log("start building add objects");
      for (let el of this.$slots.default) {
        const tag = el.componentOptions.tag;
        if (tag === "floor-object" || tag === "pipe-object") {
          el.componentInstance.addObjects(scene);
        }
      }
    },
  },
};
</script>

<style>
</style>