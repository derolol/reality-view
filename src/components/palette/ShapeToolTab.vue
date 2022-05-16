<template>
  <div class="shape-tool-tab">
    <!-- 

    绘图菜单

    -->
    <el-menu
      class="palette-menu"
      :default-active="menuIndex"
      :collapse="true"
      @select="handleMenuSelect"
    >
      <el-menu-item index="1">
        <i>
          <svg-icon
            iconName="vector"
            iconClass="menu-icon"
          />
        </i>
        <span slot="title">绘制形状</span>
      </el-menu-item>
      <el-menu-item index="2">
        <i>
          <svg-icon
            iconName="setting"
            iconClass="menu-icon"
          />
        </i>
        <span slot="title">调整属性</span>
      </el-menu-item>
      <el-menu-item
        disabled
        index="3"
      >
        <i>
          <svg-icon
            iconName="portfolio"
            iconClass="menu-icon"
          />
        </i>
        <span slot="title">工具箱</span>
      </el-menu-item>
      <el-menu-item
        disabled
        index="4"
      >
        <i>
          <svg-icon
            iconName="question"
            iconClass="menu-icon"
          />
        </i>
        <span slot="title">帮助中心</span>
      </el-menu-item>
    </el-menu>
    <!-- 

    绘图工具面板

  -->
    <div class="palette-control">
      <!-- 

      1. 形状

     -->
      <div
        class="palette-control-shape"
        v-show="menuIndex === '1'"
      >
        <div class="bool-mode-group">
          <el-radio-group
            v-model="currentShapeMode"
            @change="shapeModeChange"
          >
            <el-radio-button
              v-for="bool in boolItems"
              :key="bool.shape"
              :label="bool.shape"
              :size="medium"
            >
              <el-tooltip
                :content="bool.desc"
                placement="bottom"
              >
                <svg-icon
                  :iconName="bool.shape"
                  :iconClass="
                    bool.shape === 'single'
                      ? 'bool-mode-icon-spec'
                      : 'bool-mode-icon'
                  "
                />
              </el-tooltip>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div
          v-for="group in itemGroup"
          :key="group.label"
        >
          <div class="shape-title">{{ group.label }}</div>
          <el-row>
            <el-col
              :span="8"
              v-for="item in group.items"
              :key="itemList[item].shape"
            >
              <el-tooltip
                :content="itemList[item].disabled ? '禁用' : '单击开始绘制'"
                placement="bottom"
              >
                <shape-item
                  :shape="itemList[item].shape"
                  :shapeDesc="itemList[item].desc"
                  :disabled="itemList[item].disabled"
                  @click.native="handleShapeItemClick(item)"
                />
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 

      2. 属性

     -->
      <div
        class="palette-setting-attribute"
        v-show="menuIndex === '2'"
      >
        <div v-show="currentShapeType === 'rectangle'">
          <div class="setting-warn-info">设置{{ shapeDesc }}属性</div>
          <el-form
            class="setting-form"
            label-width="40px"
          >
            <el-form-item label="宽度">
              <el-input v-model="settingRectWidth">
                <span
                  class="input-text-suffix"
                  slot="suffix"
                >m</span>
              </el-input>
            </el-form-item>
            <el-form-item label="高度">
              <el-input v-model="settingRectHeight">
                <span
                  class="input-text-suffix"
                  slot="suffix"
                >m</span>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleShapeItemClick(currentShapeType)"
              >提交</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-show="currentShapeType === 'polygon'">
          <div class="setting-warn-info">设置{{ shapeDesc }}属性</div>
          当前无已创建图形
        </div>
      </div>
      <div v-show="menuIndex === '3'"></div>
      <div v-show="menuIndex === '4'"></div>
    </div>
  </div>
</template>

<script>
import ShapeItem from "./ShapeItem.vue";

