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
        <v-shape ref="shape" :config="shapeConfig" />
        <!-- 

          变形器
        
        -->
        <v-transformer
          ref="transformer"
          :config="{
            centeredScaling: true,
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
          }"
          @transformend="handleTransform"
        />
        <v-shape ref="tempShape" :config="tempShapeConfig" />
        <!-- 

          绘制自定义形状时的鼠标所在端点
        
        -->
        <v-circle v-if="cursorPointVisible" :config="cursorPointConfig" />
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
        <v-circle v-if="polygonClose" :config="polygonClosePointConfig" />
        <!-- 
          
          绘制自定义形状时的连接虚线
        
        -->
        <v-shape v-if="shapeType === 'polygon'" :config="lineHelperConfig" />
        <v-wedge v-if="shapeType === 'polygon'" :config="degreeHelperConfig" />
        <v-text
          v-if="shapeType === 'polygon'"
          :config="degreeHelperTextConfig"
        />
        <v-line v-if="colinearHelperVisible" :config="colinearHelperConfig" />
      </v-layer>
    </v-stage>

    <!-- 

      Input 绘制线段长度输入框

     -->
    <div class="distance-helper" :style="distanceHelperInputStyle">
      <el-input
        ref="distanceHelperInput"
        v-model="distanceHelperValue"
        class="distance-helper-input"
        size="mini"
        v-if="shapeType === 'polygon'"
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
        >返回</el-button
      >
    </div>
    <!-- 

      Input + Button 修改画布显示宽高

     -->
    <div class="canvas-tools">
      <el-form inline>
        <!-- 

          Input

         -->
        <el-form-item label="画布显示宽"
          ><el-input class="size-input" v-model="canvasShowWidth">
            <span class="input-text-suffix" slot="suffix">m</span>
          </el-input>
        </el-form-item>
        <el-form-item label="画布显示高">
          <el-input class="size-input" v-model="canvasShowHeight">
            <span class="input-text-suffix" slot="suffix">m</span>
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
import utils from "@/store/utils";
import * as martinez from "martinez-polygon-clipping";
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
        strokeWidth: 2,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
      },
      tempShapeCoordinates: [],
      tempShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 2,
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
        strokeWidth: 2,
        dash: [5, 2],
      },
      degreeHelperConfig: {
        stroke: "#D1BFFF",
        strokeWidth: 2,
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
      colinearHelperConfig: {
        points: [],
        stroke: "#E6A23C",
        strokeWidth: 1,
        dash: [5, 2],
      },

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

      wallVectors: [],

      mouseMoveThrottleEvent: null,
    };
  },
  created() {
    this.mouseMoveThrottleEvent = utils.throttle(this.handleStageMouseMove, 50);
  },
  watch: {
    gridValue() {
      this.$emit("gridValueChange");
      if (Array.isArray(this.tempShapeCoordinates)) {
        this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
          sceneFunc: utils.generateSceneFunc(
            this.tempShapeCoordinates,
            this.canvasScale,
            this.canvasWidth,
            this.canvasHeight
          ),
        });
      }
      if (Array.isArray(this.shapeCoordinates)) {
        this.shapeConfig = Object.assign({}, this.shapeConfig, {
          sceneFunc: utils.generateSceneFunc(
            this.shapeCoordinates,
            this.canvasScale,
            this.canvasWidth,
            this.canvasHeight
          ),
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
      // // 处理用户选中形状事件
      // if (!this.startPaintPolygon) {
      //   // 用户选中state，取消当前的选中
      //   if (e.target === e.target.getStage()) {
      //     this.selectedShape = null;
      //     // 更新当前的transformer状态
      //     this.updateTransformer();
      //     return;
      //   }

      //   // 判断是否点击了Shape
      //   const clickedOnShape = e.target.name() === "shape";
      //   if (!clickedOnShape) {
      //     return;
      //   }

      //   // 获取选中的shape节点
      //   this.selectedShape = this.$refs.shape.getNode();
      //   // 更新当前的transformer状态
      //   this.updateTransformer();
      //   return;
      // }

      // let scale = this.$refs.palette.getCanvasScale();
      // let point = this.$refs.palette.getMousePosition();
      // let x = point.x;
      // let y = point.y;

      // // 判断是否需要封闭图形
      // if (
      //   utils.distanceBetweenPoints(
      //     [this.shapePoints[0], this.shapePoints[1]],
      //     [x, y]
      //   ) < 0.5
      // ) {
      //   this.startPaintPolygon = false;
      //   this.$message.info("多边形绘制完成");
      //   // 完成绘制封闭图形
      //   let { width, height, offsetX, offsetY } = this.resizePaintShape();
      //   this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
      //     sceneFunc: (context, shape) => {
      //       context.beginPath();
      //       for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
      //         let x = this.shapePoints[i] * scale;
      //         let y = -this.shapePoints[i + 1] * scale;
      //         if (i === 0) context.moveTo(x, y);
      //         context.lineTo(x, y);
      //       }
      //       context.closePath();
      //       context.fillStrokeShape(shape);
      //     },
      //     width,
      //     height,
      //     offsetX,
      //     offsetY,
      //   });
      //   // 重置辅助线属性
      //   this.currentLineHelperConfig = Object.assign(
      //     {},
      //     {
      //       points: [],
      //       stroke: "#D1BFFF",
      //       strokeWidth: 2,
      //       dash: [5, 2],
      //     }
      //   );
      //   // 清空绘制点
      //   this.divideShapePoint.splice(0, this.divideShapePoint.length);
      //   return;
      // }

      // // 新增绘制点
      // this.shapePoints.push(x, y);
      // let { width, height, offsetX, offsetY } = this.getShapeRange();
      // this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
      //   width,
      //   height,
      //   offsetX,
      //   offsetY,
      // });

      // // 生成当前临时图形的临时端点
      // this.divideShapePoint = [...new Array(this.shapePoints.length / 2)].map(
      //   (v, i) => [this.shapePoints[i * 2], this.shapePoints[i * 2 + 1]]
      // );
    },
    handleBuildingMouseDown(e) {
      this.mouseDown = true;

      // 用户此时不处于绘制状态，处理形状点击事件
      if (!this.beginDraw) {
        // // 用户选中state，取消当前的选中
        // if (e.target === e.target.getStage()) {
        //   this.selectedShape = null;
        //   // 更新当前的transformer状态
        //   this.updateTransformer();
        //   return;
        // }
        // const clickedOnShape = e.target.name() === "shape";
        // if (!clickedOnShape) return;
        // this.selectedShape = this.$refs.shape.getNode();
        // this.updateTransformer();
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
              utils.distanceBetweenPoints(p1, p2) <=
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
              sceneFunc: utils.generateSceneFunc(
                this.tempShapeCoordinates,
                this.canvasScale,
                this.canvasWidth,
                this.canvasHeight
              ),
            });
          }
        }
      }
    },
    handleFloorMouseDown(e) {
      this.handleBuildingMouseDown(e);
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
        // 移动跟随光标端点
        this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
          x: this.getShowX(this.pointX),
          y: this.getShowY(this.pointY),
        });
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
            sceneFunc: utils.generateSceneFunc(
              this.tempShapeCoordinates,
              this.canvasScale,
              this.canvasWidth,
              this.canvasHeight
            ),
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
              utils.distanceBetweenPoints(p, p2) <=
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
              this.degreeHelperValue = utils.getPointAngleDegree(p1, p2);
              this.distanceHelperValue = utils.distanceBetweenPoints(p1, p2);
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
      let degree = utils.getPointAngleDegree(p1, p2);
      degree = Math.floor(degree);
      let distance = utils.distanceBetweenPoints(p1, p2);
      distance = Math.floor(distance);
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
        sceneFunc: utils.generateSceneFunc(
          this.lineHelperCoordinates,
          this.canvasScale,
          this.canvasWidth,
          this.canvasHeight
        ),
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
      this.handleBuildingMouseDown();
    },
    handleFloorMouseMove(e) {
      this.handleBuildingMouseMove(e);
    },
    handleWallMouseMove(e) {
      let { vector, point } = utils.checkPointNearVectors(
        [this.pointX, this.pointY],
        this.wallVectors,
        this.wallStickDistance / this.canvasScale
      );
      // 若点在向量附近则将点移动到垂足
      if (vector !== null) {
        this.pointX = point[0];
        this.pointY = point[1];
        // 判断点是否在线段内
        let p = [this.pointX, this.pointY];
        // 不在线段内需要显示辅助线提示
        if (!utils.checkPointOnSegment(p, vector)) {
          // 判断点最近的线段一端
          let d1 = utils.distanceBetweenPoints(p, vector[0]);
          let d2 = utils.distanceBetweenPoints(p, vector[1]);
          let line = [];
          if (d1 < d2) line = [p, vector[0]];
          else line = [p, vector[1]];
          line = line.map((v) => [this.getShowX(v[0]), this.getShowY(v[1])]);
          this.colinearHelperConfig = Object.assign(
            {},
            this.colinearHelperConfig,
            {
              points: line.flat(Infinity),
            }
          );
          this.colinearHelperVisible = true;
          // 移动跟随光标端点
          this.cursorPointConfig = Object.assign({}, this.cursorPointConfig, {
            x: this.getShowX(this.pointX),
            y: this.getShowY(this.pointY),
          });
          return;
        }
      }
      this.colinearHelperVisible = false;

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
          break;
        }
      }
    },
    handleFloorFinishDraw(save) {
      if (save) {
        this.$emit("endPainting");
      }
      this.beginDraw = false;

      switch (this.shapeType) {
        case "rectangle": {
          if (save) {
            this.convertTemp();
            // 与楼层轮廓相交，避免超出轮廓
            this.tempShapeCoordinates = martinez.intersection(
              this.basicShapeCoordinates,
              this.tempShapeCoordinates
            );
            this.tempShapeCoordinates = this.formatMartinezBool(
              this.tempShapeCoordinates
            );
            console.log(this.tempShapeCoordinates);
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
            this.tempShapeCoordinates = martinez.intersection(
              this.basicShapeCoordinates,
              this.tempShapeCoordinates
            );
            this.tempShapeCoordinates = this.formatMartinezBool(
              this.tempShapeCoordinates
            );
            this.replaceTemp();
          }
          this.lineHelperConfig = Object.assign({}, this.lineHelperConfig, {
            sceneFunc: () => {},
          });
          this.tempShapeCoordinates = [];
          this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
            sceneFunc: () => {},
          });
          break;
        }
      }
    },
    /**
     * 完成布尔运算变换
     */
    convertTemp() {
      if (this.shapeMode === "single" || this.shapeCoordinates === null) {
        return;
      }
      if (this.shapeMode === "union") {
        this.tempShapeCoordinates = martinez.union(
          this.shapeCoordinates,
          this.tempShapeCoordinates
        );
      } else if (this.shapeMode === "intersection") {
        this.tempShapeCoordinates = martinez.intersection(
          this.shapeCoordinates,
          this.tempShapeCoordinates
        );
      } else if (this.shapeMode === "diff") {
        this.tempShapeCoordinates = martinez.diff(
          this.shapeCoordinates,
          this.tempShapeCoordinates
        );
      } else if (this.shapeMode === "xor") {
        this.tempShapeCoordinates = martinez.xor(
          this.shapeCoordinates,
          this.tempShapeCoordinates
        );
      }
      this.tempShapeCoordinates = this.formatMartinezBool(
        this.tempShapeCoordinates
      );
    },
    /**
     * 更新当前主区内容
     */
    replaceTemp() {
      // 保存当前主控制区
      this.beforeShapeCoordinates = utils.arraySimpleDeepCopy(
        this.shapeCoordinates
      );
      // 替换temp为主控制区
      this.shapeCoordinates = utils.arraySimpleDeepCopy(
        this.tempShapeCoordinates
      );
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          this.shapeCoordinates,
          this.canvasScale,
          this.canvasWidth,
          this.canvasHeight
        ),
      });
      // temp置空
      this.tempShapeCoordinates = [];
      this.tempShapeConfig = Object.assign({}, this.tempShapeConfig, {
        sceneFunc: () => {},
      });
    },
    undo() {
      if (this.beginDraw) return;
      if (this.beforeShapeCoordinates === null) return;
      this.shapeCoordinates = utils.arraySimpleDeepCopy(
        this.beforeShapeCoordinates
      );
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          this.shapeCoordinates,
          this.canvasScale,
          this.canvasWidth,
          this.canvasHeight
        ),
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
        utils.arraySimpleDeepCopy(buildingCoordinates);
      this.beforeShapeCoordinates = utils.arraySimpleDeepCopy(floorCoordinates);
      this.shapeCoordinates = utils.arraySimpleDeepCopy(floorCoordinates);
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          this.shapeCoordinates,
          this.canvasScale,
          this.canvasWidth,
          this.canvasHeight
        ),
      });
    },
    /**
     * 设置墙体形状初始值
     */
    setWallShapeCoordinates(
      wallThick,
      wallGeometry,
      wallInsideGeometry,
      mapId,
      floorId
    ) {
      this.cursorPointVisible = true;
      this.currentMap = mapId;
      this.currentFloor = floorId;
      // 获取实际墙体的形状
      let wallCoordinates = utils.generateWallGeometryObject(
        wallGeometry,
        wallThick
      ).coordinates;
      // 计算墙体向量集
      this.wallVectors.splice(
        0,
        this.wallVectors.length,
        ...utils.getCoordinatesVectors(wallGeometry.coordinates)
      );
      // 渲染当前墙体形状
      this.beforeShapeCoordinates = utils.arraySimpleDeepCopy(wallCoordinates);
      this.shapeCoordinates = utils.arraySimpleDeepCopy(wallCoordinates);
      this.shapeConfig = Object.assign({}, this.shapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          this.shapeCoordinates,
          this.canvasScale,
          this.canvasWidth,
          this.canvasHeight
        ),
      });
    },
    /**
     * 更新变形状态
     */
    updateTransformer() {
      // const transformerNode = this.$refs.transformer.getNode();
      // // 若存在被选中的对象则添加变形控件，否则移除
      // if (this.selectedShape) {
      //   transformerNode.nodes([this.selectedShape]);
      // } else {
      //   transformerNode.nodes([]);
      // }
    },
    handleTransform(e) {
      // let transform = e.target.getTransform().copy();
      // let { rotation, scaleX, scaleY } = transform.decompose();
      // console.log(scaleX, scaleY);
      // let shape = this.$refs.shape.getNode();
      // shape.rotation(rotation);
      // shape.scaleX(scaleX);
      // shape.scaleY(scaleY);
      // this.coordinatesScale(this.shapeCoordinates, scaleX, scaleY);
      // this.shapeConfig = Object.assign({}, this.shapeConfig, {
      //   sceneFunc: this.generateSceneFunc(this.shapeCoordinates),
      // });
    },
    /**
     * 由于算法的产生问题
     * 1. 布尔运算后得到线条集，目前仅对该线条集做去除处理
     * 2. 保证点集的收尾相连
     * 【待处理】3. 共线点去除
     */
    formatMartinezBool(coordinates) {
      if (utils.countArrayLevel(coordinates) < 4 || coordinates.length === 1)
        return coordinates;
      let shapes = [];
      for (let i = 0, len = coordinates.length; i < len; i++) {
        let shape = coordinates[i];
        if (shape[0].length > 3) {
          shapes.push(shape);
          // 保证点集的收尾相连
          for (let j = 0, len2 = shape.length; j < len2; j++) {
            let points = shape[j];
            let pointsLength = points.length;
            if (
              points[0][0] !== points[pointsLength - 1][0] ||
              points[0][1] !== points[pointsLength - 1][1]
            ) {
              points.push([points[0][0], points[0][1]]);
            }
          }
        }
      }
      return shapes;
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
     * 根据数组层数判断当前的点类型
     */
    judgeCoordinatesType(list) {
      let level = utils.countArrayLevel(list);
      return level === 3 ? "Polygon" : "MultiPolygon";
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
     * 保证点集为逆时针
     */
    coordinatesWiseConvert(coordinates) {
      for (let i = 0, len = coordinates.length; i < len; i++) {
        let points = coordinates[i];
        if (utils.countArrayLevel(points) > 2) {
          this.coordinatesWiseConvert(points);
        } else {
          // 保证点集为逆时针
          if (utils.judgeClockwise(points)) points.reverse();
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
          this.coordinatesWiseConvert(this.shapeCoordinates);
          switch (this.drawMode) {
            case "building": {
              this.handleBuildingFinishBack();
              break;
            }
            case "floor": {
              this.handleFloorFinishBack();
              break;
            }
          }
        })
        .catch((err) => {});
    },
    handleBuildingFinishBack() {
      this.$router.push({
        name: "maps",
        params: {
          geometry: {
            type:
              utils.countArrayLevel(this.shapeCoordinates) === 3
                ? "Polygon"
                : "MultiPolygon",
            coordinates: utils.arraySimpleDeepCopy(this.shapeCoordinates),
          },
        },
      });
    },
    handleFloorFinishBack() {
      this.$router.push({
        name: "mapEditor",
        params: {
          id: this.currentMap,
          floorId: this.currentFloor,
          geometry: {
            type:
              utils.countArrayLevel(this.shapeCoordinates) === 3
                ? "Polygon"
                : "MultiPolygon",
            coordinates: utils.arraySimpleDeepCopy(this.shapeCoordinates),
          },
        },
      });
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