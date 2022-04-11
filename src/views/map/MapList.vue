<template>
  <div class="map-list">
    <div class="map-list-header">
      <div>
        <el-button type="primary" @click="createMap">创建地图</el-button>
        <el-button @click="importDialogVisible = true">导入地图</el-button>
      </div>
      <el-input class="header-search" placeholder="搜索地图"
        ><svg-icon
          slot="prefix"
          iconName="search"
          iconClass="header-search-icon"
      /></el-input>
    </div>
    <div class="map-list-container">
      <el-row :gutter="20">
        <el-col :span="6" v-for="map in mapList" :key="'map-card' + map.map_id">
          <map-card
            :imagePath="map.map_preview_path"
            :mapInfo="map"
            @getMapList="getMapList"
          ></map-card>
        </el-col>
        <el-col :span="6">
          <map-card newMap @click.native="createMap"></map-card>
        </el-col>
      </el-row>
    </div>

    <!-- 
      
      创建地图
      
    -->
    <el-dialog
      title="创建地图"
      :visible.sync="createMapDialogVisible"
      :before-close="handleCreateMapClose"
    >
      <el-form class="create-map-form" label-width="100px">
        <el-form-item label="地图名称">
          <el-input
            v-model="createMapModel.mapName"
            size="medium"
            placeholder="请输入地图名称"
          />
        </el-form-item>
        <el-form-item label="地图标签">
          <el-select
            class="map-tag-select"
            v-model="createMapModel.mapTags"
            multiple
            filterable
            allow-create
            default-first-option
            size="medium"
            @change="createMapTagChange"
          >
            <el-option
              v-for="tag in mapTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地图关联建筑">
          <el-tooltip
            :content="
              mapBuildingUpdated ? '点击修改建筑' : '点击为地图添加建筑'
            "
            placement="top"
          >
            <el-button size="medium" @click="createBuilding">
              <div class="create-map-building">
                <svg-icon
                  :iconName="mapBuildingUpdated ? 'edit' : 'plus'"
                  iconClass="btn-icon"
                />
                <span>{{ mapBuildingUpdated ? "修改建筑" : "创建建筑" }}</span>
              </div>
            </el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="地图访问级别">
          <div class="map-access-level">
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
                  v-model="createMapModel.mapAccessLevel"
                  size="medium"
                  :label="level.accessLevel"
                  border
                  >Level&nbsp;{{ level.accessLevel }}</el-radio
                >
              </el-tooltip>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateMap">取 消</el-button>
        <el-button type="primary" @click="confirmCreateMap">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 
      
      创建建筑

    -->
    <el-dialog
      title="创建建筑"
      :visible.sync="createBuildingDialogVisible"
      :before-close="handleCreateBuildingClose"
    >
      <el-form class="create-building-form" label-width="100px">
        <el-form-item label="建筑名称">
          <el-input
            v-model="createBuildingModel.buildingName"
            size="medium"
            placeholder="请输入建筑名称"
          />
        </el-form-item>
        <el-form-item label="建筑类型">
          <el-select
            class="building-type-select"
            v-model="createBuildingModel.buildingType"
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
              v-model="createBuildingModel.buildingCenterLng"
              size="medium"
            >
              <span class="input-text-prefix" slot="prefix">经度:</span>
            </el-input>
            <el-input
              v-model="createBuildingModel.buildingCenterLat"
              size="medium"
            >
              <span class="input-text-prefix" slot="prefix">纬度:</span>
            </el-input>
            <el-button size="medium" type="success" class="building-center-btn"
              >获取中心经纬度</el-button
            >
          </div>
        </el-form-item>
        <el-form-item label="建筑楼层高度">
          <el-input
            v-model="createBuildingModel.buildingFloorHeight"
            size="medium"
            @blur="handleBuildingFloorHeightChange"
          />
        </el-form-item>
        <el-form-item label="建筑轮廓">
          <div class="building-geometry-container">
            <v-stage
              ref="stage"
              :config="stageConfig"
              class="building-geometry-stage"
            >
              <v-layer>
                <v-shape ref="shape" :config="buildingGeometryConfig" />
              </v-layer>
            </v-stage>
            <el-button
              type="primary"
              size="medium"
              @click="handleBuildingGeometryPaint"
              >建筑轮廓绘制</el-button
            >
          </div>
        </el-form-item>
        <el-form-item label="建筑访问级别">
          <div class="building-access-level">
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
                  v-model="createBuildingModel.buildingAccessLevel"
                  size="medium"
                  :label="level.accessLevel"
                  border
                  >Level&nbsp;{{ level.accessLevel }}</el-radio
                >
              </el-tooltip>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateBuilding">取 消</el-button>
        <el-button type="primary" @click="confirmCreateBuilding"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <!--
      
      导入地图
      
    -->
    <el-dialog title="导入地图" :visible.sync="importDialogVisible">
      <el-form label-width="100px">
        <el-form-item label="活动名称">
          <el-input autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="importDialogVisible = false"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import data from "@/store/data";
