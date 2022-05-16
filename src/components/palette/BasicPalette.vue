<template>
  <div class="basic-palette">
    <v-stage
      ref="stage"
      :config="{ width: canvasWidth, height: canvasHeight }"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
      @mousemove="mouseMoveThrottleEvent"
      @mouseup="handleStageMouseUp"
      @touchend="handleStageMouseUp"
      @keyup.native="handleStageKeyUp"
    >
      <v-layer>
        <v-group>
          <!-- 
      
            Canvas 网格

          -->
          <v-line
            v-for="line in canvasGrid"
            :config="{
              points: line.points,
              stroke: line.color,
              strokeWidth: line.strokeWidth,
            }"
          />
        </v-group>
        <v-group>
          <!-- 

            Canvas 网格数值
            
          -->
          <v-text
            v-for="text in canvasNumber"
            :config="{
              text: text.text,
              x: text.x,
              y: text.y,
              fontSize: 14,
              fontFamily: 'Calibri',
              offsetX: -5,
              offsetY: -5,
            }"
          />
        </v-group>
      </v-layer>
      <v-layer>
        <v-shape
          ref="shape"
          :config="shapeConfig"
        />
        <!-- 

          变形器
        
        -->
        <!-- <v-transformer
          ref="transformer"
          :config="{
            centeredScaling: true,
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
          }"
          @transformend="handleTransform"
        /> -->
        <v-shape
          ref="tempShape"
          :config="tempShapeConfig"
        />

        <!-- 

          绘制自定义形状时的端点
                  
        -->
        <v-circle
          v-if="shapeType === 'polygon' && tempShapeCoordinates !== null"
          v-for="p in tempShapeCoordinates[0]"
          :key="`${p[0]},${p[1]}`"
          :config="{
            fill: '#ffffff',
            stroke: '#9477D9',
            strokeWidth: 1,
            radius: 4,
            x: getShowX(p[0]),
            y: getShowY(p[1]),
          }"
        />
        <!-- 
          
          绘制自定义形状时的连接虚线
        
        -->
        <v-shape
          v-if="shapeType === 'polygon' || wallDrawHelperVisible"
          :config="lineHelperConfig"
        />
        <v-wedge
          v-if="shapeType === 'polygon' || wallDrawHelperVisible"
          :config="degreeHelperConfig"
        />
        <v-text
          v-if="shapeType === 'polygon' || wallDrawHelperVisible"
          :config="degreeHelperTextConfig"
        />

        <!-- 

          共线提示辅助线

         -->
        <v-shape
          v-if="colinearHelperVisible"
          :config="colinearHelperConfig"
        />
        <v-shape
          v-if="colinearHelperVisible"
          :config="focusLineHelperConfig"
        />

        <!-- 

          绘制自定义形状时的鼠标所在端点
        
        -->
        <v-circle
          v-if="cursorPointVisible"
          :config="cursorPointConfig"
        />
        <!-- 

          闭合提示点

         -->
        <v-circle
          v-if="polygonClose"
          :config="polygonClosePointConfig"
        />
      </v-layer>
    </v-stage>

    <!-- 

      Input 绘制线段长度输入框

     -->
    <div
      class="distance-helper"
      :style="distanceHelperInputStyle"
    >
      <el-input
        ref="distanceHelperInput"
        v-model="distanceHelperValue"
        class="distance-helper-input"
        size="mini"
        v-if="shapeType === 'polygon' || wallDrawHelperVisible"
        @keyup.enter.native="handleDistanceEnter"
      />
    </div>

    <!-- 

      Button 完成编辑

     -->
    <div class="canvas-return">
      <el-button
        class="canvas-return-button"
        type="primary"
        @click="handleFinishClick"
      >返回</el-button>
    </div>
    <!-- 

      Input + Button 修改画布显示宽高

     -->
    <div class="canvas-tools">
      <el-form inline>
        <!-- 

          Input

         -->
        <el-form-item label="画布显示宽">
          <el-input
            class="size-input"
            v-model="canvasShowWidth"
          >
            <span
              class="input-text-suffix"
              slot="suffix"
            >m</span>
          </el-input>
        </el-form-item>
        <el-form-item label="画布显示高">
          <el-input
            class="size-input"
            v-model="canvasShowHeight"
          >
            <span
              class="input-text-suffix"
              slot="suffix"
            >m</span>
          </el-input>
        </el-form-item>
        <!-- 

          Button

         -->
        <el-form-item>
          <el-button
            type="info"
            size="mini"
            @click="
              (canvasShowWidth = +canvasShowWidth + 10),
                (canvasShowHeight = +canvasShowHeight + 10)
            "
            circle
          >
            <i class="el-icon-zoom-in"></i>
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="warning"
            size="mini"
            @click="
              (canvasShowWidth = +canvasShowWidth - 10),
                (canvasShowHeight = +canvasShowHeight - 10)
            "
            circle
          >
            <i class="el-icon-zoom-out"></i>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 

      Text 鼠标当前位置

     -->
    <div class="canvas-point">当前位置: {{ pointX }},{{ pointY }}</div>
  </div>
</template>

