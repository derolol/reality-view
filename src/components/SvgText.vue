<template>
  <div class="svg-text">
    <svg-icon :iconName="iconName" :iconStyle="iconSize" />
    <span class="content">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: "svgText",
  props: {
    iconName: {
      type: String,
      required: true,
    },
    iconWidth: {
      type: Number,
      required: true,
    },
    iconHeight: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconSize() {
      let width = 20;
      let height = 20;
      if (typeof this.iconWidth === "number") {
        width = this.iconWidth;
      }
      if (typeof this.iconHeight === "number") {
        height = this.iconHeight;
      }
      return `width: ${width}px; height: ${height}px;`;
    },
  },
};
</script>

<style lang="scss" scoped>
.svg-text {
  @include flex-between-middle($justify-content: center);
}

.svg-text .content {
  margin-left: 6px;
  line-height: 0px;
}
</style>