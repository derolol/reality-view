<template>
  <div class="palette" :style="paletteFullScreen">
    <el-row class="palette-container">
      <!-- 

    
        绘图工具栏


       -->
      <el-col class="palette-tool" :span="6">
        <!-- 

    
          绘图菜单


        -->
        <el-menu
          class="palette-menu"
          :default-active="menuIndex"
          :collapse="true"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">
            <i><svg-icon iconName="vector" iconClass="menu-icon" /></i>
            <span slot="title">绘制形状</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i><svg-icon iconName="setting" iconClass="menu-icon" /></i>
            <span slot="title">调整属性</span>
          </el-menu-item>
          <el-menu-item disabled index="3">
            <i><svg-icon iconName="portfolio" iconClass="menu-icon" /></i>
            <span slot="title">工具箱</span>
          </el-menu-item>
          <el-menu-item disabled index="4">
            <i><svg-icon iconName="question" iconClass="menu-icon" /></i>
            <span slot="title">帮助中心</span>
          </el-menu-item>
        </el-menu>
        <!-- 

    
          绘图工具面板


        -->
        <div class="palette-control">
          <div class="palette-control-shape" v-show="menuIndex === '1'">
            <div class="shape-title">线条</div>
            <el-row>
              <el-col
                :span="8"
                v-for="(info, item) in lineItemList"
                :key="item"
              >
                <el-tooltip
                  :content="'单击创建' + info.desc"
                  placement="bottom"
                >
                  <shape-item
                    :shape="info.shape"
                    :shapeDesc="info.desc"
                    :disabled="info.disabled"
                    @click.native="handleShapeItemClick(item)"
                  />
                </el-tooltip>
              </el-col>
            </el-row>
            <div class="shape-title">形状</div>
            <el-row>
              <el-col
                :span="8"
                v-for="(info, item) in shapeItemList"
                :key="item"
              >
                <el-tooltip
                  :content="'单击创建' + info.desc"
                  placement="bottom"
                >
                  <shape-item
                    :shape="info.shape"
                    :shapeDesc="info.desc"
                    :disabled="info.disabled"
                    @click.native="handleShapeItemClick(item)"
                  />
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
          <div class="palette-setting-attribute" v-show="menuIndex === '2'">
            <div v-show="currentShapeType === 'rectangle'">
              <div class="setting-warn-info">设置{{ shapeDesc }}属性</div>
              <el-form class="setting-form" label-width="40px">
                <el-form-item label="宽度">
                  <el-input v-model="settingRectWidth">
                    <span class="input-text-suffix" slot="suffix">m</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="高度">
                  <el-input v-model="settingRectHeight">
                    <span class="input-text-suffix" slot="suffix">m</span>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="handleShapeItemClick(currentShapeType)"
                    >提交</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
            <div v-show="currentShapeType === 'regular-polygon'">
              <div class="setting-warn-info">设置{{ shapeDesc }}属性</div>
              <el-form class="setting-form" label-width="40px">
                <el-form-item label="边数">
                  <el-input v-model="settingRegularPolygonSides">
                    <span class="input-text-suffix" slot="suffix">条</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="半径">
                  <el-input v-model="settingRegularPolygonRadius">
                    <span class="input-text-suffix" slot="suffix">m</span>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="handleShapeItemClick(currentShapeType)"
                    >提交</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
            <div v-show="currentShapeType === 'polygon'">
              <div class="setting-warn-info">设置{{ shapeDesc }}属性</div>
              <el-form class="setting-form" label-width="40px">
                <el-form-item
                  v-for="(v, index) in [
                    ...new Array(shapePoints.length / 2),
                  ].map((v, i) => [shapePoints[i], shapePoints[i + 1]])"
                  :key="`point${v}-${index}`"
                  :label="`点${index + 1}`"
                >
                  <div class="setting-point-input-group">
                    <el-input
                      class="setting-point-input"
                      v-model="shapePoints[index * 2]"
                    >
                      <span class="input-text-prefix" slot="prefix">x:</span>
                      <span class="input-text-suffix" slot="suffix">m</span>
                    </el-input>
                    <el-input
                      class="setting-point-input"
                      v-model="shapePoints[index * 2 + 1]"
                    >
                      <span class="input-text-prefix" slot="prefix">y:</span>
                      <span class="input-text-suffix" slot="suffix">m</span>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="handleShapeItemClick(currentShapeType)"
                    >提交</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
            <div
              class="setting-warn-info"
              v-show="currentShapeType === null || currentShapeType === ''"
            >
              当前无已创建图形
            </div>
          </div>
          <div v-show="menuIndex === '3'"></div>
          <div v-show="menuIndex === '4'"></div>
        </div>
      </el-col>
      <!-- 

    
        绘图展示


      -->
      <el-col class="palette-view" :span="18">
        <div id="paletteCanvas" class="palette-canvas">
          <v-stage
            ref="stage"
            :config="{ width: canvasWidth, height: canvasHeight }"
            @mousedown="handleStageMouseDown"
            @touchstart="handleStageMouseDown"
            @mousemove="mouseMoveThrottleEvent"
          >
            <v-layer ref="layer">
              <v-group ref="group">
                <!-- 


                  网格


                 -->
                <v-line
                  v-for="line in canvasGrid"
                  :config="{
                    points: line.points,
                    stroke: line.color,
                    strokeWidth: line.strokeWidth,
                  }"
                />
                <!-- 
                  

                  坐标轴数字
                  
                
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
                <!-- 
                  

                  矩形
                  
                
                -->
                <v-rect
                  v-if="currentShapeType === 'rectangle'"
                  ref="shape"
                  :config="currentRectConfig"
                  @transformend="handleTransformEnd"
                />
                <!-- 
                  

                  正多边形
                  
                
                -->
                <v-regular-polygon
                  v-if="currentShapeType === 'regular-polygon'"
                  ref="shape"
                  :config="currentRegularPolygon"
                  @transformend="handleTransformEnd"
                />
                <!-- 
                  

                  自定义多边形
                  
                
                -->
                <v-shape
                  v-if="currentShapeType === 'polygon'"
                  ref="shape"
                  :config="currentShapeConfig"
                  @transformend="handleTransformEnd"
                />
                <!-- 
                  

                  绘制自定义形状时的鼠标所在端点
                  
                
                -->
                <v-circle
                  v-if="startPaintPolygon"
                  :config="currentPaintPointConfig"
                />
                <!-- 
                  

                  绘制自定义形状时的连接虚线
                  
                
                -->
                <v-line
                  v-if="startPaintPolygon"
                  :config="currentLineHelperConfig"
                />
                <!-- 
                  

                  绘制自定义形状时的端点
                  
                
                -->
                <v-circle
                  v-for="p in divideShapePoint"
                  v-if="startPaintPolygon"
                  :key="`${p[0]},${p[1]}`"
                  :config="{
                    fill: '#ffffff',
                    stroke: '#9477D9',
                    strokeWidth: 1,
                    radius: 4,
                    x: p[0] * canvasScale + centerX,
                    y: centerY - p[1] * canvasScale,
                  }"
                />
                <!-- 
                  

                  变形器
                  
                
                -->
                <v-transformer
                  ref="transformer"
                  :config="{
                    centeredScaling: true,
                    rotationSnaps: [0, 90, 180, 270],
                  }"
                />
              </v-group>
            </v-layer>
          </v-stage>
        </div>
        <div class="canvas-return">
          <el-button
            class="canvas-return-button"
            type="primary"
            @click="handleReturnEvent"
            >完成编辑</el-button
          >
        </div>
        <div class="canvas-tools">
          <el-form inline>
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
            <el-form-item>
              <el-button
                type="info"
                size="mini"
                @click="(canvasShowWidth += 10), (canvasShowHeight += 10)"
                circle
              >
                <i class="el-icon-zoom-in"></i>
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                type="warning"
                size="mini"
                @click="(canvasShowWidth -= 10), (canvasShowHeight -= 10)"
                circle
              >
                <i class="el-icon-zoom-out"></i>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="canvas-point">当前位置: {{ pointX }},{{ pointY }}</div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import fullScreenMixin from "../FullScreenMixin.vue";
