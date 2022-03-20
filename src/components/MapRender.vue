<template>
  <div id="mapRender" class="map-render">
    <slot />
  </div>
</template>

<script>
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
  created() {
    this.mapRenderPrepare();
    this.mapRenderAction();
  },
  mounted() {
    this.addObjects();
  },
  methods: {
    addObjects() {
      for (let el of this.$slots.default) {
        let tag = el.componentOptions.tag;
        if (tag === "building-object") {
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
    },
    /**
     * 渲染场景初始化
     */
    mapSceneInit() {
      this.mapScene = new THREE.Scene();
      this.mapScene.background = new THREE.Color(0xf7f3ff);
    },
    /**
     * 场景渲染器初始化
     */
    mapRendererInit() {
      this.mapRenderer = new THREE.WebGLRenderer();
      this.mapRenderer.setSize(this.width, this.height);
      document
        .getElementById("mapRender")
        .appendChild(this.mapRenderer.domElement);
    },
    /**
     * 透视相机初始化
     */
    mapPerspectiveCameraInit() {
      this.mapPerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        this.width / this.height,
        0.1,
        1000
      );
      this.mapPerspectiveCamera.position.z = 50;
      this.mapPerspectiveCamera.position.x = 0;
      this.mapPerspectiveCamera.position.y = -90;
      this.mapPerspectiveCamera.up = new THREE.Vector3(0, 0, 1);
      this.mapPerspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
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
      this.mapOrthographicCamera = new THREE.OrthographicCamera(
        -right,
        right,
        top,
        -top,
        1,
        1000
      );
      this.mapOrthographicCamera.position.set(0, 0, 500);
      this.mapOrthographicCamera.up = new THREE.Vector3(0, 1, 1);
      this.mapOrthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));
    },
    /**
     * 场景光源初始化
     */
    mapLightInit() {
      this.mapScene.add(new THREE.AmbientLight(0x444444));
      let pointLight = new THREE.PointLight(0xffffff);
      pointLight.position.set(200, -400, 400); //点光源位置
      this.mapScene.add(pointLight); //点光源添加到场景中
    },
    /**
     * 场景辅助物体初始化
     */
    mapHelperInit() {
      // this.mapScene.add(new THREE.CameraHelper(this.mapPerspectiveCamera));
      this.mapScene.add(new THREE.CameraHelper(this.mapOrthographicCamera));
      this.mapScene.add(new THREE.AxesHelper(300));
      let shape = new THREE.Shape();
      shape.moveTo(0, 0); //起点
      shape.lineTo(0, 30); //第2点
      shape.lineTo(24, 14); //第3点
      shape.lineTo(24, 0); //第4点
      shape.lineTo(0, 0); //第5点
      shape.moveTo(-20, -20);
      shape.lineTo(-20, -40);
      shape.lineTo(-40, -40);
      shape.lineTo(-20, -20);

      var geometry = new THREE.ExtrudeGeometry(shape, {
        amount: 10, //拉伸长度
        bevelEnabled: false, //无倒角
      });
      var material = new THREE.MeshPhongMaterial({
        color: 0x81a5ed,
        specular: 0x444444, //高光部分的颜色
        shininess: 20, //高光部分的亮度，默认30
      }); //材质对象
      var mesh = new THREE.Mesh(geometry, material); //点模型对象
      this.mapScene.add(mesh);
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(100, 100, 5),
        new THREE.MeshBasicMaterial({
          color: 0x9477d9,
          opacity: 0.3,
          transparent: true,
        })
      );
      this.mapScene.add(cube);
      cube.position.set(0, 0, -5);
    },
    mapRenderAction() {
      requestAnimationFrame(this.mapRenderAction);
      this.mapRenderer.render(this.mapScene, this.mapPerspectiveCamera);
    },
    mapRenderResize() {
      this.mapRenderer.setSize(this.width, this.height);
      this.mapPerspectiveCamera.aspect = this.width / this.height;
      this.mapPerspectiveCamera.updateProjectionMatrix();
    },
  },
  computed: {},
};
</script>

<style>
.map-render {
  margin: 0px;
  font-size: 0px;
}
</style>