<template>
  <div class="login" :style="loginSize">
    <div class="login-card">
      <div class="login-card-left">
        <div class="title login-card-left-item">Welcome!</div>
        <div class="image login-card-left-item"></div>
        <div class="login-card-left-item">
          <div class="desc-ch">在线室内地图编辑器</div>
          <div class="desc-en">Online indoor map Editor</div>
        </div>
      </div>
      <div class="login-card-right">
        <div class="sign">
          <svg-icon iconName="logo" iconClass="sign-logo" />
          <div class="sign-title">Reality</div>
        </div>
        <el-form class="login-form" label-width="58px">
          <el-form-item>
            <span slot="label" class="login-form-item-label"
              ><svg-icon
                iconName="user"
                iconClass="login-form-item-label-icon"
              />账号</span
            >
            <el-input v-model="userName" />
          </el-form-item>
          <el-form-item>
            <span slot="label" class="login-form-item-label"
              ><svg-icon
                iconName="lock"
                iconClass="login-form-item-label-icon"
              />密码</span
            >
            <el-input v-model="userPassword" type="password" />
          </el-form-item>
          <el-form-item>
            <div class="login-btn-group">
              <el-button
                class="login-btn"
                type="primary"
                size="medium"
                @click="userLogin"
                >登录</el-button
              >
              <el-button
                class="register-btn"
                size="medium"
                @click="userRegister"
                >注册</el-button
              >
            </div>
          </el-form-item>
          <el-form-item>
            <div class="login-option-group">
              <span class="third-option"
                ><svg-icon
                  iconName="wechat"
                  iconClass="login-option-icon"
                />第三方登录</span
              >
              <span class="forget-option"
                ><svg-icon
                  iconName="info"
                  iconClass="login-option-icon"
                />忘记密码</span
              >
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/request/user";
import SvgIcon from "@/components/SvgIcon.vue";
export default {
  components: { SvgIcon },
  name: "login",
  data() {
    return {
      userName: "",
      userPassword: "",

      windowWidth: 0,
      windowHeight: 0,
      loginSize: "",
    };
  },
  watch: {},
  async created() {
    window.addEventListener("resize", this.resetWindowSize, true);
    this.resetWindowSize();
    if (this.$route.params.before) {
      this.$message.warning({ message: "请先登录", duration: 1000 });
    }
  },
  activated() {},
  methods: {
    // 用户登录
    async userLogin() {
      const key = (await api.getPublicKey()).data.key;
      const res = await api.userLogin(key, this.userName, this.userPassword);
      // 登录失败
      if (res.code !== 200) {
        let info = "登录失败";
        console.log(res);
        if (res.code === 403001) {
          info = "请输入正确的用户名或密码";
        }
        if (res.code === 403002) {
          info = "用户不存在";
        }
        if (res.code === 403003) {
          info = "用户密码错误";
        }
        this.$message.warning({ message: info, duration: 1000 });
        return;
      }
      // 登录成功存储用户信息及token
      const userInfo = res.data.info;
      const token = res.data.token;
      localStorage.setItem("reality_token", token);
      localStorage.setItem("reality_user_info", JSON.stringify(userInfo));
      this.$store.commit("setUser", userInfo);
      this.$message.success({ message: "登录成功", duration: 1000 });
      // 判断用户是否被重定向到登录页面
      let routeName = this.$route.params.before
        ? this.$route.params.before
        : "homepage";
      this.$router.push({ name: routeName });
    },
    // 用户注册
    async userRegister() {
      const key = (await api.getPublicKey()).data.key;
      const res = await api.userRegister(key, this.userName, this.userPassword);
      // 注册失败
      if (res.code !== 200) {
        let info = "注册失败";
        if (res.code === 412001) {
          info = "请输入正确的用户名或密码";
        }
        if (res.code === 412002) {
          info = "用户已存在";
        }
        this.$message.warning({ message: info, duration: 1000 });
        return;
      }
      // 注册成功
      const userInfo = res.data.info;
      this.$confirm("注册成功, 现在是否登录", "注册成功提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await this.userLogin();
        })
        .catch(() => {});
    },
    resetWindowSize() {
      this.windowHeight = window.innerHeight < 500 ? 500 : window.innerHeight;
      this.loginSize = `height: ${this.windowHeight}px;`;
    },
  },
};
</script>

<style lang="scss">
.login {
  width: 100%;
  @include flex-between-middle($justify-content: center);
  background-color: $--color-purple-white;
}

.login .login-card {
  margin-top: -50px;
  width: 700px;
  height: 400px;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  border: 1px solid $--color-purple-white;
  background-color: $--color-purple-white;
  overflow: hidden;
  color: #6949b8;
  transition: 0.3s;
  @include flex-between-middle($justify-content: flex-start);
}

.login-card-left {
  width: 40%;
  height: 100%;
  color: white;
  background-color: $--color-purple-deep;
  @include flex-between-middle($align-content: space-around);
}

.login-card-left-item {
  margin-left: 40px;
}

.login-card-right {
  width: calc(60% - 100px);
  height: calc(100% - 100px);
  padding: 50px;
}

.login-card-left .title {
  font-size: 40px;
  font-weight: 500;
  color: #6949b8;
  text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
  font-family: "Microsoft YaHei";
}

.login-card-left .image {
}

.login-card-left .desc-ch {
  font-family: "Microsoft YaHei";
  font-size: 15px;
}

.login-card-left .desc-en {
  font-size: 13px;
  font-family: "Microsoft YaHei";
}

.login-card-right .sign {
  padding: 10px;
  @include flex-between-middle($justify-content: center);
}

.sign .sign-logo {
  width: 40px;
  height: 40px;
}

.sign .sign-title {
  font-size: 30px;
  font-weight: 800;
  background-image: linear-gradient(
    45deg,
    $--color-purple-deep,
    $--color-purple-main
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: Arial;
  line-height: 40px;
  margin-left: 5px;
}

.login-form {
  margin-top: 20px;
}

.login-form .el-form-item:first-child,
.el-form-item:nth-child(2) {
  margin-bottom: 10px;
}

.login-form .el-form-item:nth-child(3) {
  margin-bottom: 0px;
}

.login-form .login-form-item-label {
  color: $--color-purple-deep;
  @include flex-between-middle($justify-content: flex-start);
}

.login-form .login-form-item-label-icon {
  width: 15px;
  height: 15px;
  margin-right: 2px;
}

.login-btn-group {
  @include flex-between-middle($justify-content: center);
}

.login-btn-group .login-btn {
  border: none;
  flex-grow: 1;
}

.login-btn-group .register-btn {
  flex-grow: 1;
}

.login-option-group {
  @include flex-between-middle($justify-content: space-between);
}

.login-option-group span {
  flex-shrink: 1;
  cursor: pointer;
  @include flex-between-middle($justify-content: flex-start);
}

.login-option-group span:hover {
  color: $--color-purple-highlight;
  text-decoration: underline;
}

.third-option {
  text-align: left;
}

.forget-option {
  text-align: right;
}

.login-option-icon {
  width: 15px;
  height: 15px;
  margin-right: 2px;
}
</style>