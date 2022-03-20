<template>
  <div>Building {{ scene }}</div>
</template>

<script>
export default {
  name: "buildingObject",
  props: {
    scene: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {};
  },
};
</script>

<style>
</style>