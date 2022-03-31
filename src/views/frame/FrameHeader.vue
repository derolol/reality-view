<template>
  <div class="bar">
    <div class="bar-sign">
      <div class="bar-sign-logo" @click="jumpHomepage">
        <svg-icon icon-name="logo" icon-style="bar-sign-logo-icon" />
      </div>
      <div class="bar-sign-title" @click="jumpHomepage">Reality</div>
      <el-input
        placeholder="搜索"
        v-model="searchingContent"
        class="bar-sign-search"
      >
        <svg-icon
          slot="prefix"
          iconName="search"
          iconClass="bar-sign-search-icon"
        />
      </el-input>
    </div>
    <div class="bar-control">
      <el-menu
        class="bar-menu"
        :default-active="menuActiveIndex"
        mode="horizontal"
        @select="menuSelect"
      >
        <el-menu-item
          v-for="(item, key) in menuItems"
          :key="item.index"
          :index="item.index"
        >
          <span class="menu-item-title">
            <svg-icon :icon-name="item.icon" icon-style="menu-item-icon" />{{
              item.text
            }}
          </span>
        </el-menu-item>
      </el-menu>
      <div class="bar-login">
        <el-button
          type="info"
          round
          plain
          size="medium"
          class="bar-login-btn"
          v-if="!passCheck"
          @click="jumpLogin"
          >登录</el-button
        >
        <div class="user-info" v-if="passCheck">
          <span class="bar-login-user">你好, {{ currentUser }}</span>
          <el-avatar
            class="bar-login-profile"
            size="medium"
            :src="currentUserAvatar"
          ></el-avatar>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "header-nav-bar",
  data() {
    return {
      lastClicked: Date.now(),
    };
  },
  created() {
    // 根据路由调整当前menu
    if (this.menuItems.hasOwnProperty(this.$route.name)) {
      this.$store.commit("setActiveItem", this.$route.name);
    }
  },
  methods: {
    async menuSelect(item) {
      // 防抖
      if (this.lastClicked - Date.now() > 50) return;
      this.lastClicked = Date.now();
      // 跳转
      this.$router.push({ name: item });
      this.$store.commit("setActiveItem", item);
    },
    jumpLogin() {
      this.$router.push({ name: "login" });
    },
    jumpHomepage() {
      this.$router.push({ name: "homepage" });
      this.$store.commit("setActiveItem", "homepage");
    },
  },
  computed: {
    menuItems() {
      return this.$store.state.menuItems;
    },
    menuActiveIndex() {
      return this.$store.getters.getActiveItem;
    },
    currentUser() {
      return this.$store.state.currentUser;
    },
    currentUserAvatar() {
      return this.$store.state.currentUserImagePath;
    },
    passCheck() {
      return this.$store.state.currentUser ? true : false;
    },
  },
};
</script>

<style lang="scss" scoped>
.bar {
  padding: 30px 80px;
  @include flex-between-middle;
}

.bar .bar-sign {
  @include flex-between-middle($justify-content: flex-start);
}

.bar .bar-sign .bar-sign-logo,
.bar-sign-title {
  cursor: pointer;
}

.bar .bar-sign .bar-sign-logo .bar-sign-logo-icon {
  width: 30px;
  height: 30px;
}

.bar .bar-sign .bar-sign-title {
  font-size: 22px;
  font-weight: 800;
  background-image: linear-gradient(
    45deg,
    $--color-purple-deep,
    $--color-purple-main
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: Arial;
  line-height: 20px;
  padding: 5px;
}

.bar .bar-menu .el-menu-item {
  height: $--menu-height;
  line-height: $--menu-height;
}

.menu-item-title {
  @include flex-between-middle;
}

.menu-item-icon {
  height: $--menu-height;
  line-height: $--menu-height;
  width: 18px;
  height: 18px;
  display: inline-block;
  padding: 0 2px;
}

.bar-control {
  @include flex-between-middle;
}

.bar-login {
  margin-left: 20px;
}

.bar-login .user-info {
  @include flex-between-middle;
}

.bar-login .user-info .bar-login-profile {
  margin-left: 5px;
}

.bar-sign .bar-sign-search {
  width: auto;
  margin-left: 20px;
}

.bar-sign .bar-sign-search .el-input__inner {
  border-radius: 20px;
}

.bar-sign-search ::v-deep .el-input__prefix {
  @include flex-between-middle($justify-content: flex-start);
}

.bar-sign .bar-sign-search-icon {
  width: 20px;
  height: 20px;
  margin: 0 5px;
}
</style>