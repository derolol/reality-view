<template>
  <div
    class="palette"
    :style="paletteFullScreen"
  >
    <el-row class="palette-container">
      <!-- 

        绘图工具栏

       -->
      <el-col
        class="palette-tool"
        :span="6"
      >
        <shape-tool-tab
          ref="toolTab"
          :disabledList="disabledList"
          :allowShapeBool="allowShapeBool"
          @shapeItemClick="handleShapeItemClick"
          @shapeModeClick="handleShapeModeClick"
        />
      </el-col>
      <!-- 
    
        绘图展示

      -->
      <el-col
        class="palette-view"
        :span="18"
      >
        <div
          id="paletteCanvas"
          class="palette-canvas"
        >
          <basic-palette
            ref="palette"
            :canvasWidth="canvasWidth"
            :canvasHeight="canvasHeight"
            :shapeType="shapeType"
            :shapeMode="shapeMode"
            :drawMode="drawMode"
            @endPainting="finishPainting"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import fullScreenMixin from "../FullScreenMixin.vue";
import ShapeToolTab from "./ShapeToolTab.vue";
import BasicPalette from "./BasicPalette.vue";
import toolUtil from "@/utils/toolUtil";
import geometryUtil from "@/utils/geometryUtil";

export default {
  name: "palette",
  components: { ShapeToolTab, BasicPalette },
  mixins: [fullScreenMixin],
  data() {
    return {
      shapeType: null,
      shapeMode: "",
      drawMode: "building",

      disabledList: ["line", "multi-line", "regular-polygon"],
      buildingDisabledList: [
        "line",
        "multi-line",
        "multi-line",
        "regular-polygon",
      ],
      floorDisabledList: [
        "line",
        "multi-line",
        "multi-line",
        "regular-polygon",
      ],
      wallDisabledList: [
        "line",
        "multi-line",
        "rectangle",
        "regular-polygon",
        "polygon",
      ],

      allowShapeBool: true,

      touchShiftKeyStatusChange: null,
      touchAltKeyStatusChange: null,
    };
  },
  created() {},
  mounted() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    this.touchShiftKeyStatusChange = toolUtil.debounce(
      this.$refs.palette.setShiftKeyStatus,
      100
    );
    this.touchAltKeyStatusChange = toolUtil.debounce(
      this.$refs.palette.setAltKeyStatus,
      100
    );
  },
  activated() {
    // 重置布尔运算选择类型
    this.$refs.toolTab.currentShapeMode = "single";
    this.shapeMode = "single";

    // 根据绘制模式初始化画板
    let drawMode = this.$route.params.drawMode;
    if (drawMode !== null && typeof drawMode === "string") {
      this.drawMode = drawMode;
      // 当处于建筑绘制模式时
      if (drawMode === "building") {
        this.allowShapeBool = true;
        // 设置当前不能使用的功能
        this.disabledList.splice(
          0,
          this.disabledList.length,
          ...this.buildingDisabledList
        );
        return;
      }
      // 当处于楼层绘制模式时
      if (drawMode === "floor") {
        this.allowShapeBool = true;
        // 设置当前不能使用的功能
        this.disabledList.splice(
          0,
          this.disabledList.length,
          ...this.floorDisabledList
        );
        // 设置画板的初始值
        let { buildingGeometry, floorGeometry, mapId, floorId } =
          this.$route.params;
        this.$refs.palette.setBasicShapeCoordinates(
          buildingGeometry.coordinates,
          floorGeometry.coordinates,
          mapId,
          floorId
        );
        return;
      }
      // 当处于墙体绘制模式时
      if (drawMode === "wall") {
        this.allowShapeBool = false;
        // 设置当前不能使用的功能
        this.disabledList.splice(
          0,
          this.disabledList.length,
          ...this.wallDisabledList
        );
        // 设置画板的初始值
        let {
          wallThick,
          wallGeometry,
          wallInsideGeometry,
          areaCoordinatesList,
          mapId,
          floorId,
        } = this.$route.params;
        this.$refs.palette.setWallShapeCoordinates(
          wallThick,
          wallGeometry.coordinates,
          wallInsideGeometry.coordinates,
          areaCoordinatesList,
          mapId,
          floorId
        );
        // 设置画板的大小
        let box = geometryUtil.getCoordinatesBox(wallGeometry.coordinates);
        console.log(box);
        let width = Math.max(Math.abs(box.x), Math.abs(box.x + box.width)) * 2;
        let height =
          Math.max(Math.abs(box.y), Math.abs(box.y + box.height)) * 2;
        this.$refs.palette.canvasShowWidth = Math.floor(width / 100 + 1) * 100;
        this.$refs.palette.canvasShowHeight =
          Math.floor(height / 100 + 1) * 100;
      }
    }
  },
  computed: {
    canvasWidth() {
      return 0.75 * this.fullScreenWidth;
    },
    canvasHeight() {
      return this.fullScreenHeight;
    },
    /**
     * 画布全屏
     */
    paletteFullScreen() {
      return `width:${this.fullScreenWidth}px;height:${this.fullScreenHeight}px;`;
    },
  },
  methods: {
    /**
     * 处理创建形状的操作
     */
    handleShapeItemClick(shape) {
      if (this.shapeType !== null) {
        if (this.shapeType === shape) {
          this.shapeType = null;
          this.$message.info({ message: "取消绘制成功", duration: 1000 });
          this.$refs.palette.setBeginDraw(false);
        } else {
          this.$message.warning({ message: "请完成当前绘制", duration: 1000 });
        }
        return;
      }
      this.shapeType = shape;
      this.$refs.palette.setBeginDraw(true);
      let info = "";
      switch (shape) {
        case "rectangle":
          info = "左键拖动绘制矩形";
          break;
        case "polygon":
          info = "左键点击绘制任意多边形";
          break;
      }
      this.$notify.info({
        title: "提示",
        message: info,
      });
    },
    handleShapeModeClick(mode) {
      this.shapeMode = mode;
    },
    finishPainting() {
      this.shapeType = null;
      this.$message.success("完成绘制");
    },
    handleKeyUp(e) {
      // Ctrl + z
      if (e.ctrlKey && e.keyCode === 90) {
        this.$refs.palette.undo();
      }
      if (e.keyCode === 16) {
        this.touchShiftKeyStatusChange(false, false);
      }
      if (e.keyCode === 18) {
        this.touchAltKeyStatusChange(false, false);
      }
    },
    handleKeyDown(e) {
      if (e.keyCode === 16) {
        this.touchShiftKeyStatusChange(false, true);
      }
      if (e.keyCode === 18) {
        this.touchAltKeyStatusChange(false, true);
      }
    },
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  },
};
</script>

<style lang="scss" scoped>
.palette-container {
  width: 100%;
  height: 100%;
}

.palette-tool {
  height: 100%;
}

.palette-view {
  height: 100%;
  position: relative;
}

.palette-canvas {
  width: 100%;
  height: 100%;
}
</style>