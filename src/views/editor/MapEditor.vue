<template>
  <div id="mapEditor" class="map-editor">
    <map-render :width="mapEditorWidth" :height="mapEditorHeight" />
  </div>
</template>

<script>
import MapRender from "@/components/MapRender.vue";
export default {
  name: "mapEditor",
  components: { MapRender },
  data() {
    return {
      mapEditorWidth: 0,
      mapEditorHeight: 0,
    };
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