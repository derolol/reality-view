<template>
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
      :visible.sync="editFloorDrawerVisible"
      :before-close="handleEditFloorDrawerClose"
      @click.native.stop=""
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
        <el-form
          class="edit-floor-form"
          label-width="100px"
        >
          <el-form-item
            class="edit-floor-ground-item"
            label="楼层底板"
          >
            <div class="switch-container">
              <el-switch
                size="medium"
                @change="handleFloorMeshVisibleChange"
                v-model="floorMeshVisibleModel"
              />
              <span class="switch-text">{{ floorMeshVisible ? "显示" : "隐藏" }}楼层地板</span>
            </div>
          </el-form-item>
          <el-form-item label="所有楼层">
            <div class="switch-container">
              <el-switch
                size="medium"
                @change="handleAllFloorVisibleChange"
                v-model="allFloorMeshVisibleModel"
              />
              <span class="switch-text">{{
                  allFloorMeshVisible ? "显示所有楼层" : "只显示当前楼层"
                }}</span>
            </div>
          </el-form-item>
          <el-form-item label="楼层名称">
            <el-input
              size="medium"
              v-model="editFloorModel.floorName"
              placeholder="请输入楼层名称"
              @change="touchEditFloorChange(false)"
            />
          </el-form-item>
          <el-form-item label="楼层层号">
            <div class="form-question-item">
              <el-input
                size="medium"
                v-model="editFloorModel.floorLevel"
                placeholder="请输入楼层层号"
                @blur="handleFloorLevelChange"
                @change="touchEditFloorChange(false)"
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
                >取消</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="handleFloorCopy"
                >确定</el-button>
              </div>
              <el-button
                size="medium"
                type="info"
                slot="reference"
              >
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
                >取消</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="handleFloorDeletion"
                >确定</el-button>
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
                <v-layer>
                  <v-shape :config="editFloorShapeConfig"></v-shape>
                </v-layer>
              </v-stage>
              <el-button
                size="medium"
                @click="jumpFloorGeometryPalette"
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
          <el-form-item label="楼层访问级别">
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
                    @change="touchEditFloorChange(false)"
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
import { mapState, mapMutations } from "vuex";
import api from "@/request/editor";
import data from "@/utils/data";
import toolUtil from "@/utils/toolUtil";
import geometryUtil from "@/utils/geometryUtil";
export default {
  name: "floorEditor",
  props: {
    editFloorDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      accessLevel: data.MapAccessLevelList,

      touchEditFloorChangeDebounce: null,
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
    };
  },
  watch: {
    editFloorDrawerVisible(visible) {
      if (visible) {
        this.handleEditFloorDrawerOn();
      } else {
        this.touchEditFloorChange(true);
      }
    },
    currentFloor(oldFloor, newFloor) {
      this.updateEditFloorForm();
      this.updateEditFloorShape();
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      floors: (state) => state.floors,
      areas: (state) => state.areas,
      currentFloor: (state) => state.currentFloor,
      currentBuilding: (state) => state.currentBuilding,
      wallRef: (state) => state.wallRef,
      floorRef: (state) => state.floorRef,
      buildingRef: (state) => state.buildingRef,
      allFloorMeshVisible: (state) => state.allFloorMeshVisible,
      floorMeshVisible: (state) => state.floorMeshVisible,
    }),
  },
  created() {
    this.touchEditFloorChangeDebounce = toolUtil.debounce(
      this.handleEditFloorSubmit,
      3000
    );
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**           楼层 Floor Drawer           **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发楼层信息改变
     */
    touchEditFloorChange(atOnce, geometryChange) {
      console.log("floor save", atOnce);
      let floorId = this.currentFloor;
      let floorModel = toolUtil.arraySimpleDeepCopy(this.editFloorModel);
      let wallId = this.wallRef.wallId();
      this.touchEditFloorChangeDebounce(
        atOnce,
        geometryChange,
        floorId,
        floorModel,
        wallId
      );
    },

    /**
     * 编辑楼层抽屉打开
     */
    handleEditFloorDrawerOn() {
      this.floorMeshVisibleModel = this.floorMeshVisible;
      this.allFloorMeshVisibleModel = this.allFloorMeshVisible;
      this.updateEditFloorForm();
      this.updateEditFloorShape();
    },

    /**
     * 楼层编辑抽屉关闭
     */
    handleEditFloorDrawerClose() {
      this.$emit("drawerVisibleChange", "floor", false);
    },

    /**
     * 更新楼层编辑表单
     */
    updateEditFloorForm() {
      let geometry = this.floorRef.floorGeometryObject();
      this.editFloorModel.floorName = this.floorRef.floorName();
      this.editFloorModel.floorLevel = this.floorRef.floorLevel();
      this.editFloorModel.floorGeometry = geometry;
      this.editFloorModel.floorAccessLevel = +this.floorRef.floorAccessLevel();
    },

    /**
     * 更新楼层绘制轮廓
     */
    updateEditFloorShape() {
      // 初始化楼层轮廓
      let geometry = this.floorRef.floorGeometryObject();
      let showWidth = this.floorStageConfig.width;
      let showHeight = this.floorStageConfig.height;
      const box = geometryUtil.getCoordinatesBox(geometry.coordinates);
      const scale = geometryUtil.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.editFloorShapeConfig = Object.assign({}, this.editFloorShapeConfig, {
        sceneFunc: geometryUtil.generateSceneFunc(
          geometry.coordinates,
          scale,
          showWidth,
          showHeight
        ),
        x: -box.x * scale - showWidth / 2 + 0.05 * showWidth,
        y: -showHeight / 2 + (box.y + box.height) * scale + 0.05 * showHeight,
      });
    },

    /**
     * 提交楼层信息
     */
    async handleEditFloorSubmit(geometryChange, floorId, floorModel, wallId) {
      // 获取楼层相关信息
      let geometry = floorModel.floorGeometry;
      let floorRef = this.mapObjectRefs[`floor${floorId}`][0];
      // 获取墙体相关信息
      let wallRef = this.mapObjectRefs[`wall${wallId}`][0];
      let wallInsideGeometry = wallRef.wallInsideGeometryObject();
      let wallThick = wallRef.wallThick();
      let wallThickList = wallRef.wallThickList();
      // 存储功能区的变化
      let areaGeometries = {};
      if (geometryChange) {
        // 获取当前功能区及其对应的id
        let areaCoordinatesBefore = this.areas
          .filter((area) => +area.properties.area_belong_floor === +floorId)
          .map((area) => ({
            area_id: area.properties.area_id,
            coordinates: area.geometry.coordinates,
          }));
        // 对功能区进行排序
        areaCoordinatesBefore = areaCoordinatesBefore.sort((c1, c2) =>
          geometryUtil.areaCoordinatesMinus(c1.coordinates, c2.coordinates)
        );
        // 修改楼层轮廓改变后的功能区
        let { areaCoordinates } = geometryUtil.generateWallCoordinates(
          geometry.coordinates,
          wallInsideGeometry.coordinates,
          wallThickList[wallThick - 1]
        );
        geometryUtil.areaCoordinatesListSort(areaCoordinates);
        // 对比功能区的不同
        let { deleteAreaIdList, newAreaList } =
          geometryUtil.areaCoordinatesListCompare(
            areaCoordinatesBefore,
            areaCoordinates
          );
        // 存储到上传变量中，并对点集进行格式化
        areaGeometries = {
          deleteAreaIdList,
          newAreaList: newAreaList.map((area) =>
            geometryUtil.generateGeoJSONGeometry(area)
          ),
        };
      }
      // 准备上传的数据
      const edit = {
        floor_name: floorModel.floorName,
        floor_level: floorModel.floorLevel,
        floor_geometry: JSON.stringify(geometry),
        areaGeometries: JSON.stringify(areaGeometries),
        floor_access_level: floorModel.floorAccessLevel,
      };
      // 更新本地floor组件数据
      floorRef.updateFloorInfo({
        floor_name: floorModel.floorName,
        floor_level: floorModel.floorLevel,
        floor_access_level: floorModel.floorAccessLevel,
      });
      // 判断轮廓是否发生改变
      geometryChange = geometryChange ? true : false;
      // 上传建筑数据
      const updated = await api.updateFloor(floorId, {
        info: edit,
        geometryChange,
      });
      // 判断是否修改成功且轮廓是否发生改变
      if (updated.code !== 200 || !updated.data.geometryChange) return;
      // 修改相应的墙体和功能区轮廓
      let { wall, area } = updated.data;
      // 更新墙体结构
      wallRef.wallGeometryObject(JSON.parse(wall.wall_geometry));
      wallRef.rerenderMesh();
      // 完成功能区的删除和新增
      let newAreaList = area.newAreaList;
      let deleteAreaIdList = areaGeometries.deleteAreaIdList;
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
        // 渲染功能区
        for (let area of newAreaList) {
          floorRef.addAreaGroupObject(area);
        }
      });
    },

    /**
     * 处理楼层层号变化事件
     */
    handleFloorLevelChange() {
      let newLevel = this.editFloorModel.floorLevel;
      let currentFloorLevel = this.floorRef.floorLevel();
      // 判断用户输入层号是否有误
      if (typeof +newLevel !== "number" || newLevel === "") {
        this.editFloorModel.floorLevel = +currentFloorLevel;
        return;
      }
      // 判断修改楼层是否为当前楼层
      if (+currentFloorLevel === +newLevel) return;
      // 获取建筑的所有楼层
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      // 判断层号是否重复
      if (floorLevelList.indexOf(newLevel) !== -1) {
        this.$message.warning("该楼层已存在");
        this.editFloorModel.floorLevel = +currentFloorLevel;
        return;
      }
      // 更新楼层列表
      floorLevelList.splice(
        floorLevelList.indexOf(+currentFloorLevel),
        1,
        +newLevel
      );
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
      this.floorRef.floorLevel(newLevel);
      // 切换楼层
      this.setCurrentFloor(this.floorRef.floorId());
    },

    /**
     * 楼层建筑可见性
     */
    handleFloorMeshVisibleChange() {
      console.log("floor visible change");
      this.setFloorMeshVisible(this.floorMeshVisibleModel);
      console.log(this.floorMeshVisible);
    },

    /**
     * 多层楼层可见性
     */
    handleAllFloorVisibleChange() {
      console.log("all floor visible change");
      this.setAllFloorMeshVisible(this.allFloorMeshVisibleModel);
      console.log(this.allFloorMeshVisible);
    },

    /**
     * 跳转到楼层轮廓编辑页面
     */
    jumpFloorGeometryPalette() {
      this.$emit("drawerVisibleChange", "floor", false);
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
      let drawMode = this.$route.params.drawMode;
      if (typeof drawMode !== "string" || drawMode !== "floor") {
        return;
      }
      this.setCurrentFloor(this.$route.params.floorId);
      let floorGeometry = this.$route.params.geometry;
      // 更新最新楼层数据
      this.floorRef.floorGeometryObject(floorGeometry);
      // 打开楼层编辑页面
      this.$emit("drawerVisibleChange", "floor", true);
      // 立即提交楼层数据
      this.touchEditFloorChange(true, true);
    },

    /**
     * 新增楼层
     */
    async handleFloorAddition() {
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      let geometry = this.buildingRef.buildingGeometryObject();
      let { areaCoordinates } = geometryUtil.generateWallCoordinates(
        geometry.coordinates,
        [],
        0.37
      );
      let level = Math.max(...floorLevelList) + 1;
      let floorInfo = {
        floor_belong_building: this.currentBuilding,
        floor_name: "楼层",
        floor_level: level,
        floor_owner: this.$store.state.currentInfo.user_id,
        floor_geometry: JSON.stringify(geometry),
        area_geometry: JSON.stringify(
          geometryUtil.generateGeoJSONGeometry(areaCoordinates)
        ),
        floor_access_level: 1,
      };
      // 上传楼层数据
      let created = await api.createFloor(floorInfo);
      if (created.code !== 200) {
        this.$message.error("创建楼层失败");
        return;
      }
      let { floor, wall, area } = created.data;
      let floorId = floor.properties.floor_id;
      this.addFloor(floor);
      this.addWall(wall);
      this.addArea(area);
      // 更新建筑关联列表
      this.buildingRef.buildingAttachFloor().push(floorId);
      // 更新楼层列表
      floorLevelList.push(level);
      floorLevelList.sort((a, b) => b - a);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      floorLevelMap[level] = floorId;
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      this.$nextTick(() => {
        // building 渲染新增 floor
        this.buildingRef.addFloorGroupObject(floorId);
        // 切换到新增的楼层
        this.setCurrentFloor(floorId);
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
      let { floor, wall, areas, components, pois, pipes } = copied.data.copied;
      let floorId = floor.properties.floor_id;
      // 添加该楼层数据
      this.addFloor(floor);
      this.addWall(wall);
      areas.forEach((area) => this.addArea(area));
      components.forEach((component) => this.addComponent(component));
      pois.forEach((poi) => this.addPOI(poi));
      pipes.forEach((pipe) => this.addPipe(pipe));
      // 更新建筑关联列表
      this.buildingRef.buildingAttachFloor().push(floorId);
      // 更新楼层列表
      floorLevelList.push(this.floorCopyLevel);
      floorLevelList.sort((a, b) => b - a);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      floorLevelMap[this.floorCopyLevel] = floorId;
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      this.$nextTick(() => {
        // building 渲染新增 floor
        this.buildingRef.addFloorGroupObject(floorId);
        // 切换到复制的楼层
        this.setCurrentFloor(floorId);
      });
    },

    /**
     * 删除楼层
     */
    async handleFloorDeletion() {
      let deleteFloorId = +this.currentFloor;
      let deleteFloorLevel = +this.floorRef.floorLevel();
      this.floorDeletionVisible = false;
      if (this.floors.length === 1) {
        this.$message.error("删除失败：楼层数量不能小于1");
        return;
      }
      // 上传删除信息
      let deleted = await api.deleteFloor(deleteFloorId);
      if (deleted.code !== 200) {
        this.$message.error("删除失败：请重试");
        return;
      }
      this.$message.info("删除楼层成功");
      // 更新建筑关联楼层
      let floorIdList = this.buildingRef.buildingAttachFloor();
      let floorIdIndex = floorIdList.findIndex((v) => v == deleteFloorId);
      floorIdList.splice(floorIdIndex, 1);
      // 更新楼层列表
      let floorLevelList = this.buildingRef.buildingFloorLevelList();
      let index = floorLevelList.findIndex((v) => v == deleteFloorLevel);
      floorLevelList.splice(index, 1);
      // 更新楼层映射
      let floorLevelMap = this.buildingRef.buildingFloorLevelMap();
      delete floorLevelMap[deleteFloorLevel];
      floorLevelList.sort((a, b) => b - a);
      // 更新建筑轮廓
      this.buildingRef.floorLevelChange(
        Math.max(...floorLevelList),
        Math.min(...floorLevelList)
      );
      // 删除该楼层数据
      const floorIndex = this.floors.findIndex(
        (v) => +v.properties.floor_id === deleteFloorId
      );
      this.floors.splice(floorIndex, 1);
      // 更新当前默认 floor id，位于中间的楼层
      let level = floorLevelList[Math.floor(floorLevelList.length / 2)];
      this.setCurrentFloor(floorLevelMap[level]);
    },

    ...mapMutations("mapEditorStore", [
      "addFloor",
      "addWall",
      "addArea",
      "addComponent",
      "addPOI",
      "addPipe",
      "removeArea",
      "setCurrentFloor",
      "setAllFloorMeshVisible",
      "setFloorMeshVisible",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-floor-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-floor-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-floor-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
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

.edit-drawer .switch-container {
  @include flex-between-middle($justify-content: flex-start);
}

.edit-drawer .switch-container .switch-text {
  color: $--color-purple-main;
  margin-left: 8px;
  font-size: 15px;
}
</style>