import request from "@/request/editor";
import MapCard from "./MapCard.vue";
import geometryUtil from "@/store/geometryUtil";
export default {
  name: "mapList",
  components: { MapCard },
  data() {
    return {
      mapList: [],

      accessLevel: data.MapAccessLevelList,

      createMapDialogVisible: false,
      mapTags: data.MapTagList,
      createMapModel: {
        mapName: "",
        mapTags: [],
        mapAttachBuilding: [],
        mapAccessLevel: 1,
      },
      mapBuildingUpdated: false,

      createBuildingDialogVisible: false,
      buildTypeGroupList: data.BuildingType,
      createBuildingModel: {
        buildingName: "",
        buildingType: "",
        buildingCenterLng: 0,
        buildingCenterLat: 0,
        buildingFloorHeight: 3,
        buildingGeometry: {},
        buildingAccessLevel: 1,
      },
      stageConfig: {
        width: 100,
        height: 60,
      },
      buildingGeometryConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 2,
        name: "shape",
        strokeScaleEnabled: false, // 缩放不影响描边粗细
      },

      importDialogVisible: false,

      alreadyCreated: false,
      autoSaveDataTimer: null,
    };
  },
  watch: {
    createMapDialogVisible() {
      this.$router.replace({
        query: {
          map: this.createMapDialogVisible,
          building: this.createBuildingDialogVisible,
        },
      });
    },
    createBuildingDialogVisible() {
      this.$router.replace({
        query: {
          map: this.createMapDialogVisible,
          building: this.createBuildingDialogVisible,
        },
      });
    },
  },
  created() {
    this.getMapList();
    this.rebuildPageData();
    this.alreadyCreated = true;
    this.autoSaveDataTimer = setInterval(() => {
      this.saveDataLocal();
    }, 2000);
  },
  activated() {
    if (this.alreadyCreated) return;
    this.rebuildPageData();
  },
  deactivated() {
    this.saveDataLocal();
    if (this.autoSaveDataTimer) {
      clearInterval(this.autoSaveDataTimer);
    }
  },
  destroyed() {
    this.saveDataLocal();
    if (this.autoSaveDataTimer) {
      clearInterval(this.autoSaveDataTimer);
    }
  },
  methods: {
    /**
     * 获取所有地图
     */
    async getMapList() {
      const maps = await request.getMapList();
      if (maps.code !== 200 || typeof maps.data.maps !== "object") {
        this.$message.error("获取地图列表失败");
        return;
      }
      this.mapList.splice(0, this.mapList.length, ...maps.data.maps);
    },
    /**
     * 创建建筑实体
     */
    async createMapObject() {
      let mapInfo = {
        map_name: this.createMapModel.mapName,
        map_tag: JSON.stringify(this.createMapModel.mapTags),
        map_attach_building: JSON.stringify([]),
        map_owner: this.$store.state.currentInfo.user_id,
        map_access_level: this.createMapModel.mapAccessLevel,
      };
      const map = await request.createMap(mapInfo);
      if (map.code !== 200) {
        throw Error(`创建地图失败:${map.message}`);
      }
      let mapRes = map.data.map;
      let mapId = mapRes !== null ? mapRes.map_id : -1;
      let buildingInfo = {
        building_name: this.createBuildingModel.buildingName,
        building_type: this.createBuildingModel.buildingType,
        building_center_lng: this.createBuildingModel.buildingCenterLng,
        building_center_lat: this.createBuildingModel.buildingCenterLat,
        building_floor_height: this.createBuildingModel.buildingFloorHeight,
        building_geometry: JSON.stringify(
          this.createBuildingModel.buildingGeometry
        ),
        building_belong_map: mapId,
        building_attach_floor: JSON.stringify([]),
        building_owner: this.$store.state.currentInfo.user_id,
        building_access_level: this.createBuildingModel.buildingAccessLevel,
      };
      const building = await request.createBuilding(buildingInfo);
      if (building.code !== 200) {
        await request.deleteMap(mapId);
        throw Error(`创建建筑失败:${building.message}`);
      }
      this.$message.info("创建地图成功");
      this.mapList.push(map.data.map);
    },
    /**
     * 创建标签时判断标签个数
     */
    createMapTagChange() {
      let len = this.createMapModel.mapTags.length;
      if (len > 5) {
        this.createMapModel.mapTags.splice(len - 1, 1);
        this.$message.info({ message: "仅限选择5个标签" });
      }
    },
    /**
     * 显示创建地图对话框
     */
    createMap() {
      this.createMapDialogVisible = true;
    },
    /**
     * 显示创建建筑对话框
     */
    createBuilding() {
      this.createMapDialogVisible = false;
      this.createBuildingDialogVisible = true;
    },
    /**
     * 取消创建地图
     */
    cancelCreateMap() {
      this.createMapDialogVisible = false;
      this.mapBuildingUpdated = false;
      this.initMapData();
      this.initBuildingData();
    },
    /**
     * 确认创建地图
     */
    confirmCreateMap() {
      this.createMapObject()
        .then(() => {
          this.createMapDialogVisible = false;
          this.mapBuildingUpdated = false;
          this.initMapData();
          this.initBuildingData();
        })
        .catch((err) => {
          console.error(err);
          this.$message.error("创建地图失败，请重试!");
        });
    },
    /**
     * 取消创建建筑
     */
    cancelCreateBuilding() {
      this.createBuildingDialogVisible = false;
      this.createMapDialogVisible = true;
      this.mapBuildingUpdated = false;
      this.initBuildingData();
    },
    /**
     * 确认创建建筑
     */
    confirmCreateBuilding() {
      this.createBuildingDialogVisible = false;
      this.createMapDialogVisible = true;
      this.mapBuildingUpdated = true;
    },
    /**
     * 当创建地图窗口被关闭时阻塞处理
     */
    handleCreateMapClose(done) {
      this.$confirm("确认关闭窗口？（数据将不会被保存）")
        .then(() => {
          this.mapBuildingUpdated = false;
          this.initMapData();
          this.initBuildingData();
          done();
        })
        .catch(() => {});
    },
    /**
     * 当创建建筑窗口被关闭时阻塞处理
     */
    handleCreateBuildingClose(done) {
      this.$confirm("确认关闭窗口？（数据将不会被保存）")
        .then(() => {
          this.mapBuildingUpdated = false;
          this.initBuildingData();
          done();
        })
        .catch(() => {});
    },
    /**
     * 跳转到画板页面
     * 绘制建筑轮廓
     */
    handleBuildingGeometryPaint() {
      this.$router.push({ name: "palette", params: { drawMode: "building" } });
    },
    /**
     * 根据当前获取的绘制点
     * 绘制轮廓形状预览图
     */
    setBuildingGeometryConfig() {
      const showWidth = this.stageConfig.width;
      const showHeight = this.stageConfig.height;
      const box = geometryUtil.getCoordinatesBox(
        this.createBuildingModel.buildingGeometry.coordinates
      );
      const scale = geometryUtil.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.buildingGeometryConfig = Object.assign(
        {},
        this.buildingGeometryConfig,
        {
          sceneFunc: geometryUtil.generateSceneFunc(
            this.createBuildingModel.buildingGeometry.coordinates,
            scale,
            showWidth,
            showHeight
          ),
          x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
          y: -showHeight / 2 + (box.y + box.height) * scale + 0.05 * showHeight,
        }
      );
    },
    /**
     * 当用户修改input时触发数据保存到本地
     */
    saveDataLocal() {
      localStorage.setItem(
        "reality-maps-create-map-model",
        JSON.stringify(this.createMapModel)
      );
      localStorage.setItem(
        "reality-maps-create-building-model",
        JSON.stringify(this.createBuildingModel)
      );
      localStorage.setItem("reality-maps-map", this.createMapDialogVisible);
      localStorage.setItem(
        "reality-maps-building",
        this.createBuildingDialogVisible
      );
    },
    /**
     * 初始化地图数据
     */
    initMapData() {
      this.createMapModel = Object.assign(
        {},
        {
          mapName: "",
          mapTags: [],
          mapAttachBuilding: [],
          mapAccessLevel: 1,
        }
      );
      localStorage.setItem(
        "reality-maps-create-map-model",
        JSON.stringify(this.createMapModel)
      );
    },
    /**
     * 初始化建筑数据
     */
    initBuildingData() {
      this.createBuildingModel = Object.assign(
        {},
        {
          buildingName: "",
          buildingType: "",
          buildingCenterLng: 0,
          buildingCenterLat: 0,
          buildingFloorHeight: 3,
          buildingGeometry: {},
          buildingAccessLevel: 1,
        }
      );
      localStorage.setItem(
        "reality-maps-create-building-model",
        JSON.stringify(this.createBuildingModel)
      );
    },
    rebuildPageData() {
      // 控制对话框的显示及隐藏
      let showCreateMap = localStorage.getItem("reality-maps-map");
      let showCreateBuilding = localStorage.getItem("reality-maps-building");
      // 创建地图对话框
      if (showCreateMap !== null) {
        if (typeof showCreateMap === "string") {
          this.createMapDialogVisible = showCreateMap === "true";
        } else if (typeof showCreateMap === "boolean") {
          this.createMapDialogVisible = showCreateMap;
        }
      }
      // 创建建筑对话框
      if (showCreateBuilding !== null) {
        if (typeof showCreateBuilding === "string") {
          this.createBuildingDialogVisible = showCreateBuilding === "true";
        } else if (typeof showCreateMap === "boolean") {
          this.createBuildingDialogVisible = showCreateBuilding;
        }
      }
      // 若本地存储数据则恢复本地地图数据
      let mapInfo = localStorage.getItem("reality-maps-create-map-model");
      if (mapInfo) {
        this.createMapModel = JSON.parse(mapInfo);
      }
      // 若本地存储数据则恢复本地建筑数据
      let buildingInfo = localStorage.getItem(
        "reality-maps-create-building-model"
      );
      if (buildingInfo) {
        this.createBuildingModel = JSON.parse(buildingInfo);
      }
      // 获取完成绘制的轮廓
      let geometry = this.$route.params.geometry;
      if (
        geometry !== null &&
        typeof geometry === "object" &&
        geometry.hasOwnProperty("coordinates")
      ) {
        this.createBuildingModel.buildingGeometry = Object.assign({}, geometry);
        this.$nextTick(() => {
          this.setBuildingGeometryConfig();
        });
      }
    },
    handleBuildingFloorHeightChange() {},
  },
};
</script>

