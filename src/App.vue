<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0px;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: $--color-purple-white;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px $--color-purple-light;
  background-color: $--color-purple-light;
}
</style>
