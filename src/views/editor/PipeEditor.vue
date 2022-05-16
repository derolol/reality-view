<template>
  <!-- ------------------------------------------------------
    ###########################################################
         
                          连通区域修改抽屉
    
    ###########################################################
    ------------------------------------------------------- -->
  <div>
    <el-drawer
      class="edit-drawer edit-pipe-drawer"
      title="编辑连通区域信息"
      direction="rtl"
      size="100%"
      :modal="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
      :modal-append-to-body="false"
      :visible.sync="editPipeDrawerVisible"
      :before-close="handleEditPipeDrawerClose"
      @click.native.stop=""
    >
      <div class="edit-drawer-container">
        <!-- 
        ##############################################
                          新增连通区域
        ##############################################
         -->
        <el-popover
          placement="bottom"
          width="160"
          v-model="addPipePopoverVisible"
        >
          <div v-if="editPipeType===0">
            <p>点击选择内部墙体，创建水平连通区域</p>
          </div>
          <div v-if="editPipeType===1">
            <p>创建垂直连通区域</p>
            <div class="pipe-attach-floor">
              <!-- 
            ##############################################
                              楼层1选择器
            ##############################################
            -->
              <el-select
                class="add-pipe-floor"
                v-model="addPipeBelongFloor1"
                filterable
                size="mini"
                @change="handleAddPipeFloorChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >楼层1:</span>
                <el-option
                  v-for="floor in sortedFloors"
                  :key="'add-pipe-floor-1'+floor.id"
                  :label="floor.level | floorNumberFormat"
                  :value="floor.id"
                  :disabled="floor.id == addPipeBelongFloor2"
                />
              </el-select>
              <!-- 
              ##############################################
                                楼层2选择器
              ##############################################
              -->
              <el-select
                class="add-pipe-floor"
                v-model="addPipeBelongFloor2"
                size="mini"
                @change="handleAddPipeFloorChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >楼层2:</span>
                <el-option
                  v-for="floor in sortedFloors"
                  :key="'add-pipe-floor-2'+floor.id"
                  :label="floor.level | floorNumberFormat"
                  :value="floor.id"
                  :disabled="floor.id == addPipeBelongFloor1"
                />
              </el-select>
            </div>
          </div>
          <div class="popover-bottom">
            <el-button
              size="mini"
              type="text"
              @click="cancelPipeAddition"
            >取消</el-button>
            <el-button
              type="primary"
              size="mini"
              @click="confirmPipeAddition"
            >确定</el-button>
          </div>
          <el-button
            class="edit-pipe-new"
            size="medium"
            slot="reference"
            @click="handlePipeAddition"
          >
            <svg-text
              iconName="plus"
              :iconWidth="16"
              :iconHeight="16"
              text="新增连通区域"
            />
          </el-button>
        </el-popover>
        <!-- 
        ##############################################
                        改变连通区域类型
        ##############################################
         -->
        <el-radio-group
          v-model="editPipeType"
          class="edit-pipe-type"
        >
          <el-radio-button :label="0">水平连通区域</el-radio-button>
          <el-radio-button :label="1">垂直连通区域</el-radio-button>
        </el-radio-group>
        <!-- 
        ##############################################
                        水平连通区域表单
        ##############################################
         -->
        <el-form
          v-if="currentPipe!==-1 && editPipeType == 0"
          class="edit-poi-form"
          label-width="100px"
        >
          <!-- 
          ##############################################
                          水平连通区域名称
          ##############################################
          -->
          <el-form-item label="连通区域名称">
            <el-input
              size="medium"
              v-model="editHorizontalPipeModel.pipeName"
              placeholder="请输入连通区域名称"
              @change="touchEditPipeChange(false)"
            />
          </el-form-item>
          <!-- 
          ##############################################
                          水平连通区域轮廓
          ##############################################
          -->
          <el-form-item label="连通区域轮廓">
            <div class="pipe-edit-geometry-container">
              <!-- 
              ##############################################
                                轮廓展示画布
              ##############################################
              -->
              <v-stage
                ref="stage"
                :config="pipeStageConfig"
                class="pipe-edit-geometry-stage"
              >
                <v-layer>
                  <v-shape :config="editPipeShapeConfig"></v-shape>
                </v-layer>
              </v-stage>
              <!-- 
              ##############################################
                                轮廓站按钮
              ##############################################
              -->
              <el-button
                size="medium"
                @click="jumpPipeGeometryPalette"
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
          <!-- 
          ##############################################
                          水平连通区域管理
          ##############################################
          -->
          <el-form-item label="连通区域管理">
            <!-- 
            ##############################################
                              删除提示框
            ##############################################
            -->
            <el-popover
              placement="top"
              width="160"
              v-model="horizontalPipeDeletionVisible"
            >
              <p>确定删除该连通区域?</p>
              <div class="popover-bottom">
                <el-button
                  size="mini"
                  type="text"
                  @click="horizontalPipeDeletionVisible = false"
                >取消</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="handlePipeDeletion"
                >确定</el-button>
              </div>
              <!-- 
              ##############################################
                                删除按钮
              ##############################################
              -->
              <el-button
                class="pipe-delete-btn"
                size="medium"
                type="danger"
                slot="reference"
              >
                <svg-text
                  iconName="delete"
                  :iconWidth="16"
                  :iconHeight="16"
                  text="删除连通区域"
                />
              </el-button>
            </el-popover>
          </el-form-item>
        </el-form>
        <!-- 
        ##############################################
                        垂直连通区域管理
        ##############################################
        -->
        <el-form
          v-if="currentPipe !== -1 && editPipeType == 1"
          class="edit-poi-form"
          label-width="100px"
        >
          <!-- 
          ##############################################
                          垂直连通区域名称
          ##############################################
          -->
          <el-form-item label="连通区域名称">
            <el-input
              size="medium"
              v-model="editVerticalPipeModel.pipeName"
              placeholder="请输入连通区域名称"
              @change="touchEditPipeChange(false)"
            />
          </el-form-item>
          <!-- 
          ##############################################
                        垂直连通区域关联楼层
          ##############################################
          -->
          <el-form-item label="关联楼层">
            <div class="pipe-attach-floor">
              <!-- 
              ##############################################
                                楼层1选择器
              ##############################################
              -->
              <el-select
                class="pipe-attach-floor-input"
                v-model="editVerticalPipeModel.pipeBelongFloor1"
                filterable
                size="medium"
                @change="handlePipeBelongFloorChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >楼层1:</span>
                <el-option
                  v-for="floor in sortedFloors"
                  :key="'pipe-floor-1'+floor.id"
                  :label="floor.level | floorNumberFormat"
                  :value="floor.id"
                  :disabled="floor.id == editVerticalPipeModel.pipeBelongFloor2"
                />
              </el-select>
              <!-- 
              ##############################################
                                楼层2选择器
              ##############################################
              -->
              <el-select
                class="pipe-attach-floor-input"
                v-model="editVerticalPipeModel.pipeBelongFloor2"
                size="medium"
                @change="handlePipeBelongFloorChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >楼层2:</span>
                <el-option
                  v-for="floor in sortedFloors"
                  :key="'pipe-floor-2'+floor.id"
                  :label="floor.level | floorNumberFormat"
                  :value="floor.id"
                  :disabled="floor.id == editVerticalPipeModel.pipeBelongFloor1"
                />
              </el-select>
            </div>
          </el-form-item>
          <!-- 
          ##############################################
                        垂直连通区域楼层1位置
          ##############################################
          -->
          <el-form-item label="楼层1位置">
            <div class="pipe-position">
              <!-- 
              ##############################################
                              楼层1位置x输入框
              ##############################################
              -->
              <el-input
                class="pipe-position-input"
                v-model="editVerticalPipeModel.pipePositionX1"
                size="medium"
                @change="handlePipePositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >x:</span>
              </el-input>
              <!-- 
              ##############################################
                              楼层1位置y输入框
              ##############################################
              -->
              <el-input
                class="pipe-position-input"
                v-model="editVerticalPipeModel.pipePositionY1"
                size="medium"
                @change="handlePipePositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >y:</span>
              </el-input>
            </div>
          </el-form-item>
          <!-- 
          ##############################################
                        垂直连通区域楼层2位置
          ##############################################
          -->
          <el-form-item label="楼层2位置">
            <div class="pipe-position">
              <!-- 
              ##############################################
                              楼层2位置x输入框
              ##############################################
              -->
              <el-input
                class="pipe-position-input"
                v-model="editVerticalPipeModel.pipePositionX2"
                size="medium"
                @change="handlePipePositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >x:</span>
              </el-input>
              <!-- 
              ##############################################
                              楼层2位置y输入框
              ##############################################
              -->
              <el-input
                class="pipe-position-input"
                v-model="editVerticalPipeModel.pipePositionY2"
                size="medium"
                @change="handlePipePositionChange"
              >
                <span
                  class="input-text-prefix"
                  slot="prefix"
                >y:</span>
              </el-input>
            </div>
          </el-form-item>
          <!-- 
          ##############################################
                          垂直连通区域管理
          ##############################################
          -->
          <el-form-item label="连通区域管理">
            <!-- 
            ##############################################
                              删除对话框
            ##############################################
            -->
            <el-popover
              placement="top"
              width="160"
              v-model="verticalPipeDeletionVisible"
            >
              <p>确定删除该连通区域?</p>
              <div class="popover-bottom">
                <el-button
                  size="mini"
                  type="text"
                  @click="verticalPipeDeletionVisible = false"
                >取消</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="handlePipeDeletion"
                >确定</el-button>
              </div>
              <!-- 
              ##############################################
                                  删除按钮
              ##############################################
              -->
              <el-button
                class="pipe-delete-btn"
                size="medium"
                type="danger"
                slot="reference"
              >
                <svg-text
                  iconName="delete"
                  :iconWidth="16"
                  :iconHeight="16"
                  text="删除连通区域"
                />
              </el-button>
            </el-popover>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import toolUtil from "@/utils/toolUtil";
