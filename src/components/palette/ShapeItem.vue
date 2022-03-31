<template>
  <div
    class="shape-item"
    :class="{ 'shape-item-disabled': disabled, 'shape-item-hover': hover }"
    @mouseenter="hover = !disabled"
    @mouseleave="hover = false"
  >
    <div class="shape-head">
      <svg-icon :iconName="shape" iconClass="shape-icon" />
    </div>
    <div class="shape-desc">{{ shapeDesc }}</div>
  </div>
</template>

<script>
export default {
  name: "shapeItem",
  props: {
    shape: {
      type: String,
      require: true,
      default: "error",
    },
    shapeDesc: {
      type: String,
      require: true,
      default: "Error",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {},
};
</script>

<style lang="scss">
.shape-item {
  color: $--color-text;
  user-select: none;
}

.shape-item-hover {
  cursor: pointer;
  color: $--color-purple-main;
}

.shape-item-disabled {
  cursor: not-allowed;
  color: $--color-disabled;
}

.shape-head {
  margin-top: 15px;
  color: currentColor;
  @include flex-between-middle($justify-content: center);
}

.shape-icon {
  width: 25px;
  height: 25px;
}

.shape-desc {
  margin-top: 5px;
  margin-bottom: 20px;
  color: currentColor;
  width: 100%;
  font-size: 14px;
  text-align: center;
}
</style>