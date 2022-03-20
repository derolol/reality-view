<template>
  <div id="mapEditor" class="map-editor">
    <map-render :width="mapEditorWidth" :height="mapEditorHeight">
      <map-object :mapGeometry="testGeometry">
        <building-object>
          <floor-object>
            <wall-object />
            <area-object></area-object>
            <area-object></area-object>
            <poi-object></poi-object>
            <poi-object></poi-object>
            <pipe-object></pipe-object>
          </floor-object>
          <floor-object></floor-object>
          <floor-object></floor-object>
          <floor-object></floor-object>
          <pipe-object />
        </building-object>
      </map-object>
    </map-render>
  </div>
</template>

<script>
import MapRender from "@/components/MapRender.vue";
import MapObject from "@/components/three-object/MapObject.vue";
import BuildingObject from "@/components/three-object/BuildingObject.vue";
import FloorObject from "@/components/three-object/FloorObject.vue";
import WallObject from "@/components/three-object/WallObject.vue";
import PipeObject from "@/components/three-object/PipeObject.vue";
import AreaObject from "@/components/three-object/AreaObject.vue";
import PoiObject from "@/components/three-object/POIObject.vue";
export default {
  name: "mapEditor",
  components: {
    MapRender,
    MapObject,
    BuildingObject,
    FloorObject,
    AreaObject,
    WallObject,
    PipeObject,
    PoiObject,
  },
  data() {
    return {
      mapEditorWidth: 0,
      mapEditorHeight: 0,
      testGeometry: null,
    };
  },
  created() {
    this.testGeometry = [
      new THREE.Vector2(-10, -10),
      new THREE.Vector2(-10, 10),
      new THREE.Vector2(10, 10),
      new THREE.Vector2(10, -10),
      new THREE.Vector2(-10, -10),
    ];
  },
  mounted() {
    window.addEventListener("resize", this.windowResize);
    this.windowResize();
  },
  methods: {
    windowResize() {
      this.mapEditorWidth = window.innerWidth;
      this.mapEditorHeight = window.innerHeight - 1;
    },
  },
};
</script>

<style>
.map-editor {
  margin: 0px;
  font-size: 0px;
}
</style>