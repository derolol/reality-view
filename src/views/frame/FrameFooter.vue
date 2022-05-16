<template>
  <div class="footer">
    <div class="footer-container">
      <div class="title">加入我们</div>
      <div class="title">联系我们</div>
    </div>
    <div class="footer-container">
      <div class="icon"></div>
      <div class="icon"></div>
      <div class="icon"></div>
      <div class="icon"></div>
    </div>
    <div class="info">
      <div class="state">互联网ICP备案: <a
          class="icp-link"
          target="_blank"
          href="https://beian.miit.gov.cn"
        >粤ICP备2022052940号</a></div>
      <div class="state copyright">Copyright ©2018~2022 Derolol. All Rights Reserved.</div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.footer {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 20px;
  background-color: $--color-purple_main;
}

.footer-container {
  @include flex-between-middle($justify-content: center);
}

.title {
  color: white;
  font-size: 18px;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 30px;
}

.icon {
  width: 30px;
  height: 30px;
  border: 2px solid white;
  border-radius: 100%;
  margin-left: 3px;
  margin-right: 3px;
  margin-top: 15px;
}

.info {
  width: 100%;
  position: absolute;
  bottom: 15px;
}

.state {
  color: white;
  text-align: center;
  font-size: 16px;
  margin: 2px 0px;
}

.icp-link {
  color: white;
  text-decoration: none;
}

.copyright {
  margin-top: 10px;
}
</style>