import api from "@/request/editor";
import geometryUtil from "@/utils/geometryUtil";
export default {
  name: "pipeEditor",
  filters: {
    floorNumberFormat(floor) {
      if (floor === "...") return floor;
      floor = +floor;
      if (floor >= 0) return `F${floor + 1}`;
      return `B${Math.abs(floor)}`;
    },
  },
  props: {
    editPipeDrawerVisible: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      sortedFloors: [],

      editPipeType: 0,
      touchEditPipeChangeDebounce: null,

      editHorizontalPipeModel: {
        pipeName: "",
        pipeGeometry: "",
      },
      editVerticalPipeModel: {
        pipeName: "",
        pipeBelongFloor1: -1,
        pipeBelongFloor1: -1,
        pipePositionX1: 0,
        pipePositionY1: 0,
        pipePositionX2: 0,
        pipePositionY2: 0,
      },

      addPipePopoverVisible: false,
      addPipeBelongFloor1: -1,
      addPipeBelongFloor2: -1,

      pipeStageConfig: {
        width: 250,
        height: 150,
      },
      editPipeShapeConfig: {
        sceneFunc: () => {},
        stroke: "#9477D9",
        strokeWidth: 1,
        name: "shape",
        strokeScaleEnabled: false,
      },

      horizontalPipeDeletionVisible: false,
      verticalPipeDeletionVisible: false,
    };
  },
  created() {
    this.touchEditPipeChangeDebounce = toolUtil.debounce(
      this.handleEditPipeSubmit,
      3000
    );
  },
  watch: {
    floors() {
      let floorLevelIdMap = {};
      for (let i = 0, len = this.floors.length; i < len; i++) {
        let floor = this.floors[i].properties;
        floorLevelIdMap[floor.floor_level] = floor.floor_id;
      }
      this.sortedFloors.splice(0, this.sortedFloors.length);
      Object.keys(floorLevelIdMap)
        .sort((a, b) => b - a)
        .forEach((v) => {
          this.sortedFloors.push({
            id: floorLevelIdMap[v],
            level: v,
          });
        });
    },
    editPipeDrawerVisible(visible) {
      if (visible) {
        this.handleEditPipeDrawerOn();
      } else {
        this.touchEditPipeChange(true);
        this.setCurrentPipe(-1);
      }
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapObjectRefs: (state) => state.mapObjectRefs,
      floors: (state) => state.floors,
      pipes: (state) => state.pipes,
      currentPipe: (state) => state.currentPipe,
      pipeRef: (state) => state.pipeRef,
      buildingRef: (state) => state.buildingRef,
    }),
  },
  methods: {
    /*******************************************/
    /**                                       **/
    /**          连通区域 Pipe Drawer          **/
    /**                                       **/
    /*******************************************/

    /**
     * 触发连通区域修改提交
     */
    touchEditPipeChange(atOnce) {
      let pipeId = this.currentPipe;
      if (pipeId === -1) return;
      let pipeType = +this.editPipeType;
      let pipeModel = null;
      switch (pipeType) {
        // 水平连通区域的模型
        case 0: {
          pipeModel = toolUtil.arraySimpleDeepCopy(
            this.editHorizontalPipeModel
          );
          break;
        }
        // 垂直连通区域的模型
        case 1: {
          pipeModel = toolUtil.arraySimpleDeepCopy(this.editVerticalPipeModel);
          break;
        }
      }
      this.touchEditPipeChangeDebounce(atOnce, pipeId, pipeType, pipeModel);
    },

    /**
     * 连通区域编辑抽屉打开
     */
    handleEditPipeDrawerOn() {
      this.updateEditPipeForm();
    },

    /**
     * 连通区域编辑抽屉关闭
     */
    handleEditPipeDrawerClose() {
      this.$emit("drawerVisibleChange", "pipe", false);
    },

    /**
     * 更新表单内容为当前连通区域
     */
    updateEditPipeForm() {
      if (this.currentPipe === -1 || this.pipeRef === null) return;
      switch (+this.pipeRef.pipeType()) {
        // 水平连通区域
        case 0: {
          this.editPipeType = 0;
          this.editHorizontalPipeModel = {
            pipeName: this.pipeRef.pipeName(),
            pipeGeometry: this.pipeRef.pipeGeometryObject(),
          };
          break;
        }
        // 垂直连通区域
        case 1: {
          this.editPipeType = 1;
          let coordinates = this.pipeRef.pipeGeometryObject().coordinates;
          this.editVerticalPipeModel = {
            pipeName: this.pipeRef.pipeName(),
            pipeBelongFloor1: this.pipeRef.pipeBelongFloor()[0],
            pipeBelongFloor2: this.pipeRef.pipeBelongFloor()[1],
            pipePositionX1: coordinates[0][0],
            pipePositionY1: coordinates[0][1],
            pipePositionX2: coordinates[1][0],
            pipePositionY2: coordinates[1][1],
          };
          break;
        }
      }
    },

    /**
     * 提交连通区域的修改
     */
    async handleEditPipeSubmit(pipeId, pipeType, pipeModel) {
      let info = null;
      // 获取相应连通区域类型的更新信息
      switch (pipeType) {
        case 0: {
          info = {
            pipe_name: pipeModel.pipeName,
            pipe_geometry: JSON.stringify(pipeModel.pipeGeometry),
          };
          break;
        }
        case 1: {
          info = {
            pipe_name: pipeModel.pipeName,
            pipe_geometry: JSON.stringify({
              type: "LineString",
              coordinates: [
                [+pipeModel.pipePositionX1, +pipeModel.pipePositionY1],
                [+pipeModel.pipePositionX2, +pipeModel.pipePositionY2],
              ],
            }),
            pipe_belong_floor: JSON.stringify([
              +pipeModel.pipeBelongFloor1,
              +pipeModel.pipeBelongFloor2,
            ]),
          };
          break;
        }
      }
      let updatedPipe = await api.updatePipe(pipeId, info);
      if (updatedPipe.code !== 200) {
        this.$message.error("更新连通区域失败");
        return;
      }
    },

    /**
     * 确认新增连通区域
     */
    async confirmPipeAddition() {
      let info = null;
      switch (+this.editPipeType) {
        case 0: {
          info = {
            pipe_type: 0,
            pipe_geometry: [],
            pipe_belong_floor: [],
            pipe_belong_building: -1,
          };
          break;
        }
        // 竖直连通区域
        case 1: {
          // 楼层1的轮廓
          let floor1 =
            this.mapObjectRefs[`floor${this.addPipeBelongFloor1}`][0];
          let box1 = geometryUtil.getCoordinatesBox(
            floor1.floorGeometryObject().coordinates
          );
          // 楼层2的轮廓
          let floor2 =
            this.mapObjectRefs[`floor${this.addPipeBelongFloor2}`][0];
          let box2 = geometryUtil.getCoordinatesBox(
            floor2.floorGeometryObject().coordinates
          );
          // 上传连通区域信息
          info = {
            pipe_type: 1,
            pipe_geometry: JSON.stringify({
              type: "LineString",
              // 随机选择楼层中一位置
              coordinates: [
                [
                  Math.floor(Math.random() * box1.width + box1.x),
                  Math.floor(Math.random() * box1.height + box1.y),
                ],
                [
                  Math.floor(Math.random() * box2.width + box2.x),
                  Math.floor(Math.random() * box2.height + box2.y),
                ],
              ],
            }),
            pipe_belong_floor: JSON.stringify([
              this.addPipeBelongFloor1,
              this.addPipeBelongFloor2,
            ]),
            pipe_belong_building: this.buildingRef.buildingId(),
          };
          break;
        }
      }
      // 创建连通区域
      let created = await api.createPipe(info);
      if (created.code !== 200) {
        this.$message.error("创建连通区域失败");
        return;
      }
      let newPipe = created.data.pipe;
      // 在全局变量新增连通区域
      this.addPipe(newPipe);
      switch (+newPipe.properties.pipe_type) {
        case 0: {
          break;
        }
        case 1: {
          let pipeId = newPipe.properties.pipe_id;
          this.buildingRef.buildingAttachPipe().push(pipeId);
          this.$nextTick(() => {
            // 添加连通区域对象
            this.buildingRef.addPipeObject(pipeId);
            // 更新当前聚焦连通区域对象
            this.setCurrentPipe(pipeId);
            this.updateEditPipeForm();
          });
          break;
        }
      }
      this.addPipePopoverVisible = false;
    },

    /**
     * 取消新增连通区域
     */
    cancelPipeAddition() {
      switch (+this.editPipeType) {
        case 0: {
          break;
        }
        case 1: {
          this.addPipeBelongFloor1 = -1;
          this.addPipeBelongFloor2 = -1;
          break;
        }
      }
      this.addPipePopoverVisible = false;
    },

    /**
     * 跳转到连通区域编辑页面
     */
    jumpPipeGeometryPalette() {},

    /**
     * 删除连通区域
     */
    async handlePipeDeletion() {
      let pipeId = this.currentPipe;
      let pipeType = this.editPipeType;
      // 在数据库删除
      let deleted = await api.deletePipe(pipeId);
      if (deleted.code !== 200) {
        this.$message.error("删除连通区域失败");
        return;
      }
      // 从全局连通区域变量移除
      this.removePipe(pipeId);
      switch (+pipeType) {
        case 0: {
          // 删除楼层包含的记录
          let floorId =
            +this.mapObjectRefs[`pipe${pipeId}`][0].pipeBelongFloor();
          let floorRef = this.mapObjectRefs[`floor${floorId}`][0];
          let index = floorRef.floorAttachPipe().findIndex((p) => p == pipeId);
          floorRef.floorAttachPipe().splice(index, 1);
          this.horizontalPipeDeletionVisible = false;
          break;
        }
        case 1: {
          // 删除建筑包含的记录
          let index = this.buildingRef
            .buildingAttachPipe()
            .findIndex((p) => p == pipeId);
          this.buildingRef.buildingAttachPipe().splice(index, 1);
          this.verticalPipeDeletionVisible = false;
          break;
        }
      }
      this.$emit("drawerVisibleChange", "pipe", false);
    },

    /**
     * 改变连通区域所属楼层
     */
    handlePipeBelongFloorChange() {
      // 更新连通区域数据
      this.touchEditPipeChange();
      let pipeRef = this.mapObjectRefs[`pipe${this.currentPipe}`][0];
      switch (+pipeRef.pipeType()) {
        case 0: {
          break;
        }
        // 垂直连通区域
        case 1: {
          pipeRef.pipeBelongFloor([
            this.editVerticalPipeModel.pipeBelongFloor1,
            this.editVerticalPipeModel.pipeBelongFloor2,
          ]);
          break;
        }
      }
    },

    /**
     * 改变连通区域所在位置
     */
    handlePipePositionChange() {
      // 更新连通区域数据
      this.touchEditPipeChange();
      let pipeRef = this.mapObjectRefs[`pipe${this.currentPipe}`][0];
      switch (+pipeRef.pipeType()) {
        case 0: {
          break;
        }
        // 垂直连通区域
        case 1: {
          pipeRef.pipeGeometryObject([
            [
              +this.editVerticalPipeModel.pipePositionX1,
              +this.editVerticalPipeModel.pipePositionY1,
            ],
            [
              +this.editVerticalPipeModel.pipePositionX2,
              +this.editVerticalPipeModel.pipePositionY2,
            ],
          ]);
          break;
        }
      }
    },

    /**
     * 点击连通区域实体
     */
    handleClickPipeObject(pipeId) {
      if (pipeId === this.currentPipe) return;
      // 当前编辑抽屉未打开
      if (!this.editPipeDrawerVisible) {
        this.setCurrentPipe(pipeId);
        this.$emit("drawerVisibleChange", "pipe", true);
        return;
      }
      // 当前编辑抽屉已打开，则更新当前连通区域及表单
      this.setCurrentPipe(pipeId);
      this.$refs.pipeEditor.updateEditPipeForm(true);
    },

    ...mapMutations("mapEditorStore", [
      "setCurrentPipe",
      "addPipe",
      "removePipe",
    ]),
  },
};
</script>

