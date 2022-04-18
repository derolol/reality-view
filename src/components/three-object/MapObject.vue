<template>
  <div>
    <slot />
  </div>
</template>

<script>
// {
//     "type": "Feature",
//     "properties":
//     {
//         "model": "map",
//         "map_id": 0,
//         "map_name": "",
//         "map_tag": [0, 2, 3],
//         "map_attach_building": [0, 1],
//         "map_owner": 1,
//         "map_access_level": 1,
//         "map_access_w_list": [1, 2, 3],
//         "map_access_r_list": [1, 2, 3],
//         "map_access_w_group": [1, 2, 3],
//         "map_access_r_group": [1, 2, 3],
//         "created_at": "",
//         "updated_at": "",
//         "deleted": false
//     }
// }
export default {
  name: "mapObject",
  props: {
    mapInfo: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      scene: null,
    };
  },
  created() {},
  methods: {},
};
</script>

<style>
</style>