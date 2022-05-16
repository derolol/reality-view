<template>
  <!-- ------------------------------------------------------
  ###########################################################
        
                          功能区修改抽屉
  
  ###########################################################
  ------------------------------------------------------- -->
  <div>
    <el-drawer
      class="edit-drawer edit-area-drawer"
      title="编辑功能区信息"
      direction="rtl"
      size="100%"
      :modal="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
      :modal-append-to-body="false"
      :visible.sync="editAreaDrawerVisible"
      :before-close="handleEditAreaDrawerClose"
      @click.native.stop=""
    >
      <div class="edit-drawer-container">
        <el-form
          class="edit-area-form"
          label-width="100px"
        >
          <el-form-item label="功能区名称">
            <el-input
              size="medium"
              v-model="editAreaModel.areaName"
              placeholder="请输入功能区名称"
              @change="touchEditAreaChange(false)"
            />
          </el-form-item>
          <el-form-item label="功能区类型">
            <el-select
              class="area-type-select"
              v-model="editAreaModel.areaType"
              filterable
              size="medium"
              @change="handleAreaTypeChange"
            >
              <el-option
                v-for="type in areaTypeList"
                :key="'area-type-'+type.no"
                :label="type.type"
                :value="type.no"
              >
                <div class="area-type-label">
                  <div
                    class="area-type-color"
                    :style="{'background-color':`#${type.color.toString(16)}`}"
                  ></div>
                  <span>{{type.type}}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联POI">
            <el-button
              v-if="editAreaModel.areaAttachPOI != -1"
              size="medium"
              type="primary"
              @click="handleTouchEditPOI"
            >
              <svg-text
                iconName="edit"
                :iconWidth="16"
                :iconHeight="16"
                text="编辑POI"
              />
            </el-button>
            <el-button
              v-if="editAreaModel.areaAttachPOI == -1"
              size="medium"
              type="success"
              class="building-center-btn"
              @click="handleTouchCreatePOI"
            >
              <svg-text
                iconName="plus"
                :iconWidth="16"
                :iconHeight="16"
                text="添加关联POI"
              />
            </el-button>
          </el-form-item>
          </el-form-item>
          <el-form-item label="访问级别">
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
                    v-model="editAreaModel.areaAccessLevel"
                    size="medium"
                    :label="level.accessLevel"
                    border
                    @change="touchEditAreaChange(false)"
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
import polylabel from "polylabel";
export default {
  name: "areaEditor",
  props: {
    editAreaDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      accessLevel: data.MapAccessLevelList,

      areaTypeList: data.AreaType,
      touchEditAreaChangeDebounce: null,
      editAreaModel: {
        areaName: "",
        areaType: "",
        areaAttachPOI: -1,
        areaAccessLevel: 1,
      },
    };
  },
  watch: {
    editAreaDrawerVisible(visible) {
      if (visible) {
        this.handleEditAreaDrawerOn();
      } else {
        this.touchEditAreaChange(true);
        this.setCurrentArea(-1);
      }
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      areas: (state) => state.areas,
      currentArea: (state) => state.currentArea,
      currentFloor: (state) => state.currentFloor,
      areaRef: (state) => state.areaRef,
      buildingRef: (state) => state.buildingRef,
      floorRef: (state) => state.floorRef,
    }),
  },
  created() {
    this.touchEditAreaChangeDebounce = toolUtil.debounce(
      this.handleEditAreaSubmit,
      3000
    );
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**           功能区 Area Drawer           **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发功能区修改
     */
    touchEditAreaChange(atOnce) {
      let areaId = this.currentArea;
      let areaModel = toolUtil.arraySimpleDeepCopy(this.editAreaModel);
      this.touchEditAreaChangeDebounce(atOnce, areaId, areaModel);
    },

    /**
     * 功能区修改抽屉打开
     */
    handleEditAreaDrawerOn() {
      // 打开功能区编辑窗口，且当前无功能区
      if (this.areaRef === null) {
        // 设置第一个为默认功能区
        this.setCurrentArea(this.floorRef.floorAttachArea()[0]);
      }
      this.updateEditAreaForm();
      this.updateFocusArea();
    },

    /**
     * 关闭功能区修改抽屉
     */
    handleEditAreaDrawerClose() {
      this.$emit("drawerVisibleChange", "area", false);
    },

    /**
     * 更新功能区表单
     */
    updateEditAreaForm() {
      this.editAreaModel = {
        areaName: this.areaRef.areaName(),
        areaType: this.areaRef.areaType(),
        areaAttachPOI: this.areaRef.areaAttachPOI(),
        areaAccessLevel: +this.areaRef.areaAccessLevel(),
      };
    },

    /**
     * 更新聚焦功能区
     */
    updateFocusArea() {
      // 获取功能区对应结构
      let coordinates = this.areaRef.areaGeometryObject().coordinates;
      if (toolUtil.countArrayLevel(coordinates) === 4)
        coordinates = coordinates[0];
      // 获取功能区的极点
      let point = polylabel(coordinates, 1.0);
      // 获取目标楼层高度
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
      // 启动功能区对焦动画
      this.$emit("mapFocusMesh", point[0], point[1], z);
    },

    /**
     * 提交功能区修改
     */
    async handleEditAreaSubmit(areaId, areaModel) {
      let areaRef = this.mapObjectRefs[`area${areaId}`][0];
      // 获取功能区修改信息
      let info = {
        area_name: areaModel.areaName,
        area_type: areaModel.areaType,
        area_attach_poi: areaModel.areaAttachPOI,
        area_access_level: areaModel.areaAccessLevel,
      };
      // 上传功能区修改结果
      let updated = await api.updateArea(areaId, { info });
      if (updated.code !== 200) return;
      let { area_name, area_type, area_attach_poi, area_access_level } =
        updated.data.area;
      // 更新功能区属性
      areaRef.updateAreaInfo({
        area_name,
        area_type,
        area_attach_poi: JSON.parse(area_attach_poi),
        area_access_level,
      });
    },

    /**
     * 用户点击编辑当前功能区关联的POI
     */
    handleTouchEditPOI() {
      let poiId = this.areaRef.areaAttachPOI();
      this.$emit("drawerVisibleChange", "area", false);
      this.setCurrentPOI(poiId);
      this.$emit("drawerVisibleChange", "poi", true);
    },

    /**
     * 用户创建当前功能区的POI
     */
    async handleTouchCreatePOI() {
      let floor = this.currentFloor;
      let area = this.currentArea;
      let floorHeight = +this.floorRef.floorHeight();
      let coordinates = this.areaRef.areaGeometryObject().coordinates;
      // 获取功能区的极点
      let point = polylabel(coordinates, 1.0);

      // 组织创建POI数据
      let add = {
        floor,
        poi_name: "POI",
        poi_res: "100001",
        poi_geometry: JSON.stringify({
          type: "Point",
          coordinates: point,
        }),
        poi_height: floorHeight * 2,
        poi_belong_area: area,
      };

      // 上传数据
      let created = await api.createPOI(add);
      if (created.code !== 200) {
        this.$message.error("创建POI失败");
        return;
      }
      this.$message.success("创建POI成功");

      // 新增POI信息
      let newPOI = created.data.poi;
      this.addPOI(newPOI);

      let newPOIId = newPOI.properties.poi_id;
      // 更新楼层关联POI列表
      let floorRef = this.$refs[`floor${floor}`][0];
      floorRef.floorAttachPOI().push(newPOIId);
      // 更新功能区关联POI信息
      let areaRef = this.$refs[`area${area}`][0];
      areaRef.areaAttachPOI(newPOIId);
      this.editAreaModel.areaAttachPOI = newPOIId;

      this.$nextTick(() => {
        // 更新楼层POI
        floorRef.addPOIObject(newPOIId);
      });
    },

    /**
     * 处理功能区类型改变
     */
    handleAreaTypeChange() {
      this.touchEditAreaChange(false);
      this.areaRef.areaType(this.editAreaModel.areaType);
    },

    /**
     * 当点击到功能区对象时
     */
    handleClickAreaObject(areaId) {
      if (areaId === this.currentArea) return;
      let areaRef = this.mapObjectRefs[`area${areaId}`][0];

      // 获取当前功能区所在楼层
      let floorId = areaRef.areaBelongFloor();
      // 若点击的功能区不在当前楼层，则切换楼层
      if (floorId != this.currentFloor) {
        this.setCurrentFloor(floorId);
      }

      // 若此时未在编辑功能区
      if (!this.editAreaDrawerVisible) {
        this.setCurrentArea(areaId);
        this.$emit("drawerVisibleChange", "area", true);
        return;
      }

      // 立即提交功能区数据
      this.touchEditAreaChange(true);
      // 设置当前功能区
      this.setCurrentArea(areaId);
      this.updateFocusArea();
      this.updateEditAreaForm();
    },

    ...mapMutations("mapEditorStore", [
      "setCurrentArea",
      "setCurrentPOI",
      "setCurrentFloor",
      "addArea",
      "addPOI",
      "removeArea",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-area-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-area-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-area-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.el-select-dropdown .area-type-label {
  @include flex-between-middle;
}

.el-select-dropdown .area-type-color {
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.edit-drawer .access-level {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .access-level .level-container {
  margin-right: 10px;
  margin-bottom: 5px;
}
</style>