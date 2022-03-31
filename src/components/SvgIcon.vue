<template>
  <svg :class="myClass" :style="myStyle" aria-hidden="true">
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
    iconClass: {
      type: String,
    },
    iconStyle: {
      type: String,
    },
  },
  computed: {
    name() {
      return `#icon-${this.iconName}`;
    },
    myClass() {
      return `svg-icon ${this.iconClass ? this.iconClass : ""}`;
    },
    myStyle() {
      return `${this.iconStyle ? this.iconStyle : ""}`;
    },
  },
};
</script>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>