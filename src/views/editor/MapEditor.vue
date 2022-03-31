<template>
  <div
    id="mapEditor"
    class="map-editor"
    v-loading="saveDataLoading"
    element-loading-text="上传地图信息中..."
  >
    <!-- 

      场景渲染

     -->
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

    <!-- 

      指南针

     -->
    <div class="navigate">
      <div class="navigate-bottom"></div>
      <div ref="navigatePointer" class="navigate-pointer"></div>
    </div>

    <!-- 

      楼层选择器

    -->
    <floor-choose
      class="floor-choose-container"
      :floors="floors"
      :currentFloor="currentFloor"
    ></floor-choose>

    <!-- 

      工具栏

     -->
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
      <el-button class="object-option" type="primary" plain>
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

    <!-- 

      建筑修改抽屉

     -->
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
        :before-close="handleDrawerClose"
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
              />
            </el-form-item>
            <el-form-item label="建筑类型">
              <el-select
                class="building-type-select"
                v-model="editBuildingModel.buildingType"
                filterable
                size="medium"
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
                >
                  <span class="input-text-prefix" slot="prefix">经度:</span>
                </el-input>
                <el-input
                  class="building-center-input"
                  v-model="editBuildingModel.buildingCenterLat"
                  size="medium"
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
                      >Level&nbsp;{{ level.accessLevel }}</el-radio
                    >
                  </el-tooltip>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <div class="edit-btn-group">
                <el-button
                  class="edit-btn"
                  size="medium"
                  type="primary"
                  @click="handleEditBuildingSubmit"
                  >确认</el-button
                >
                <el-button
                  class="edit-btn"
                  size="medium"
                  @click="editBuildingDrawerVisible = false"
                  >取消</el-button
                >
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>

    <!-- 

      楼层修改抽屉

     -->
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
        :visible.sync="editFloorDrawerVisible"
        :before-close="handleDrawerClose"
      >
        <div class="edit-drawer-container">
          <el-button class="edit-floor-new" size="medium">
            <svg-icon></svg-icon>新增楼层</el-button
          >
          <el-form class="edit-floor-form" label-width="100px">
            <el-form-item label="楼层底板">
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
              />
            </el-form-item>
            <el-form-item label="楼层层号">
              <el-input
                size="medium"
                v-model="editFloorModel.floorLevel"
                placeholder="请输入楼层层号"
              />
            </el-form-item>
            <el-form-item label="楼层管理">
              <el-button size="medium" type="info">复制楼层</el-button>
              <el-button size="medium" type="danger">删除楼层</el-button>
            </el-form-item>
            <el-form-item label="楼层轮廓">
              <el-button size="medium">修改轮廓</el-button>
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
                      >Level&nbsp;{{ level.accessLevel }}</el-radio
                    >
                  </el-tooltip>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <div class="edit-btn-group">
                <el-button
                  class="edit-btn"
                  size="medium"
                  type="primary"
                  @click="handleEditFloorSubmit"
                  >确认</el-button
                >
                <el-button
                  class="edit-btn"
                  size="medium"
                  @click="editFloorDrawerVisible = false"
                  >取消</el-button
                >
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
      editFloorDrawerVisible: false,
      floorMeshVisiable: true,
      allFloorVisible: true,
      editFloorModel: {
        floorName: "",
        floorLevel: 0,
        floorAccessLevel: 1,
      },
    };
  },
  computed: {
    threeWidth() {
      let scale = 1;
      if (this.editBuildingDrawerVisible || this.editFloorDrawerVisible)
        scale = 0.6;
      return this.fullScreenWidth * scale;
    },
    threeHeight() {
      return this.fullScreenHeight;
    },
  },
  created() {
    this.initObject();
    this.$route.meta.allowNext = false;
    this.$route.meta.saveData = this.getRenderCanvas;
  },
  methods: {
    async initObject() {
      const mapId = this.$route.params.id;
      let res = await api.findMapById(mapId);
      if (res.code !== 200) return;
      const data = res.data.map;
      if (typeof data === "object") {
        this.map = data.mapObject;
        for (let building of data.buildingObjects) {
          this.buildings.push(building);
        }
        for (let floor of data.floorObjects) {
          this.floors.push(floor);
        }
        let buildingInfo = this.buildings[this.currentBuilding].properties;
        let levelList = buildingInfo.building_floor_level_list;
        let level = levelList[Math.floor(levelList.length / 2)];
        this.currentFloor = buildingInfo.building_floor_level_map[level];
        for (let wall of data.wallObjects) {
          this.walls.push(wall);
        }
        for (let area of data.areaObjects) {
          this.areas.push(area);
        }
      }
      this.$nextTick(() => {
        this.$store.commit("initMapObjectRefs", this.$refs);
        this.$refs.render.startRender();
      });
    },
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
    /**
     * 展示编辑建筑抽屉时
     * 设置建筑值的初始值
     */
    handleEditBuildingClick() {
      this.editBuildingDrawerVisible = true;
      let info = this.buildings[this.currentBuilding];
      this.editBuildingModel = {
        buildingName: info.properties.building_name,
        buildingType: "" + info.properties.building_type,
        buildingCenterLng: info.properties.building_center_lng,
        buildingCenterLat: info.properties.building_center_lat,
        buildingFloorHeight: info.properties.building_floor_height,
        buildingAccessLevel: +info.properties.building_access_level,
      };
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
      const building = await api.updateBuilding(
        this.buildings[this.currentBuilding].properties.building_id,
        edit
      );
      if (building.code !== 200) {
        this.$message.error("修改建筑信息失败");
        return;
      }
      let info = building.data.building;
      Object.assign(this.buildings[this.currentBuilding].properties, info);
      this.$message.success("修改建筑信息成功");
      this.editBuildingDrawerVisible = false;
    },
    /**
     * 建筑轮廓显示隐藏设置
     */
    handleBuildingMeshVisibleChange(visible) {
      let buildingId =
        this.buildings[this.currentBuilding].properties.building_id;
      this.$refs[`building${buildingId}`][0].updateBuildingMeshVisible(visible);
    },
    /**
     * 建筑楼层高度改变
     */
    handleBuildingFloorHeightChange() {
      let buildingInfo = this.buildings[this.currentBuilding].properties;
      const height = this.editBuildingModel.buildingFloorHeight;
      let buildingId = buildingInfo.building_id;
      this.$refs[`building${buildingId}`][0].updateBuildingFloorHeightChange(
        height
      );
      let floorIdList = buildingInfo.building_attach_floor;
      for (let i = 0, len = floorIdList.length; i < len; i++) {
        let floorId = floorIdList[i];
        this.$refs[`floor${floorId}`][0].updateBuildingFloorHeightChange(
          height
        );
        let wallId = this.$refs[`floor${floorId}`][0].getFloorAttachWall();
        this.$refs[`wall${wallId}`][0].updateWallFloorHeightChange(height);
      }
    },
    handleEditFloorClick() {
      this.editFloorDrawerVisible = true;
      let floor = this.$refs[`floor${this.currentFloor}`][0].getProperties();
      this.editFloorModel.floorName = floor.floor_name;
      this.editFloorModel.floorLevel = floor.floor_level;
      this.editFloorModel.floorAccessLevel = floor.floor_access_level;
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
}

.edit-drawer-container .edit-floor-new {
  width: 100%;
  margin-bottom: 20px;
}
</style>