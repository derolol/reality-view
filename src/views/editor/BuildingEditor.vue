<template>
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
      @click.native.stop=""
    >
      <div class="edit-drawer-container">
        <el-form
          class="edit-building-form"
          label-width="100px"
        >
          <el-form-item label="建筑轮廓">
            <div class="switch-container">
              <el-switch
                @change="handleBuildingMeshVisibleChange"
                v-model="buildingMeshVisibleModel"
              />
              <span class="switch-text">{{ buildingMeshVisible ? "显示" : "隐藏" }}建筑轮廓</span>
            </div>
          </el-form-item>

          <el-form-item label="建筑名称">
            <el-input
              size="medium"
              v-model="editBuildingModel.buildingName"
              placeholder="请输入建筑名称"
              @change="touchEditBuildingChange(false)"
            />
          </el-form-item>
          <el-form-item label="建筑类型">
            <el-select
              class="building-type-select"
              v-model="editBuildingModel.buildingType"
              filterable
              size="medium"
              @change="touchEditBuildingChange(false)"
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
                @change="touchEditBuildingChange(false)"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >经度:</span>
              </el-input>
              <el-input
                class="building-center-input"
                v-model="editBuildingModel.buildingCenterLat"
                size="medium"
                @change="touchEditBuildingChange(false)"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >纬度:</span>
              </el-input>
            </div>

            <el-popover
              placement="bottom"
              width="300"
              trigger="click"
            >
              <baidu-map
                class="bm-view"
                center="南昌市南昌大学青山湖区"
                :zoom="15"
                @click="getMapClickInfo"
                @moving="syncCenterAndZoom"
                @moveend="syncCenterAndZoom"
                @zoomend="syncCenterAndZoom"
                :scroll-wheel-zoom="true"
                :map-click="false"
              >
                <bm-view style="width: 300px; height: 300px;"></bm-view>
                <bm-marker
                  :position="{lng:editBuildingModel.buildingCenterLng,lat:editBuildingModel.buildingCenterLat}"
                  :dragging="true"
                  animation="BMAP_ANIMATION_BOUNCE"
                >
                </bm-marker>
                <bm-control :offset="{ width: '100px', height: '100px' }">
                  <bm-auto-complete
                    v-model="searchKeyWord"
                    :sugStyle="{ zIndex: 999999 }"
                  >
                    <el-input
                      type="text"
                      placeholder="请输入搜索关键字"
                      v-model="searchKeyWord"
                    />
                  </bm-auto-complete>
                </bm-control>
                <bm-local-search
                  :keyword="searchKeyWord"
                  :auto-viewport="true"
                  style="display: none;"
                >
                </bm-local-search>
              </baidu-map>
              <el-button
                slot="reference"
                size="medium"
                type="success"
                class="building-center-btn"
              >获取中心经纬度</el-button>
            </el-popover>
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
                    @change="touchEditBuildingChange(false)"
                  >Level&nbsp;{{ level.accessLevel }}</el-radio>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import toolUtil from "@/utils/toolUtil";
