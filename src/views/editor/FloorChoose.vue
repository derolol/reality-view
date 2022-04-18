<template>
  <div class="floor-choose">
    <div style="font-size: 20px; color: red"></div>
    <div
      v-for="(f, index) in showFloorList"
      :key="'level' + f"
      class="floor-button animate__animated"
      :class="{
        'floor-button-active': currentFloorLevel == f,
        animate__pulse: animationControl[index],
      }"
      @mouseenter="setAnimation(index, true)"
      @mouseleave="setAnimation(index, false)"
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

      floorLevelToId: {},
      floorIdToLevel: {},

      animationControl: [],
    };
  },
  created() {
    this.animationControl = [...new Array(this.maxShowFloors)].fill(false);
  },
  watch: {
    floors() {
      for (let i = 0, len = this.floors.length; i < len; i++) {
        let floor = this.floors[i].properties;
        let id = floor.floor_id;
        let level = floor.floor_level;
        this.floorLevelToId[level] = id;
        this.floorIdToLevel[id] = level;
      }
    },
  },
  computed: {
    currentFloorLevel() {
      return this.floorIdToLevel[this.currentFloor];
    },
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
      this.$emit("floorChange", this.floorLevelToId[floor]);
    },
    setAnimation(index, status) {
      this.animationControl.splice(index, 1, status);
    },
    updateFloorMap() {
      this.floorLevelToId = {};
      this.floorIdToLevel = {};
      for (let i = 0, len = this.floors.length; i < len; i++) {
        let floor = this.floors[i].properties;
        let id = floor.floor_id;
        let level = floor.floor_level;
        this.floorLevelToId[level] = id;
        this.floorIdToLevel[id] = level;
      }
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
  background-color: #9554ff;
  box-shadow: 0px 0px 8px #c29cff;
  cursor: pointer;
}
</style>