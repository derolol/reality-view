<template>
  <div
    class="floor-choose animate__animated"
    :class="{
      animate__pulse: mouseEnterButton,
    }"
    @mouseenter="mouseEnterButton = true"
    @mouseleave="mouseEnterButton = false"
  >
    <div
      class="floor-button"
      :class="{ 'floor-button-active': currentFloor == f }"
      v-for="f in showFloorList"
      @click="handleFloorClick(f)"
    >
      <div>{{ f | floorNumberFormat }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FloorChoose",
  props: {
    floors: {
      type: Object,
      require: true,
    },
    currentFloor: {
      type: Number,
      require: true,
    },
  },
  filters: {
    floorNumberFormat(floor) {
      if (floor === "...") return floor;
      floor = +floor;
      if (floor >= 0) return `F${floor + 1}`;
      return `B${Math.abs(floor)}`;
    },
  },
  data() {
    return {
      maxShowFloors: 7,
      mouseEnterButton: false,
    };
  },
  computed: {
    floorList() {
      let f = [];
      for (let i = 0, len = this.floors.length; i < len; i++) {
        f.push(this.floors[i].properties.floor_level);
      }
      f.sort((a, b) => a - b);
      return f;
    },
    showFloorList() {
      let oldLength = this.floorList.length;
      let more = oldLength - this.maxShowFloors;
      if (more <= 0) return this.floorList;
      let currentIndex = this.floorList.indexOf(this.currentFloor);
      let floors = Array.from(this.floorList);
      if (currentIndex <= 3) {
        floors.splice(this.maxShowFloors - 2, oldLength - this.maxShowFloors);
        floors[this.maxShowFloors - 2] = "...";
        return floors;
      } else if (currentIndex >= oldLength - 4) {
        floors.splice(2, oldLength - this.maxShowFloors);
        floors[1] = "...";
        return floors;
      }
      floors.splice(2, currentIndex - 3);
      floors.splice(5, floors.length - 7);
      floors[1] = "...";
      floors[this.maxShowFloors - 2] = "...";
      return floors;
    },
  },
  methods: {
    handleFloorClick(floor) {
      if (floor === "...") return;
      this.currentFloor = floor;
    },
  },
};
</script>

<style lang="scss" scoped>
.floor-choose {
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  align-content: flex-start;
}

.floor-choose .floor-button {
  width: 32px;
  height: 32px;
  border-radius: 5px;
  background-color: #b384ff;
  text-align: center;
  margin: 2px 0px;
}

.floor-choose .floor-button-active {
  background-color: #9554ff;
}

.floor-choose .floor-button > div {
  width: 100%;
  height: 100%;
  text-align: center;
  display: inline-block;
  color: white;
  line-height: 32px;
  font-size: 16px;
  background-image: linear-gradient(#ffffff27, #ffffff3d);
  border-radius: 5px;
}

.floor-choose .floor-button:hover {
  background-color: #ab77ff;
  box-shadow: 0px 0px 8px #c29cff;
  cursor: pointer;
}
</style>