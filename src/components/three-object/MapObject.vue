<template>
  <div>Map {{ scene }}</div>
</template>

<script>
export default {
  name: "mapObject",
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