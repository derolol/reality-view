<template>
  <svg :class="style" aria-hidden="true">
    <use :xlink:href="name" />
  </svg>
</template>

<script>
export default {
  name: "SvgIcon",
  props: {
    iconName: {
      type: String,
      required: true,
    },
    iconStyle: {
      type: String,
    },
  },
  computed: {
    name() {
      return `#icon-${this.iconName}`;
    },
    style() {
      return `svg-icon ${this.iconStyle ? this.iconStyle : ""}`;
    },
  },
};
</script>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>