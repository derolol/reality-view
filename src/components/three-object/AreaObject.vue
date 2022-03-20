<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "areaObject",
  props: {},
  data() {
    return {};
  },
  created() {
    console.log("area");
  },
  methods: {
    addObjects(scene) {
      console.log("start area add objects");
      if (!this.$slots.default) return;
      for (let el of this.$slots.default) {
        const tag = el.componentOptions.tag;
        if (tag === "component-object") {
          el.componentInstance.addObjects(this.mapScene);
        }
      }
    },
  },
};
</script>

<style>
</style>