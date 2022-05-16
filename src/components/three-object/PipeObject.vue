<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { MeshLambertMaterial, Mesh } from "three";
import data from "@/utils/data";
import geometryUtil from "@/utils/geometryUtil";
import { mapState, mapMutations } from "vuex";
export default {
  name: "pipeObject",
  props: {
    pipeInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      previousGroup: null,
      pipeGeometry: null,
      pipeMaterial: null,
      pipeMesh: null,
    };
  },
  created() {},
  beforeDestroy() {
    this.clearObject();
  },
  watch: {
    allFloorMeshVisible(visible) {
      if (+this.pipeType() === 1) {
        this.pipeMesh.visible = visible;
      }
    },
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapScene: (state) => state.mapScene,
      mapObjectRefs: (state) => state.mapObjectRefs,
      buildingRef: (state) => state.buildingRef,
      allFloorMeshVisible: (state) => state.allFloorMeshVisible,
    }),
  },
  methods: {
    /**
     * 渲染连通区域
     */
    addPipeObject(previousGroup) {
      this.previousGroup = previousGroup;
      this.initPipeGeometry();
      this.initPipeMaterial();
      this.initPipeMesh();
      this.previousGroup.add(this.pipeMesh);
    },

    /**
     * 初始化连通区域结构
     */
    initPipeGeometry() {
      switch (+this.pipeType()) {
        case 0: {
          break;
        }
        // 垂直连通区域
        case 1: {
          let points = this.pipeGeometryObject().coordinates;
          let levels = this.pipeBelongFloor()
            .map((f) => this.mapObjectRefs[`floor${f}`][0].floorLevel())
            .map(this.getFloorZ);
          // 构建shape列表
          this.pipeGeometry = geometryUtil.getGeometryByCenterPoint(
            points,
            levels,
            {
              steps: 1,
              bevelEnabled: false,
            }
          );
          break;
        }
      }
    },

    /**
     * 初始化连通区域材质
     */
    initPipeMaterial() {
      switch (+this.pipeType()) {
        case 0: {
          break;
        }
        // 垂直连通区域
        case 1: {
          this.pipeMaterial = new MeshLambertMaterial({
            opacity: 0.2,
            transparent: true,
            color: 0xaaaaaa,
          });
          break;
        }
      }
    },

    /**
     * 初始化连通区域物体
     */
    initPipeMesh() {
      switch (+this.pipeType()) {
        case 0: {
          break;
        }
        // 垂直连通区域
        case 1: {
          this.pipeMesh = new Mesh(this.pipeGeometry, this.pipeMaterial);
          this.pipeMesh.name = `pipe${this.pipeId()}three${this.pipeMesh.id}`;
          this.addMapClickableObjects(this.pipeMesh);
          break;
        }
      }
    },

    /**
     * 获取楼层相应空间位置
     */
    getFloorZ(level) {
      let floorHeight = this.buildingRef.buildingFloorHeight();
      let height = floorHeight * data.ThreeObjectConfig.zScale;
      return level * (height + 2 * data.ThreeObjectConfig.floorMargin);
    },

    /**
     * 清除连通区域对象
     */
    clearObject() {
      if (this.pipeMesh != null) {
        this.previousGroup.remove(this.pipeMesh);
        this.removeMapClickableObjects(this.pipeMesh);
      }
    },

    /**
     * 重新渲染区域对象
     */
    rerenderObject() {
      this.clearObject();
      this.initPipeGeometry();
      this.initPipeMaterial();
      this.initPipeMesh();
      this.previousGroup.add(this.pipeMesh);
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    ...mapMutations("mapEditorStore", [
      "addMapClickableObjects",
      "removeMapClickableObjects",
    ]),

    pipeId(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_id = value;
      }
      return this.pipeInfo.properties.pipe_id;
    },

    pipeName(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_name = value;
      }
      return this.pipeInfo.properties.pipe_name;
    },

    pipeType(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_type = value;
      }
      return this.pipeInfo.properties.pipe_type;
    },

    pipeHeight(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_height = value;
      }
      return this.pipeInfo.properties.pipe_height;
    },

    pipeFloorHeight(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_floor_height = value;
      }
      return this.pipeInfo.properties.pipe_floor_height;
    },

    /**
     * 关联连通区域改变
     */
    pipeBelongFloor(value) {
      if (value !== undefined && value !== null) {
        switch (+this.pipeType()) {
          case 0: {
            break;
          }
          // 垂直连通区域关联楼层改变
          case 1: {
            // 改变管理楼层
            this.pipeInfo.properties.pipe_belong_floor = value;
            // 重新渲染
            this.rerenderObject();
            break;
          }
        }
      }
      return this.pipeInfo.properties.pipe_belong_floor;
    },

    pipeBelongBuilding(value) {
      if (value !== undefined && value !== null) {
        this.pipeInfo.properties.pipe_belong_building = value;
      }
      return this.pipeInfo.properties.pipe_belong_building;
    },

    pipeGeometryObject(value) {
      if (value !== undefined && value !== null) {
        switch (+this.pipeType()) {
          case 0: {
            break;
          }
          // 垂直连通区域关联楼层改变
          case 1: {
            // 改变连通区域位置
            this.pipeInfo.geometry.coordinates = value;
            // 重新渲染
            this.rerenderObject();
            break;
          }
        }
      }
      return this.pipeInfo.geometry;
    },
  },
};
</script>

<style>
</style>