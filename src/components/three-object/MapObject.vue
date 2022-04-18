<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "mapObject",
  props: {
    mapInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>

<style>
</style>