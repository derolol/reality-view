<template>
  <div id="mapRender" class="map-render">
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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import utils from "@/store/utils";
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

      getCanvasImage: false,
      getImageCallback: true,
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
  created() {},
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
        el.componentInstance.setScene(this.mapScene);
        if (tag === "building-object") {
          el.componentInstance.setScene(this.mapScene);
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
      this.mapPerspectiveCamera.position.z = 50;
      this.mapPerspectiveCamera.position.x = 0;
      this.mapPerspectiveCamera.position.y = -90;
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
      this.mapScene.add(new AmbientLight(0x444444));
      let pointLight1 = new PointLight(0xaaaaaa);
      pointLight1.position.set(-400, 400, -400); //点光源位置
      this.mapScene.add(pointLight1); //点光源添加到场景中
      let pointLight2 = new PointLight(0xffffff);
      pointLight2.position.set(400, -400, 400); //点光源位置
      this.mapScene.add(pointLight2); //点光源添加到场景中
    },
    /**
     * 场景辅助物体初始化
     */
    mapHelperInit() {
      // this.mapScene.add(new CameraHelper(this.mapPerspectiveCamera));
      this.mapScene.add(new CameraHelper(this.mapOrthographicCamera));
      this.mapScene.add(new AxesHelper(300));
      const gridHelper = new GridHelper(200, 50, "#DCDFE6", "#DCDFE6");
      gridHelper.setRotationFromEuler(new Euler(Math.PI / 2, 0, 0, "XYZ"));
      this.mapScene.add(gridHelper);
    },
    mapControllerInit() {
      this.mapController = new OrbitControls(
        this.mapPerspectiveCamera,
        this.mapRenderer.domElement
      );
      this.mapController.update();
      let changeEvent = utils.throttle(this.mapControllerChange, 500);
      this.mapController.addEventListener("change", changeEvent);
      this.mapController.addEventListener("end", this.mapControllerChange);
    },
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
    },
    mapRenderResize() {
      if (this.mapRenderer === null) return;
      this.mapRenderer.setSize(this.width, this.height);
      this.mapPerspectiveCamera.aspect = this.width / this.height;
      this.mapPerspectiveCamera.updateProjectionMatrix();
    },
    startGetRenderCanvas(callback) {
      this.getImageCallback = callback;
      this.getCanvasImage = true;
    },
    mapControllerChange() {
      this.$emit("controllerRotation", this.mapController.getAzimuthalAngle());
    },
  },
  computed: {},
};
</script>

<style>
.map-render {
  margin: 0px;
  outline: none;
  background-image: linear-gradient(#ebdeff, #bbaad4);
}
</style>