<template>
  <div class="map-card">
    <el-card class="map-card-container">
      <el-image :src="imageUrl" lazy></el-image>
      <div>{{ mapName }}</div>
      <svg-icon iconName="edit" iconStyle="map-card-icon" />
      <svg-icon iconName="share" iconStyle="map-card-icon" />
    </el-card>
  </div>
</template>

<script>
export default {
  name: "mapCard",
  props: {
    imageUrl: {
      type: String,
      default: "",
    },
    mapName: {
      type: String,
      default: "",
    },
  },
};
</script>

<style>
.map-card {
}

.map-card-container {
  position: absolute;
}

.map-card-icon {
  width: 20px;
  height: 20px;
}
</style>