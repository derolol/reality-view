<template></template>

<script>
import { Group, ExtrudeGeometry, MeshLambertMaterial, Mesh } from "three";
import data from "@/utils/data";
import geometryUtil from "@/utils/geometryUtil";
import { mapState, mapMutations } from "vuex";
export default {
  name: "wallObject",
  props: {
    wallInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      wallGeometry: [],
      wallMaterial: [],
      wallMesh: [],
      wallGroup: null,
    };
  },
  created() {},
  beforeDestroy() {
    this.clearWallObject();
  },
  computed: {
    ...mapState("mapEditorStore", {
      mapScene: (state) => state.mapScene,
      mapObjectRefs: (state) => state.mapObjectRefs,
    }),
  },
  methods: {
    /**
     * 渲染墙体对象
     */
    addWallObject(previousGroup) {
      this.previousGroup = previousGroup;
      this.initWallGeometry();
      this.initWallMaterial();
      this.initWallGroup();
      this.initWallMesh();
      this.previousGroup.add(this.wallGroup);
    },

    /**
     * 初始化墙体结构
     */
    initWallGeometry() {
      let { zScale } = data.ThreeObjectConfig;
      let wallHeight = this.wallFloorHeight() * zScale;
      let wallThick = this.wallThickList()[this.wallThick() - 1];
      // 构建墙体GeoJSON
      let { shapeCoordinates } = geometryUtil.generateWallCoordinates(
        this.wallGeometryObject().coordinates,
        this.wallInsideGeometryObject().coordinates,
        wallThick
      );
      // 构建shape列表
      let shapes = geometryUtil.getShapeByCoordinates(shapeCoordinates);
      // 构建墙体形状
      this.wallGeometry.splice(0, this.wallGeometry.length);
      for (let shape of shapes) {
        this.wallGeometry.push(
          new ExtrudeGeometry(shape, {
            steps: 1,
            depth: wallHeight,
            bevelEnabled: false,
          })
        );
      }
    },

    /**
     * 初始化墙体材质
     */
    initWallMaterial() {
      this.wallMaterial.push(
        new MeshLambertMaterial({
          opacity: 0.6,
          transparent: true,
          color: 0x9f85dd,
        })
      );
    },

    /**
     * 初始化墙体组
     */
    initWallGroup() {
      this.wallGroup = new Group();
    },

    /**
     * 初始化墙体物体
     */
    initWallMesh() {
      this.wallMesh.splice(0, this.wallMesh.length);
      for (let i = 0, len = this.wallGeometry.length; i < len; i++) {
        let mesh = new Mesh(this.wallGeometry[i], this.wallMaterial[0]);
        mesh.position.set(0, 0, 0);
        mesh.name = `wall${this.wallId()}three${mesh.id}`;
        this.wallMesh.push(mesh);
        this.wallGroup.add(mesh);
      }
    },

    /**
     * 批量更新墙体信息
     */
    updateWallInfo(info) {
      Object.assign(this.wallInfo.properties, info);
    },

    /**
     * 清除墙体对象
     */
    clearWallObject() {
      this.wallGroup.remove(...this.wallMesh);
      this.previousGroup.remove(this.wallGroup);
    },

    /**
     * 重新渲染物体
     */
    rerenderMesh() {
      this.clearWallObject();
      this.initWallGeometry();
      this.initWallMaterial();
      this.initWallMesh();
      this.previousGroup.add(this.wallGroup);
    },

    /*******************************************/
    /**                                       **/
    /**            Getter & Setter            **/
    /**                                       **/
    /*******************************************/

    wallId(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_id = value;
      }
      return this.wallInfo.properties.wall_id;
    },

    wallThick(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_thick = +value;
      }
      return +this.wallInfo.properties.wall_thick;
    },

    wallFloorHeight(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_floor_height = value;
        this.rerenderMesh();
      }
      return this.wallInfo.properties.wall_floor_height;
    },

    wallFloorLevel(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_floor_level = value;
      }
      return this.wallInfo.properties.wall_floor_level;
    },

    wallThickList(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_thick_list = value;
      }
      return this.wallInfo.properties.wall_thick_list;
    },

    wallBelongFloor(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_belong_floor = value;
      }
      return this.wallInfo.properties.wall_belong_floor;
    },

    wallAttachArea(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_attach_area = value;
      }
      return this.wallInfo.properties.wall_attach_area;
    },

    wallAttachPipe(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.properties.wall_attach_pipe = value;
      }
      return this.wallInfo.properties.wall_attach_pipe;
    },

    wallGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.geometries[0] = value;
      }
      return this.wallInfo.geometries[0];
    },

    wallInsideGeometryObject(value) {
      if (value !== undefined && value !== null) {
        this.wallInfo.geometries[1] = value;
      }
      return this.wallInfo.geometries[1];
    },
  },
};
</script>

<style>
</style>