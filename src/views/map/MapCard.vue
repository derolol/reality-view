<template>
  <div class="map-card">
    <el-card
      class="map-card-container"
      shadow="hover"
      @click.native="jumpEditMap"
    >
      <el-image class="map-card-preview-image" fit="cover" :src="imageUrl" lazy>
        <div
          slot="placeholder"
          :class="{
            'image-placeholder-slot': !newMap,
            'image-placeholder-slot-new': newMap,
          }"
        ></div>
        <div
          slot="error"
          :class="{
            'image-error-slot': !newMap,
            'image-error-slot-new': newMap,
          }"
        >
          <div class="image-error-slot-container">
            <svg-icon
              v-show="newMap"
              iconName="plus"
              iconClass="new-map-plus-icon"
            />
            <div class="image-error-slor-text">
              {{ newMap ? "点击新建地图" : "点击进入地图初始化" }}
            </div>
          </div>
        </div>
      </el-image>
      <div v-if="!newMap" class="map-card-info">
        <div>{{ mapInfo.map_name }}</div>
      </div>
      <div v-if="!newMap" class="map-card-tool">
        <div class="map-card-tool-container">
          <div
            class="map-tool-icon-container"
            v-for="tool in toolList"
            :key="tool.iconName"
          >
            <el-tooltip effect="dark" :content="tool.toolDesc" placement="top">
              <svg-icon
                :iconName="tool.iconName"
                iconClass="map-card-icon"
                @click.native.stop="handleToolClick(tool.iconName)"
              />
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from "@/request/editor";
export default {
  name: "mapCard",
  props: {
    imagePath: {
      type: String,
      default: "",
    },
    mapInfo: {
      type: Object,
      default() {
        return {};
      },
    },
    newMap: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  data() {
    return {
      toolList: {
        edit: { iconName: "edit", toolDesc: "编辑地图信息" },
        delete: { iconName: "delete", toolDesc: "删除地图" },
        share: { iconName: "share", toolDesc: "分享地图" },
      },
    };
  },
  computed: {
    imageUrl() {
      return this.$store.state.mapPreviewBasePath + this.imagePath;
    },
  },
  methods: {
    jumpEditMap() {
      if (
        this.mapInfo !== null &&
        typeof this.mapInfo === "object" &&
        this.mapInfo.hasOwnProperty("map_id")
      ) {
        this.$router.push({
          name: "mapEditor",
          params: { id: this.mapInfo.map_id },
        });
      }
    },
    async handleToolClick(tool) {
      if (tool === "edit") {
        this.$message.info("该功能未开放");
        return;
      }
      if (tool === "delete") {
        let cancelMessage = "取消删除地图";
        let messageType = "info";
        try {
          await this.$confirm("是否确认删除该地图", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          });
          let deleted = await request.deleteMap(this.mapInfo.map_id);
          if (deleted.code !== 200 || !deleted.data.deletedStatus) {
            cancelMessage = "删除地图失败";
            messageType = "error";
            throw new Error("删除失败");
          }
          this.$emit("getMapList");
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        } catch (err) {
          this.$message({
            type: messageType,
            message: cancelMessage,
          });
        }
        return;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.map-card {
  width: 100%;
  position: relative;
  margin-bottom: 20px;
}

.map-card-container {
  height: 240px;
  cursor: pointer;
}

.map-card-container ::v-deep .el-card__body {
  width: 100%;
  padding: 0px;
}

.map-card-container ::v-deep .el-image {
  width: 100%;
}

.map-card-preview-image {
  height: 200px;
}

.map-card .image-placeholder-slot {
  width: 100%;
  height: 200px;
  background-color: $--color-purple-white;
}

.map-card .image-placeholder-slot-new {
  width: 100%;
  height: 200px;
  background-color: $--color-disabled;
}

.map-card .image-error-slot {
  width: 100%;
  height: 200px;
  background-color: $--color-purple-white;
  text-align: center;
  font-size: 16px;
  line-height: 200px;
}

.map-card .image-error-slot-new {
  width: 100%;
  height: 200px;
  color: $--color-text;
  background-color: $--color-disabled;
  text-align: center;
  font-size: 16px;
  line-height: 200px;
}

.map-card .image-error-slot-container {
  @include flex-between-middle(
    $justify-content: center,
    $align-content: center
  );
  flex-direction: column;
  height: 100%;
}

.map-card .image-error-slot-new .image-error-slor-text {
  margin-top: 5px;
  line-height: 20px;
}

.map-card-info {
  padding: 10px 20px;
}

.map-card-tool {
  position: absolute;
  top: 10px;
  right: 10px;
}

.map-card-tool .map-card-tool-container {
  @include flex-between-middle($justify-content: flex-end);
}

.map-card-tool .map-tool-icon-container {
  padding: 5px;
  border-radius: 5px;
}

.map-card-tool .map-tool-icon-container:hover {
  color: $--color-purple-highlight;
  background-color: #ffffff66;
  cursor: pointer;
}

.map-card-tool .map-card-icon {
  width: 20px;
  height: 20px;
}

.new-map-plus-icon {
  width: 50px;
  height: 50px;
}
</style>