import api from "@/request/editor";
import data from "@/utils/data";
import { mapState, mapMutations } from "vuex";
export default {
  name: "buildingEditor",
  props: {
    editBuildingDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      accessLevel: data.MapAccessLevelList,

      buildTypeGroupList: data.BuildingType,
      touchEditBuildingChangeDebounce: null,
      editBuildingModel: {
        buildingName: "",
        buildingType: "",
        buildingCenterLng: 0,
        buildingCenterLat: 0,
        buildingFloorHeight: 3,
        buildingAccessLevel: 1,
      },
      searchKeyWord: "",
      zoom: 15,
    };
  },
  watch: {
    editBuildingDrawerVisible(visible) {
      if (visible) {
        this.handleEditBuildingDrawerOn();
      } else {
        this.touchEditBuildingChange(true);
      }
    },
    buildingMeshVisible(visible) {
      this.buildingMeshVisibleModel = visible;
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      buildings: (state) => state.buildings,
      currentFloor: (state) => state.currentFloor,
      currentBuilding: (state) => state.currentBuilding,
      buildingRef: (state) => state.buildingRef,
      buildingMeshVisible: (state) => state.buildingMeshVisible,
    }),
  },
  created() {
    this.touchEditBuildingChangeDebounce = toolUtil.debounce(
      this.handleEditBuildingSubmit,
      3000
    );
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**         建筑 Building Drawer          **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发建筑信息更改事件
     */
    touchEditBuildingChange(atOnce) {
      let buildingModel = toolUtil.arraySimpleDeepCopy(this.editBuildingModel);
      this.touchEditBuildingChangeDebounce(
        atOnce,
        this.currentBuilding,
        buildingModel
      );
    },

    /**
     * 编辑建筑抽屉打开
     */
    handleEditBuildingDrawerOn() {
      this.buildingMeshVisibleModel = this.buildingMeshVisible;
      this.updateEditBuildingForm();
    },

    /**
     * 编辑建筑抽屉关闭
     */
    handleEditBuildingDrawerClose() {
      this.$emit("drawerVisibleChange", "building", false);
    },

    /**
     * 更新建筑表单信息
     */
    updateEditBuildingForm() {
      this.editBuildingModel = {
        buildingName: this.buildingRef.buildingName(),
        buildingType: "" + this.buildingRef.buildingType(),
        buildingCenterLng: this.buildingRef.buildingCenterLng(),
        buildingCenterLat: this.buildingRef.buildingCenterLat(),
        buildingFloorHeight: this.buildingRef.buildingFloorHeight(),
        buildingAccessLevel: +this.buildingRef.buildingAccessLevel(),
      };
    },

    /**
     * 提交编辑后的建筑信息
     */
    async handleEditBuildingSubmit(buildingId, buildingModel) {
      let {
        buildingName,
        buildingType,
        buildingCenterLng,
        buildingCenterLat,
        buildingFloorHeight,
        buildingAccessLevel,
      } = buildingModel;
      const edit = {
        building_name: buildingName,
        building_type: buildingType,
        building_center_lng: buildingCenterLng,
        building_center_lat: buildingCenterLat,
        building_floor_height: buildingFloorHeight,
        building_access_level: buildingAccessLevel,
      };
      this.buildingRef.updateBuildingInfo(edit);
      // 上传建筑信息
      const building = await api.updateBuilding(buildingId, edit);
      if (building.code !== 200) return;
    },

    /**
     * 建筑轮廓显示隐藏设置
     */
    handleBuildingMeshVisibleChange() {
      this.setBuildingMeshVisible(this.buildingMeshVisibleModel);
    },

    /**
     * 获取地图点击信息
     */
    getMapClickInfo(e) {
      this.editBuildingModel.buildingCenterLng = e.point.lng;
      this.editBuildingModel.buildingCenterLat = e.point.lat;
    },

    /**
     * 同步中心和缩放
     */
    syncCenterAndZoom(e) {
      const { lng, lat } = e.target.getCenter();
      this.editBuildingModel.buildingCenterLng = lng;
      this.editBuildingModel.buildingCenterLat = lat;
      this.zoom = e.target.zoom;
    },

    /**
     * 建筑楼层高度改变
     */
    handleBuildingFloorHeightChange() {
      this.touchEditBuildingChange(false);
      const height = this.editBuildingModel.buildingFloorHeight;
      // 更新建筑轮廓
      this.buildingRef.buildingFloorHeight(height);
      let floorIdList = this.buildingRef.buildingAttachFloor();
      for (let i = 0, len = floorIdList.length; i < len; i++) {
        let floorId = floorIdList[i];
        // 更新楼层高度和位置
        this.mapObjectRefs[`floor${floorId}`][0].floorHeight(height);
        // 更新墙体高度
        let wallId = this.mapObjectRefs[`floor${floorId}`][0].floorAttachWall();
        this.mapObjectRefs[`wall${wallId}`][0].wallFloorHeight(height);
      }
      this.setCurrentFloor(this.currentFloor);
    },

    ...mapMutations("mapEditorStore", [
      "setCurrentFloor",
      "setBuildingMeshVisible",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-building-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-building-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-building-drawer ::v-deep .el-form-item {
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

.edit-drawer .switch-container {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .switch-container .switch-text {
  color: $--color-purple-main;
  margin-left: 8px;
  font-size: 15px;
}
</style>