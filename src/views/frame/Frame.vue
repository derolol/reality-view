<template>
  <div class="container">
    <el-card>
      <div class="header">
        <frame-header />
      </div>
      <div class="body">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
      <div class="footer">
        <frame-footer />
      </div>
    </el-card>
  </div>
</template>

<script>
import FrameFooter from "./FrameFooter.vue";
import FrameHeader from "./FrameHeader.vue";
export default {
  name: "frame",
  components: { FrameHeader, FrameFooter },
};
</script>

<style>
.container {
  padding: 20px;
}

.body {
  padding: 50px;
  min-height: 500px;
}

.footer {
  width: 100%;
}
</style>