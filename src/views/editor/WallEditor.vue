<template>
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
      @click.native.stop=""
    >
      <div class="edit-drawer-container">
        <el-form
          class="edit-wall-form"
          label-width="100px"
        >
          <el-form-item label="墙体厚度">
            <el-select
              size="medium"
              v-model="editWallModel.wallThick"
              @change="handleWallThickChange"
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
                <v-layer>
                  <v-shape :config="editWallShapeConfig"></v-shape>
                </v-layer>
              </v-stage>
              <el-button
                size="medium"
                @click="jumpWallGeometryPalette"
              >
                <svg-text
                  iconName="pencil"
                  :iconWidth="16"
                  :iconHeight="16"
                  text="修改轮廓"
                />
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import toolUtil from "@/utils/toolUtil";
import geometryUtil from "@/utils/geometryUtil";
import api from "@/request/editor";
import { mapState, mapMutations } from "vuex";
export default {
  name: "wallEditor",
  props: {
    editWallDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      touchEditWallChangeDebounce: null,
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
        strokeWidth: 1,
        name: "shape",
        strokeScaleEnabled: false,
      },
    };
  },
  watch: {
    editWallDrawerVisible(visible) {
      if (visible) {
        this.handleEditWallDrawerOn();
      } else {
        this.touchEditWallChange(true);
      }
    },
    currentFloor(oldFloor, newFloor) {
      this.wallThickList = this.wallRef.wallThickList();
      this.updateEditWallForm();
      this.updateEditWallShape();
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      walls: (state) => state.walls,
      areas: (state) => state.areas,
      currentWall: (state) => state.currentWall,
      currentFloor: (state) => state.currentFloor,
      wallRef: (state) => state.wallRef,
      floorRef: (state) => state.floorRef,
    }),
  },
  created() {
    this.touchEditWallChangeDebounce = toolUtil.debounce(
      this.handleEditWallSubmit,
      3000
    );
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**            墙体 Wall Drawer           **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发墙体信息改变
     */
    touchEditWallChange(atOnce, areas) {
      let floorId = this.currentFloor;
      let wallId = +this.floorRef.floorAttachWall();
      let wallModel = toolUtil.arraySimpleDeepCopy(this.editWallModel);
      this.touchEditWallChangeDebounce(
        atOnce,
        floorId,
        wallId,
        wallModel,
        areas
      );
    },

    /**
     * 编辑墙体抽屉打开
     */
    handleEditWallDrawerOn() {
      this.wallThickList = this.wallRef.wallThickList();
      this.updateEditWallForm();
      this.updateEditWallShape();
    },

    /**
     * 编辑墙体抽屉关闭
     */
    handleEditWallDrawerClose() {
      this.$emit("drawerVisibleChange", "wall", false);
    },

    /**
     * 更新墙体表单
     */
    updateEditWallForm() {
      let wallGeometry = this.wallRef.wallGeometryObject();
      let wallInsideGeometry = this.wallRef.wallInsideGeometryObject();
      this.editWallModel = {
        wallThick: +this.wallRef.wallThick(),
        wallGeometry,
        wallInsideGeometry,
      };
    },

    /**
     * 更新墙体形状
     */
    updateEditWallShape() {
      // 初始化墙体轮廓
      let showWidth = this.wallStageConfig.width;
      let showHeight = this.wallStageConfig.height;
      let thick = this.wallThickList[+this.editWallModel.wallThick - 1];
      let wallGeometry = toolUtil.arraySimpleDeepCopy(
        this.wallRef.wallGeometryObject()
      );
      let wallInsideGeometry = toolUtil.arraySimpleDeepCopy(
        this.wallRef.wallInsideGeometryObject()
      );
      // 构建墙体形状
      let { shapeCoordinates } = geometryUtil.generateWallCoordinates(
        wallGeometry.coordinates,
        wallInsideGeometry.coordinates,
        thick
      );
      // 获取墙体外接矩形
      const box = geometryUtil.getCoordinatesBox(shapeCoordinates);
      // 获取缩放比例
      const scale = geometryUtil.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.editWallShapeConfig = Object.assign({}, this.editWallShapeConfig, {
        // 构造绘制函数
        sceneFunc: geometryUtil.generateSceneFunc(
          shapeCoordinates,
          scale,
          showWidth,
          showHeight
        ),
        x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
        y: -showHeight / 2 + (box.y + box.height) * scale + 0.05 * showHeight,
      });
    },

    /**
     * 处理墙体信息上传
     */
    async handleEditWallSubmit(floorId, wallId, wallModel, areas = null) {
      let update = false;
      let wallRef = this.mapObjectRefs[`wall${wallId}`][0];
      const edit = {
        wall_thick: wallModel.wallThick,
        wall_geometry: JSON.stringify(wallModel.wallGeometry),
        wall_inside_geometry: JSON.stringify(wallModel.wallInsideGeometry),
      };
      // 若无传递的area值，则假设仅发生墙体变化，功能区按排序顺序修改geometry
      if (areas === null) {
        update = true;
        // 获取当前楼层的功能区及其对应的id
        let currentAreaCoordinatesList = this.areas
          .filter(
            (area) => +area.properties.area_belong_floor === +this.currentFloor
          )
          .map((area) => ({
            area_id: area.properties.area_id,
            coordinates: area.geometry.coordinates,
          }));
        // 对功能区进行排序
        currentAreaCoordinatesList = currentAreaCoordinatesList.sort((c1, c2) =>
          geometryUtil.areaCoordinatesMinus(c1.coordinates, c2.coordinates)
        );
        // 计算新的功能区形状
        let thick = wallRef.wallThickList()[+wallModel.wallThick - 1];
        let { areaCoordinates } = geometryUtil.generateWallCoordinates(
          wallModel.wallGeometry.coordinates,
          wallModel.wallInsideGeometry.coordinates,
          thick
        );
        // 对新的功能区进行排序
        areaCoordinates = areaCoordinates.sort((c1, c2) =>
          geometryUtil.areaCoordinatesMinus(c1, c2)
        );
        // 按照排序顺序修改功能区轮廓
        for (let i = 0, len = currentAreaCoordinatesList.length; i < len; i++) {
          currentAreaCoordinatesList[i].coordinates = areaCoordinates[i];
        }
        areas = {
          updateAreaList: currentAreaCoordinatesList.map((area) => ({
            area_id: area.area_id,
            area_geometry: geometryUtil.generateGeoJSONGeometry(
              area.coordinates
            ),
          })),
        };
      }
      // 更新本地floor组件数据
      wallRef.updateWallInfo({
        wall_thick: wallModel.wallThick,
        wall_geometry: wallModel.wallGeometry,
        wall_inside_geometry: wallModel.wallInsideGeometry,
      });
      // 上传建筑数据
      const updated = await api.updateWall(wallId, {
        floor: floorId,
        info: edit,
        areas: JSON.stringify(areas),
      });
      if (updated.code !== 200) {
        return;
      }
      // 仅更新功能区轮廓
      if (update) {
        for (let area of areas.updateAreaList) {
          this.mapObjectRefs[`area${area.area_id}`][0].areaGeometryObject(
            area.area_geometry
          );
        }
        return;
      }
      let floorRef = this.mapObjectRefs[`floor${floorId}`][0];
      // 完成功能区的删除和新增
      let newAreaList = updated.data.areaList.newAreaList;
      let deleteAreaIdList = areas.deleteAreaIdList;
      // 更新功能区id列表
      let areaIdList = newAreaList.map((area) => area.properties.area_id);
      areaIdList.push(...floorRef.floorAttachArea());
      areaIdList = [...new Set(areaIdList)];
      areaIdList = areaIdList.filter(
        (id) => deleteAreaIdList.indexOf(id) === -1
      );
      floorRef.floorAttachArea(areaIdList);
      // 删除对应功能区
      for (let id of deleteAreaIdList) {
        this.removeArea(id);
      }
      // 新增功能区
      for (let area of newAreaList) {
        this.addArea(area);
      }
      this.$nextTick(() => {
        for (let area of newAreaList) {
          floorRef.addAreaGroupObject(area.properties.area_id);
        }
        wallRef.rerenderMesh();
      });
    },

    /**
     * 跳转到墙体结构画板页面
     */
    jumpWallGeometryPalette() {
      // 获取当前功能区及其对应的id
      let areaCoordinatesList = this.areas
        .filter(
          (area) => +area.properties.area_belong_floor === +this.currentFloor
        )
        .map((area) => ({
          area_id: area.properties.area_id,
          coordinates: area.geometry.coordinates,
        }));
      // 对功能区进行排序
      areaCoordinatesList = areaCoordinatesList.sort((c1, c2) =>
        geometryUtil.areaCoordinatesMinus(c1.coordinates, c2.coordinates)
      );
      this.$emit("drawerVisibleChange", "wall", false);
      this.$router.push({
        name: "palette",
        params: {
          drawMode: "wall",
          wallThick: this.wallRef.wallThickList()[this.wallRef.wallThick() - 1],
          wallGeometry: this.wallRef.wallGeometryObject(),
          wallInsideGeometry: this.wallRef.wallInsideGeometryObject(),
          areaCoordinatesList,
          mapId: this.$route.params.id,
          floorId: this.currentFloor,
        },
      });
    },

    /**
     * 获取完成编辑的楼层 Geometry
     */
    getWallGeometries() {
      let drawMode = this.$route.params.drawMode;
      if (typeof drawMode !== "string" || drawMode !== "wall") {
        return;
      }
      let { floorId, wallGeometry, wallInsideGeometry, areaGeometries } =
        this.$route.params;
      // 更新墙体信息
      this.setCurrentFloor(floorId);
      let wallId = +this.floorRef.floorAttachWall();
      let wallRef = this.mapObjectRefs[`wall${wallId}`][0];
      wallRef.wallGeometryObject(wallGeometry);
      wallRef.wallInsideGeometryObject(wallInsideGeometry);
      // 打开墙体编辑页面并显示最新数据
      this.$emit("drawerVisibleChange", "wall", true);
      this.$nextTick(() => {
        // 立即触发墙体信息的提交
        this.touchEditWallChange(true, areaGeometries);
      });
    },

    /**
     * 墙体厚度改变
     */
    handleWallThickChange() {
      this.touchEditWallChange(false);
      // 更新本地floor组件数据
      this.wallRef.updateWallInfo({
        wall_thick: this.editWallModel.wallThick,
        wall_geometry: this.editWallModel.wallGeometry,
        wall_inside_geometry: this.editWallModel.wallInsideGeometry,
      });
      this.wallRef.rerenderMesh();
    },

    ...mapMutations("mapEditorStore", [
      "setCurrentWall",
      "setCurrentFloor",
      "addArea",
      "removeArea",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-wall-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-wall-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-wall-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
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