<script>
const GRID_WIDTH = 10;
const GRID_NUMBER = 10;
import toolUtil from "@/utils/toolUtil";
import mathUtil from "@/utils/mathUtil";
import clipperUtil from "@/utils/clipperUtil";
import geometryUtil from "@/utils/geometryUtil";
export default {
  name: "basicPalette",
  props: {
    canvasWidth: {
      type: Number,
      require: true,
    },
    canvasHeight: {
      type: Number,
      require: true,
    },
    drawMode: {
      type: String,
      require: true,
    },
    shapeMode: {
      type: String,
      require: true,
    },
    shapeType: {
      type: String,
      require: true,
    },
  },
  data() {
    return {
      canvasShowWidth: 100,
      canvasShowHeight: 100,

      currentMap: -1,
      currentFloor: -1,

      beginDraw: false,
      shiftKeyStatus: false,
      altKeyStatus: false,

      pointX: 0,
      pointY: 0,

      mouseDown: false,
      mouseClickStartX: 0,
      mouseClickStartY: 0,
      mouseClickEndX: 0,
      mouseClickEndY: 0,

      selectedShape: null,

      basicShapeCoordinates: null,
      beforeShapeCoordinates: null,
      shapeCoordinates: null,
      shapeConfig: {
        name: "shape",
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 1,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
      },
      tempShapeCoordinates: [],
      tempShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 1,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
      },
      cursorPointVisible: false, // 光标跟随点
      cursorPointConfig: {
        fill: "#ffffff",
        stroke: "#9477D9",
        strokeWidth: 1,
        radius: 4,
      },
      lineHelperCoordinates: [], // 形状闭合辅助线
      lineHelperConfig: {
        sceneFunc: () => {},
        stroke: "#D1BFFF",
        strokeWidth: 1,
        dash: [5, 2],
      },
      degreeHelperConfig: {
        stroke: "#D1BFFF",
        strokeWidth: 1,
      },
      degreeHelperTextConfig: {
        fontSize: 16,
        fontFamily: "Calibri",
        fill: "#9477D9",
      },
      polygonClosePointConfig: {
        // 形状端点辅助点
        fill: "#ffffff",
        stroke: "#F27B7B",
        strokeWidth: 1,
        radius: 4,
      },
      colinearHelperVisible: false, // 共线辅助线
      colinearHelperCoordinates: [],
      colinearHelperConfig: {
        sceneFunc: () => {},
        stroke: "#E6A23C",
        strokeWidth: 1,
        dash: [5, 2],
      },
      focusLineHelperCoordinates: [],
      focusLineHelperConfig: {
        sceneFunc: () => {},
        stroke: "#F27B7B",
        strokeWidth: 1,
      },
      wallDrawHelperVisible: false,

      stickDistance: 0.4,
      closeDistance: 8,
      wallStickDistance: 8,
      stickDegree: [
        [-5, 5, 0],
        [85, 95, 90],
        [-180, -175, 180],
        [175, 180, 180],
        [-95, -85, -90],
      ],
      lineLongWarnDistance: 30,

      degreeHelperValue: 0,
      distanceHelperValue: 0,

      wallThick: 0,
      wallVectors: [],
      wallCoordinates: null,
      wallInsideCoordinates: null,
      areaCoordinates: null,
      areaBeforeCoordinates: null,

      mouseMoveThrottleEvent: null,
    };
  },
  created() {
    this.mouseMoveThrottleEvent = toolUtil.throttle(
      this.handleStageMouseMove,
      50
    );
  },
  watch: {
    gridValue() {
      this.$emit("gridValueChange");
      if (Array.isArray(this.tempShapeCoordinates)) {
        this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
          sceneFunc: this.generateSceneFunc(this.tempShapeCoordinates),
        });
      }
      if (Array.isArray(this.shapeCoordinates)) {
        this.shapeConfig = Object.assign({}, this.shapeConfig, {
          sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
        });
      }
    },
  },
  computed: {
    /**
     * 创建画布网格
     * 依赖变量 canvasWidth
     * 依赖变量 canvasHeight
     */
    canvasGrid() {
      // 计算网格中心
      let centerX = this.canvasWidth / 2;
      let centerY = this.canvasHeight / 2;
      // 获取满足宽半长所需的单位网格数量 | 网格起始位置 | 网格结束位置
      const lineNumberX = Math.floor(centerX / GRID_WIDTH) + 1;
      const startX = centerX - lineNumberX * GRID_WIDTH;
      const endX = centerX + lineNumberX * GRID_WIDTH;
      // 获取满足高半长所需的单位网格数量 | 网格起始位置 | 网格结束位置
      const lineNumberY = Math.floor(centerY / GRID_WIDTH) + 1;
      const startY = centerY - lineNumberY * GRID_WIDTH;
      const endY = centerY + lineNumberY * GRID_WIDTH;
      // 设置网格基本属性
      let lineList = [];
      let color = "#E4E4E6";
      let strokeWidth = 1;
      // 绘制竖向网格线，除中心网格线
      for (let i = 0; i < lineNumberX * 2 + 1; i++) {
        let x = startX + i * GRID_WIDTH;
        // 跳过中心向绘制
        if (i === lineNumberX) continue;
        // 10小格为一个单位，网格线加粗
        if (Math.abs(i - lineNumberX) % 10 === 0) {
          strokeWidth = 2;
        }
        lineList.push({
          strokeWidth,
          color,
          points: [x, startY, x, endY],
        });
        strokeWidth = 1;
      }
      // 绘制横向网格线，除中心网格线
      for (let i = 0; i < lineNumberY * 2 + 1; i++) {
        let y = startY + i * GRID_WIDTH;
        // 跳过中心向绘制
        if (i === lineNumberY) continue;
        // 10小格为一个单位，网格线加粗
        if (Math.abs(i - lineNumberY) % 10 === 0) {
          strokeWidth = 2;
        }
        lineList.push({
          strokeWidth,
          color,
          points: [startX, y, endX, y],
        });
        strokeWidth = 1;
      }
      // 绘制竖向中心线
      let x = startX + lineNumberX * GRID_WIDTH;
      lineList.push({
        strokeWidth: 1,
        color: "#909399",
        points: [x, startY, x, endY],
      });
      // 绘制横向中心线
      let y = startY + lineNumberY * GRID_WIDTH;
      lineList.push({
        strokeWidth: 1,
        color: "#909399",
        points: [startX, y, endX, y],
      });
      return lineList;
    },
    /**
     * 每个网格大格对应实际值
     * 依赖变量 canvasWidth
     * 依赖变量 canvasHeight
     * 依赖变量 canvasShowWidth
     * 依赖变量 canvasShowHeight
     */
    gridValue() {
      // 获取大格的像素宽度
      const GRID_LARGE_WIDTH = GRID_WIDTH * GRID_NUMBER;
      // 获取竖向和横向可容纳的大格数量
      let numX = Math.floor(this.canvasWidth / GRID_LARGE_WIDTH / 2) * 2;
      let numY = Math.floor(this.canvasHeight / GRID_LARGE_WIDTH / 2) * 2;
      // 获取每大格需要表示的实际宽度的最小值
      let w1 = Math.floor(this.canvasShowWidth / numX) + 1;
      let w2 = Math.floor(this.canvasShowHeight / numY) + 1;
      // 计算得到最近的整十数值
      return Math.floor(Math.max(w1, w2) / 10) * 10 + 10;
    },
    /**
     * 画布坐标轴数值
     * 依赖变量 canvasWidth
     * 依赖变量 canvasHeight
     * 依赖变量 gridValue
     */
    canvasNumber() {
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      let textList = [];
      const GRID_LARGE_WIDTH = GRID_WIDTH * GRID_NUMBER;
      // 填充横向坐标轴
      let value = this.gridValue;
      let offsetWidth = GRID_LARGE_WIDTH;
      while (offsetWidth * 2 < this.canvasWidth) {
        textList.push({
          text: value.toString(),
          x: centerX + offsetWidth,
          y: centerY,
        });
        textList.push({
          text: (-value).toString(),
          x: centerX - offsetWidth,
          y: centerY,
        });
        offsetWidth += GRID_LARGE_WIDTH;
        value += this.gridValue;
      }
      // 填充竖向坐标轴
      value = this.gridValue;
      let offsetHeight = GRID_LARGE_WIDTH;
      while (offsetHeight * 2 < this.canvasHeight) {
        textList.push({
          text: value.toString(),
          x: centerX,
          y: centerY - offsetHeight,
        });
        textList.push({
          text: (-value).toString(),
          x: centerX,
          y: centerY + offsetHeight,
        });
        offsetHeight += GRID_LARGE_WIDTH;
        value += this.gridValue;
      }
      // 填充坐标原点
      textList.push({
        text: "O",
        x: centerX,
        y: centerY,
      });
      return textList;
    },
    /**
     * 获取一单位实际值代表的屏幕像素
     * 依赖变量 gridValue
     */
    canvasScale() {
      return (GRID_NUMBER * GRID_WIDTH) / this.gridValue;
    },
  },
  methods: {
    setBeginDraw(status) {
      this.beginDraw = status;
      this.cursorPointVisible = true;
      if (!status) this.finishDraw(false);
    },
    getShowX(x) {
      return x * this.canvasScale + this.canvasWidth / 2;
    },
    getShowY(y) {
      return this.canvasHeight / 2 - y * this.canvasScale;
    },
    getX(x) {
      return (x - this.canvasWidth / 2) / this.canvasScale;
    },
    getY(y) {
      return (this.canvasHeight / 2 - y) / this.canvasScale;
    },
    handleStageMouseDown(e) {
      // 根据绘画模式判断
      switch (this.drawMode) {
        case "building":
          this.handleBuildingMouseDown(e);
          break;
        case "floor":
          this.handleFloorMouseDown(e);
          break;
        case "wall":
          this.handleWallMouseDown(e);
          break;
        case "pipe":
          this.handlePipeMouseDown(e);
          break;
      }
    },
    handleBuildingMouseDown(e) {
      this.mouseDown = true;

      // 用户此时不处于绘制状态，处理形状点击事件
      if (!this.beginDraw) {
        return;
      }

      // 根据绘制形状类型响应鼠标点击操作
      switch (this.shapeType) {
        case "rectangle": {
          this.mouseClickStartX = this.pointX;
          this.mouseClickStartY = this.pointY;
          break;
        }
        case "polygon": {
          if (this.tempShapeCoordinates.length === 0) {
            this.tempShapeCoordinates.push([]);
          }
          // 端点数大于2满足需要判断是否闭合的条件
          if (this.tempShapeCoordinates[0].length > 2) {
            let p1 = [this.pointX, this.pointY];
            let p2 = [
              this.tempShapeCoordinates[0][0][0],
              this.tempShapeCoordinates[0][0][1],
            ];
            // 满足闭合条件
            if (
              mathUtil.distanceBetweenPoints(p1, p2) <=
              this.closeDistance / this.canvasScale
            ) {
              this.polygonClose = false;
              this.finishDraw();
              return;
            }
          }
          // 增加绘制点
          this.tempShapeCoordinates[0].push([this.pointX, this.pointY]);
          if (this.tempShapeCoordinates[0].length > 1) {
            this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
              sceneFunc: this.generateSceneFunc(this.tempShapeCoordinates),
            });
          }
        }
      }
    },
    handleFloorMouseDown(e) {
      this.handleBuildingMouseDown(e);
    },
    handleWallMouseDown(e) {
      let p = [this.pointX, this.pointY];
      // 判断点集是否开始初始化
      if (this.tempShapeCoordinates.length === 0) {
        this.tempShapeCoordinates.push([]);
      }
      // 判断是否闭合的条件
      if (this.tempShapeCoordinates[0].length > 0) {
        // 判断点所在向量数组是否存在向量
        if (
          this.focusLineHelperCoordinates.length > 0 &&
          this.focusLineHelperCoordinates[0].length > 0
        ) {
          console.log(this.focusLineHelperCoordinates);
          // 满足闭合条件，完成绘制
          this.tempShapeCoordinates[0].push(p);
          this.polygonClose = false;
          this.finishDraw();
          return;
        }
      }
      // 第一个点必须保证在墙上
      if (this.tempShapeCoordinates[0].length === 0) {
        console.log("judge first point", this.tempShapeCoordinates[0].length);
        console.log(
          "focusLineHelperCoordinates",
          this.focusLineHelperCoordinates
        );
        if (
          this.focusLineHelperCoordinates.length === 0 ||
          this.focusLineHelperCoordinates[0].length === 0
        ) {
          console.log(this.focusLineHelperCoordinates);
          this.$message.warning("必须从现有墙体开始绘制");
          return;
        }
      }
      // 增加绘制点
      this.tempShapeCoordinates[0].push(p);
      // 绘制形状
      if (this.tempShapeCoordinates[0].length > 1) {
        this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
          sceneFunc: this.generateSceneFunc(this.tempShapeCoordinates),
        });
      }
    },
    /**
     * 鼠标移动事件
     * - 绘制类型
     * - 绘制对象
     */
    handleStageMouseMove(e) {
      // 跟踪当前鼠标位置
      this.pointX = this.getX(e.evt.layerX);
      this.pointY = this.getY(e.evt.layerY);
      // 根据绘画模式判断
      switch (this.drawMode) {
        case "building":
          this.handleBuildingMouseMove(e);
          break;
        case "floor":
          this.handleFloorMouseMove(e);
          break;
        case "wall":
          this.handleWallMouseMove(e);
          break;
        case "pipe":
          this.handlePipeMouseMove(e);
          break;
      }
    },
    handleBuildingMouseMove() {
      // 当前未处于绘制状态
      if (!this.beginDraw) {
        // // 移动跟随光标端点
        // this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
        //   x: this.getShowX(this.pointX),
        //   y: this.getShowY(this.pointY),
        // });
        return;
      }

      // 根据绘制形状类型响应鼠标移动操作
      switch (this.shapeType) {
        case "rectangle": {
          this.judgePointStick();
          // 判断是否已确认了第一个点
          if (!this.mouseDown) return;
          this.tempShapeCoordinates.splice(
            0,
            this.tempShapeCoordinates.length,
            ...this.generateRectangle(
              this.pointX,
              this.pointY,
              this.mouseClickStartX,
              this.mouseClickStartY
            )
          );
          this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
            sceneFunc: this.generateSceneFunc(this.tempShapeCoordinates),
          });
          break;
        }
        case "regular-polygon": {
          break;
        }
        case "polygon": {
          if (this.tempShapeCoordinates.length < 1) {
            this.judgePointStick();
            return;
          }
          const len = this.tempShapeCoordinates[0].length;
          if (len < 1) return;
          let p1 = this.tempShapeCoordinates[0][len - 1];
          let p2 = this.tempShapeCoordinates[0][0];
          // 端点数大于2满足需要判断是否闭合的条件
          if (len > 2) {
            let p = [this.pointX, this.pointY];
            // 若满足闭合条件，则将当前鼠标点定位到首个端点
            if (
              mathUtil.distanceBetweenPoints(p, p2) <=
              this.closeDistance / this.canvasScale
            ) {
              this.pointX = p2[0];
              this.pointY = p2[1];
              // 移动跟随光标端点
              this.cursorPointConfig = Object.assign(
                {},
                this.cursorPointConfig,
                {
                  x: this.getShowX(this.pointX),
                  y: this.getShowY(this.pointY),
                }
              );
              // 显示闭合提示点
              this.polygonClose = true;
              this.polygonClosePointConfig = Object.assign(
                {},
                this.polygonClosePointConfig,
                {
                  x: this.getShowX(this.pointX),
                  y: this.getShowY(this.pointY),
                }
              );
              this.degreeHelperValue = mathUtil.getPointAngleDegree(p1, p2);
              this.distanceHelperValue = mathUtil.distanceBetweenPoints(p1, p2);
              this.handleHelperDraw();
              return;
            } else {
              this.polygonClose = false;
            }
          }
          this.generatePointTip();
          this.handleHelperDraw();
          break;
        }
      }
    },
    judgePointStick() {
      // 粘性判断
      let { x, y } = this.getStickPoint(this.pointX, this.pointY);
      this.pointX = x;
      this.pointY = y;

      // 移动跟随光标端点
      this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
        x: this.getShowX(this.pointX),
        y: this.getShowY(this.pointY),
      });
    },
    generatePointTip() {
      let len = this.tempShapeCoordinates[0].length;
      let p1 = this.tempShapeCoordinates[0][len - 1];
      let p2 = [this.pointX, this.pointY];
      // 显示与前一个点的关系提示
      let degree = mathUtil.getPointAngleDegree(p1, p2);
      if (this.shiftKeyStatus) {
        degree = Math.floor(degree);
      }
      let distance = mathUtil.distanceBetweenPoints(p1, p2);
      if (this.altKeyStatus) {
        distance = Math.floor(distance);
      }
      // 角度粘性判断
      for (let stickGroup of this.stickDegree) {
        let min = stickGroup[0];
        let max = stickGroup[1];
        let stick = stickGroup[2];
        // 符合角度粘性条件
        if (min <= degree && degree <= max) {
          degree = stick;
          break;
        }
      }
      // 根据角的度数调整当前鼠标点
      if (degree === 0) {
        this.pointX = p1[0] + distance;
        this.pointY = p1[1];
      } else if (degree === 90) {
        this.pointX = p1[0];
        this.pointY = p1[1] + distance;
      } else if (degree === 180) {
        this.pointX = p1[0] - distance;
        this.pointY = p1[1];
      } else if (degree === -90) {
        this.pointX = p1[0];
        this.pointY = p1[1] - distance;
      } else {
        this.pointX = p1[0] + Math.cos((degree * Math.PI) / 180) * distance;
        this.pointY = p1[1] + Math.sin((degree * Math.PI) / 180) * distance;
      }
      // 根据当前角度绘制复制形状
      this.degreeHelperValue = degree;
      this.distanceHelperValue = distance;
      // 移动跟随光标端点
      this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
        x: this.getShowX(this.pointX),
        y: this.getShowY(this.pointY),
      });
    },
    handleHelperDraw() {
      let len = this.tempShapeCoordinates[0].length;
      let p1 = this.tempShapeCoordinates[0][len - 1];
      let p2 = [this.pointX, this.pointY];
      let distance = +this.distanceHelperValue;
      let degree = this.degreeHelperValue;

      let rd = (degree / 180) * Math.PI;
      let dx = 0;
      let dy = 0;
      let points = [];
      let helperAngle = degree;
      let helperRotation = 0;
      let halfD = 0;
      // 角度 [0, 90]
      if (0 <= degree && degree <= 90) {
        dx = (-Math.sin(rd) * this.lineLongWarnDistance) / this.canvasScale;
        dy = (Math.cos(rd) * this.lineLongWarnDistance) / this.canvasScale;
        // points.push([p1[0] + distance, p1[1]]);
        helperAngle = degree;
        helperRotation = -degree;
        halfD = (degree / 360) * Math.PI;
      }
      // 角度 (90, 180]
      else if (90 < degree && degree <= 180) {
        dx = (Math.sin(rd) * this.lineLongWarnDistance) / this.canvasScale;
        dy = (-Math.cos(rd) * this.lineLongWarnDistance) / this.canvasScale;
        // points.push([p1[0] - distance, p1[1]]);
        helperAngle = 180 - degree;
        helperRotation = -180;
        halfD = ((180 - helperAngle / 2) / 180) * Math.PI;
      }
      // 角度 [-90, 0)
      else if (-90 <= degree && degree < 0) {
        dx = (Math.sin(rd) * this.lineLongWarnDistance) / this.canvasScale;
        dy = (-Math.cos(rd) * this.lineLongWarnDistance) / this.canvasScale;
        // points.push([p1[0] + distance, p1[1]]);
        helperAngle = -degree;
        helperRotation = 0;
        halfD = (degree / 360) * Math.PI;
      }
      // 角度 [-180, -90)
      else if (-180 < degree && degree < -90) {
        dx = (-Math.sin(rd) * this.lineLongWarnDistance) / this.canvasScale;
        dy = (Math.cos(rd) * this.lineLongWarnDistance) / this.canvasScale;
        // points.push([p1[0] - distance, p1[1]]);
        helperAngle = degree + 180;
        helperRotation = -degree;
        halfD = (((degree + 180) / 2 - 180) / 180) * Math.PI;
      }
      // 绘制长度辅助线
      points.push(
        [p1[0], p1[1]],
        [p1[0] + dx, p1[1] + dy],
        [p2[0] + dx, p2[1] + dy],
        [p2[0], p2[1]],
        [p1[0], p1[1]]
      );
      this.lineHelperCoordinates.splice(
        0,
        this.lineHelperCoordinates.length,
        points
      );
      this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
        sceneFunc: this.generateSceneFunc(this.lineHelperCoordinates),
      });
      // 绘制角度辅助线
      this.degreeHelperConfig = Object.assign({}, this.degreeHelperConfig, {
        x: this.getShowX(p1[0]),
        y: this.getShowY(p1[1]),
        radius: distance * this.canvasScale,
        angle: helperAngle,
        rotation: helperRotation,
      });
      let helperTextX = p1[0] + Math.cos(halfD) * distance * 0.8;
      let helperTextY = p1[1] + Math.sin(halfD) * distance * 0.8;
      this.degreeHelperTextConfig = Object.assign(
        {},
        this.degreeHelperTextConfig,
        {
          x: this.getShowX(helperTextX),
          y: this.getShowY(helperTextY),
          text: Math.floor(helperAngle * 100) / 100,
        }
      );
      // 设置当前长度值及其位置
      this.distanceHelperValue = distance;
      // 设置当前长度值输入框文本选中
      this.$nextTick(() => {
        this.$refs.distanceHelperInput.select();
      });
      let inputX = this.getShowX((p1[0] + p2[0]) / 2 + dx);
      let inputY = this.getShowY((p1[1] + p2[1]) / 2 + dy);
      // 设置当前输入框位置
      this.distanceHelperInputStyle = `left:${inputX - 40}px;top:${
        inputY - 15
      }px;`;
    },
    handleDistanceEnter() {
      let len = this.tempShapeCoordinates[0].length;
      let p1 = this.tempShapeCoordinates[0][len - 1];
      let degree = +this.degreeHelperValue;
      let distance = +this.distanceHelperValue;
      // 根据角的度数调整当前鼠标点
      if (degree === 0) {
        this.pointX = p1[0] + distance;
        this.pointY = p1[1];
      } else if (degree === 90) {
        this.pointX = p1[0];
        this.pointY = p1[1] + distance;
      } else if (degree === 180) {
        this.pointX = p1[0] - distance;
        this.pointY = p1[1];
      } else if (degree === -90) {
        this.pointX = p1[0];
        this.pointY = p1[1] - distance;
      } else {
        this.pointX = p1[0] + Math.cos((degree * Math.PI) / 180) * distance;
        this.pointY = p1[1] + Math.sin((degree * Math.PI) / 180) * distance;
      }
      // 移动跟随光标端点
      this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
        x: this.getShowX(this.pointX),
        y: this.getShowY(this.pointY),
      });
      switch (this.drawMode) {
        case "building":
          this.handleBuildingMouseDown();
          break;
        case "floor":
          this.handleFloorMouseDown();
          break;
        case "wall":
          this.handleWallMouseDown();
          break;
        case "pipe":
          this.handlePipeMouseDown();
          break;
      }
    },
    handleFloorMouseMove(e) {
      this.handleBuildingMouseMove(e);
    },
    /**
     * 处理处于墙体绘制状态时
     * 鼠标移动事件
     */
    handleWallMouseMove(e) {
      this.judgePointStick();

      let { nearVectors, nearPoint } = mathUtil.checkPointNearVectors(
        [this.pointX, this.pointY],
        this.wallVectors,
        this.wallStickDistance / this.canvasScale
      );
      // 清空辅助线
      this.colinearHelperCoordinates.splice(
        0,
        this.colinearHelperCoordinates.length
      );
      this.focusLineHelperCoordinates.splice(
        0,
        this.focusLineHelperCoordinates.length
      );
      // 若点在向量附近则将点移动到垂足
      if (nearVectors.length > 0) {
        this.pointX = nearPoint[0];
        this.pointY = nearPoint[1];
        let p = [this.pointX, this.pointY];

        // 遍历线段判断点是否在线段内
        for (let v of nearVectors) {
          // 不在线段内需要显示辅助线提示
          if (!mathUtil.checkPointOnSegment(p, v)) {
            // 判断点最近的线段一端
            let d1 = mathUtil.distanceBetweenPoints(p, v[0]);
            let d2 = mathUtil.distanceBetweenPoints(p, v[1]);
            let line = [];
            if (d1 < d2) line = [p, v[0]];
            else line = [p, v[1]];
            this.colinearHelperCoordinates.push(line);
          } else {
            this.focusLineHelperCoordinates.push(v);
          }
        }
        // 绘制共线辅助线
        this.colinearHelperConfig = Object.assign(
          {},
          this.colinearHelperConfig,
          {
            sceneFunc: this.generateSceneFunc(this.colinearHelperCoordinates),
          }
        );
        // 绘制所在线段辅助助线
        this.focusLineHelperConfig = Object.assign(
          {},
          this.focusLineHelperConfig,
          {
            sceneFunc: this.generateSceneFunc(this.focusLineHelperCoordinates),
          }
        );
        this.colinearHelperVisible = true;
      } else {
        this.colinearHelperVisible = false;
      }

      // 判断是否需要显示角度和长度提示
      if (
        this.tempShapeCoordinates.length > 0 &&
        this.tempShapeCoordinates[0].length > 0
      ) {
        this.generatePointTip();
        this.handleHelperDraw();
      }

      // 移动跟随光标端点
      this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
        x: this.getShowX(this.pointX),
        y: this.getShowY(this.pointY),
      });
    },
    handlePipeMouseMove(e) {},
    handleStageMouseUp(e) {
      // 根据绘画模式判断
      switch (this.drawMode) {
        case "building":
          this.handleBuildingMouseUp(e);
          break;
        case "floor":
          this.handleFloorMouseUp(e);
          break;
        case "wall":
          this.handleWallMouseUp(e);
          break;
        case "pipe":
          this.handlePipeMouseUp(e);
          break;
      }
    },
    handleBuildingMouseUp(e) {
      this.mouseDown = false;
      // 根据绘制形状类型响应鼠标移动操作
      switch (this.shapeType) {
        case "rectangle": {
          this.finishDraw();
        }
      }
    },
    handleFloorMouseUp(e) {
      this.handleBuildingMouseUp(e);
    },
    handleWallMouseUp(e) {},
    finishDraw(save = true) {
      // 根据绘画模式判断
      switch (this.drawMode) {
        case "building":
          this.handleBuildingFinishDraw(save);
          break;
        case "floor":
          this.handleFloorFinishDraw(save);
          break;
        case "wall":
          this.handleWallFinishDraw(save);
          break;
        case "pipe":
          this.handlePipeFinishDraw(save);
          break;
      }
    },
    handleBuildingFinishDraw(save) {
      if (save) {
        this.$emit("endPainting");
      }
      this.beginDraw = false;
      this.cursorPointVisible = false;

      switch (this.shapeType) {
        case "rectangle": {
          if (save) {
            this.convertTemp();
            this.replaceTemp();
          }
          break;
        }
        case "polygon": {
          if (save) {
            let p = [
              this.tempShapeCoordinates[0][0][0],
              this.tempShapeCoordinates[0][0][1],
            ];
            this.tempShapeCoordinates[0].push(p);
            this.convertTemp();
            this.replaceTemp();
          }
          this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
            sceneFunc: () => {},
          });
          this.tempShapeCoordinates = [];
          this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
            sceneFunc: () => {},
          });
          // 隐藏绘制提示
          this.clearTipShape();
          break;
        }
      }
    },
    handleFloorFinishDraw(save) {
      if (save) {
        this.$emit("endPainting");
      }
      this.beginDraw = false;
      this.cursorPointVisible = false;

      switch (this.shapeType) {
        case "rectangle": {
          if (save) {
            this.convertTemp();
            // 与楼层轮廓相交，避免超出轮廓
            this.tempShapeCoordinates = clipperUtil.coordinatesPolygonClipper(
              this.basicShapeCoordinates,
              this.tempShapeCoordinates,
              "intersection"
            );
            // this.tempShapeCoordinates = this.formatMartinezBool(
            //   this.tempShapeCoordinates
            // );
            this.replaceTemp();
          }
          break;
        }
        case "polygon": {
          if (save) {
            // 封闭绘制图形
            let p = [
              this.tempShapeCoordinates[0][0][0],
              this.tempShapeCoordinates[0][0][1],
            ];
            this.tempShapeCoordinates[0].push(p);
            this.convertTemp();
            // 与楼层轮廓相交，避免超出轮廓
            this.tempShapeCoordinates = clipperUtil.coordinatesPolygonClipper(
              this.basicShapeCoordinates,
              this.tempShapeCoordinates,
              "intersection"
            );
            // this.tempShapeCoordinates = this.formatMartinezBool(
            //   this.tempShapeCoordinates
            // );
            this.replaceTemp();
          }
          this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
            sceneFunc: () => {},
          });
          this.tempShapeCoordinates = [];
          this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
            sceneFunc: () => {},
          });
          // 隐藏绘制提示
          this.clearTipShape();
          break;
        }
      }
    },
    handleWallFinishDraw(save) {
      if (save) {
        // 保存当前主控制区
        this.beforeShapeCoordinates = toolUtil.arraySimpleDeepCopy(
          this.wallInsideCoordinates
        );
        // 清洗并添加新的内部墙体向量
        this.clearWallIndexLines();
        this.buildWallCoordiantes();
        // temp置空
        this.tempShapeCoordinates = [];
        this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
          sceneFunc: () => {},
        });
      }
      this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
        sceneFunc: () => {},
      });
      this.tempShapeCoordinates = [];
      this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
        sceneFunc: () => {},
      });
      this.focusLineHelperCoordinates = [];
      // 隐藏绘制提示
      this.clearTipShape();
    },
    /**
     * 1清洗新加入的线段变量
     * -1.1 超出范围的部分
     * -1.2 共线或覆盖
     * 2根据交点划分内部墙体
     */
    clearWallIndexLines() {
      // 剪裁超出范围的部分
      let clipperPath = clipperUtil.coordinatesPolygonSegmentIntersection(
        this.tempShapeCoordinates,
        this.wallCoordinates
      );
      // 处理覆盖线段
      let segments = geometryUtil.getCoordinatesVectors(clipperPath);
      let cleanCoordinates = geometryUtil.cleanOverlapSegments(segments);
      if (this.wallInsideCoordinates.length === 0) {
        this.wallInsideCoordinates.push(...cleanCoordinates);
        return;
      }
      // 处理相交线段
      let srcSegments = geometryUtil.getCoordinatesVectors(
        this.wallInsideCoordinates
      );
      let interSegments = geometryUtil.getCoordinatesVectors(cleanCoordinates);
      let targetSegments = [];
      let i = 0;
      let j = 0;
      let count = 0;
      console.log("# 开始遍历需要扫描的线段");
      while (srcSegments.length > 0) {
        console.log(
          `----当前指针位置及长度i:${i}/${srcSegments.length} j:${j}/${interSegments.length}`
        );
        count += 1;
        if (count > 100) break;
        let p = mathUtil.segmentIntersect(srcSegments[i], interSegments[j]);
        console.log(
          "----计算向量",
          JSON.stringify(srcSegments[i]),
          JSON.stringify(interSegments[j]),
          "交点",
          JSON.stringify(p)
        );
        // 记录交点位置
        let end1 = true;
        let end2 = true;
        // 若交点存在
        if (
          p &&
          !mathUtil.judgePointEqual(p, srcSegments[i][0]) &&
          !mathUtil.judgePointEqual(p, srcSegments[i][1])
        ) {
          end1 = false;
          console.log("交点不在向量1端点");
        }
        if (
          p &&
          !mathUtil.judgePointEqual(p, interSegments[j][0]) &&
          !mathUtil.judgePointEqual(p, interSegments[j][1])
        ) {
          end2 = false;
          console.log("交点不在向量2端点");
        }
        // 两条线段无交点
        if ((end1 && end2) || p.length === 0) {
          console.log("----交点不存在或交点未两线段交点");
          // 若仅有一条新增线段，则完成该线段的比对
          if (interSegments.length <= 1) {
            console.log(
              "--------添加源线段",
              JSON.stringify([toolUtil.arraySimpleDeepCopy(srcSegments[i])])
            );
            targetSegments.push([toolUtil.arraySimpleDeepCopy(srcSegments[i])]);
            srcSegments.splice(i, 1);
          }
          // 若仍存在多条新增线段，则继续比对
          else {
            i += 1;
          }
          // 新段与已有线段均不存在交点
          if (i === srcSegments.length) {
            console.log(
              "--------添加相交线段",
              JSON.stringify([toolUtil.arraySimpleDeepCopy(interSegments[0])])
            );
            targetSegments.push([
              toolUtil.arraySimpleDeepCopy(interSegments[0]),
            ]);
            interSegments.splice(0, 1);
            i = 0;
            j = 0;
          }
          continue;
        }
        // 若线段存在交点，则根据交点分割线段
        console.log("----存在交点");
        if (!end1) {
          srcSegments.push([srcSegments[i][0], p], [srcSegments[i][1], p]);
          console.log(
            "分割源线段为:",
            JSON.stringify([srcSegments[i][0], p]),
            JSON.stringify([srcSegments[i][1], p])
          );
          srcSegments.splice(i, 1);
          console.log("长度", srcSegments.length);
        }
        if (!end2) {
          interSegments.push(
            [interSegments[j][0], p],
            [interSegments[j][1], p]
          );
          console.log(
            "分割相交线段为:",
            JSON.stringify([interSegments[j][0], p]),
            JSON.stringify([interSegments[j][1], p])
          );
          interSegments.splice(j, 1);
          console.log("长度", srcSegments.length);
        }
      }
      console.log("# 结束扫描", JSON.stringify(targetSegments));
      this.wallInsideCoordinates = targetSegments;
    },
    /**
     * 隐藏绘制提示工具
     */
    clearTipShape() {
      this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
        sceneFunc: () => {},
      });
      this.degreeHelperConfig = Object.assign({}, this.degreeHelperConfig, {
        radius: 0,
      });
      this.degreeHelperTextConfig = Object.assign(
        {},
        this.degreeHelperTextConfig,
        { text: "" }
      );
      this.distanceHelperInputStyle = "left:0px;top:-40px;";
    },
    /**
     * 完成 temp 与现有多边形的布尔运算变换
     */
    convertTemp() {
      if (this.shapeMode === "single" || this.shapeCoordinates === null) {
        return;
      }
      this.tempShapeCoordinates = clipperUtil.coordinatesPolygonClipper(
        this.shapeCoordinates,
        this.tempShapeCoordinates,
        this.shapeMode
      );
    },
    /**
     * 更新当前主区内容
     */
    replaceTemp() {
      // 保存当前主控制区
      this.beforeShapeCoordinates = toolUtil.arraySimpleDeepCopy(
        this.shapeCoordinates
      );
      // 替换temp为主控制区
      this.shapeCoordinates = toolUtil.arraySimpleDeepCopy(
        this.tempShapeCoordinates
      );
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
      });
      // temp置空
      this.tempShapeCoordinates = [];
      this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
        sceneFunc: () => {},
      });
    },
    /**
     * 撤回当前操作
     */
    undo() {
      if (this.beginDraw) return;
      if (this.beforeShapeCoordinates === null) return;
      // 墙体需要撤回当前内部墙体的构造
      if (this.drawMode === "wall") {
        this.wallInsideCoordinates = toolUtil.arraySimpleDeepCopy(
          this.beforeShapeCoordinates
        );
        this.buildWallCoordiantes();
        this.beforeShapeCoordinates = null;
        return;
      }
      // 其他可直接撤回图形
      this.shapeCoordinates = toolUtil.arraySimpleDeepCopy(
        this.beforeShapeCoordinates
      );
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
      });
      this.beforeShapeCoordinates = null;
    },

    /**
     * 设置基础轮廓
     */
    setBasicShapeCoordinates(
      buildingCoordinates,
      floorCoordinates,
      mapId,
      floorId
    ) {
      this.currentMap = mapId;
      this.currentFloor = floorId;
      this.basicShapeCoordinates =
        toolUtil.arraySimpleDeepCopy(buildingCoordinates);
      this.beforeShapeCoordinates =
        toolUtil.arraySimpleDeepCopy(floorCoordinates);
      this.shapeCoordinates = toolUtil.arraySimpleDeepCopy(floorCoordinates);
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
      });
    },
    /**
     * 设置墙体形状初始值
     */
    setWallShapeCoordinates(
      wallThick,
      wallCoordinates,
      wallInsideCoordinates,
      areaCoordinatesList,
      mapId,
      floorId
    ) {
      this.wallDrawHelperVisible = true;
      this.cursorPointVisible = true;
      this.wallThick = wallThick;
      this.currentMap = mapId;
      this.currentFloor = floorId;
      // 复制点集
      if (typeof wallInsideCoordinates !== "object") {
        wallInsideCoordinates = [];
      }
      this.wallCoordinates = toolUtil.arraySimpleDeepCopy(wallCoordinates);
      this.wallInsideCoordinates = toolUtil.arraySimpleDeepCopy(
        wallInsideCoordinates
      );
      // 构造墙体多边形
      this.buildWallCoordiantes();
      // 初始区现有功能区
      this.areaBeforeCoordinates =
        toolUtil.arraySimpleDeepCopy(areaCoordinatesList);
      // 初始化墙体多边形
      this.beforeShapeCoordinates = toolUtil.arraySimpleDeepCopy(
        wallInsideCoordinates
      );
    },
    buildWallCoordiantes() {
      let { areaMainCoordinates, areaCoordinates, shapeCoordinates } =
        geometryUtil.generateWallCoordinates(
          this.wallCoordinates,
          this.wallInsideCoordinates,
          this.wallThick
        );
      // 清空墙体向量
      this.wallVectors.splice(0, this.wallVectors.length);
      // 判断是否存在内墙添加墙体向量
      if (
        this.wallInsideCoordinates.length > 0 &&
        this.wallInsideCoordinates[0].length > 0
      ) {
        this.wallVectors.push(
          ...geometryUtil.getCoordinatesVectors(this.wallInsideCoordinates)
        );
      }
      // 获取墙体中线构造向量
      let wallMiddle = clipperUtil.coordinatesPolygonOffset(
        this.wallCoordinates,
        -this.wallThick / 2
      );
      // 添加墙体向量
      this.wallVectors.push(...geometryUtil.getCoordinatesVectors(wallMiddle));
      // 渲染墙体
      this.shapeCoordinates = shapeCoordinates;
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
      });
      this.areaCoordinates = areaCoordinates;
    },
    /**
     * 设置当前Shift键的状态
     */
    setShiftKeyStatus(status) {
      this.shiftKeyStatus = status;
      this.$nextTick(() => {
        this.$refs.distanceHelperInput.select();
      });
    },
    /**
     * 设置当前Alt键的状态
     */
    setAltKeyStatus(status) {
      this.altKeyStatus = status;
      this.$nextTick(() => {
        this.$refs.distanceHelperInput.select();
      });
    },
    /**
     * 根据对角点生成相应矩形
     */
    generateRectangle(x1, y1, x2, y2) {
      let x = Math.min(x1, x2);
      let y = Math.min(y1, y2);
      let width = Math.abs(x1 - x2);
      let height = Math.abs(y1 - y2);
      let points = [
        [
          [x + width, y + height],
          [x, y + height],
          [x, y],
          [x + width, y],
          [x + width, y + height],
        ],
      ];
      return points;
    },
    /**
     * 获取粘性整数点
     */
    getStickPoint(cursorX, cursorY) {
      let xl = Math.floor(cursorX);
      let xr = xl + 1;
      let yl = Math.floor(cursorY);
      let yr = yl + 1;
      let distance = this.stickDistance;
      if (Math.abs(cursorX - xl) < distance) cursorX = xl;
      if (Math.abs(cursorX - xr) < distance) cursorX = xr;
      if (Math.abs(cursorY - yl) < distance) cursorY = yl;
      if (Math.abs(cursorY - yr) < distance) cursorY = yr;
      return { x: cursorX, y: cursorY };
    },
    /**
     * 偏移形状到可视坐标轴的右下角
     * 用于适应transformer
     */
    coordinatesTranslation(coordinates, offsetX, offsetY) {
      for (let i = 0, len = coordinates.length; i < len; i++) {
        let p = coordinates[i];
        if (!Array.isArray(p[0])) {
          p[0] += offsetX;
          p[1] += offsetY;
        } else {
          this.coordinatesTranslation(p, offsetX, offsetY);
        }
      }
    },
    /**
     * 完成编辑返回按钮
     */
    handleFinishClick() {
      this.$confirm(
        `确认离开编辑页面?(${
          this.currentShapeType === null ? "未编辑" : "已编辑"
        })`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        }
      )
        .then(() => {
          this.$message({
            type: "success",
            message: "返回页面成功",
          });
          switch (this.drawMode) {
            case "building": {
              this.handleBuildingFinishBack();
              break;
            }
            case "floor": {
              this.handleFloorFinishBack();
              break;
            }
            case "wall": {
              this.handleWallFinishBack();
              break;
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleBuildingFinishBack() {
      this.$router.push({
        name: "maps",
        params: {
          geometry: geometryUtil.generateGeoJSONGeometry(this.shapeCoordinates),
        },
      });
    },
    handleFloorFinishBack() {
      this.$router.push({
        name: "mapEditor",
        params: {
          drawMode: "floor",
          id: this.currentMap,
          floorId: this.currentFloor,
          geometry: geometryUtil.generateGeoJSONGeometry(this.shapeCoordinates),
        },
      });
    },
    handleWallFinishBack() {
      // 对新的功能区进行排序
      geometryUtil.areaCoordinatesListSort(this.areaCoordinates);
      let { deleteAreaIdList, newAreaList } =
        geometryUtil.areaCoordinatesListCompare(
          this.areaBeforeCoordinates,
          this.areaCoordinates
        );
      let wallGeometry = geometryUtil.generateGeoJSONGeometry(
        this.wallCoordinates
      );
      let wallInsideGeometry = geometryUtil.generateGeoJSONGeometry(
        this.wallInsideCoordinates
      );
      let areaGeometries = {
        deleteAreaIdList,
        newAreaList: newAreaList.map((area) =>
          geometryUtil.generateGeoJSONGeometry(area)
        ),
      };
      this.$router.push({
        name: "mapEditor",
        params: {
          id: this.currentMap,
          floorId: this.currentFloor,
          drawMode: "wall",
          wallGeometry,
          wallInsideGeometry,
          areaGeometries,
        },
      });
    },
    generateSceneFunc(coordinates) {
      return geometryUtil.generateSceneFunc(
        coordinates,
        this.canvasScale,
        this.canvasWidth,
        this.canvasHeight
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.basic-palette {
  position: relative;
}

.canvas-return {
  position: absolute;
  top: 20px;
  left: 20px;
}

.canvas-return .canvas-return-button {
  position: absolute;
}

.canvas-tools {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: #ffffff55;
  border-radius: 10px;
}

.canvas-tools .el-form-item {
  margin-bottom: 0px;
}

.canvas-tools .el-form-item .size-input {
  width: 90px;
}

.canvas-tools .el-form-item .size-unit {
  margin-left: 6px;
  font-size: 18px;
  font-weight: 0;
}

.canvas-point {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: $--color-purple-main;
}

.distance-helper {
  position: absolute;
  top: -40px;
}

.distance-helper-input {
  width: 80px;
  height: 30px;
}
</style>