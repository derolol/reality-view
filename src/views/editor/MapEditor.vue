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
    <three-render
      ref="render"
      :width="threeWidth"
      :height="threeHeight"
      @controllerRotation="touchNavigateAnimation"
    >
      <map-object
        :ref="'map' + map.properties.map_id"
        v-if="map !== null"
        :mapInfo="map"
      />
      <building-object
        :ref="'building' + building.properties.building_id"
        v-for="building in buildings"
        :key="'building' + building.properties.building_id"
        :buildingInfo="building"
      />
      <floor-object
        :ref="'floor' + floor.properties.floor_id"
        v-for="floor in floors"
        :key="'floor' + floor.properties.floor_id"
        :floorInfo="floor"
      />
      <wall-object
        :ref="'wall' + wall.properties.wall_id"
        v-for="wall in walls"
        :key="'wall' + wall.properties.wall_id"
        :wallInfo="wall"
      />
      <area-object
        :ref="'area' + area.properties.area_id"
        v-for="area in areas"
        :key="'area' + area.properties.area_id"
        :areaInfo="area"
      />
    </three-render>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            指南针
    
    ###########################################################
    ------------------------------------------------------- -->
    <div class="navigate">
      <div class="navigate-bottom"></div>
      <div ref="navigatePointer" class="navigate-pointer"></div>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            楼层选择器
    
    ###########################################################
    ------------------------------------------------------- -->
    <floor-choose
      class="floor-choose-container"
      :style="{ right: `${fullScreenWidth * (1 - canvasScale) + 80}px` }"
      :floors="floors"
      :currentFloor="currentFloor"
      @floorChange="handleChooseFloorChange"
    ></floor-choose>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            工具栏
    
    ###########################################################
    ------------------------------------------------------- -->
    <div class="option-list">
      <el-button
        class="object-option"
        type="primary"
        plain
        @click="handleEditBuildingClick"
      >
        <svg-text
          iconName="building"
          :iconWidth="16"
          :iconHeight="16"
          text="建筑"
        />
      </el-button>
      <el-button
        @click="handleEditFloorClick"
        class="object-option"
        type="primary"
        plain
      >
        <svg-text
          iconName="floor"
          :iconWidth="16"
          :iconHeight="16"
          text="楼层"
        />
      </el-button>
      <el-button
        @click="handleEditWallClick"
        class="object-option"
        type="primary"
        plain
      >
        <svg-text
          iconName="wall"
          :iconWidth="16"
          :iconHeight="16"
          text="墙体"
        />
      </el-button>
      <el-button class="object-option" type="primary" plain>
        <svg-text
          iconName="area"
          :iconWidth="16"
          :iconHeight="16"
          text="功能区"
        />
      </el-button>
      <el-button class="object-option" type="primary" plain>
        <svg-text iconName="poi" :iconWidth="16" :iconHeight="16" text="POI" />
      </el-button>
      <el-button class="object-option" type="primary" plain>
        <svg-text
          iconName="pipe"
          :iconWidth="16"
          :iconHeight="16"
          text="连通区域"
        />
      </el-button>
      <el-button class="object-option" type="primary" plain>
        <svg-text
          iconName="portfolio"
          :iconWidth="16"
          :iconHeight="16"
          text="工具箱"
        />
      </el-button>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            建筑修改抽屉
    
    ###########################################################
    ------------------------------------------------------- -->
    <div>
      <el-drawer
        class="edit-drawer edit-building-drawer"
        title="编辑建筑信息"
        direction="rtl"
        size="100%"
        :modal="false"
        :close-on-press-escape="false"
        :wrapperClosable="false"
        :modal-append-to-body="false"
        :visible.sync="editBuildingDrawerVisible"
        :before-close="handleEditBuildingDrawerClose"
      >
        <div class="edit-drawer-container">
          <el-form class="edit-building-form" label-width="100px">
            <el-form-item label="建筑轮廓">
              <div class="switch-container">
                <el-switch
                  @change="handleBuildingMeshVisibleChange"
                  v-model="buildingMeshVisiable"
                />
                <span class="switch-text"
                  >{{ buildingMeshVisiable ? "显示" : "隐藏" }}建筑轮廓</span
                >
              </div>
            </el-form-item>

            <el-form-item label="建筑名称">
              <el-input
                size="medium"
                v-model="editBuildingModel.buildingName"
                placeholder="请输入建筑名称"
                @change="touchEditBuildingChange"
              />
            </el-form-item>
            <el-form-item label="建筑类型">
              <el-select
                class="building-type-select"
                v-model="editBuildingModel.buildingType"
                filterable
                size="medium"
                @change="touchEditBuildingChange"
              >
                <el-option-group
                  v-for="group in buildTypeGroupList"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="type in group.types"
                    :key="type.no"
                    :label="type.option"
                    :value="type.no"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>
            <el-form-item label="建筑中心">
              <div class="building-center">
                <el-input
                  class="building-center-input"
                  v-model="editBuildingModel.buildingCenterLng"
                  size="medium"
                  @change="touchEditBuildingChange"
                >
                  <span class="input-text-prefix" slot="prefix">经度:</span>
                </el-input>
                <el-input
                  class="building-center-input"
                  v-model="editBuildingModel.buildingCenterLat"
                  size="medium"
                  @change="touchEditBuildingChange"
                >
                  <span class="input-text-prefix" slot="prefix">纬度:</span>
                </el-input>
              </div>
              <el-button
                size="medium"
                type="success"
                class="building-center-btn"
                >获取中心经纬度</el-button
              >
            </el-form-item>
            <el-form-item label="建筑楼层高度">
              <el-input
                v-model="editBuildingModel.buildingFloorHeight"
                size="medium"
                @blur="handleBuildingFloorHeightChange"
              />
            </el-form-item>
            <el-form-item label="建筑访问级别">
              <div class="access-level">
                <div
                  class="level-container"
                  v-for="level in accessLevel"
                  :key="level.accessLevel"
                >
                  <el-tooltip
                    effect="dark"
                    :content="level.accessDesc"
                    placement="bottom"
                  >
                    <el-radio
                      v-model="editBuildingModel.buildingAccessLevel"
                      size="medium"
                      :label="level.accessLevel"
                      border
                      @change="touchEditBuildingChange"
                      >Level&nbsp;{{ level.accessLevel }}</el-radio
                    >
                  </el-tooltip>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            楼层修改抽屉
    
    ###########################################################
    ------------------------------------------------------- -->
    <div>
      <el-drawer
        class="edit-drawer edit-floor-drawer"
        title="编辑楼层信息"
        direction="rtl"
        size="100%"
        :modal="false"
        :close-on-press-escape="false"
        :wrapperClosable="false"
        :modal-append-to-body="false"
        :visible.sync="editFLoorDrawerVisible"
        :before-close="handleEditFloorDrawerClose"
      >
        <div class="edit-drawer-container">
          <el-button
            class="edit-floor-new"
            size="medium"
            @click="handleFloorAddition"
          >
            <svg-text
              iconName="plus"
              :iconWidth="16"
              :iconHeight="16"
              text="新增楼层"
            />
          </el-button>
          <el-form class="edit-floor-form" label-width="100px">
            <el-form-item class="edit-floor-ground-item" label="楼层底板">
              <div class="switch-container">
                <el-switch
                  size="medium"
                  @change="handleFloorMeshVisibleChange"
                  v-model="floorMeshVisiable"
                />
                <span class="switch-text"
                  >{{ floorMeshVisiable ? "显示" : "隐藏" }}楼层地板</span
                >
              </div>
            </el-form-item>
            <el-form-item label="所有楼层">
              <div class="switch-container">
                <el-switch
                  size="medium"
                  @change="handleAllFloorVisibleChange"
                  v-model="allFloorVisible"
                />
                <span class="switch-text">{{
                  allFloorVisible ? "显示所有楼层" : "只显示当前楼层"
                }}</span>
              </div>
            </el-form-item>
            <el-form-item label="楼层名称">
              <el-input
                size="medium"
                v-model="editFloorModel.floorName"
                placeholder="请输入楼层名称"
                @change="touchEditFloorChange"
              />
            </el-form-item>
            <el-form-item label="楼层层号">
              <div class="form-question-item">
                <el-input
                  size="medium"
                  v-model="editFloorModel.floorLevel"
                  placeholder="请输入楼层层号"
                  @blur="handleFloorLevelChange"
                  @change="touchEditFloorChange"
                />
                <el-popover
                  placement="top-start"
                  title="楼层号设置规则"
                  width="150"
                  trigger="hover"
                >
                  <el-table :data="floorLevelRule">
                    <el-table-column
                      width="50"
                      property="level"
                      label="层号"
                    ></el-table-column>
                    <el-table-column
                      width="100"
                      property="desc"
                      label="含义"
                    ></el-table-column>
                  </el-table>
                  <svg-icon
                    class="form-question-icon"
                    slot="reference"
                    iconName="question"
                  ></svg-icon>
                </el-popover>
              </div>
            </el-form-item>
            <el-form-item label="楼层管理">
              <el-popover
                placement="top"
                width="160"
                v-model="floorCopyVisible"
              >
                <p>请输入复制楼层层号</p>
                <el-input
                  v-model="floorCopyLevel"
                  class="floor-popover-input"
                  size="mini"
                  type="text"
                  placeholder="楼层层号"
                />
                <div class="popover-bottom">
                  <el-button
                    size="mini"
                    type="text"
                    @click="floorCopyVisible = false"
                    >取消</el-button
                  >
                  <el-button type="primary" size="mini" @click="handleFloorCopy"
                    >确定</el-button
                  >
                </div>
                <el-button size="medium" type="info" slot="reference">
                  <svg-text
                    iconName="copy"
                    :iconWidth="16"
                    :iconHeight="16"
                    text="复制楼层"
                  />
                </el-button>
              </el-popover>
              <el-popover
                placement="top"
                width="160"
                v-model="floorDeletionVisible"
              >
                <p>确定删除该楼层?</p>
                <div class="popover-bottom">
                  <el-button
                    size="mini"
                    type="text"
                    @click="floorDeletionVisible = false"
                    >取消</el-button
                  >
                  <el-button
                    type="primary"
                    size="mini"
                    @click="handleFloorDeletion"
                    >确定</el-button
                  >
                </div>
                <el-button
                  class="floor-delete-btn"
                  size="medium"
                  type="danger"
                  slot="reference"
                >
                  <svg-text
                    iconName="delete"
                    :iconWidth="16"
                    :iconHeight="16"
                    text="删除楼层"
                  />
                </el-button>
              </el-popover>
            </el-form-item>
            <el-form-item label="楼层轮廓">
              <div class="floor-edit-geometry-container">
                <v-stage
                  ref="stage"
                  :config="floorStageConfig"
                  class="floor-edit-geometry-stage"
                >
                  <v-layer
                    ><v-shape :config="editFloorShapeConfig"></v-shape
                  ></v-layer>
                </v-stage>
                <el-button size="medium" @click="jumpFloorGeometryPalette">
                  <svg-text
                    iconName="pencil"
                    :iconWidth="16"
                    :iconHeight="16"
                    text="修改轮廓"
                /></el-button>
              </div>
            </el-form-item>
            <el-form-item label="建筑访问级别">
              <div class="access-level">
                <div
                  class="level-container"
                  v-for="level in accessLevel"
                  :key="level.accessLevel"
                >
                  <el-tooltip
                    effect="dark"
                    :content="level.accessDesc"
                    placement="bottom"
                  >
                    <el-radio
                      v-model="editFloorModel.floorAccessLevel"
                      size="medium"
                      :label="level.accessLevel"
                      border
                      @change="touchEditFloorChange"
                      >Level&nbsp;{{ level.accessLevel }}</el-radio
                    >
                  </el-tooltip>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>

    <!-- ------------------------------------------------------
    ###########################################################
         
                            墙体修改抽屉
    
    ###########################################################
    ------------------------------------------------------- -->
    <div>
      <el-drawer
        class="edit-drawer edit-wall-drawer"
        title="编辑墙体信息"
        direction="rtl"
        size="100%"
        :modal="false"
        :close-on-press-escape="false"
        :wrapperClosable="false"
        :modal-append-to-body="false"
        :visible.sync="editWallDrawerVisible"
        :before-close="handleEditWallDrawerClose"
      >
        <div class="edit-drawer-container">
          <el-form class="edit-wall-form" label-width="100px">
            <el-form-item label="墙体厚度">
              <el-select
                size="medium"
                v-model="editWallModel.wallThick"
                @change="touchEditWallChange"
              >
                <el-option
                  v-for="(thick, index) in wallThickList"
                  :key="'thick' + thick"
                  :label="thick + 'm'"
                  :value="index + 1"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="墙体轮廓">
              <div class="wall-edit-geometry-container">
                <v-stage
                  ref="stage"
                  :config="wallStageConfig"
                  class="wall-edit-geometry-stage"
                >
                  <v-layer
                    ><v-shape :config="editWallShapeConfig"></v-shape
                  ></v-layer>
                </v-stage>
                <el-button size="medium" @click="jumpWallGeometryPalette">
                  <svg-text
                    iconName="pencil"
                    :iconWidth="16"
                    :iconHeight="16"
                    text="修改轮廓"
                /></el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import fullScreenMixin from "@/components/FullScreenMixin.vue";