export default {
  name: "shapeToolTab",
  components: { ShapeItem },
  props: {
    disabledList: {
      type: Object,
      require: false,
      default() {
        return [];
      },
    },
    allowShapeBool: {
      type: Boolean,
      require: true,
    },
  },
  data() {
    return {
      menuIndex: "1",
      currentShapeType: "",
      currentShapeMode: "single",
      boolItems: {
        single: {
          shape: "single",
          desc: "无布尔运算",
          disabled: false,
        },
        intersection: {
          shape: "intersection",
          desc: "交集",
          disabled: false,
        },
        union: {
          shape: "union",
          desc: "并集",
          disabled: false,
        },
        diff: {
          shape: "diff",
          desc: "减去顶层",
          disabled: false,
        },
        xor: {
          shape: "xor",
          desc: "异或",
          disabled: false,
        },
      },
      itemGroup: {
        line: {
          label: "线条",
          items: ["line", "multi-line"],
        },
        shape: {
          label: "形状",
          items: ["rectangle", "regular-polygon", "polygon"],
        },
      },
      itemList: {
        line: {
          shape: "line",
          desc: "直线",
          disabled: false,
        },
        "multi-line": {
          shape: "multi-line",
          desc: "折线",
          disabled: false,
        },
        rectangle: {
          shape: "rectangle",
          desc: "矩形",
          disabled: false,
        },
        "regular-polygon": {
          shape: "regular-polygon",
          desc: "正多边形",
          disabled: false,
        },
        polygon: {
          shape: "polygon",
          desc: "任意多边形",
          disabled: false,
        },
      },
    };
  },
  created() {
    this.$emit("shapeModeClick", this.currentShapeMode);
  },
  watch: {
    disabledList() {
      for (let key in this.itemList) {
        if (this.disabledList.indexOf(key) !== -1) {
          this.itemList[key] = Object.assign({}, this.itemList[key], {
            disabled: true,
          });
        } else {
          this.itemList[key] = Object.assign({}, this.itemList[key], {
            disabled: false,
          });
        }
      }
    },
  },
  computed: {
    shapeDesc() {
      if (
        typeof this.currentShapeType !== "string" ||
        this.currentShapeType === ""
      )
        return "";
      return this.itemList[this.currentShapeType].desc;
    },
  },
  methods: {
    /**
     * 处理用户菜单切换的操作
     */
    handleMenuSelect(menu) {
      this.menuIndex = menu;
    },
    /**
     * 处理创建形状按钮被点击的操作
     */
    handleShapeItemClick(shape) {
      if (this.itemList[shape].disabled) return;
      this.currentShapeType = shape;
      this.$emit("shapeItemClick", shape);
    },
    shapeModeChange(bool) {
      if (bool === "single") return;
      console.log(this.allowShapeBool);
      if (!this.allowShapeBool) {
        this.currentShapeMode = "single";
        this.$message.info("该绘制模式下布尔运算被禁用");
        return;
      }
      this.$emit("shapeModeClick", bool);
    },
  },
};
</script>

<style lang="scss" scoped>
.shape-tool-tab {
  height: 100%;
  @include flex-between-middle($justify-content: flex-start, $wrap: nowrap);
  box-shadow: 1px 0px 5px #c2c2c2;
}

.shape-tool-tab .palette-menu {
  height: 100%;
  width: 60px;
  min-width: 60px;
}

.shape-tool-tab .palette-menu .menu-icon {
  width: 22px;
  height: 22px;
}

.shape-tool-tab .palette-control {
  flex-grow: 1;
  height: 100%;
  display: inline-block;
}

.palette-control-shape .shape-title {
  @include flex-between-middle($justify-content: flex-start);
  padding: 8px 0px 8px 20px;
  color: $--color-purple-deep;
  font-weight: 900;
  background-color: $--color-purple-white;
}

.setting-warn-info {
  margin: 20px;
  border: 2px solid $--color-purple-main;
  border-radius: 5px;
  height: 50px;
  color: $--color-purple-main;
  text-align: center;
  line-height: 50px;
}

.palette-setting-attribute {
  overflow-y: scroll;
  height: 100%;
}

.setting-warn-info {
  margin: 20px;
  border: 2px solid $--color-purple-main;
  border-radius: 5px;
  height: 50px;
  color: $--color-purple-main;
  text-align: center;
  line-height: 50px;
}

.setting-form {
  margin: 0 20px;
}

.setting-form .el-form-item {
  margin-bottom: 10px;
}

.input-text-prefix,
.input-text-suffix {
  margin: 0px 4px;
  font-size: 16px;
}

.setting-point-input-group {
  @include flex-between-middle($wrap: nowrap);
}

.setting-point-input-group .setting-point-input:first-child {
  margin-right: 10px;
}

.bool-mode-group {
  @include flex-between-middle($justify-content: center);
  margin: 10px auto;
}

.bool-mode-group .el-radio-group ::v-deep .el-radio-button__inner {
  width: 60px;
  height: 40px;
  color: $--color-text;
}

.bool-mode-group .el-radio-group ::v-deep .el-radio-button__inner:hover {
  color: $--color-purple-main;
}

.bool-mode-group
  .el-radio-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  color: white;
}

.bool-mode-group
  .el-radio-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  color: white;
}

.bool-mode-icon {
  position: absolute;
  left: 30px;
  top: 20px;
  margin-left: -11px;
  margin-top: -11px;
  width: 22px;
  height: 22px;
}

.bool-mode-icon-spec {
  position: absolute;
  left: 30px;
  top: 20px;
  margin-left: -8px;
  margin-top: -8px;
  width: 16px;
  height: 16px;
}
</style>