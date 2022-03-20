<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "floorObject",
  props: {},
  data() {
    return {};
  },
  created() {
    console.log("floor");
  },
  methods: {
    addObjects(scene) {
      console.log("start floor add objects");
      if (!this.$slots.default) return;
      for (let el of this.$slots.default) {
        const tag = el.componentOptions.tag;
        if (
          tag === "wall-object" ||
          tag === "area-object" ||
          tag === "poi-object" ||
          tag === "pipe-object"
        ) {
          el.componentInstance.addObjects(scene);
        }
      }
    },
  },
};
</script>

<style>
</style>