<style lang="scss" scoped>
.map-list-header {
  @include flex-between-middle;
  margin-bottom: 20px;
}

.header-search {
  width: 300px;
}

.header-search ::v-deep .el-input__prefix {
  @include flex-between-middle($justify-content: flex-start);
}

.header-search-icon {
  width: 20px;
  height: 20px;
  margin-left: 5px;
}

.create-map-form .el-form-item,
.create-building-form .el-form-item {
  margin-bottom: 10px;
}

.create-map-form .map-access-level,
.create-building-form .building-access-level {
  @include flex-between-middle($justify-content: flex-start);
}

.level-container {
  margin-right: 10px;
}

.create-map-form .map-tag-select {
  width: 100%;
}

.create-map-form .create-map-building {
  @include flex-between-middle($justify-content: flex-start);
}

.create-map-form .create-map-building .btn-icon {
  margin-left: -3px;
  margin-right: 5px;
  width: 17px;
  height: 17px;
}

.create-building-form .building-type-select {
  width: 100%;
}

.create-building-form .building-center {
  @include flex-between-middle($justify-content: space-between, $wrap: nowrap);
}

.create-building-form .building-center .input-text-prefix {
  padding: 0 10px;
}

.building-center .el-input--prefix ::v-deep .el-input__inner {
  padding-left: 55px;
}

