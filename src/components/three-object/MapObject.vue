<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "mapObject",
  props: {
    mapId: {
      type: Number,
      require: true,
    },
    mapName: {
      type: String,
      require: true,
    },
    mapTag: {
      type: Array,
      require: true,
    },
    mapGeometry: {
      type: Object,
      require: true,
    },
    mapAttachBuilding: {
      type: Number,
      require: true,
    },
    mapOwner: {
      type: Number,
      require: true,
    },
    mapAccessLevel: {
      type: Number,
      require: true,
    },
  },
  data() {
    return {
      mapScene: null,
      mapObjectShape: null,
      mapObjectGeometry: null,
      mapObjectMaterial: null,
      mapObjectMesh: null,
    };
  },
  created() {
    console.log("map init");
    this.initMapObject();
  },
  methods: {
    addObjects(scene) {
      this.mapScene = scene;
      this.mapScene.add(this.mapObjectMesh);
      console.log("start map add objects");
      for (let el of this.$slots.default) {
        const tag = el.componentOptions.tag;
        if (tag === "building-object") {
          el.componentInstance.addObjects(scene);
        }
      }
    },
    initMapObject() {
      this.mapObjectShape = new THREE.Shape(this.mapGeometry);
      this.mapObjectGeometry = new THREE.ExtrudeGeometry(this.mapObjectShape, {
        depth: 5,
        bevelEnabled: false,
      });
      this.mapObjectMaterial = new THREE.MeshPhongMaterial({
        color: 0x81a5ed,
        specular: 0x444444,
        shininess: 20,
      });
      this.mapObjectMesh = new THREE.Mesh(
        this.mapObjectGeometry,
        this.mapObjectMaterial
      );
    },
  },
};
</script>

<style>
</style>