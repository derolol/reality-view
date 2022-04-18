<template>
  <div
    class="offset-image"
    :style="imageStyle"
  ></div>
</template>

<script>
export default {
  name: "offsetImage",
  props: {
    src: {
      type: String,
      require: true,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {};
  },
  computed: {
    imageStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        backgroundImage: `url(${this.src})`,
        backgroundPosition: `-${this.x * this.width}px -${
          this.y * this.height
        }px`,
      };
    },
  },
};
</script>

<style>
.offset-image {
  background-repeat: no-repeat;
  background-size: 600%;
  margin: 5px;
}
</style>