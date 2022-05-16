<template>
  <!-- ------------------------------------------------------
    ###########################################################
         
                            POI修改抽屉
    
    ###########################################################
    ------------------------------------------------------- -->
  <div>
    <el-drawer
      class="edit-drawer edit-poi-drawer"
      title="编辑POI信息"
      direction="rtl"
      size="100%"
      :modal="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
      :modal-append-to-body="false"
      :visible.sync="editPOIDrawerVisible"
      :before-close="handleEditPOIDrawerClose"
      @click.native.stop=""
    >
      <div class="edit-drawer-container">
        <el-button
          class="edit-poi-new"
          size="medium"
          @click="handlePOIAddition"
        >
          <svg-text
            iconName="plus"
            :iconWidth="16"
            :iconHeight="16"
            text="新增POI"
          />
        </el-button>
        <el-form
          v-if="currentPOI!==-1"
          class="edit-poi-form"
          label-width="80px"
        >
          <el-form-item label="POI名称">
            <el-input
              size="medium"
              v-model="editPOIModel.poiName"
              placeholder="请输入POI名称"
              @change="handlePOINameChange"
            />
          </el-form-item>
          <el-form-item label="POI类型">
            <el-select
              filterable
              size="medium"
              v-model="editPOIModel.poiRes"
              @change="handlePOIResChange"
            >
              <el-option-group
                v-for="group in mapPOIResList"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="type in group.types"
                  :key="type.no"
                  :label="type.label"
                  :value="type.no"
                >
                  <div class="poi-image-item">
                    <offset-image
                      :src="mapPOIImageList[type.path]"
                      :x="type.offsetX"
                      :y="type.offsetY"
                      :width="30"
                      :height="30"
                    />
                    <span>{{type.label}}</span>
                  </div>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="POI管理">
            <el-popover
              placement="bottom"
              trigger="manual"
              width="180"
              v-model="poiBelongAreaVisible"
            >
              <div
                class="poi-belong-area-p"
                v-if="!mapObjectRefs[`area${editPOIModel.poiBelongArea}`]"
              >当前无关联功能区</div>
              <div
                class="poi-belong-area-p"
                v-if="mapObjectRefs[`area${editPOIModel.poiBelongArea}`]"
              >当前已关联功能区
                <span class="poi-belong-area-name">
                  {{mapObjectRefs[`area${editPOIModel.poiBelongArea}`][0].areaName()}}
                </span>
              </div>
              <div class="poi-belong-area-p poi-belong-area-tip">点击屏幕功能区进行关联</div>
              <div class="popover-bottom">
                <el-button
                  size="mini"
                  type="text"
                  @click="poiBelongAreaVisible = false"
                >取消</el-button>
              </div>
              <el-button
                size="medium"
                type="info"
                slot="reference"
                @click="poiBelongAreaVisible = true"
              >
                <svg-text
                  iconName="pipe"
                  :iconWidth="16"
                  :iconHeight="16"
                  text="关联功能区"
                />
              </el-button>
            </el-popover>
            <el-popover
              placement="top"
              width="160"
              v-model="poiDeletionVisible"
            >
              <p>确定删除该POI?</p>
              <div class="popover-bottom">
                <el-button
                  size="mini"
                  type="text"
                  @click="poiDeletionVisible = false"
                >取消</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="handlePOIDeletion"
                >确定</el-button>
              </div>
              <el-button
                class="poi-delete-btn"
                size="medium"
                type="danger"
                slot="reference"
              >
                <svg-text
                  iconName="delete"
                  :iconWidth="16"
                  :iconHeight="16"
                  text="删除POI"
                />
              </el-button>
            </el-popover>
          </el-form-item>
          <el-form-item label="POI位置">
            <div class="poi-center">
              <el-input
                class="poi-center-input"
                v-model="editPOIModel.poiPosX"
                size="medium"
                @change="handlePOIPositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >x:</span>
              </el-input>
              <el-input
                class="poi-center-input"
                v-model="editPOIModel.poiPosY"
                size="medium"
                @change="handlePOIPositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >y:</span>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item label="POI高度">
            <el-input
              v-model="editPOIModel.poiHeight"
              size="medium"
              @change="handlePOIHeightChange"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import data from "@/utils/data";
