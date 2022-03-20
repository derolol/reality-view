<template>
  <div class="homepage">
    <div class="homepage-stat homepage-module">
      <div class="title">
        <svg-icon iconName="chart" iconStyle="title-icon" />
        <span class="title-text">数据统计</span>
      </div>
      <div class="number-card homepage-module-content">
        <count
          v-for="num in numberList"
          :key="num.title"
          :title="num.title"
          :desc="num.desc"
          :startValue="num.startValue"
          :endValue="num.endValue"
          :duration="num.duration"
          :unit="num.unit"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from "@/components/SvgIcon.vue";
import Count from "./Count.vue";
export default {
  name: "homepage",
  components: { Count, SvgIcon },
  data() {
    return {
      numberList: [
        {
          title: "平台访问量",
          desc: "Number of the website visitors",
          startValue: 0,
          endValue: 123442,
          duration: 1000,
          unit: "次",
        },
        {
          title: "平台制图数量",
          desc: "Number of indoor map created",
          startValue: 0,
          endValue: 999,
          duration: 1000,
          unit: "份",
        },
        {
          title: "平台制图总面积",
          desc: "Total number of the area of all maps",
          startValue: 0,
          endValue: 429582,
          duration: 1000,
          unit: "㎡",
        },
        {
          title: "地图社区成员数",
          desc: "Number of the society members",
          startValue: 0,
          endValue: 2000,
          duration: 1000,
          unit: "人",
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.homepage {
  padding: 80px;
}

.homepage-module .title {
  @include flex-between-middle($justify-content: flex-start);
  padding: 8px 0px 8px 20px;
  border-left: 5px solid $--color-purple-deep;
  background-color: $--color-purple-white;
}

.homepage .homepage-module-content {
  margin: 20px;
}

.homepage-module .number-card {
  margin: 100px 20px;
  @include flex-between-middle($justify-content: space-around);
}

.homepage-module .title-icon {
  width: 25px;
  height: 25px;
}

.homepage-module .title-text {
  font-size: 22px;
  margin-left: 6px;
}
</style>