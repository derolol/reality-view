<template>
  <div class="map-list">
    <div class="map-list-header">
      <div>
        <el-button type="primary" @click="createMapDialogVisible = true"
          >创建地图</el-button
        >
        <el-button @click="importDialogVisible = true">导入地图</el-button>
      </div>
      <el-input class="header-search" placeholder="搜索地图"
        ><svg-icon
          slot="prefix"
          iconName="search"
          iconStyle="header-search-icon"
      /></el-input>
    </div>

    <!-- 
      
      创建地图
      
    -->
    <el-dialog title="创建地图" :visible.sync="createMapDialogVisible">
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
          <el-button size="medium" @click="createBuilding">新增建筑</el-button>
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
        <el-button @click="createMapDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createMapDialogVisible = false"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <!-- 
      
      创建建筑

    -->
    <el-dialog title="创建建筑" :visible.sync="createBuildingDialogVisible">
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
              v-for="typeList in buildingTypeList"
              :key="typeList.label"
              :label="typeList.label"
            >
              <el-option
                v-for="type in typeList.options"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="建筑中心">
          <div class="building-center">
            <span class="building-center-label">经度</span>
            <el-input
              v-model="createBuildingModel.buildingCenterLng"
              type="number"
              size="medium"
            />
            <span class="building-center-label building-center-lat">纬度</span>
            <el-input
              v-model="createBuildingModel.buildingCenterLat"
              type="number"
              size="medium"
            />
            <el-button size="medium" type="success" class="building-center-btn"
              >获取中心经纬度</el-button
            >
          </div>
        </el-form-item>
        <el-form-item label="建筑楼层高度">
          <el-input
            v-model="createBuildingModel.buildingFloorHeight"
            type="number"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="建筑轮廓">
          <el-button type="primary" size="medium">建筑轮廓绘制</el-button>
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
export default {
  name: "map-list",
  data() {
    return {
      accessLevel: data.MapAccessLevelList,

      createMapDialogVisible: false,
      mapTags: ["室内", "大型商场", "停车场", "医院", "学校", "游戏", "景点"],
      createMapModel: {
        mapName: "",
        mapTags: [],
        mapAttachBuilding: [],
        mapAccessLevel: 1,
      },

      createBuildingDialogVisible: false,
      buildingTypeList: [
        {
          label: "商业建筑",
          options: ["商场", "写字楼", "超市", "菜市场", "停车场"],
        },
        {
          label: "便民建筑",
          options: [
            "医院",
            "学校",
            "图书馆",
            "科技馆",
            "火车站",
            "飞机场",
            "公园",
            "银行",
          ],
        },
        {
          label: "居住建筑",
          options: ["住宅", "酒店"],
        },
      ],
      createBuildingModel: {
        buildingName: "",
        buildingType: "",
        buildingCenterLng: 0,
        buildingCenterLat: 0,
        buildingFloorHeight: 3,
        buildingAccessLevel: 1,
      },

      importDialogVisible: false,
    };
  },
  methods: {
    createMapTagChange() {
      let len = this.createMapModel.mapTags.length;
      if (len > 5) {
        this.createMapModel.mapTags.splice(len - 1, 1);
        this.$message.info({ message: "仅限选择5个标签" });
      }
    },
    createBuilding() {
      this.createMapDialogVisible = false;
      this.createBuildingDialogVisible = true;
    },
    cancelCreateBuilding() {
      this.createBuildingDialogVisible = false;
      this.createMapDialogVisible = true;
    },
    confirmCreateBuilding() {
      this.createBuildingDialogVisible = false;
      this.createMapDialogVisible = true;
    },
  },
};
</script>

<style lang="scss">
.map-list-header {
  @include flex-between-middle;
  margin-bottom: 20px;
}

.header-search {
  width: 300px;
}

.header-search .el-input__prefix {
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

.create-building-form .building-type-select {
  width: 100%;
}

.create-building-form .building-center {
  @include flex-between-middle($wrap: nowrap);
}

.create-building-form .building-center .building-center-label {
  display: inline-block;
  margin-right: 5px;
  width: 40px;
}

.create-building-form .building-center .building-center-lat {
  margin-left: 10px;
}

.create-building-form .building-center .el-input {
  width: auto;
}

.create-building-form .building-center .building-center-btn {
  margin-left: 10px;
}
</style>