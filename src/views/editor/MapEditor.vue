<template>
  <div
    id="mapEditor"
    class="map-editor"
    v-loading="saveDataLoading"
    element-loading-text="上传地图信息中..."
  >
    <!-- ------------------------------------------------------
    ###########################################################
         
                            场景渲染
    
    ###########################################################
    ------------------------------------------------------- -->
    <map-render
      ref="mapRender"
      :mapId="mapId"
      :mapRenderWidth="mapRenderWidth"
      :mapRenderHeight="mapRenderHeight"
      @controllerRotation="touchNavigateAnimation"
      @onMouseClick="onMouseClick"
    />

    <!-- ------------------------------------------------------
    ###########################################################
         
                            指南针
    
    ###########################################################
    ------------------------------------------------------- -->
    <div class="navigate">
      <div class="navigate-bottom"></div>
      <div
        ref="navigatePointer"
        class="navigate-pointer"
      ></div>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            返回按钮
    
    ###########################################################
    ------------------------------------------------------- -->

    <div
      class="back-button-container"
      :style="{ right: `${fullScreenWidth * (1 - canvasScale) + 50}px` }"
    >
      <el-button
        type="primary"
        @click="handleReturnMapList"
      >返回地图列表</el-button>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            楼层选择器
    
    ###########################################################
    ------------------------------------------------------- -->
    <floor-choose
      ref="floorChoose"
      class="floor-choose-container"
      :style="{ right: `${fullScreenWidth * (1 - canvasScale) + 80}px` }"
      @floorChange="handleChooseFloorChange"
      @beforeFloorChange="handleBeforeFloorChange"
    ></floor-choose>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            工具栏
    
    ###########################################################
    ------------------------------------------------------- -->
    <div class="option-list">
      <el-button
        v-for="option in optionList"
        :key="'tool-option-'+option.icon"
        class="object-option"
        type="primary"
        plain
        @click.stop="handleToolItemClick(option.item)"
      >
        <svg-text
          :iconName="option.icon"
          :iconWidth="16"
          :iconHeight="16"
          :text="option.iconText"
        />
      </el-button>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                          地图元素编辑抽屉
    
    ###########################################################
    ------------------------------------------------------- -->

    <building-editor
      ref="buildingEditor"
      :editBuildingDrawerVisible="editBuildingDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

    <floor-editor
      ref="floorEditor"
      :editFloorDrawerVisible="editFloorDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

    <wall-editor
      ref="wallEditor"
      :editWallDrawerVisible="editWallDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

    <area-editor
      ref="areaEditor"
      :editAreaDrawerVisible="editAreaDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

    <poi-editor
      ref="poiEditor"
      :editPOIDrawerVisible="editPOIDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

    <pipe-editor
      ref="pipeEditor"
      :editPipeDrawerVisible="editPipeDrawerVisible"
      @drawerVisibleChange="drawerVisibleChange"
      @mapFocusFloor="mapFocusFloor"
      @mapFocusMesh="mapFocusMesh"
    />

  </div>
</template>

<script>
import api from "@/request/editor";
import data from "@/utils/data";

import { mapState } from "vuex";

import floorChoose from "./FloorChoose.vue";
import mapRender from "./MapRender.vue";
import fullScreenMixin from "@/components/FullScreenMixin.vue";

import areaEditor from "./AreaEditor.vue";
import poiEditor from "./POIEditor.vue";
import pipeEditor from "./PipeEditor.vue";
import wallEditor from "./WallEditor.vue";
import floorEditor from "./FloorEditor.vue";
import buildingEditor from "./BuildingEditor.vue";