.create-building-form .building-center .el-input {
  margin-right: 10px;
}

.create-building-form .building-geometry-stage {
  border: 1px solid $--color-disabled;
  display: inline-block;
  margin-right: 10px;
}

.create-building-form .building-geometry-container {
  @include flex-between-middle(
    $justify-content: flex-start,
    $align-items: flex-end
  );
}

// 为对话框提供动画
.map-list ::v-deep .el-dialog__wrapper {
  transition-duration: 0.3s;
}

.dialog-fade-enter-active {
  animation: none !important;
}
.dialog-fade-leave-active {
  transition-duration: 0.15s !important;
  animation: none !important;
}

.dialog-fade-enter-active ::v-deep .el-dialog,
dialog-fade-leave-active ::v-deep .el-dialog {
  animation-fill-mode: forwards;
}

.dialog-fade-enter-active ::v-deep .el-dialog {
  animation-duration: 0.3s;
  animation-name: anim-open;
  animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
}

.dialog-fade-leave-active ::v-deep .el-dialog {
  animation-duration: 0.3s;
  animation-name: anim-close;
}

@keyframes anim-open {
  0% {
    opacity: 0;
    transform: scale3d(0, 0, 1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes anim-close {
  0% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
  100% {
    opacity: 0;
    transform: scale3d(0, 0, 1);
  }
}
</style>