<style lang="scss" scoped>
.edit-pipe-drawer {
  font-size: 16px;
  width: 40%;
  left: 60%;
}

.edit-pipe-drawer ::v-deep .el-drawer__container .el-drawer__header {
  margin-bottom: 0px;
}

.edit-drawer-container {
  width: 100%;
  padding: 30px;
}

.edit-pipe-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.edit-pipe-drawer .pipe-position,
.edit-pipe-drawer .pipe-attach-floor {
  @include flex-between-middle($wrap: nowrap);
}

.edit-pipe-drawer .pipe-position ::v-deep .el-input .el-input__inner {
  padding-left: 25px;
}

.edit-pipe-drawer .pipe-attach-floor ::v-deep .el-input .el-input__inner {
  padding-left: 55px;
}

.edit-pipe-drawer .pipe-position .input-text-prefix,
.edit-pipe-drawer .pipe-attach-floor .input-text-prefix {
  padding: 0px 5px;
}

.edit-pipe-drawer .pipe-position .pipe-position-input:first-child,
.edit-pipe-drawer .pipe-attach-floor .pipe-attach-floor-input:first-child {
  margin-right: 10px;
}

.edit-pipe-drawer .pipe-position .pipe-position-input,
.edit-pipe-drawer .pipe-attach-floor .pipe-attach-floor-input {
  margin-bottom: 5px;
}

.edit-drawer-container .edit-pipe-new {
  width: 100%;
  margin-bottom: 10px;
}

.edit-drawer-container .edit-pipe-type {
  width: 100%;
  margin-bottom: 20px;
}

.add-pipe-floor ::v-deep .el-input .el-input__inner {
  padding-left: 50px;
}

.add-pipe-floor ::v-deep .el-input .input-text-prefix {
  line-height: 28px;
  padding: 0px 3px;
}

.add-pipe-floor {
  margin-bottom: 8px;
}

.popover-bottom {
  text-align: right;
  margin: 0;
}
</style>