import ShapeItem from "./ShapeItem.vue";
import utils from "@/store/utils";

const GRID_WIDTH = 10;

export default {
  components: { ShapeItem },
  name: "palette",
  mixins: [fullScreenMixin],
  data() {
    return {
      menuIndex: "1",
      lineItemList: {
        line: {
          shape: "line",
          desc: "直线",
          disabled: true,
        },
        "multi-line": {
          shape: "multi-line",
          desc: "折线",
          disabled: true,
        },
      },
      shapeItemList: {
        rectangle: {
          shape: "rectangle",
          desc: "矩形",
          disabled: false,
        },
        "regular-polygon": {
          shape: "regular-polygon",
          desc: "正多边形",
          disabled: false,
        },
        polygon: {
          shape: "polygon",
          desc: "任意多边形",
          disabled: false,
        },
      },

      canvasShowWidth: 50,
      canvasShowHeight: 50,

      mouseMoveThrottleEvent: null,

      currentShapeType: "",
      selectedShape: null,

      settingRectWidth: 40,
      settingRectHeight: 20,
      currentRectConfig: {
        stroke: "#9477D9",
        strokeWidth: 2,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
        name: "shape",
        draggable: true,
      },

      settingRegularPolygonSides: 5,
      settingRegularPolygonRadius: 20,
      currentRegularPolygon: {
        stroke: "#9477D9",
        strokeWidth: 2,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
        name: "shape",
        draggable: true,
      },

      shapePoints: [],
      currentShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 2,
        strokeScaleEnabled: false, // 缩放不影响描边粗细
        name: "shape",
        draggable: true,
      },
      currentLineHelperConfig: {
        points: [],
        stroke: "#D1BFFF",
        strokeWidth: 2,
        dash: [5, 2],
      },
      divideShapePoint: [],
      pointX: 0,
      pointY: 0,
      currentPaintPointConfig: {
        fill: "#ffffff",
        stroke: "#9477D9",
        strokeWidth: 1,
        radius: 4,
      },
      startPaintPolygon: false,
    };
  },
  created() {
    this.mouseMoveThrottleEvent = utils.throttle(this.handleStageMouseMove, 50);
  },
  watch: {
    gridValue() {
      this.resizeTransformerSize();
    },
  },
  computed: {
    centerX() {
      return this.canvasWidth / 2;
    },
    centerY() {
      return this.canvasHeight / 2;
    },
    canvasWidth() {
      return 0.75 * this.fullScreenWidth;
    },
    canvasHeight() {
      return this.fullScreenHeight;
    },
    /**
     * 创建画布网格
     */
    canvasGrid() {
      const lineNumberX = Math.floor(this.centerX / GRID_WIDTH) + 1;
      const startX = this.centerX - lineNumberX * GRID_WIDTH;
      const endX = this.centerX + lineNumberX * GRID_WIDTH;
      const lineNumberY = Math.floor(this.centerY / GRID_WIDTH) + 1;
      const startY = this.centerY - lineNumberY * GRID_WIDTH;
      const endY = this.centerY + lineNumberY * GRID_WIDTH;
      let lineList = [];
      let color = "#E4E4E6";
      let strokeWidth = 1;
      for (let i = 0; i < lineNumberX * 2 + 1; i++) {
        let x = startX + i * GRID_WIDTH;
        if (i === lineNumberX) continue;
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
      for (let i = 0; i < lineNumberY * 2 + 1; i++) {
        let y = startY + i * GRID_WIDTH;
        if (i === lineNumberY) continue;
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
      let x = startX + lineNumberX * GRID_WIDTH;
      lineList.push({
        strokeWidth: 1,
        color: "#909399",
        points: [x, startY, x, endY],
      });
      let y = startY + lineNumberY * GRID_WIDTH;
      lineList.push({
        strokeWidth: 1,
        color: "#909399",
        points: [startX, y, endX, y],
      });
      return lineList;
    },
    /**
     * 每个网格大格的实际值
     */
    gridValue() {
      const centerX = this.centerX;
      const centerY = this.centerY;
      if (centerX === 0 || centerY === 0) return [];
      let numX = Math.floor(this.canvasWidth / GRID_WIDTH / 20) * 2;
      let numY = Math.floor(this.canvasHeight / GRID_WIDTH / 20) * 2;
      let w1 = Math.floor(this.canvasShowWidth / numX) + 1;
      let w2 = Math.floor(this.canvasShowHeight / numY) + 1;
      return Math.floor(Math.max(w1, w2) / 10) * 10 + 10;
    },
    /**
     * 画布坐标轴数值
     */
    canvasNumber() {
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      let numX = Math.floor(this.canvasWidth / GRID_WIDTH / 20) * 2;
      let numY = Math.floor(this.canvasHeight / GRID_WIDTH / 20) * 2;
      let textList = [];
      for (let i = 0, len = numX / 2; i < len; i++) {
        textList.push({
          text: ((i + 1) * this.gridValue).toString(),
          x: centerX + (i + 1) * GRID_WIDTH * 10,
          y: centerY,
        });
        textList.push({
          text: (-1 * (i + 1) * this.gridValue).toString(),
          x: centerX - (i + 1) * GRID_WIDTH * 10,
          y: centerY,
        });
      }
      for (let i = 0, len = numY / 2; i < len; i++) {
        textList.push({
          text: ((i + 1) * this.gridValue).toString(),
          x: centerX,
          y: centerY - (i + 1) * GRID_WIDTH * 10,
        });
        textList.push({
          text: (-1 * (i + 1) * this.gridValue).toString(),
          x: centerX,
          y: centerY + (i + 1) * GRID_WIDTH * 10,
        });
      }
      textList.push({
        text: "O",
        x: centerX,
        y: centerY,
      });
      return textList;
    },
    /**
     * 画布全屏
     */
    paletteFullScreen() {
      return `width:${this.fullScreenWidth}px;height:${this.fullScreenHeight}px;`;
    },
    canvasScale() {
      return (10 * GRID_WIDTH) / this.gridValue;
    },
    shapeDesc() {
      if (!this.currentShapeType || this.currentShapeType === "") return "";
      return this.shapeItemList[this.currentShapeType].desc;
    },
  },
  methods: {
    /**
     * 处理用户菜单切换的操作
     */
    handleMenuSelect(menu) {
      this.menuIndex = menu;
    },
    /**
     * 处理创建形状的操作
     */
    handleShapeItemClick(shape) {
      if (this.startPaintPolygon) {
        if (this.currentShapeType === "polygon") {
          this.startPaintPolygon = false;
          this.shapePoints.splice(0, this.shapePoints.length);
          // 重置辅助线属性
          this.currentLineHelperConfig = Object.assign(
            {},
            {
              points: [],
              stroke: "#D1BFFF",
              strokeWidth: 2,
              dash: [5, 2],
            }
          );
          // 清空绘制点
          this.divideShapePoint.splice(0, this.divideShapePoint.length);
          this.$message.success({
            message: "取消多边形绘制成功",
            duration: 1000,
          });
          return;
        }
        this.$message.error({
          message: "当前处于多边形绘制状态，形状切换失败",
          duration: 1000,
        });
        return;
      }
      this.selectedShape = null;
      this.updateTransformer();

      this.currentShapeType = shape;
      if (shape === "rectangle") {
        let width = this.settingRectWidth * this.canvasScale;
        let height = this.settingRectHeight * this.canvasScale;
        this.currentRectConfig = Object.assign({}, this.currentRectConfig, {
          x: this.centerX,
          y: this.centerY,
          width: width,
          height: height,
          offsetX: width / 2,
          offsetY: height / 2,
        });
      }
      if (shape === "regular-polygon") {
        this.currentRegularPolygon = Object.assign(
          {},
          this.currentRegularPolygon,
          {
            x: this.centerX,
            y: this.centerY,
            radius: this.settingRegularPolygonRadius * this.canvasScale,
            sides: this.settingRegularPolygonSides,
          }
        );
      }
      if (shape === "polygon") {
        if (this.shapePoints.length > 0) {
          this.shapePoints.splice(0, this.shapePoints.length);
        }
        this.startPaintPolygon = true;
        this.$message.info({
          message: "点击进行屏幕绘制",
          duration: 1000,
        });
        this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
          sceneFunc: (context, shape) => {
            context.beginPath();
            for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
              let x = this.shapePoints[i] * this.canvasScale;
              let y = -this.shapePoints[i + 1] * this.canvasScale;
              if (i === 0) context.moveTo(x, y);
              context.lineTo(x, y);
            }
            // context.closePath();
            context.fillStrokeShape(shape);
          },
        });
      }
    },
    /**
     * 处理变形事件结束后的变形
     */
    handleTransformEnd(e) {
      if (this.selectedShape) return;
      this.selectedShape.x = e.target.x();
      this.selectedShape.y = e.target.y();
      this.selectedShape.rotation = e.target.rotation();
      this.selectedShape.scaleX = e.target.scaleX();
      this.selectedShape.scaleY = e.target.scaleY();
    },
    /**
     * 处理用户鼠标点击Stage事件
     */
    handleStageMouseDown(e) {
      // 处理用户选中形状事件
      if (!this.startPaintPolygon) {
        // 用户选中state，取消当前的选中
        if (e.target === e.target.getStage()) {
          this.selectedShape = null;
          // 更新当前的transformer状态
          this.updateTransformer();
          return;
        }

        // 判断是否点击了Shape
        const clickedOnShape = e.target.name() === "shape";
        if (!clickedOnShape) {
          return;
        }

        // 获取选中的shape节点
        this.selectedShape = this.$refs.shape.getNode();
        // 更新当前的transformer状态
        this.updateTransformer();
        return;
      }

      let x = this.pointX;
      let y = this.pointY;

      // 判断是否需要封闭图形
      if (
        utils.distanceBetweenPoints(
          [this.shapePoints[0], this.shapePoints[1]],
          [x, y]
        ) < 0.5
      ) {
        this.startPaintPolygon = false;
        this.$message.info("多边形绘制完成");
        // 完成绘制封闭图形
        let { width, height, offsetX, offsetY } = this.resizePaintShape();
        this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
          sceneFunc: (context, shape) => {
            context.beginPath();
            for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
              let x = this.shapePoints[i] * this.canvasScale;
              let y = -this.shapePoints[i + 1] * this.canvasScale;
              if (i === 0) context.moveTo(x, y);
              context.lineTo(x, y);
            }
            context.closePath();
            context.fillStrokeShape(shape);
          },
          width,
          height,
          offsetX,
          offsetY,
        });
        // 重置辅助线属性
        this.currentLineHelperConfig = Object.assign(
          {},
          {
            points: [],
            stroke: "#D1BFFF",
            strokeWidth: 2,
            dash: [5, 2],
          }
        );
        // 清空绘制点
        this.divideShapePoint.splice(0, this.divideShapePoint.length);
        return;
      }

      // 新增绘制点
      this.shapePoints.push(x, y);
      let { width, height, offsetX, offsetY } = this.getShapeRange();
      this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
        width,
        height,
        offsetX,
        offsetY,
      });

      // 生成当前临时图形的临时端点
      this.divideShapePoint = [...new Array(this.shapePoints.length / 2)].map(
        (v, i) => [this.shapePoints[i * 2], this.shapePoints[i * 2 + 1]]
      );
    },
    /**
     * 处理鼠标在stage移动事件
     */
    handleStageMouseMove(e) {
      // 跟踪当前鼠标位置
      let x = e.evt.layerX;
      let y = e.evt.layerY;
      this.pointX = (e.evt.layerX - this.centerX) / this.canvasScale;
      this.pointY = (this.centerY - e.evt.layerY) / this.canvasScale;
      if (!this.startPaintPolygon) return;

      // 显示当前应绘制的点和连接辅助线
      // 判断是否满足闭合条件
      if (
        this.shapePoints.length > 2 &&
        utils.distanceBetweenPoints(
          [this.shapePoints[0], this.shapePoints[1]],
          [this.pointX, this.pointY]
        ) < 0.5
      ) {
        this.pointX = this.shapePoints[0];
        this.pointY = this.shapePoints[1];
        this.currentPaintPointConfig = Object.assign(
          {},
          this.currentPaintPointConfig,
          {
            x: this.pointX * this.canvasScale + this.centerX,
            y: this.centerY - this.pointY * this.canvasScale,
          }
        );
      }
      // 整数点粘性设置
      else {
        let stickDistance = 0.3;
        let xl = Math.floor(this.pointX);
        let xr = xl + 1;
        let yl = Math.floor(this.pointY);
        let yr = yl + 1;
        if (Math.abs(this.pointX - xl) < stickDistance) this.pointX = xl;
        if (Math.abs(this.pointX - xr) < stickDistance) this.pointX = xr;
        if (Math.abs(this.pointY - yl) < stickDistance) this.pointY = yl;
        if (Math.abs(this.pointY - yr) < stickDistance) this.pointY = yr;
        this.currentPaintPointConfig = Object.assign(
          {},
          this.currentPaintPointConfig,
          {
            x: this.pointX * this.canvasScale + this.centerX,
            y: this.centerY - this.pointY * this.canvasScale,
          }
        );
      }
      // 绘制完整图形辅助线
      let len = this.shapePoints.length;
      if (len < 2) return;
      let points = [
        this.shapePoints[len - 2],
        this.shapePoints[len - 1],
        this.pointX,
        this.pointY,
        this.shapePoints[0],
        this.shapePoints[1],
      ].map((v, i) => {
        if (i % 2 === 0) return v * this.canvasScale + this.centerX;
        return this.centerY - v * this.canvasScale;
      });
      this.currentLineHelperConfig = Object.assign(
        {},
        this.currentLineHelperConfig,
        { points }
      );
    },
    /**
     * 更新变形状态
     */
    updateTransformer() {
      const transformerNode = this.$refs.transformer.getNode();
      // 若存在被选中的对象则添加变形控件，否则移除
      if (this.selectedShape) {
        transformerNode.nodes([this.selectedShape]);
      } else {
        transformerNode.nodes([]);
      }
    },

    /**
     * 当画布实际大小更改时，同步修改当前shape在屏幕显示的width
     */
    resizeTransformerSize() {
      if (this.selectedShape) {
        this.$refs.transformer.getNode().nodes([]);
      }
      if (this.currentShapeType === "rectangle") {
        let width = this.settingRectWidth * this.canvasScale;
        let height = this.settingRectHeight * this.canvasScale;
        this.currentRectConfig = Object.assign({}, this.currentRectConfig, {
          x: this.centerX,
          y: this.centerY,
          width: width,
          height: height,
          offsetX: width / 2,
          offsetY: height / 2,
        });
      }
      if (this.currentShapeType === "regular-polygon") {
        this.currentRegularPolygon = Object.assign(
          {},
          this.currentRegularPolygon,
          {
            x: this.centerX,
            y: this.centerY,
            radius: this.settingRegularPolygonRadius * this.canvasScale,
            sides: this.settingRegularPolygonSides,
          }
        );
      }
      if (this.currentShapeType === "polygon") {
        // 自定义shape需要重新定义width和height
        let { width, height } = this.getShapeRange();
        this.currentShapeConfig = Object.assign({}, this.currentShapeConfig, {
          width,
          height,
        });
      }
      if (this.selectedShape) {
        this.$refs.transformer.getNode().nodes([this.selectedShape]);
      }
    },
    /**
     * 修改当前绘制图形的点和偏移
     * 方便适配transformer
     */
    resizePaintShape() {
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
        let x = this.shapePoints[i];
        let y = this.shapePoints[i + 1];
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
      }
      let width = (maxX - minX) * this.canvasScale;
      let height = (maxY - minY) * this.canvasScale;
      let dx = minX !== 0 ? -minX : 0;
      let dy = maxY !== 0 ? -maxY : 0;
      for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
        this.shapePoints[i] += dx;
        this.shapePoints[i + 1] += dy;
      }
      let offsetX = ((minX + maxX) / 2 + dx) * this.canvasScale - this.centerX;
      let offsetY = -((minY + maxY) / 2 + dy) * this.canvasScale - this.centerY;
      return { width, height, offsetX, offsetY };
    },
    /**
     * 根据当前点集获取形状的宽度
     */
    getShapeRange() {
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      for (let i = 0, len = this.shapePoints.length; i < len; i += 2) {
        let x = this.shapePoints[i];
        let y = this.shapePoints[i + 1];
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
      }
      let width = (maxX - minX) * this.canvasScale;
      let height = (maxY - minY) * this.canvasScale;
      return {
        width,
        height,
        offsetX: -this.centerX,
        offsetY: -this.centerY,
      };
    },
    handleReturnEvent() {
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
            message: "返回创建页面成功",
          });
          let points = [];
          // 构建长方形点集
          if (this.currentShapeType === "rectangle") {
            let w = this.settingRectWidth / 2;
            let h = this.settingRectHeight / 2;
            points.push([-w, -h], [w, -h], [w, h], [-w, h]);
          }
          // 构建正多边形点集
          else if (this.currentShapeType === "regular-polygon") {
            let r = this.settingRegularPolygonRadius;
            let sides = this.settingRegularPolygonSides;
            for (let i = 0; i < sides; i++) {
              let degree = (360 / sides) * i;
              if (degree === 90) {
                points.push([r, 0]);
                continue;
              }
              if (degree === 180) {
                points.push([0, -r]);
                continue;
              }
              if (degree === 270) {
                points.push([-r, 0]);
                continue;
              }
              degree *= Math.PI / 180;
              points.push([Math.sin(degree) * r, Math.cos(degree) * r]);
            }
          }
          // 构建自定义多边形点集
          else if (this.currentShapeType === "polygon") {
            let offsetX = this.$refs.shape.getNode().offsetX();
            let offsetY = this.$refs.shape.getNode().offsetY();
            points = [...new Array(this.shapePoints.length / 2)].map((v, i) => [
              this.shapePoints[i * 2] -
                (this.centerX + offsetX) / this.canvasScale,
              this.shapePoints[i * 2 + 1] +
                (this.centerY + offsetY) / this.canvasScale,
            ]);
          }
          // 保证点集为逆时针
          if (utils.judgeClockwise(points)) points.reverse();
          this.$router.push({ name: "maps", params: { points } });
        })
        .catch((err) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.palette-container {
  width: 100%;
  height: 100%;
}

.palette-menu {
  min-width: 25px;
}

.palette-tool,
.palette-menu {
  height: 100%;
}

.palette-tool {
  @include flex-between-middle($justify-content: flex-start, $wrap: nowrap);
  box-shadow: 1px 0px 5px #c2c2c2;
}

.palette-tool .palette-control {
  flex-grow: 1;
  height: 100%;
  display: inline-block;
}

.palette-tool .palette-menu .menu-icon {
  width: 22px;
  height: 22px;
}

.palette-control-shape .shape-title {
  @include flex-between-middle($justify-content: flex-start);
  padding: 8px 0px 8px 20px;
  color: $--color-purple-deep;
  font-weight: 900;
  background-color: $--color-purple-white;
}

.palette-view {
  height: 100%;
  position: relative;
}

.palette-canvas {
  width: 100%;
  height: 100%;
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
  padding: 10px;
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

.setting-warn-info {
  margin: 20px;
  border: 2px solid $--color-purple-main;
  border-radius: 5px;
  height: 50px;
  color: $--color-purple-main;
  text-align: center;
  line-height: 50px;
}

.setting-form {
  margin: 0 20px;
}

.setting-form .el-form-item {
  margin-bottom: 10px;
}

.input-text-prefix,
.input-text-suffix {
  margin: 0px 4px;
  font-size: 16px;
}

.palette-setting-attribute {
  width: 100%;
}
</style>