import ThreeRender from "@/components/ThreeRender.vue";
import MapObject from "@/components/three-object/MapObject.vue";
import BuildingObject from "@/components/three-object/BuildingObject.vue";
import FloorObject from "@/components/three-object/FloorObject.vue";
import WallObject from "@/components/three-object/WallObject.vue";
import PipeObject from "@/components/three-object/PipeObject.vue";
import AreaObject from "@/components/three-object/AreaObject.vue";
import PoiObject from "@/components/three-object/POIObject.vue";
import api from "@/request/editor";
import FloorChoose from "./FloorChoose.vue";
import data from "@/store/data";
import utils from "@/store/utils";
export default {
  name: "mapEditor",
  components: {
    ThreeRender,
    MapObject,
    BuildingObject,
    FloorObject,
    AreaObject,
    WallObject,
    PipeObject,
    PoiObject,
    FloorChoose,
  },
  mixins: [fullScreenMixin],
  data() {
    return {
      canvasScale: 1,

      map: null,
      buildings: [],
      floors: [],
      walls: [],
      areas: [],
      pois: [],
      pipes: [],
      components: [],
      mapPreviewImage: null,
      saveDataLoading: false,

      navigateRotate: 0,

      accessLevel: data.MapAccessLevelList,

      currentBuilding: 0,
      editBuildingDrawerVisible: false,
      buildTypeGroupList: data.BuildingType,
      touchEditBuildingChange: null,
      editBuildingModel: {
        buildingName: "",
        buildingType: "",
        buildingCenterLng: 0,
        buildingCenterLat: 0,
        buildingFloorHeight: 3,
        buildingAccessLevel: 1,
      },
      buildingMeshVisiable: true,

      currentFloor: 0,
      editFLoorDrawerVisible: false,
      floorMeshVisiable: true,
      allFloorVisible: true,
      touchEditFloorChange: null,
      editFloorModel: {
        floorName: "",
        floorLevel: 0,
        floorGeometry: null,
        floorAccessLevel: 1,
      },
      floorStageConfig: {
        width: 100,
        height: 60,
      },
      editFloorShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 2,
        name: "shape",
        strokeScaleEnabled: false, // 缩放不影响描边粗细
      },
      floorLevelRule: [
        {
          level: "-1",
          desc: "负一层",
        },
        {
          level: "0",
          desc: "首层",
        },
        {
          level: "1",
          desc: "地上二层",
        },
      ],
      floorCopyVisible: false,
      floorCopyLevel: null,
      floorDeletionVisible: false,

      editWallDrawerVisible: false,
      editWallModel: {
        wallThick: 1,
        wallGeometry: {},
        wallInsideGeometry: {},
      },
      wallThickList: [],
      wallStageConfig: {
        width: 250,
        height: 150,
      },
      editWallShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 2,
        name: "shape",
        strokeScaleEnabled: false,
      },
    };
  },
  computed: {
    visible() {
      return (
        this.editBuildingDrawerVisible ||
        this.editFLoorDrawerVisible ||
        this.editWallDrawerVisible
      );
    },
    threeWidth() {
      this.canvasScale = 1;
      if (this.visible) this.canvasScale = 0.6;
      return this.fullScreenWidth * this.canvasScale;
    },
    threeHeight() {
      return this.fullScreenHeight;
    },
    buildingRef() {
      return this.$refs[`building${this.currentBuilding}`][0];
    },
    floorRef() {
      return this.$refs[`floor${this.currentFloor}`][0];
    },
    wallRef() {
      let wall = this.floorRef.floorAttachWall();
      return this.$refs[`wall${wall}`][0];
    },
  },
  created() {
    this.initObject();
    this.$route.meta.allowNext = false;
    this.$route.meta.saveData = this.getRenderCanvas;
    this.initTouchEvent();
  },
  activated() {
    this.getFloorGeometry();
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**        地图对象数据加载和初始化         **/
    /**                                       **/
    /*******************************************/

    async initObject() {
      const mapId = this.$route.params.id;
      let res = await api.findMapById(mapId);
      if (res.code !== 200) return;
      const mapData = res.data.map;
      let level = 0;
      if (typeof mapData === "object") {
        // map 数据初始化
        this.map = mapData.mapObject;
        // building 数据初始化
        for (let building of mapData.buildingObjects) {
          this.buildings.push(building);
        }
        // 设置当前默认的 building id
        let buildingInfo = this.buildings[0].properties;
        this.currentBuilding = buildingInfo.building_id;
        // floor 数据初始化
        for (let floor of mapData.floorObjects) {
          this.floors.push(floor);
        }
        // 设置当前默认 floor id，位于中间的楼层
        let levelList = buildingInfo.building_floor_level_list;
        level = levelList[Math.floor(levelList.length / 2)];
        this.currentFloor = buildingInfo.building_floor_level_map[level];
        // wall 数据初始化
        for (let wall of mapData.wallObjects) {
          this.walls.push(wall);
        }
        // area 数据初始化
        for (let area of mapData.areaObjects) {
          this.areas.push(area);
        }
      }
      this.$nextTick(() => {
        this.$store.commit("initMapObjectRefs", this.$refs);
        this.$refs.render.startRender();
        // 根据当前楼层对网格位置初始化
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = level * (height + 2 * floorMargin);
        this.$refs.render.setGridHelperLevel(0, 0, z);
        this.$refs.render.setCameraPosition(0, -90, z);
      });
    },

    /*******************************************/
    /**                                       **/
    /**           自动提交事件绑定             **/
    /**                                       **/
    /*******************************************/

    initTouchEvent() {
      this.touchEditBuildingChange = utils.debounce(
        this.handleEditBuildingSubmit,
        3000
      );
      this.touchEditFloorChange = utils.debounce(
        this.handleEditFloorSubmit,
        3000
      );
      this.touchEditWallChange = utils.debounce(
        this.handleEditWallSubmit,
        3000
      );
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
      this.$refs.render.startGetRenderCanvas((url) => {
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
    touchNavigateAnimation(degree) {
      this.navigateRotate = -(degree * 180) / Math.PI;
      this.$refs.navigatePointer.style.transform = `rotate(${this.navigateRotate}deg)`;
    },

    /*******************************************/
    /**                                       **/
    /**         建筑 Building Drawer          **/
    /**                                       **/
    /*******************************************/

    /**
     * 展示编辑建筑抽屉时
     * 设置建筑值的初始值
     */
    handleEditBuildingClick() {
      if (this.visible && !this.editBuildingDrawerVisible) return;
      this.editBuildingDrawerVisible = !this.editBuildingDrawerVisible;
      if (!this.editBuildingDrawerVisible) {
        this.handleEditBuildingSubmit();
        return;
      }
      this.editBuildingModel = {
        buildingName: this.buildingRef.buildingName(),
        buildingType: "" + this.buildingRef.buildingType(),
        buildingCenterLng: this.buildingRef.buildingCenterLng(),
        buildingCenterLat: this.buildingRef.buildingCenterLat(),
        buildingFloorHeight: this.buildingRef.buildingFloorHeight(),
        buildingAccessLevel: +this.buildingRef.buildingAccessLevel(),
      };
    },
    handleEditBuildingDrawerClose(done) {
      this.handleEditBuildingSubmit();
      done();
    },
    /**
     * 提交编辑后的建筑信息
     */
    async handleEditBuildingSubmit() {
      const edit = {
        building_name: this.editBuildingModel.buildingName,
        building_type: this.editBuildingModel.buildingType,
        building_center_lng: this.editBuildingModel.buildingCenterLng,
        building_center_lat: this.editBuildingModel.buildingCenterLat,
        building_floor_height: this.editBuildingModel.buildingFloorHeight,
        building_access_level: this.editBuildingModel.buildingAccessLevel,
      };
      this.buildingRef.updateBuildingInfo(edit);
      const building = await api.updateBuilding(this.currentBuilding, edit);
    },
    /**
     * 建筑轮廓显示隐藏设置
     */
    handleBuildingMeshVisibleChange(visible) {
      this.buildingRef.updateBuildingMeshVisible(visible);
    },
    /**
     * 建筑楼层高度改变
     */
    handleBuildingFloorHeightChange() {
      const height = this.editBuildingModel.buildingFloorHeight;
      // 更新建筑轮廓
      this.buildingRef.updateBuildingFloorHeightChange(height);
      let floorIdList = this.buildingRef.buildingAttachFloor();
      for (let i = 0, len = floorIdList.length; i < len; i++) {
        let floorId = floorIdList[i];
        // 更新楼层高度和位置
        this.$refs[`floor${floorId}`][0].updateBuildingFloorHeightChange(
          height
        );
        // 更新墙体高度
        let wallId = this.$refs[`floor${floorId}`][0].floorAttachWall();
        this.$refs[`wall${wallId}`][0].updateWallFloorHeightChange(height);
      }
      // 更新网格位移
      let level = this.floorRef.floorLevel();
      let exactHeight = height * data.ThreeObjectConfig.zScale;
      let z = level * (exactHeight + 2 * data.ThreeObjectConfig.floorMargin);
      this.$refs.render.setGridHelperLevel(0, 0, z);
      this.touchEditBuildingChange();
    },

    /*******************************************/
    /**                                       **/
    /**           楼层 Floor Drawer           **/
    /**                                       **/
    /*******************************************/

    /**
     * 展示编辑楼层抽屉
     * 初始化楼层值
     */
    handleEditFloorClick() {
      if (this.visible && !this.editFLoorDrawerVisible) return;
      this.editFLoorDrawerVisible = !this.editFLoorDrawerVisible;
      if (!this.editFLoorDrawerVisible) {
        this.handleEditFloorSubmit();
        return;
      }
      let geometry = this.floorRef.floorGeometryObject();
      this.editFloorModel.floorName = this.floorRef.floorName();
      this.editFloorModel.floorLevel = this.floorRef.floorLevel();
      this.editFloorModel.floorGeometry = geometry;
      this.editFloorModel.floorAccessLevel = +this.floorRef.floorAccessLevel();
      // 初始化楼层轮廓
      let showWidth = this.floorStageConfig.width;
      let showHeight = this.floorStageConfig.height;
      const box = utils.getShapeBox(geometry.coordinates);
      const scale = utils.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.editFloorShapeConfig = Object.assign({}, this.editFloorShapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          geometry.coordinates,
          scale,
          showWidth,
          showHeight
        ),
        x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
        y: -showHeight / 2 + (box.y + box.height) * scale + 0.05 * showHeight,
      });
    },
    handleEditFloorDrawerClose(done) {
      this.handleEditFloorSubmit();
      done();
    },
    /**
     * 提交楼层信息
     */
    async handleEditFloorSubmit(geometryChange) {
      const edit = {
        floor_name: this.editFloorModel.floorName,
        floor_level: this.editFloorModel.floorLevel,
        floor_geometry: JSON.stringify(this.editFloorModel.floorGeometry),
      };
      // 更新本地floor组件数据
      this.floorRef.updateFloorInfo({
        floor_name: this.editFloorModel.floorName,
        floor_level: this.editFloorModel.floorLevel,
      });
      // 判断轮廓是否发生改变
      geometryChange = geometryChange ? true : false;
      // 上传建筑数据
      const updated = await api.updateFloor(this.currentFloor, {
        info: edit,
        geometryChange,
      });
      // 判断轮廓是否发生改变
      if (updated.code === 200) {
        let geometryChange = updated.data.geometryChange;
        // 修改相应的墙体和功能区轮廓
        if (geometryChange) {
          let { wall, area } = updated.data;
          let wallId = this.floorRef.floorAttachWall();
          this.$refs[`wall${wallId}`][0].updateWallGeometry(
            JSON.parse(wall.wall_geometry)
          );
          let areaId = this.floorRef.floorAttachArea()[0];
          this.$refs[`area${areaId}`][0].updateAreaGeometry(
            JSON.parse(area.area_geometry)
          );
        }
      }
    },
    /**
     * 处理楼层层号变化事件
     */
    handleFloorLevelChange() {
      let newLevel = this.editFloorModel.floorLevel;
      let currentFloorLevel = this.floorRef.floorLevel();
      // 判断修改楼层是否为当前楼层
      if (+currentFloorLevel === +newLevel) return;
      // 获取建筑的所有楼层
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      // 判断层号是否重复
      if (floorLevelList.indexOf(newLevel) !== -1) {
        this.$message.warning("该楼层已存在");
        this.editFloorModel.floorLevel = currentFloorLevel;
        return;
      }
      // 更新楼层列表
      floorLevelList.push(newLevel);
      floorLevelList.splice(floorLevelList.indexOf("" + currentFloorLevel), 1);
      floorLevelList.sort((a, b) => b - a);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      delete floorLevelMap[currentFloorLevel];
      floorLevelMap[newLevel] = this.currentFloor;
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      // 更新楼层位移
      this.floorRef.floorLevelChange(newLevel);
      // 更新网格位移
      let height =
        this.buildingRef.buildingFloorHeight() * data.ThreeObjectConfig.zScale;
      let z = newLevel * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.$refs.render.setGridHelperLevel(0, 0, z);
    },
    /**
     * 楼层建筑可见性
     */
    handleFloorMeshVisibleChange() {
      let floorList = this.buildingRef.buildingAttachFloor();
      for (let floorId of floorList) {
        // 若全部可见则显示全部楼层
        this.floorRef.setFloorMeshVisible(this.floorMeshVisiable);
      }
    },
    /**
     * 控制全部楼层的显示
     */
    handleAllFloorVisibleChange() {
      let floorList = this.buildingRef.buildingAttachFloor();
      for (let floorId of floorList) {
        // 若全部可见则显示全部楼层
        if (this.allFloorVisible) {
          this.floorRef.setFloorGroupVisible(true);
        } else {
          // 只显示当前楼层
          if (floorId === this.currentFloor) {
            this.floorRef.setFloorGroupVisible(true);
          } else {
            // 其余楼层隐藏
            this.floorRef.setFloorGroupVisible(false);
          }
        }
      }
    },
    /**
     * 跳转到楼层轮廓编辑页面
     */
    jumpFloorGeometryPalette() {
      this.$router.push({
        name: "palette",
        params: {
          drawMode: "floor",
          buildingGeometry: this.buildingRef.buildingGeometryObject(),
          floorGeometry: this.floorRef.floorGeometryObject(),
          mapId: this.$route.params.id,
          floorId: this.currentFloor,
        },
      });
    },
    /**
     * 获取完成编辑的楼层 Geometry
     */
    getFloorGeometry() {
      let floorId = this.$route.params.floorId;
      let floorGeometry = this.$route.params.geometry;
      if (
        floorId === null ||
        floorGeometry === null ||
        floorId === undefined ||
        floorGeometry === undefined
      ) {
        return;
      }
      this.currentFloor = floorId;
      this.$refs[`floor${this.currentFloor}`][0].updateFloorGeometry(
        floorGeometry
      );
      this.editFLoorDrawerVisible = false;
      this.handleEditFloorClick();
      this.handleEditFloorSubmit(true);
    },
    /**
     * 新增楼层
     */
    async handleFloorAddition() {
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      let level = Math.max(...floorLevelList) + 1;
      let floorInfo = {
        floor_belong_building: this.currentBuilding,
        floor_name: "楼层",
        floor_level: level,
        floor_owner: this.$store.state.currentInfo.user_id,
        floor_geometry: JSON.stringify(
          this.buildingRef.buildingGeometryObject()
        ),
        floor_access_level: 1,
      };
      let created = await api.createFloor(floorInfo);
      if (created.code !== 200) {
        this.$message.error("创建楼层失败");
        return;
      }
      let { floor, wall, area } = created.data;
      console.log(floor, wall, area);
      this.floors.push(floor);
      this.walls.push(wall);
      this.areas.push(area);
      // 更新楼层列表
      floorLevelList.push(level);
      floorLevelList.sort((a, b) => b - a);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      floorLevelMap[level] = floor.properties.floor_id;
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      this.$nextTick(() => {
        // 更新当前refs列表
        this.$store.commit("initMapObjectRefs", this.$refs);
        console.log(floor.properties.floor_id);
        // building 渲染新增 floor
        this.buildingRef.addFloorGroupObject(floor.properties.floor_id);
        // 切换到新增的楼层
        this.handleChooseFloorChange(floor.properties.floor_id);
      });
    },
    /**
     * 复制楼层
     */
    async handleFloorCopy() {
      // 输入楼层号检查
      if (this.floorCopyLevel === null || this.floorCopyLevel === undefined) {
        this.$message.warning("请输入正确的复制目标楼层号");
        return;
      }
      // 判断楼层号是否能正确转换为数字
      this.floorCopyLevel = +this.floorCopyLevel;
      if (
        this.floorCopyLevel === NaN ||
        typeof this.floorCopyLevel !== "number"
      ) {
        this.$message.warning("请输入正确的复制目标楼层号");
        return;
      }
      // 判断层号是否重复
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      if (floorLevelList.findIndex((v) => v == this.floorCopyLevel) !== -1) {
        this.$message.warning("该楼层已存在");
        this.floorCopyLevel = null;
        return;
      }
      // 关闭询问对话框
      this.floorCopyVisible = false;
      // 复制楼层
      let copied = await api.copyFloor(this.currentFloor, this.floorCopyLevel);
      if (copied.code !== 200) {
        this.$message.error("楼层复制失败");
        this.floorCopyLevel = null;
        return;
      }
      this.$message.info("复制楼层成功");
      let { floor, wall, area, component, poi, pipe } = copied.data.copied;
      // 添加该楼层数据
      this.floors.push(floor);
      this.walls.push(wall);
      this.areas.push(...area);
      this.components.push(...component);
      this.pois.push(...poi);
      this.pipes.push(...pipe);
      // 更新楼层列表
      floorLevelList.push(this.floorCopyLevel);
      floorLevelList.sort((a, b) => b - a);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      floorLevelMap[this.floorCopyLevel] = floor.properties.floor_id;
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      this.$nextTick(() => {
        // 更新当前refs列表
        this.$store.commit("initMapObjectRefs", this.$refs);
        console.log(floor.properties.floor_id);
        // building 渲染新增 floor
        this.buildingRef.addFloorGroupObject(floor.properties.floor_id);
        // 切换到复制的楼层
        this.handleChooseFloorChange(floor.properties.floor_id);
      });
    },
    /**
     * 删除楼层
     */
    async handleFloorDeletion() {
      this.floorDeletionVisible = false;
      if (this.floors.length === 1) {
        this.$message.error("删除失败：楼层数量不能小于1");
        return;
      }
      let deleted = await api.deleteFloor(this.currentFloor);
      if (deleted.code !== 200) {
        this.$message.error("删除失败：请重试");
        return;
      }
      this.$message.info("删除楼层成功");
      // 更新楼层列表
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      let index = floorLevelList.findIndex(
        (v) => v == this.floorRef.floorLevel()
      );
      floorLevelList.splice(index, 1);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      delete floorLevelMap[this.floorRef.floorLevel()];
      console.log(floorLevelList);
      floorLevelList.sort((a, b) => b - a);
      // 删除该楼层数据
      const floorIndex = this.floors.findIndex(
        (v) => +v.properties.floor_id === +this.currentFloor
      );
      this.floors.splice(floorIndex, 1);
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      // 更新当前默认 floor id，位于中间的楼层
      let level = floorLevelList[Math.floor(floorLevelList.length / 2)];
      this.handleChooseFloorChange(floorLevelMap[level]);
    },
    /**
     * 用户点击切换当前楼层
     */
    handleChooseFloorChange(floorId) {
      // 若当前正在楼层编辑界面
      if (this.editFLoorDrawerVisible) {
        // 立即提交当前修改
        this.handleEditFloorSubmit();
        this.currentFloor = floorId;
        // 修改当前显示内容
        let geometry = this.floorRef.floorGeometryObject();
        this.editFloorModel.floorName = this.floorRef.floorName();
        this.editFloorModel.floorLevel = this.floorRef.floorLevel();
        this.editFloorModel.floorGeometry = geometry;
        this.editFloorModel.floorAccessLevel =
          +this.floorRef.floorAccessLevel();
        // 初始化楼层轮廓
        let showWidth = this.floorStageConfig.width;
        let showHeight = this.floorStageConfig.height;
        const box = utils.getShapeBox(geometry.coordinates);
        const scale = utils.getBoxScale(showWidth, showHeight, box) * 0.9;
        this.editFloorShapeConfig = Object.assign(
          {},
          this.editFloorShapeConfig,
          {
            sceneFunc: utils.generateSceneFunc(
              geometry.coordinates,
              scale,
              showWidth,
              showHeight
            ),
            x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
            y:
              -showHeight / 2 +
              (box.y + box.height) * scale +
              0.05 * showHeight,
          }
        );
      }
      // 设置当前楼层id
      this.currentFloor = floorId;
      let currentLevel = this.floorRef.floorLevel();
      // 根据楼层显示状态控制当前楼层的显示
      this.handleAllFloorVisibleChange();
      // 更新网格和相机的位置
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = currentLevel * (height + 2 * floorMargin);
      this.$refs.render.setGridHelperLevel(0, 0, z);
      this.$refs.render.setCameraPosition(0, -90, z);
    },

    /*******************************************/
    /**                                       **/
    /**            墙体 Wall Drawer           **/
    /**                                       **/
    /*******************************************/

    /**
     * 展示编辑墙体抽屉时
     * 设置墙体值的初始值
     */
    handleEditWallClick() {
      if (this.visible && !this.editWallDrawerVisible) return;
      this.editWallDrawerVisible = !this.editWallDrawerVisible;
      if (!this.editWallDrawerVisible) {
        this.handleEditWallSubmit();
        return;
      }
      this.wallThickList = this.wallRef.wallThickList();
      let geometry = this.wallRef.wallGeometryObject();
      console.log(+this.wallRef.wallThick());
      this.editWallModel = {
        wallThick: +this.wallRef.wallThick(),
        wallGeometry: geometry,
        wallInsideGeometry: this.wallRef.wallInsideGeometryObject(),
      };
      // 初始化墙体轮廓
      let showWidth = this.wallStageConfig.width;
      let showHeight = this.wallStageConfig.height;
      let thick = this.wallThickList[this.editWallModel.wallThick];
      // 构建墙体形状
      let wallGeometry = utils.generateWallGeometryObject(geometry, thick);
      const box = utils.getShapeBox(wallGeometry.coordinates);
      const scale = utils.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.editWallShapeConfig = Object.assign({}, this.editWallShapeConfig, {
        sceneFunc: utils.generateSceneFunc(
          wallGeometry.coordinates,
          scale,
          showWidth,
          showHeight
        ),
        x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
        y: -showHeight / 2 + (box.y + box.height) * scale + 0.05 * showHeight,
      });
    },
    handleEditWallDrawerClose() {},
    handleEditWallSubmit() {},
    jumpWallGeometryPalette() {
      this.$router.push({
        name: "palette",
        params: {
          drawMode: "wall",
          wallThick: this.wallRef.wallThickList()[this.wallRef.wallThick()],
          wallGeometry: this.wallRef.wallGeometryObject(),
          wallInsideGeometry: this.wallRef.wallInsideGeometryObject(),
          mapId: this.$route.params.id,
          floorId: this.currentFloor,
        },
      });
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

.edit-drawer .edit-btn-group {
  @include flex-between-middle();
}

.edit-drawer .edit-btn-group .edit-btn {
  flex-grow: 1;
}

.edit-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.edit-building-drawer .building-center {
  @include flex-between-middle($wrap: nowrap);
}

.edit-building-drawer .building-center ::v-deep .el-input .el-input__inner {
  padding-left: 50px;
}

.edit-building-drawer .building-center .input-text-prefix {
  padding: 0px 5px;
}

.edit-building-drawer .building-center .building-center-input:first-child {
  margin-right: 10px;
}

.edit-building-drawer .building-center .building-center-input {
  margin-bottom: 5px;
}

.edit-drawer .access-level {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .form-question-item {
  @include flex-between-middle($wrap: nowrap);
}

.edit-drawer .form-question-icon {
  display: block;
  margin-left: 10px;
  width: 18px;
  height: 18px;
  color: $--color-info;
}

.edit-drawer .access-level .level-container {
  margin-right: 10px;
  margin-bottom: 5px;
}

.edit-drawer .switch-container {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .switch-container .switch-text {
  color: $--color-purple-main;
  margin-left: 8px;
  font-size: 15px;
}

.edit-drawer-container .edit-floor-new {
  width: 100%;
  margin-bottom: 20px;
}

.edit-floor-form .floor-edit-geometry-container {
  @include flex-between-middle(
    $justify-content: flex-start,
    $align-items: flex-end
  );
}

.floor-edit-geometry-container .floor-edit-geometry-stage {
  border: 1px solid $--color-disabled;
  display: inline-block;
  margin-right: 10px;
}

.edit-floor-form .edit-floor-ground-item {
  margin-bottom: 0px;
}

.edit-floor-form .floor-delete-btn {
  margin-left: 10px;
}

.el-popover .floor-popover-input ::v-deep {
  margin-bottom: 10px;
}

.popover-bottom {
  text-align: right;
  margin: 0;
}

.edit-wall-form .wall-edit-geometry-container {
  @include flex-between-middle(
    $justify-content: flex-start,
    $align-items: flex-end
  );
}

.wall-edit-geometry-container .wall-edit-geometry-stage {
  border: 1px solid $--color-disabled;
  display: inline-block;
  margin-right: 10px;
}
</style>