export default {
  name: "mapEditor",
  components: {
    floorChoose,
    mapRender,
    areaEditor,
    poiEditor,
    pipeEditor,
    wallEditor,
    floorEditor,
    buildingEditor,
  },
  mixins: [fullScreenMixin],
  data() {
    return {
      canvasScale: 1,
      mapId: -1,

      mapPreviewImage: null,
      saveDataLoading: false,

      optionList: {
        building: {
          icon: "building",
          item: "building",
          iconText: "建筑",
        },
        floor: {
          icon: "floor",
          item: "floor",
          iconText: "楼层",
        },
        wall: {
          icon: "wall",
          item: "wall",
          iconText: "墙体",
        },
        area: {
          icon: "area",
          item: "area",
          iconText: "功能区",
        },
        poi: {
          icon: "poi",
          item: "poi",
          iconText: "POI",
        },
        pipe: {
          icon: "pipe",
          item: "pipe",
          iconText: "连通区域",
        },
        component: {
          icon: "component",
          item: "component",
          iconText: "组件",
        },
        portfolio: {
          icon: "portfolio",
          item: "portfolio",
          iconText: "工具箱",
        },
      },

      navigateRotate: 0,

      accessLevel: data.MapAccessLevelList,

      editBuildingDrawerVisible: false,
      editFloorDrawerVisible: false,
      editWallDrawerVisible: false,
      editAreaDrawerVisible: false,
      editPOIDrawerVisible: false,
      editPipeDrawerVisible: false,
    };
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      map: (state) => state.map,
      buildings: (state) => state.buildings,
      floors: (state) => state.floors,
      walls: (state) => state.walls,
      areas: (state) => state.areas,
      pois: (state) => state.pois,
      pipes: (state) => state.pipes,
      components: (state) => state.components,
      currentBuilding: (state) => state.currentBuilding,
      currentFloor: (state) => state.currentFloor,
      currentWall: (state) => state.currentWall,
      currentArea: (state) => state.currentArea,
      currentPOI: (state) => state.currentPOI,
      currentPipe: (state) => state.currentPipe,
      currentComponent: (state) => state.currentComponent,
      buildingRef: (state) => state.buildingRef,
      floorRef: (state) => state.floorRef,
      wallRef: (state) => state.wallRef,
      areaRef: (state) => state.areaRef,
      poiRef: (state) => state.poiRef,
      pipeRef: (state) => state.pipeRef,
      componentRef: (state) => state.componentRef,
    }),

    mapRenderWidth() {
      this.canvasScale = 1;
      if (this.visible) this.canvasScale = 0.6;
      return this.fullScreenWidth * this.canvasScale;
    },
    mapRenderHeight() {
      return this.fullScreenHeight;
    },

    visible() {
      return (
        this.editBuildingDrawerVisible ||
        this.editFloorDrawerVisible ||
        this.editWallDrawerVisible ||
        this.editAreaDrawerVisible ||
        this.editPOIDrawerVisible ||
        this.editPipeDrawerVisible
      );
    },
  },
  created() {
    this.mapId = this.$route.params.id;
    this.$route.meta.allowNext = false;
    this.$route.meta.saveData = this.getRenderCanvas;
    // 监听页面的刷新及离开
    window.onbeforeunload = (e) => {
      this.saveCurrentEdit();
    };
  },
  mounted() {},
  activated() {
    this.$refs.floorEditor.getFloorGeometry();
    this.$refs.wallEditor.getWallGeometries();
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**            监听用户事件绑定            **/
    /**                                       **/
    /*******************************************/

    /**
     * 当用户鼠标点击场景
     */
    onMouseClick(click, objectType, objectId, threeId) {
      // 若当前非功能区、POI、连通区域
      // 编辑窗口处于打开状态则忽略点击
      if (
        this.visible &&
        !this.editAreaDrawerVisible &&
        !this.editPOIDrawerVisible &&
        !this.editPipeDrawerVisible
      ) {
        return;
      }

      // 若点击了一个可见物体
      if (click) {
        // 当前点击的是Area
        if (objectType === "area") {
          // 当前没有编辑POI和连通区域
          if (!this.editPOIDrawerVisible && !this.editPipeDrawerVisible) {
            this.$refs.areaEditor.handleClickAreaObject(objectId);
            return;
          }
          // 当前在编辑POI
          if (this.editPOIDrawerVisible) {
            let res = this.$refs.poiEditor.handleClickAreaObject(objectId);
            if (res) return;
          }
        }

        // 当前点击的是POI
        if (objectType === "poi") {
          // 当用户没有编辑功能区和连通区域
          if (!this.editAreaDrawerVisible && !this.editPipeDrawerVisible) {
            this.$refs.poiEditor.handleClickPOIObject(objectId);
            return;
          }
        }

        // 当前点击的是连通区域
        if (objectType === "pipe") {
          // 若当前没有编辑功能区和POI
          if (this.editAreaDrawerVisible || this.editPOIDrawerVisible) return;
          this.$refs.pipeEditor.handleClickPipeObject(objectId);
          return;
        }
      }

      // 没有击中Area或POI，恢复视角
      if (
        this.editAreaDrawerVisible ||
        this.editPOIDrawerVisible ||
        this.editPipeDrawerVisible
      ) {
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
        this.mapFocusFloor(z);
      }

      // 若当前正在编辑Area，关闭编辑页面
      if (this.editAreaDrawerVisible) {
        this.editAreaDrawerVisible = false;
      }
      // 若当前正在编辑POI，关闭编辑页面
      if (this.editPOIDrawerVisible) {
        this.editPOIDrawerVisible = false;
      }
      // 若当前正在编辑Pipe，关闭编辑页面
      if (this.editPipeDrawerVisible) {
        this.editPipeDrawerVisible = false;
      }
    },

    /*******************************************/
    /**                                       **/
    /**            地图预览 Canvas             **/
    /**                                       **/
    /*******************************************/

    /**
     * 获取画布的内容
     * 并对获取的图片进行压缩
     */
    getRenderCanvas(width, height) {
      this.saveDataLoading = true;
      const minWidth = width;
      const minHeight = height;
      this.$refs.mapRender.render.startGetRenderCanvas((url) => {
        this.mapPreviewImage = new Image();
        this.mapPreviewImage.onload = () => {
          let canvas = document.createElement("canvas");
          let context = canvas.getContext("2d");
          // 画布源宽高
          const originWidth = this.mapPreviewImage.width;
          const originHeight = this.mapPreviewImage.height;
          // 缩放比例计算
          let scaleX = minWidth / originWidth;
          let scaleY = minHeight / originHeight;
          const scale = scaleX > scaleY ? scaleX : scaleY;
          const targetWidth = Math.round(scale * originWidth);
          const targetHeight = Math.round(scale * originHeight);
          // 放缩画布大小
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          // 绘制线性渐变背景
          let background = context.createLinearGradient(0, 0, 0, targetHeight);
          background.addColorStop(0, "#ebdeff");
          background.addColorStop(1, "#bbaad4");
          context.fillStyle = background;
          context.fillRect(0, 0, targetWidth, targetHeight);
          context.drawImage(
            this.mapPreviewImage,
            0,
            0,
            targetWidth,
            targetHeight
          );
          let image = canvas.toDataURL("image/jpeg", 1);
          this.uploadMapPreview(image);
        };
        this.mapPreviewImage.src = url;
      });
    },

    /**
     * 上传地图预览图
     */
    async uploadMapPreview(image) {
      const res = await api.uploadMapPreviewImage(
        this.map.properties.map_id,
        image
      );
      if (res.code !== 200) {
        this.$message.error("更新地图预览图失败");
      }
      this.$route.meta.allowNext = true;
      this.$route.meta.saveData = () => {};
      this.$router.push(this.$route.meta.to);
    },

    /**
     * 根据角度调整指南针相应的角度变化
     */
    touchNavigateAnimation(degree) {
      this.navigateRotate = -(degree * 180) / Math.PI;
      this.$refs.navigatePointer.style.transform = `rotate(${this.navigateRotate}deg)`;
    },

    /**
     * 聚焦楼层动画
     */
    mapFocusFloor(z) {
      this.$refs.mapRender.render.mapFocusFloorTweenInit(z);
    },

    /**
     * 聚焦物体动画
     */
    mapFocusMesh(x, y, z) {
      this.$refs.mapRender.render.mapFocusMeshTweenInit(x, y, z);
    },

    /**
     * 处理点击工具按钮
     */
    handleToolItemClick(type) {
      let currentType = this.judgeCurrentVisible();

      // 处理POI的大写
      if (type.toLowerCase() === "poi") type = "POI";
      if (currentType.toLowerCase() === "poi") currentType = "POI";

      // 获取抽屉
      let currentDrawer = `edit${
        currentType.charAt(0).toUpperCase() + currentType.slice(1)
      }DrawerVisible`;
      let clickDrawer = `edit${
        type.charAt(0).toUpperCase() + type.slice(1)
      }DrawerVisible`;

      // 若当前已打开抽屉，则关闭
      if (currentType !== "none") {
        this[currentDrawer] = false;
        // 当重复点击时关闭当前编辑窗口
        if (currentType === type) return;
      }
      // 打开当前点击抽屉
      this[clickDrawer] = true;
    },

    /**
     * 抽屉可见性改变
     */
    drawerVisibleChange(drawerType, visible) {
      if (drawerType.toLowerCase() === "poi") drawerType = "POI";
      this[
        `edit${
          drawerType.charAt(0).toUpperCase() + drawerType.slice(1)
        }DrawerVisible`
      ] = visible;
    },

    /**
     * 判断当前可见的抽屉
     */
    judgeCurrentVisible() {
      if (!this.visible) return "none";
      if (this.editBuildingDrawerVisible) return "building";
      if (this.editFloorDrawerVisible) return "floor";
      if (this.editWallDrawerVisible) return "wall";
      if (this.editAreaDrawerVisible) return "area";
      if (this.editPOIDrawerVisible) return "poi";
      if (this.editPipeDrawerVisible) return "pipe";
      return "none";
    },

    /**
     * 当用户选择楼层改变时的回调函数
     */
    handleBeforeFloorChange() {
      this.saveCurrentEdit();
    },

    /**
     * 保存当前正在修改的表单
     */
    saveCurrentEdit() {
      let type = this.judgeCurrentVisible();
      if (type === "none") return;
      let ref = `${type}Editor`;
      if (type.toLowerCase() === "poi") type = "POI";
      let method = `touchEdit${
        type.charAt(0).toUpperCase() + type.slice(1)
      }Change`;
      this.$refs[ref][method](true);
    },

    /**
     * 返回地图列表
     */
    handleReturnMapList() {
      this.$router.push({ name: "maps" });
    },
  },
};
</script>

<style lang="scss" scoped>
.map-editor {
  margin: 0px;
  font-size: 0px;
}

.navigate {
  position: absolute;
  top: 30px;
  left: 40px;
}

.navigate .navigate-bottom,
.navigate .navigate-pointer {
  width: 150px;
  height: 150px;
  position: absolute;
  top: 0px;
  left: 0px;
  background-size: 300px;
  background-image: url("../../assets/image/navigate.png");
}

.navigate .navigate-bottom {
  background-position-x: -150px;
}

.floor-choose-container {
  position: absolute;
  right: 80px;
  bottom: 80px;
}

.option-list {
  left: 55px;
  bottom: 80px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: flex-start;
}

.option-list .object-option {
  margin: 3px 10px;
}

.object-option-container {
  @include flex-between-middle($justify-content: center);
}

.option-list .option-icon {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}

.edit-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.edit-drawer .switch-container {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .switch-container .switch-text {
  color: $--color-purple-main;
  margin-left: 8px;
  font-size: 15px;
}

.popover-bottom {
  text-align: right;
  margin: 0;
}

.el-select-group .el-select-dropdown__item {
  height: auto;
  line-height: auto;
}

.back-button-container {
  position: absolute;
  top: 50px;
}
</style>