import geometryUtil from "@/utils/geometryUtil";
import toolUtil from "@/utils/toolUtil";
import api from "@/request/editor";
import OffsetImage from "./OffsetImage.vue";
export default {
  name: "poi",
  props: {
    editPOIDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  components: {
    OffsetImage,
  },
  data() {
    return {
      touchEditPOIChangeDebounce: null,
      editPOIModel: {
        poiName: "",
        poiRes: "",
        poiPosX: 0,
        poiPosY: 0,
        poiHeight: 0,
        poiBelongArea: "",
      },
      poiBelongAreaVisible: false,
      poiDeletionVisible: false,
    };
  },
  watch: {
    editPOIDrawerVisible(visible) {
      if (visible) {
        this.handleEditPOIDrawerOn();
      } else {
        this.touchEditPOIChange(true);
        this.setCurrentPOI(-1);
      }
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      pois: (state) => state.pois,
      currentPOI: (state) => state.currentPOI,
      currentFloor: (state) => state.currentFloor,
      poiRef: (state) => state.poiRef,
      floorRef: (state) => state.floorRef,
      buildingRef: (state) => state.buildingRef,
      mapPOIImageList: (state) => state.mapPOIImageList,
      mapPOIResList: (state) => state.mapPOIResList,
    }),
  },
  created() {
    this.touchEditPOIChangeDebounce = toolUtil.debounce(
      this.handleEditPOISubmit,
      3000
    );
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**           兴趣点 POI Drawer            **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发POI修改
     */
    touchEditPOIChange(atOnce) {
      let poiId = this.currentPOI;
      let poiModel = toolUtil.arraySimpleDeepCopy(this.editPOIModel);
      this.touchEditPOIChangeDebounce(atOnce, poiId, poiModel);
    },

    /**
     * 打开POI编辑抽屉
     */
    handleEditPOIDrawerOn() {
      // 若当前无聚焦POI
      if (this.poiRef === null) {
        let pois = this.floorRef.floorAttachPOI();
        // 若该楼层无POI则退出
        if (pois.length <= 0) return;
        // 设置当前POI
        this.setCurrentPOI(pois[0]);
      }
      this.updateEditPOIForm();
      this.updateFocusPOI();
    },

    /**
     * 关闭POI编辑抽屉
     */
    handleEditPOIDrawerClose() {
      this.$emit("drawerVisibleChange", "poi", false);
    },

    /**
     * 更新表单内容为当前连通区域
     */
    updateEditPOIForm() {
      if (this.currentPOI === -1 || this.poiRef === null) return;
      let coordinates = this.poiRef.poiGeometryObject().coordinates;
      this.editPOIModel = {
        poiName: this.poiRef.poiName(),
        poiRes: this.poiRef.poiRes(),
        poiPosX: coordinates[0],
        poiPosY: coordinates[1],
        poiHeight: this.poiRef.poiHeight(),
        poiBelongArea: this.poiRef.poiBelongArea(),
      };
    },

    /**
     * 更新当前聚焦的功能区
     */
    updateFocusPOI() {
      if (this.currentPOI === -1 || this.poiRef === null) return;
      // 获取POI位置
      let coordinates = this.poiRef.poiGeometryObject().coordinates;
      // 获取目标楼层高度
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
      console.log(this.floorRef.floorLevel());
      console.log(this.buildingRef.buildingFloorHeight());
      z += this.poiRef.poiHeight() * zScale;
      // 启动功能区对焦动画
      this.$emit("mapFocusMesh", coordinates[0], coordinates[1], z);
    },

    /**
     * 提交POI信息
     */
    async handleEditPOISubmit(poiId, poiModel) {
      let poiRef = this.mapObjectRefs[`poi${poiId}`][0];
      // 构建POI信息
      let info = {
        poi_name: poiModel.poiName,
        poi_res: poiModel.poiRes,
        poi_geometry: JSON.stringify({
          type: "Point",
          coordinates: [poiModel.poiPosX, poiModel.poiPosY],
        }),
        poi_height: poiModel.poiHeight,
        poi_belong_area: poiModel.poiBelongArea,
      };
      // 上传POI数据
      let updated = await api.updatePOI(poiId, info);
      if (updated.code !== 200) return;
      // 获取修改后POI的数据
      let { poi_name, poi_res, poi_geometry, poi_height, poi_belong_area } =
        updated.data.poi;
      // 更新当前POI数据
      poiRef.updatePOIInfo({
        poi_name,
        poi_res,
        poi_height,
        poi_belong_area,
      });
      poiRef.poiGeometryObject(JSON.parse(poi_geometry).coordinates);
    },

    /**
     * 新增POI
     */
    async handlePOIAddition() {
      let floor = +this.currentFloor;
      let floorHeight = +this.floorRef.floorHeight();
      let coordinates = this.floorRef.floorGeometryObject().coordinates;
      // 随机楼层轮廓范围一点
      let box = geometryUtil.getCoordinatesBox(coordinates);
      let x = Math.floor(box.x + box.width * Math.random());
      let y = Math.floor(box.y + box.height * Math.random());
      // 组织创建POI数据
      let add = {
        floor,
        poi_name: "POI",
        poi_res: "100001",
        poi_geometry: JSON.stringify({
          type: "Point",
          coordinates: [x, y],
        }),
        poi_height: floorHeight * 2,
        poi_belong_area: -1,
      };
      // 上传创建POI数据
      let created = await api.createPOI(add);
      if (created.code !== 200) {
        this.$message.error("创建POI失败");
        return;
      }
      this.$message.success("创建POI成功");
      // 新增POI
      let newPOI = created.data.poi;
      let newPOIId = newPOI.properties.poi_id;
      this.addPOI(newPOI);
      let floorRef = this.mapObjectRefs[`floor${floor}`][0];
      // 更新楼层关联POI列表
      floorRef.floorAttachPOI().push(newPOIId);

      this.$nextTick(() => {
        // 渲染新增楼层POI
        floorRef.addPOIObject(newPOIId);
        // 设置当前聚焦POI
        this.setCurrentPOI(newPOIId);
        this.updateEditPOIForm();
        this.updateFocusPOI();
      });
    },

    /**
     * 删除POI
     */
    async handlePOIDeletion() {
      let floor = +this.currentFloor;
      let deletePOIId = +this.currentPOI;
      // 上传删除信息
      let deleted = await api.deletePOI(floor, deletePOIId);
      if (deleted.code !== 200) {
        this.$message.error("删除失败：请重试");
        this.poiDeletionVisible = false;
        return;
      }

      this.$message.success("删除POI成功");
      // 删除该POI数据
      this.removePOI(deletePOIId);
      // 更新楼层关联POI
      let floorRef = this.mapObjectRefs[`floor${floor}`][0];
      let poiIdList = floorRef.floorAttachPOI();
      let poiIdIndex = poiIdList.findIndex((v) => v == deletePOIId);
      poiIdList.splice(poiIdIndex, 1);
      // 更新功能区关联POI
      let areaId = this.mapObjectRefs[`poi${deletePOIId}`][0].poiBelongArea();
      if (areaId != -1) {
        this.mapObjectRefs[`area${areaId}`][0].areaAttachPOI(-1);
      }

      // 关闭询问窗口
      this.poiDeletionVisible = false;
      // 关闭POI编辑抽屉
      this.$emit("drawerVisibleChange", "poi", false);
    },

    /**
     * 修改POI名称
     */
    handlePOINameChange() {
      this.touchEditPOIChange(false);
      this.poiRef.poiName(this.editPOIModel.poiName);
    },

    /**
     * 修改POI位置
     */
    handlePOIPositionChange() {
      this.touchEditPOIChange(false);
      this.poiRef.poiGeometryObject(
        toolUtil.arraySimpleDeepCopy([
          this.editPOIModel.poiPosX,
          this.editPOIModel.poiPosY,
        ])
      );
    },

    /**
     * 修改POI高度
     */
    handlePOIHeightChange() {
      this.touchEditPOIChange(false);
      this.poiRef.poiHeight(this.editPOIModel.poiHeight);
    },

    /**
     * 修改POI资源
     */
    handlePOIResChange() {
      this.touchEditPOIChange(false);
      this.poiRef.poiRes(this.editPOIModel.poiRes);
    },

    /**
     * 处理用户点击POI对象
     */
    handleClickPOIObject(poiId) {
      // 当用户处于POI关联功能区状态，忽略其他点击
      if (this.editPOIDrawerVisible && this.poiBelongAreaVisible) return;

      // 获取当前POI所在楼层
      let floorId = this.mapObjectRefs[`poi${poiId}`][0].poiBelongFloor();
      // 若点击的POI不在当前楼层，则切换楼层
      if (floorId != this.currentFloor) {
        this.setCurrentFloor(floorId);
      }

      // 若此时未在编辑功能区
      if (!this.editPOIDrawerVisible) {
        this.setCurrentPOI(poiId);
        this.$emit("drawerVisibleChange", "poi", true);
        return;
      }

      // 立即提交功能区数据
      this.touchEditPOIChange(true);

      // 设置当前POI对象
      this.setCurrentPOI(poiId);

      // 更新表单并聚焦
      this.updateEditPOIForm();
      this.updateFocusPOI();
    },

    /**
     * 用户点击功能区
     */
    handleClickAreaObject(areaId) {
      // 仅当处于编辑POI关联功能区状态时响应
      if (!this.poiBelongAreaVisible) return false;
      // 获取相应功能区对象
      let areaRef = this.mapObjectRefs[`area${areaId}`][0];

      // 判断当前功能区是否已关联POI
      if (
        typeof +areaRef.areaAttachPOI() === "number" &&
        +areaRef.areaAttachPOI() !== -1
      ) {
        this.$message.warning("当前功能区已关联POI");
        return;
      }

      // 若当前POI已有关联功能区，移除该关联
      let curBelongAreaId = +this.editPOIModel.poiBelongArea;
      if (typeof curBelongAreaId === "number" && curBelongAreaId !== -1) {
        this.mapObjectRefs[`area${curBelongAreaId}`][0].areaAttachPOI(-1);
      }

      // 设置当前POI关联功能区
      this.editPOIModel.poiBelongArea = areaId;
      areaRef.areaAttachPOI(this.currentPOI);

      // 获取功能区轮廓
      let coordinates = areaRef.areaGeometryObject().coordinates;
      if (toolUtil.countArrayLevel(coordinates) === 4)
        coordinates = coordinates[0];
      // 获取功能区的极点
      let point = polylabel(coordinates, 1.0);
      point = point.map((p) => Math.floor(p * 100) / 100);
      this.editPOIModel.poiPosX = point[0];
      this.editPOIModel.poiPosY = point[1];
      // 更新POI坐标
      this.poiRef.poiGeometryObject(
        toolUtil.arraySimpleDeepCopy([point[0], point[1]])
      );
      // 更新POI聚焦位置
      this.updateFocusPOI();

      // 退出关联功能区模式
      this.poiBelongAreaVisible = false;
      this.$message.success("关联功能区成功");

      // 立即更新POI信息
      this.touchEditPOIChange(true);
      return true;
    },

    ...mapMutations("mapEditorStore", [
      "setCurrentPOI",
      "setCurrentFloor",
      "addPOI",
      "removePOI",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-poi-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-poi-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-poi-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.edit-poi-drawer .poi-center {
  @include flex-between-middle($wrap: nowrap);
}

.edit-poi-drawer .poi-center .input-text-prefix {
  padding: 0px 5px;
}

.edit-poi-drawer .poi-center .poi-center-input:first-child {
  margin-right: 10px;
}

.edit-drawer-container .edit-poi-new {
  width: 100%;
  margin-bottom: 20px;
}

.edit-poi-form .poi-delete-btn {
  margin-left: 10px;
}

.el-popover .poi-popover-input ::v-deep {
  margin-bottom: 10px;
}

.el-select-group .poi-image-item {
  height: 100%;
  @include flex-between-middle;
}

.el-select-group .el-select-dropdown__item {
  height: 36px;
}

.el-popover .poi-belong-area-name {
  color: $--color-purple-main;
  font-weight: 900;
}

.el-popover .poi-belong-area-tip {
  color: $--color-text;
}

.el-popover .poi-belong-area-p {
  margin: 4px;
}

.popover-bottom {
  text-align: right;
  margin: 0;
}
</style>