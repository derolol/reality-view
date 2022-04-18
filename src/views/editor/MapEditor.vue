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
      @onMouseClick="onMouseClick"
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
      <poi-object
        :ref="'poi' + poi.properties.poi_id"
        v-for="poi in pois"
        :key="'poi' + poi.properties.poi_id"
        :poiInfo="poi"
      />
    </three-render>

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
        @click.stop="handleEditBuildingClick"
      >
        <svg-text
          iconName="building"
          :iconWidth="16"
          :iconHeight="16"
          text="建筑"
        />
      </el-button>
      <el-button
        @click.stop="handleEditFloorClick"
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
        @click.stop="handleEditWallClick"
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
      <el-button
        @click.stop="handleEditAreaClick"
        class="object-option"
        type="primary"
        plain
      >
        <svg-text
          iconName="area"
          :iconWidth="16"
          :iconHeight="16"
          text="功能区"
        />
      </el-button>
      <el-button
        @click.stop="handleEditPOIClick"
        class="object-option"
        type="primary"
        plain
      >
        <svg-text
          iconName="poi"
          :iconWidth="16"
          :iconHeight="16"
          text="POI"
        />
      </el-button>
      <el-button
        class="object-option"
        type="primary"
        plain
      >
        <svg-text
          iconName="pipe"
          :iconWidth="16"
          :iconHeight="16"
          text="连通区域"
        />
      </el-button>
      <el-button
        class="object-option"
        type="primary"
        plain
      >
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
                  v-model="buildingMeshVisiable"
                />
                <span class="switch-text">{{ buildingMeshVisiable ? "显示" : "隐藏" }}建筑轮廓</span>
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
                  v-model="floorMeshVisiable"
                />
                <span class="switch-text">{{ floorMeshVisiable ? "显示" : "隐藏" }}楼层地板</span>
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
                      @change="touchEditFloorChange(floor)"
                    >Level&nbsp;{{ level.accessLevel }}</el-radio>
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
                  v-if="!$refs[`area${editPOIModel.poiBelongArea}`]"
                >当前无关联功能区</div>
                <div
                  class="poi-belong-area-p"
                  v-if="$refs[`area${editPOIModel.poiBelongArea}`]"
                >当前已关联功能区
                  <span class="poi-belong-area-name">
                    {{$refs[`area${editPOIModel.poiBelongArea}`][0].areaName()}}
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
import toolUtil from "@/store/toolUtil";
import geometryUtil from "@/store/geometryUtil";
import polylabel from "polylabel";
import OffsetImage from "./OffsetImage.vue";
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
    OffsetImage,
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
      buildingMeshVisiable: false,

      currentFloor: 0,
      editFLoorDrawerVisible: false,
      floorMeshVisiable: true,
      allFloorVisible: true,
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

      editWallDrawerVisible: false,
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

      currentArea: -1,
      editAreaDrawerVisible: false,
      areaTypeList: data.AreaType,
      touchEditAreaChangeDebounce: null,
      editAreaModel: {
        areaName: "",
        areaType: "",
        areaAttachPOI: -1,
        areaAccessLevel: 1,
      },

      currentPOI: -1,
      editPOIDrawerVisible: false,
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
  computed: {
    visible() {
      return (
        this.editBuildingDrawerVisible ||
        this.editFLoorDrawerVisible ||
        this.editWallDrawerVisible ||
        this.editAreaDrawerVisible ||
        this.editPOIDrawerVisible
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
    mapMeshList() {
      return this.$store.state.mapMeshList;
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
    areaRef() {
      if (this.currentArea === -1) return null;
      return this.$refs[`area${this.currentArea}`][0];
    },
    poiRef() {
      if (this.currentPOI === -1) return null;
      return this.$refs[`poi${this.currentPOI}`][0];
    },
    mapPOIResList() {
      return this.$store.state.mapPOIResList;
    },
    mapPOIImageList() {
      return this.$store.state.mapPOIImageList;
    },
  },
  created() {
    this.initObject();
    this.initPOIResources();
    this.$route.meta.allowNext = false;
    this.$route.meta.saveData = this.getRenderCanvas;
    this.initTouchEvent();
  },
  mounted() {},
  activated() {
    this.getFloorGeometry();
    this.getWallGeometries();
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
        // poi 数据初始化
        for (let poi of mapData.poiObjects) {
          this.pois.push(poi);
        }
      }
      this.$nextTick(() => {
        this.$store.commit("initMapObjectRefs", this.$refs);
        this.$refs.render.startRender();
        this.$store.commit("initMapScene", this.$refs.render.mapScene);
        // 根据当前楼层对网格位置初始化
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = level * (height + 2 * floorMargin);
        // 设置当前观察建筑的楼层多边形外矩形
        this.$refs.render.setFloorHeight(height);
        this.$refs.render.setFloorBox(
          geometryUtil.getCoordinatesBox(
            this.buildingRef.buildingGeometryObject().coordinates
          )
        );
        // 更新三维场景物体位置
        this.$refs.render.moveRenderPosition(0, 0, z);
        this.allFloorVisible = false;
        this.handleAllFloorVisibleChange();
      });
    },

    async initPOIResources() {
      let res = await api.getPOIResources();
      if (res.code !== 200) return;
      this.$store.commit("initMapPOIResList", res.data.resList);
      this.$store.commit("initMapPOIImageList", res.data.resImageList);
    },

    /*******************************************/
    /**                                       **/
    /**           自动提交事件绑定             **/
    /**                                       **/
    /*******************************************/

    touchEditBuildingChange(atOnce) {
      let buildingModel = toolUtil.arraySimpleDeepCopy(this.editBuildingModel);
      this.touchEditBuildingChangeDebounce(
        atOnce,
        this.currentBuilding,
        buildingModel
      );
    },

    touchEditFloorChange(atOnce, geometryChange) {
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

    touchEditAreaChange(atOnce) {
      let areaId = this.currentArea;
      let areaModel = toolUtil.arraySimpleDeepCopy(this.editAreaModel);
      this.touchEditAreaChangeDebounce(atOnce, areaId, areaModel);
    },

    touchEditPOIChange(atOnce) {
      let poiId = this.currentPOI;
      let poiModel = toolUtil.arraySimpleDeepCopy(this.editPOIModel);
      this.touchEditPOIChangeDebounce(atOnce, poiId, poiModel);
    },

    initTouchEvent() {
      this.touchEditBuildingChangeDebounce = toolUtil.debounce(
        this.handleEditBuildingSubmit,
        3000
      );
      this.touchEditFloorChangeDebounce = toolUtil.debounce(
        this.handleEditFloorSubmit,
        3000
      );
      this.touchEditWallChangeDebounce = toolUtil.debounce(
        this.handleEditWallSubmit,
        3000
      );
      this.touchEditAreaChangeDebounce = toolUtil.debounce(
        this.handleEditAreaSubmit,
        3000
      );
      this.touchEditPOIChangeDebounce = toolUtil.debounce(
        this.handleEditPOISubmit,
        3000
      );
    },

    /**
     * 当用户鼠标点击场景
     */
    onMouseClick(raycaster) {
      // 若当前功能区编辑窗口处于打开状态则忽略点击
      if (
        this.visible &&
        !this.editAreaDrawerVisible &&
        !this.editPOIDrawerVisible
      ) {
        return;
      }
      // 检测射线点击的物体
      let meshList = raycaster.intersectObjects(this.mapMeshList, true);
      // 获取现实可见的第一个物体
      let i = 0;
      let len = meshList.length;
      for (; i < len; i++) {
        if (this.checkObjectVisible(meshList[i].object)) break;
      }
      // 若点击了一个可见物体
      if (i < len && meshList[i] !== null && meshList[i].object !== null) {
        let name = meshList[i].object.name;
        // 当前点击的是Area
        if (name.indexOf("area") !== -1) {
          // 获取Area的id
          let areaId = +name.split("-")[0].replace("area", "");
          if (areaId === this.currentArea) return;
          // 若当前不在编辑POI
          if (!this.editPOIDrawerVisible) {
            this.currentArea = areaId;
            // 获取功能区对应对象
            let coordinates = this.areaRef.areaGeometryObject().coordinates;
            if (toolUtil.countArrayLevel(coordinates) === 4)
              coordinates = coordinates[0];
            // 获取当前功能区所在楼层
            let floorId = this.areaRef.areaBelongFloor();
            // 若点击的功能区不在当前楼层，则切换楼层
            if (floorId != this.currentFloor) {
              this.handleChooseFloorChange(floorId);
            }
            // 获取功能区的极点
            let point = polylabel(coordinates, 1.0);
            // 获取目标楼层高度
            let { zScale, floorMargin } = data.ThreeObjectConfig;
            let height = this.buildingRef.buildingFloorHeight() * zScale;
            let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
            // 启动功能区对焦动画
            this.$refs.render.mapFocusMeshTweenInit(point[0], point[1], z);
            // 若此时未在编辑功能区
            if (!this.editAreaDrawerVisible) {
              this.handleEditAreaClick();
              return;
            }
            // 立即提交功能区数据
            this.touchEditAreaChange(true);
            this.editAreaModel = {
              areaName: this.areaRef.areaName(),
              areaType: this.areaRef.areaType(),
              areaAttachPOI: this.areaRef.areaAttachPOI(),
              areaAccessLevel: this.areaRef.areaAccessLevel(),
            };
            return;
          }
          // 若当前处于编辑POI关联功能区状态
          if (this.poiBelongAreaVisible) {
            let areaRef = this.$refs[`area${areaId}`][0];
            // 判断当前功能区是否已关联POI
            if (
              typeof +areaRef.areaAttachPOI() === "number" &&
              +areaRef.areaAttachPOI() !== -1
            ) {
              this.$message.warning("当前功能区已关联POI");
              return;
            }
            // 若当前POI已有关联功能区，移除该关联
            if (
              typeof +this.editPOIModel.poiBelongArea === "number" &&
              +this.editPOIModel.poiBelongArea !== -1
            ) {
              this.$refs[
                `area${+this.editPOIModel.poiBelongArea}`
              ][0].areaAttachPOI(-1);
            }
            // 设置当前POI关联功能区
            this.editPOIModel.poiBelongArea = areaId;
            areaRef.areaAttachPOI(this.currentPOI);
            // 获取功能区对应对象
            let coordinates = areaRef.areaGeometryObject().coordinates;
            if (toolUtil.countArrayLevel(coordinates) === 4)
              coordinates = coordinates[0];
            // 获取功能区的极点
            let point = polylabel(coordinates, 1.0);
            point = point.map((p) => Math.floor(p * 100) / 100);
            this.editPOIModel.poiPosX = point[0];
            this.editPOIModel.poiPosY = point[1];
            this.$refs[`poi${this.currentPOI}`][0].updatePOIPosition(
              point[0],
              point[1]
            );
            // 获取目标楼层高度
            let { zScale, floorMargin } = data.ThreeObjectConfig;
            let height = this.buildingRef.buildingFloorHeight() * zScale;
            let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
            z += this.poiRef.poiHeight() * zScale;
            // 启动功能区对焦动画
            this.$refs.render.mapFocusMeshTweenInit(point[0], point[1], z);
            this.poiBelongAreaVisible = false;
            this.$message.success("关联功能区成功");
            this.touchEditPOIChange(true);
            return;
          }
        }
        // 当前点击的是POI
        if (name.indexOf("poi") !== -1) {
          // 当用户处于POI关联功能区状态，忽略其他点击
          if (this.editPOIDrawerVisible && this.poiBelongAreaVisible) return;
          // 若当前不在编辑Area
          if (!this.editAreaDrawerVisible) {
            // 获取POI的id
            let poiId = +name.split("-")[0].replace("poi", "");
            if (poiId === this.currentPOI) return;
            this.currentPOI = poiId;
            // 获取POI所在位置
            let point = this.poiRef.poiGeometryObject().coordinates;
            // 获取当前POI所在楼层
            let floorId = this.poiRef.poiBelongFloor();
            // 若点击的POI不在当前楼层，则切换楼层
            if (floorId != this.currentFloor) {
              this.handleChooseFloorChange(floorId);
            }
            // 获取目标楼层高度
            let { zScale, floorMargin } = data.ThreeObjectConfig;
            let height = this.buildingRef.buildingFloorHeight() * zScale;
            let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
            z += this.poiRef.poiHeight() * zScale;
            // 启动功能区对焦动画
            this.$refs.render.mapFocusMeshTweenInit(point[0], point[1], z);
            // 若此时未在编辑功能区
            if (!this.editPOIDrawerVisible) {
              this.handleEditPOIClick();
              return;
            }
            // 立即提交功能区数据
            this.touchEditPOIChange(true);
            this.editPOIModel = {
              poiName: this.poiRef.poiName(),
              poiRes: this.poiRef.poiRes(),
              poiPosX: point[0],
              poiPosY: point[1],
              poiHeight: this.poiRef.poiHeight(),
              poiBelongArea: this.poiRef.poiBelongArea(),
            };
            return;
          }
        }
      }
      // 当用户处于POI关联功能区状态，忽略其他点击
      if (this.editPOIDrawerVisible && this.poiBelongAreaVisible) return;
      // 没有击中Area或POI，恢复视角
      if (this.editAreaDrawerVisible || this.editPOIDrawerVisible) {
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
        this.$refs.render.mapFocusFloorTweenInit(z);
      }
      // 若当前正在编辑Area
      if (this.editAreaDrawerVisible) {
        // 立即提交功能区数据，并管理编辑页面
        this.touchEditAreaChange(true);
        this.editAreaDrawerVisible = false;
        this.currentArea = -1;
      }
      // 若当前正在编辑POI
      if (this.editPOIDrawerVisible) {
        // 立即提交POI数据，并管理编辑页面
        this.touchEditPOIChange(true);
        this.editPOIDrawerVisible = false;
        this.currentPOI = -1;
      }
    },

    /**
     * 判断当前物体是否可见
     */
    checkObjectVisible(object) {
      if (object === null) return true;
      console.log(object.name, object.visible);
      if (object.visible) {
        return this.checkObjectVisible(object.parent);
      }
      return false;
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
      if (this.visible && !this.editBuildingDrawerVisible) {
        this.$message.info("请关闭当前编辑窗口");
        return;
      }
      this.editBuildingDrawerVisible = !this.editBuildingDrawerVisible;
      if (!this.editBuildingDrawerVisible) {
        this.touchEditBuildingChange(true);
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
      this.touchEditBuildingChange(true);
      done();
    },
    /**
     * 提交编辑后的建筑信息
     */
    async handleEditBuildingSubmit(buildingId, buildingModel) {
      console.log(arguments);
      console.log(buildingId, buildingModel);
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
      const building = await api.updateBuilding(buildingId, edit);
      if (building.code !== 200) return;
    },
    /**
     * 建筑轮廓显示隐藏设置
     */
    handleBuildingMeshVisibleChange(visible) {
      this.buildingRef.updateBuildingMeshVisible(visible);
    },
    getMapClickInfo: function (e) {
      this.editBuildingModel.buildingCenterLng = e.point.lng;
      this.editBuildingModel.buildingCenterLat = e.point.lat;
    },
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
      this.$refs.render.setFloorHeight(exactHeight);
      this.$refs.render.moveRenderPosition(0, 0, z);
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
      if (this.visible && !this.editFLoorDrawerVisible) {
        this.$message.info("请关闭当前编辑窗口");
        return;
      }
      this.editFLoorDrawerVisible = !this.editFLoorDrawerVisible;
      if (!this.editFLoorDrawerVisible) {
        this.touchEditFloorChange(true);
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
    handleEditFloorDrawerClose(done) {
      this.touchEditFloorChange(true);
      done();
    },
    /**
     * 提交楼层信息
     */
    async handleEditFloorSubmit(geometryChange, floorId, floorModel, wallId) {
      // 获取楼层相关信息
      let geometry = floorModel.floorGeometry;
      let floorRef = this.$refs[`floor${floorId}`][0];
      // 获取墙体相关信息
      let wallRef = this.$refs[`wall${wallId}`][0];
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
      };
      // 更新本地floor组件数据
      floorRef.updateFloorInfo({
        floor_name: floorModel.floorName,
        floor_level: floorModel.floorLevel,
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
      wallRef.updateWallGeometry();
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
      for (let d of deleteAreaIdList) {
        let index = this.areas.findIndex((v) => d == v.properties.area_id);
        this.areas.splice(index, 1);
      }
      // 新增功能区
      this.areas.push(...newAreaList);
      this.$nextTick(() => {
        floorRef.addAreaGroupObject();
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
      this.floorRef.floorLevelChange(newLevel);
      // 更新网格位移
      let height =
        this.buildingRef.buildingFloorHeight() * data.ThreeObjectConfig.zScale;
      let z = newLevel * (height + 2 * data.ThreeObjectConfig.floorMargin);
      this.$refs.render.moveRenderPosition(0, 0, z);
      // 更新楼层选择器的缓存信息
      this.$refs.floorChoose.updateFloorMap();
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
          this.$refs[`floor${floorId}`][0].setFloorGroupVisible(true);
        } else {
          // 其余楼层隐藏
          this.$refs[`floor${floorId}`][0].setFloorGroupVisible(false);
        }
      }
      this.floorRef.setFloorGroupVisible(true);
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
      let drawMode = this.$route.params.drawMode;
      if (typeof drawMode !== "string" || drawMode !== "floor") {
        return;
      }
      let floorGeometry = this.$route.params.geometry;
      this.currentFloor = this.$route.params.floorId;
      // 更新最新楼层数据
      this.$refs[`floor${this.currentFloor}`][0].updateFloorGeometry(
        floorGeometry
      );
      // 打开楼层编辑页面，并显示最新数据
      this.editFLoorDrawerVisible = false;
      this.handleEditFloorClick();
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
      let created = await api.createFloor(floorInfo);
      if (created.code !== 200) {
        this.$message.error("创建楼层失败");
        return;
      }
      let { floor, wall, area } = created.data;
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
      let deleteFloorId = +this.currentFloor;
      let deleteFloorLevel = +this.floorRef.floorLevel();
      this.floorDeletionVisible = false;
      if (this.floors.length === 1) {
        this.$message.error("删除失败：楼层数量不能小于1");
        return;
      }
      let deleted = await api.deleteFloor(deleteFloorId);
      if (deleted.code !== 200) {
        this.$message.error("删除失败：请重试");
        return;
      }
      this.$message.info("删除楼层成功");
      //更新建筑关联楼层
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
      // 更新当前默认 floor id，位于中间的楼层
      let level = floorLevelList[Math.floor(floorLevelList.length / 2)];
      this.handleChooseFloorChange(floorLevelMap[level]);
      // 删除该楼层数据
      const floorIndex = this.floors.findIndex(
        (v) => +v.properties.floor_id === deleteFloorId
      );
      this.floors.splice(floorIndex, 1);
    },
    /**
     * 用户点击切换当前楼层
     */
    handleChooseFloorChange(floorId) {
      // 若当前正在楼层编辑界面
      if (this.editFLoorDrawerVisible) {
        // 立即提交当前修改
        this.touchEditFloorChange(true);
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
        const box = geometryUtil.getCoordinatesBox(geometry.coordinates);
        const scale =
          geometryUtil.getBoxScale(showWidth, showHeight, box) * 0.9;
        this.editFloorShapeConfig = Object.assign(
          {},
          this.editFloorShapeConfig,
          {
            sceneFunc: geometryUtil.generateSceneFunc(
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
      this.$refs.render.moveRenderPosition(0, 0, z);
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
      if (this.visible && !this.editWallDrawerVisible) {
        this.$message.info("请关闭当前编辑窗口");
        return;
      }
      this.editWallDrawerVisible = !this.editWallDrawerVisible;
      if (!this.editWallDrawerVisible) {
        this.touchEditWallChange(true);
        return;
      }
      this.wallThickList = this.wallRef.wallThickList();
      let wallGeometry = this.wallRef.wallGeometryObject();
      let wallInsideGeometry = this.wallRef.wallInsideGeometryObject();
      this.editWallModel = {
        wallThick: +this.wallRef.wallThick(),
        wallGeometry,
        wallInsideGeometry,
      };
      // 初始化墙体轮廓
      let showWidth = this.wallStageConfig.width;
      let showHeight = this.wallStageConfig.height;
      let thick = this.wallThickList[+this.editWallModel.wallThick - 1];
      // 构建墙体形状
      let { shapeCoordinates } = geometryUtil.generateWallCoordinates(
        wallGeometry.coordinates,
        wallInsideGeometry.coordinates,
        thick
      );
      const box = geometryUtil.getCoordinatesBox(shapeCoordinates);
      const scale = geometryUtil.getBoxScale(showWidth, showHeight, box) * 0.9;
      this.editWallShapeConfig = Object.assign({}, this.editWallShapeConfig, {
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
    handleEditWallDrawerClose(done) {
      this.touchEditWallChange(true);
      done();
    },
    async handleEditWallSubmit(floorId, wallId, wallModel, areas = null) {
      let update = false;
      let wallRef = this.$refs[`wall${wallId}`][0];
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
          this.$refs[`area${area.area_id}`][0].updateAreaGeometry(
            area.area_geometry
          );
        }
        return;
      }
      let floorRef = this.$refs[`floor${floorId}`][0];
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
      for (let d of deleteAreaIdList) {
        let index = this.areas.findIndex((v) => d == v.properties.area_id);
        this.areas.splice(index, 1);
      }
      // 新增功能区
      this.areas.push(...newAreaList);
      this.$nextTick(() => {
        floorRef.addAreaGroupObject();
        wallRef.updateWallGeometry();
      });
    },
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
      this.currentFloor = floorId;
      let wallId = +this.floorRef.floorAttachWall();
      let wallRef = this.$refs[`wall${wallId}`][0];
      wallRef.wallGeometryObject(wallGeometry);
      wallRef.wallInsideGeometryObject(wallInsideGeometry);
      // 打开墙体编辑页面并显示最新数据
      this.editWallDrawerVisible = false;
      this.handleEditWallClick();
      // 立即触发墙体信息的提交
      this.touchEditWallChange(true, areaGeometries);
    },
    handleWallThickChange() {
      this.touchEditWallChange(false);
      // 更新本地floor组件数据
      this.wallRef.updateWallInfo({
        wall_thick: this.editWallModel.wallThick,
        wall_geometry: this.editWallModel.wallGeometry,
        wall_inside_geometry: this.editWallModel.wallInsideGeometry,
      });
      this.wallRef.updateWallGeometry();
    },

    /*******************************************/
    /**                                       **/
    /**           功能区 Area Drawer           **/
    /**                                       **/
    /*******************************************/

    handleEditAreaClick() {
      if (this.visible && !this.editAreaDrawerVisible) {
        this.$message.info("请关闭当前编辑窗口");
        return;
      }
      this.editAreaDrawerVisible = !this.editAreaDrawerVisible;
      if (!this.editAreaDrawerVisible) {
        this.touchEditAreaChange(true);
        this.currentArea = -1;
        return;
      }
      // 打开功能区编辑窗口，且当前无功能区
      if (this.areaRef === null) {
        // 设置第一个为默认功能区
        this.currentArea = this.floorRef.floorAttachArea()[0];
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
        this.$refs.render.mapFocusMeshTweenInit(point[0], point[1], z);
      }
      this.editAreaModel = {
        areaName: this.areaRef.areaName(),
        areaType: this.areaRef.areaType(),
        areaAttachPOI: this.areaRef.areaAttachPOI(),
        areaAccessLevel: +this.areaRef.areaAccessLevel(),
      };
    },
    handleEditAreaDrawerClose(done) {
      this.touchEditAreaChange(true);
      done();
    },
    async handleEditAreaSubmit(areaId, areaModel) {
      let areaRef = this.$refs[`area${areaId}`][0];
      let info = {
        area_name: areaModel.areaName,
        area_type: areaModel.areaType,
        area_attach_poi: areaModel.areaAttachPOI,
        area_access_level: areaModel.areaAccessLevel,
      };
      let updated = await api.updateArea(areaId, { info });
      if (updated.code !== 200) return;
      let { area_name, area_type, area_attach_poi, area_access_level } =
        updated.data.area;
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
      this.handleEditAreaClick();
      this.currentPOI = poiId;
      this.handleEditPOIClick();
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
      let newPOIId = newPOI.properties.poi_id;
      this.pois.push(newPOI);
      // 更新楼层关联POI列表
      let floorRef = this.$refs[`floor${floor}`][0];
      let poiList = floorRef.floorAttachPOI();
      poiList.push(newPOIId);
      floorRef.floorAttachPOI(poiList);
      // 更新功能区关联POI信息
      let areaRef = this.$refs[`area${area}`][0];
      areaRef.areaAttachPOI(newPOIId);
      this.editAreaModel.areaAttachPOI = newPOIId;
      this.$nextTick(() => {
        // 更新楼层POI
        floorRef.addPOIObject();
      });
    },
    handleAreaTypeChange() {
      this.touchEditAreaChange(false);
      let areaRef = this.$refs[`area${this.currentArea}`][0];
      let type = this.editAreaModel.areaType;
      // 更新当前功能区颜色
      areaRef.setMeshColor(type);
    },

    /*******************************************/
    /**                                       **/
    /**           兴趣点 POI Drawer            **/
    /**                                       **/
    /*******************************************/

    handleEditPOIClick() {
      if (this.visible && !this.editPOIDrawerVisible) {
        this.$message.info("请关闭当前编辑窗口");
        return;
      }
      this.editPOIDrawerVisible = !this.editPOIDrawerVisible;
      if (!this.editPOIDrawerVisible) {
        this.touchEditPOIChange(true);
        this.currentPOI = -1;
        return;
      }
      // 打开POI编辑窗口，且当前无聚焦POI
      if (this.poiRef === null) {
        let pois = this.floorRef.floorAttachPOI();
        if (pois.length > 0) {
          this.currentPOI = pois[0];
        }
      }
      if (this.poiRef === null) return;
      let coordinates = this.poiRef.poiGeometryObject().coordinates;
      this.editPOIModel = {
        poiName: this.poiRef.poiName(),
        poiRes: this.poiRef.poiRes(),
        poiPosX: coordinates[0],
        poiPosY: coordinates[1],
        poiHeight: this.poiRef.poiHeight(),
        poiBelongArea: this.poiRef.poiBelongArea(),
      };
      // 获取目标楼层高度
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
      z += this.poiRef.poiHeight() * zScale;
      // 启动功能区对焦动画
      this.$refs.render.mapFocusMeshTweenInit(
        coordinates[0],
        coordinates[1],
        z
      );
    },
    handleEditPOIDrawerClose(done) {
      this.touchEditPOIChange(true);
      done();
    },
    async handleEditPOISubmit(poiId, poiModel) {
      let poiRef = this.$refs[`poi${poiId}`][0];
      let info = {
        poi_name: poiModel.poiName,
        poi_res: poiModel.poiRes,
        poi_geometry: JSON.stringify({
          type: "Point",
          coordinates: [poiModel.poiPosX, poiModel.poiPosY],
        }),
        poi_height: poiModel.height,
        poi_belong_area: poiModel.poiBelongArea,
      };
      console.log("belong area:", poiModel.poiBelongArea);
      let updated = await api.updatePOI(poiId, info);
      if (updated.code !== 200) return;
      let { poi_name, poi_res, poi_geometry, poi_height, poi_belong_area } =
        updated.data.poi;
      poiRef.updatePOIInfo({
        poi_name,
        poi_res,
        poi_height,
        poi_belong_area,
      });
      poiRef.poiGeometryObject(JSON.parse(poi_geometry));
    },
    /**
     * 新增POI
     */
    async handlePOIAddition() {
      let floor = this.currentFloor;
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
      let created = await api.createPOI(add);
      if (created.code !== 200) {
        this.$message.error("创建POI失败");
        return;
      }
      this.$message.success("创建POI成功");
      let newPOI = created.data.poi;
      this.pois.push(newPOI);
      this.currentPOI = newPOI.properties.poi_id;
      let floorRef = this.$refs[`floor${floor}`][0];
      // 更新楼层关联POI列表
      let poiList = floorRef.floorAttachPOI();
      poiList.push(this.currentPOI);
      floorRef.floorAttachPOI(poiList);
      this.$nextTick(() => {
        // 更新楼层POI
        floorRef.addPOIObject();
        // 跟新POI信息
        let point = this.poiRef.poiGeometryObject().coordinates;
        this.editPOIModel = {
          poiName: this.poiRef.poiName(),
          poiRes: this.poiRef.poiRes(),
          poiPosX: point[0],
          poiPosY: point[1],
          poiHeight: this.poiRef.poiHeight(),
          poiBelongArea: this.poiRef.poiBelongArea(),
        };
        // 获取目标楼层高度
        let { zScale, floorMargin } = data.ThreeObjectConfig;
        let height = this.buildingRef.buildingFloorHeight() * zScale;
        let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
        z += this.poiRef.poiHeight() * zScale;
        // 启动功能区对焦动画
        this.$refs.render.mapFocusMeshTweenInit(point[0], point[1], z);
      });
    },
    /**
     * 删除POI
     */
    async handlePOIDeletion() {
      let floor = +this.currentFloor;
      let deletePOIId = +this.currentPOI;
      let deleted = await api.deletePOI(floor, deletePOIId);
      if (deleted.code !== 200) {
        this.$message.error("删除失败：请重试");
        this.poiDeletionVisible = false;
        return;
      }
      this.$message.success("删除POI成功");
      // 更新楼层关联POI
      let floorRef = this.$refs[`floor${floor}`][0];
      let poiIdList = floorRef.floorAttachPOI();
      let poiIdIndex = poiIdList.findIndex((v) => v == deletePOIId);
      poiIdList.splice(poiIdIndex, 1);
      // 更新功能区关联POI
      let areaId = this.$refs[`poi${deletePOIId}`][0].poiBelongArea();
      if (areaId != -1) {
        this.$refs[`area${areaId}`][0].areaAttachPOI(-1);
      }
      // 删除该POI数据
      const poiIndex = this.pois.findIndex(
        (v) => +v.properties.poi_id === deletePOIId
      );
      this.pois.splice(poiIndex, 1);
      // 关闭询问窗口
      this.poiDeletionVisible = false;
      this.editPOIDrawerVisible = false;
      // 恢复当前视角
      let { zScale, floorMargin } = data.ThreeObjectConfig;
      let height = this.buildingRef.buildingFloorHeight() * zScale;
      let z = this.floorRef.floorLevel() * (height + 2 * floorMargin);
      this.$refs.render.mapFocusFloorTweenInit(z);
    },
    handlePOINameChange() {
      this.touchEditPOIChange(false);
      this.poiRef.updatePOIName(this.editPOIModel.poiName);
    },
    handlePOIPositionChange() {
      this.touchEditPOIChange(false);
      this.poiRef.updatePOIPosition(
        this.editPOIModel.poiPosX,
        this.editPOIModel.poiPosY
      );
    },
    handlePOIHeightChange() {
      this.touchEditPOIChange(false);
      this.poiRef.updatePOIHeight(this.editPOIModel.poiHeight);
    },
    handlePOIResChange() {
      this.touchEditPOIChange(false);
      this.poiRef.updatePOIRes(this.editPOIModel.poiRes);
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

.edit-drawer .edit-btn-group {
  @include flex-between-middle();
}

.edit-drawer .edit-btn-group .edit-btn {
  flex-grow: 1;
}

.edit-drawer ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.edit-building-drawer .building-center,
.edit-poi-drawer .poi-center {
  @include flex-between-middle($wrap: nowrap);
}

.edit-building-drawer .building-center ::v-deep .el-input .el-input__inner {
  padding-left: 50px;
}

.edit-building-drawer .building-center .input-text-prefix,
.edit-poi-drawer .poi-center .input-text-prefix {
  padding: 0px 5px;
}

.edit-building-drawer .building-center .building-center-input:first-child,
.edit-poi-drawer .poi-center .poi-center-input:first-child {
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

.edit-drawer-container .edit-floor-new,
.edit-drawer-container .edit-poi-new {
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

.edit-floor-form .floor-delete-btn,
.edit-poi-form .poi-delete-btn {
  margin-left: 10px;
}

.el-popover .floor-popover-input ::v-deep,
.el-popover .poi-popover-input ::v-deep {
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

.el-select-dropdown .area-type-label {
  @include flex-between-middle;
}

.el-select-dropdown .area-type-color {
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.el-select-group .el-select-dropdown__item {
  height: auto;
  line-height: auto;
}

.el-select-group .poi-image-item {
  @include flex-between-middle;
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

.back-button-container {
  position: absolute;
  top: 50px;
}
</style>