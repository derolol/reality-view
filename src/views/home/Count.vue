<template>
  <div class="count-container">
    <div class="count-title">{{ title }}</div>
    <div class="count-desc">{{ desc }}</div>
    <count-to
      class="count-number"
      :startVal="startValue"
      :endVal="endValue"
      :duration="duration"
    />
    <span class="count-unit">{{ unit }}</span>
  </div>
</template>

<script>
import countTo from "vue-count-to";
export default {
  name: "count",
  components: { countTo },
  props: {
    startValue: {
      type: Number,
      default: 0,
    },
    endValue: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 3000,
    },
    title: {
      require: true,
      type: String,
      default: "",
    },
    desc: {
      require: true,
      type: String,
      default: "",
    },
    unit: {
      require: true,
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.count-container {
  font-family: "Microsoft YaHei";
  text-align: center;
}

.count-container .count-title {
  font-size: 26px;
}

.count-container .count-desc {
  font-size: 12px;
  margin-top: 2px;
  margin-bottom: 6px;
  color: $--color-purple-light;
}

.count-container .count-number {
  font-size: 40px;
  color: $--color-purple-highlight;
}

.count-container .count-unit {
  font-size: 20px;
}
</style>