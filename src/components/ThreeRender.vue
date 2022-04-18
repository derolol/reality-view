<template>
  <div
    id="mapRender"
    class="map-render"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMoveDebounce"
    @mouseup="handleMouseUp"
  >
    <slot />
  </div>
</template>

<script>
import {
  Scene,
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
  PointLight,
  AmbientLight,
  WebGLRenderer,
  CameraHelper,
  AxesHelper,
  GridHelper,
  Euler,
  Raycaster,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import toolUtil from "@/store/toolUtil";
export default {
  name: "MapRender",
  props: {
    width: {
      type: Number,
      require: true,
      default: 300,
    },
    height: {
      type: Number,
      require: true,
      default: 300,
    },
  },
  data() {
    return {
      mapScene: null,
      mapOrthographicCamera: null,
      mapPerspectiveCamera: null,
      mapRenderer: null,
      mapController: null,
      mapGridHelper: null,
      mapGridCellSize: 5,
      mapPointLight1: null,
      mapPointLight2: null,

      getCanvasImage: false,
      getImageCallback: true,

      cameraMovePosition: null,
      focusCurrentFloor: null,
      focusCurrentFloorOn: false,
      focusCurrentArea: null,
      focusCurrentAreaOn: false,
      floorBox: null,
      floorHeight: null,
      areaBox: null,

      mouseMove: false,
      handleMouseMoveDebounce: null,
    };
  },
  watch: {
    width() {
      this.mapRenderResize();
    },
    height() {
      this.mapRenderResize();
    },
  },
  computed: {
    refs() {
      return this.$store.state.mapObjectRefs;
    },
  },
  created() {
    this.handleMouseMoveDebounce = toolUtil.debounce((e) => {
      this.handleMouseMove(false, e);
    }, 20);
  },
  mounted() {},
  methods: {
    startRender() {
      this.mapRenderPrepare();
      this.addObjects();
      this.mapRenderAction();
    },
    addObjects() {
      if (!this.$slots.default) return;
      for (let el of this.$slots.default) {
        const tag = el.componentOptions.tag;
        if (tag === "building-object") {
          el.componentInstance.initGroupObjects();
          let group = el.componentInstance.getBuildingGroup();
          this.mapScene.add(group);
        }
      }
    },
    mapRenderPrepare() {
      this.mapSceneInit();
      this.mapRendererInit();
      this.mapPerspectiveCameraInit();
      this.mapOrthographicCameraInit(60);
      this.mapLightInit();
      this.mapHelperInit();
      this.mapControllerInit();
    },
    /**
     * 渲染场景初始化
     */
    mapSceneInit() {
      this.mapScene = new Scene();
      // this.mapScene.background = new Color(0xf7f3ff);
    },
    /**
     * 场景渲染器初始化
     */
    mapRendererInit() {
      this.mapRenderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        precision: "highp",
      });
      this.mapRenderer.setSize(this.width, this.height);
      this.mapRenderer.setClearAlpha(0.0);
      document
        .getElementById("mapRender")
        .appendChild(this.mapRenderer.domElement);
    },
    /**
     * 透视相机初始化
     */
    mapPerspectiveCameraInit() {
      this.mapPerspectiveCamera = new PerspectiveCamera(
        75,
        this.width / this.height,
        0.1,
        1000
      );
      this.mapPerspectiveCamera.position.z = 0;
      this.mapPerspectiveCamera.position.x = 0;
      this.mapPerspectiveCamera.position.y = -100;
      this.mapPerspectiveCamera.up = new Vector3(0, 0, 1);
      this.mapPerspectiveCamera.lookAt(new Vector3(0, 0, 0));
    },
    /**
     * 正交相机初始化
     */
    mapOrthographicCameraInit(showSize) {
      // 根据当前宽高比适配最小显示范围
      showSize = typeof showSize === "number" ? showSize : 300;
      let right = showSize;
      let top = showSize;
      if (this.width > this.height) {
        right = (this.width / this.height) * top;
      }
      if (this.width < this.height) {
        top = (this.hegiht / this.width) * right;
      }
      // 创建正交相机对象
      this.mapOrthographicCamera = new OrthographicCamera(
        -right,
        right,
        top,
        -top,
        1,
        1000
      );
      this.mapOrthographicCamera.position.set(0, 0, 500);
      this.mapOrthographicCamera.up = new Vector3(0, 1, 1);
      this.mapOrthographicCamera.lookAt(new Vector3(0, 0, 0));
    },
    /**
     * 场景光源初始化
     */
    mapLightInit() {
      this.mapScene.add(new AmbientLight(0x555555));
      this.mapPointLight1 = new PointLight(0x888888);
      this.mapPointLight1.position.set(-400, 400, 400); //点光源位置
      this.mapScene.add(this.mapPointLight1); //点光源添加到场景中
      this.mapPointLight2 = new PointLight(0x888888);
      this.mapPointLight2.position.set(400, -400, 400); //点光源位置
      this.mapScene.add(this.mapPointLight2); //点光源添加到场景中
    },
    /**
     * 场景辅助物体初始化
     */
    mapHelperInit() {
      // this.mapScene.add(new CameraHelper(this.mapPerspectiveCamera));
      this.mapScene.add(new CameraHelper(this.mapPerspectiveCamera));
      this.mapScene.add(new AxesHelper(300));
      this.mapGridHelperReset(200);
    },
    mapGridHelperReset(width) {
      let number = width / this.mapGridCellSize;
      if (this.mapGridHelper !== null) {
        this.mapScene.remove(this.mapGridHelper);
      }
      this.mapGridHelper = new GridHelper(width, number, "#DCDFE6", "#DCDFE6");
      this.mapGridHelper.setRotationFromEuler(
        new Euler(Math.PI / 2, 0, 0, "XYZ")
      );
      this.mapScene.add(this.mapGridHelper);
    },
    setFloorBox(box) {
      this.floorBox = box;
      let size = box.width > box.height ? box.width : box.height;
      size =
        Math.floor((size * 1.5) / this.mapGridCellSize) * this.mapGridCellSize;
      this.mapGridHelperReset(size);
    },
    setFloorHeight(height) {
      this.floorHeight = height;
    },
    /**
     * 楼层焦点变化动画
     * box 聚焦楼层外接矩形
     * z 聚焦楼层z轴位置
     */
    mapFocusFloorTweenInit(z) {
      // 若当前正在播放功能区聚焦动画，则不触发楼层聚焦动画
      if (this.focusCurrentAreaOn) {
        return;
      }
      let k = 1.5;
      let n = 1.5;
      let fov = this.mapPerspectiveCamera.fov;
      let aspect = this.mapPerspectiveCamera.aspect;
      let { x, y, width, height } = this.floorBox;
      let center = new Vector3(
        x + width / 2,
        y + height / 2,
        z + this.floorHeight
      );
      let t = Math.sqrt((height * k * k) / (2 * (k * k + 1)));
      let r = (t * (this.floorHeight / k + height / 2) * 2) / height;
      let a =
        ((width * n) / (2 * aspect * Math.tan((fov / 360) * Math.PI)) + r) /
        Math.sqrt(1 + k ** 2);
      // 让边缘显示的最小距离
      let tan = Math.tan((Math.atan(k) * 180) / Math.PI - fov / 2);
      let mina = height / 2 / (k - tan);
      a = a < mina ? mina : a;
      // 计算目标移动位置
      let destinct = new Vector3(center.x, center.y - k * a, center.z + a);
      // 获取当前摄像机的位置
      this.cameraMovePosition = this.mapPerspectiveCamera.position.clone();
      // 初始化移动动画
      this.focusCurrentFloor = new TWEEN.Tween(this.cameraMovePosition)
        .to(destinct, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut);
      // 设置动画更新函数
      this.focusCurrentFloor.onUpdate(() => {
        // 设置当前摄像机的位置及其焦点
        this.mapController.target.set(center.x, center.y, center.z);
        this.mapPerspectiveCamera.position = this.cameraMovePosition.clone();
      });
      // 设置动画完成函数
      this.focusCurrentFloor.onComplete(() => {
        this.focusCurrentFloorOn = false;
      });
      // 启动动画
      this.focusCurrentFloorOn = true;
      this.focusCurrentFloor.start();
    },
    /**
     * 物体聚焦动画
     */
    mapFocusMeshTweenInit(x, y, z) {
      // 若当前正在播放楼层聚焦动画，则停止该动画
      if (this.focusCurrentFloorOn) {
        this.focusCurrentFloor.stop();
      }
      // 获取当前摄像机的位置
      this.cameraMovePosition = this.mapPerspectiveCamera.position.clone();
      // 初始化移动动画
      this.focusCurrentArea = new TWEEN.Tween(this.cameraMovePosition)
        .to(new Vector3(x, y - 10, z + 40), 1000)
        .easing(TWEEN.Easing.Quadratic.InOut);
      // 设置动画更新函数
      this.focusCurrentArea.onUpdate(() => {
        // 设置当前摄像机的位置及其焦点
        this.mapController.target.set(x, y, z);
        this.mapPerspectiveCamera.position = this.cameraMovePosition.clone();
      });
      // 设置动画完成函数
      this.focusCurrentArea.onComplete(() => {
        this.focusCurrentAreaOn = false;
      });
      // 启动动画
      this.focusCurrentAreaOn = true;
      this.focusCurrentArea.start();
    },
    /**
     * 地图控制器初始化
     */
    mapControllerInit() {
      this.mapController = new OrbitControls(
        this.mapPerspectiveCamera,
        this.mapRenderer.domElement
      );
      this.mapController.update();
      let changeEvent = toolUtil.throttle(this.mapControllerChange, 500);
      this.mapController.addEventListener("change", changeEvent);
      this.mapController.addEventListener("end", this.mapControllerChange);
    },
    /**
     * 地图渲染
     */
    mapRenderAction() {
      requestAnimationFrame(this.mapRenderAction);
      this.mapController.update();
      this.mapRenderer.render(this.mapScene, this.mapPerspectiveCamera);
      if (this.getCanvasImage === true) {
        this.getCanvasImage = false;
        this.getImageCallback(
          this.mapRenderer.domElement.toDataURL("image/png")
        );
      }
      TWEEN.update();
    },
    /**
     * 地图渲染范围改变
     */
    mapRenderResize() {
      if (this.mapRenderer === null) return;
      this.mapRenderer.setSize(this.width, this.height);
      this.mapPerspectiveCamera.aspect = this.width / this.height;
      this.mapPerspectiveCamera.updateProjectionMatrix();
      this.mapFocusFloorTweenInit(this.mapGridHelper.position.z);
    },
    /**
     * 在完成渲染后保存渲染过后的canvas
     */
    startGetRenderCanvas(callback) {
      this.getImageCallback = callback;
      this.getCanvasImage = true;
    },
    /**
     * 地图控制器发生改变
     * 触发渲染角度变化事件
     */
    mapControllerChange() {
      this.$emit("controllerRotation", this.mapController.getAzimuthalAngle());
    },
    /**
     * 移动渲染设施的位置
     * 网格、相机、点光源
     */
    moveRenderPosition(x, y, z) {
      this.setGridHelperLevel(x, y, z);
      this.setPointLightPosition(x, y, z);
      this.mapFocusFloorTweenInit(z);
    },
    /**
     * 设置网格当前位置
     */
    setGridHelperLevel(x, y, z) {
      this.mapGridHelper.position.set(x, y, z);
    },
    /**
     * 设置摄像机的当前位置
     */
    setCameraPosition(x, y, z) {
      this.mapPerspectiveCamera.position.set(x, y - 90, z + 50);
      this.mapPerspectiveCamera.lookAt(x, y, z);
    },
    /**
     * 设置点光源的位置
     */
    setPointLightPosition(x, y, z) {
      this.mapPointLight1.position.set(-400, 400, z + 400); //点光源位置
      this.mapPointLight2.position.set(400, -400, z + 400); //点光源位置
    },
    handleMouseDown() {
      this.mouseMove = false;
    },
    handleMouseMove() {
      this.mouseMove = true;
    },
    handleMouseUp(e) {
      if (this.mouseMove) return;
      this.onMouseClick(e);
    },
    /**
     * 当触发单击事件时
     */
    onMouseClick(e) {
      // 创建拾取射线
      let raycaster = new Raycaster();
      raycaster.setFromCamera(
        {
          x: (e.clientX / this.width) * 2 - 1,
          y: -(e.clientY / this.height) * 2 + 1,
        },
        this.mapPerspectiveCamera
      );
      this.$emit("onMouseClick", raycaster);
    },
  },
};
</script>

<style>
.map-render {
  margin: 0px;
  outline: none;
  background-image: linear-gradient(#ebdeff, #bbaad4);
}
</style>