import instance from './index'

const PREFIX = 'editor';

const getMapList = async () => {
  return instance.request({
    url: `/${PREFIX}/maps`,
    methods: "get",
  });
}

const createMap = async (map) => {
  return instance.request({
    url: `/${PREFIX}/maps/`,
    method: "post",
    data: map
  });
}

const createBuilding = async (building) => {
  return instance.request({
    url: `/${PREFIX}/buildings/`,
    method: "post",
    data: building
  });
}

const findMapById = async (mapId) => {
  return instance.request({
    url: `/${PREFIX}/maps/${mapId}`,
    method: "get",
  });
};

const uploadMapPreviewImage = async (mapId, image) => {
  return instance.request({
    url: `/${PREFIX}/maps/${mapId}/preview`,
    method: "post",
    data: {
      image
    }
  });
}

const deleteMap = async (mapId) => {
  return instance.request({
    url: `/${PREFIX}/maps/${mapId}/delete`,
    method: "post",
  });
}

const updateBuilding = async (buildingId, record) => {
  return instance.request({
    url: `/${PREFIX}/buildings/${buildingId}/update`,
    method: "post",
    data: record,
  });
}

const updateFloor = async (floorId, record) => {
  return instance.request({
    url: `/${PREFIX}/floors/${floorId}/update`,
    method: "post",
    data: record,
  });
}

const deleteFloor = async (floorId) => {
  return instance.request({
    url: `/${PREFIX}/floors/${floorId}/delete`,
    method: "post",
  });
}

const copyFloor = async (floorId, targetFloorLevel) => {
  return instance.request({
    url: `/${PREFIX}/floors/${floorId}/copy`,
    method: "post",
    data: {
      target: targetFloorLevel,
    }
  });
}

const createFloor = async (info) => {
  return instance.request({
    url: `/${PREFIX}/floors`,
    method: "post",
    data: {
      info,
    }
  });
}

const updateWall = async (wallId, record) => {
  return instance.request({
    url: `/${PREFIX}/walls/${wallId}/update`,
    method: "post",
    data: record
  });
}

const updateArea = async (areaId, record) => {
  return instance.request({
    url: `/${PREFIX}/areas/${areaId}/update`,
    method: "post",
    data: record
  });
}

const getPOIResources = async () => {
  return instance.request({
    url: `/${PREFIX}/pois/res`,
    method: "get"
  })
}

const createPOI = async (record) => {
  return instance.request({
    url: `/${PREFIX}/pois`,
    method: "post",
    data: record
  })
}

const deletePOI = async (floor, poiId) => {
  return instance.request({
    url: `/${PREFIX}/pois/${poiId}/delete`,
    method: "post",
    data: {
      floor
    }
  })
}

const updatePOI = async (poiId, info) => {
  return instance.request({
    url: `/${PREFIX}/pois/${poiId}/update`,
    method: "post",
    data: { info }
  })
}

const updatePipe = async (pipeId, info) => {
  return instance.request({
    url: `/${PREFIX}/pipes/${pipeId}/update`,
    method: "post",
    data: { info }
  })
}

const createPipe = async (info) => {
  return instance.request({
    url: `/${PREFIX}/pipes`,
    method: "post",
    data: { info }
  })
}

const deletePipe = async (pipeId) => {
  return instance.request({
    url: `/${PREFIX}/pipes/${pipeId}/delete`,
    method: "post",
  })
}

export default {
  getMapList,
  createMap,
  findMapById,
  uploadMapPreviewImage,
  deleteMap,
  createBuilding,
  updateBuilding,
  updateFloor,
  deleteFloor,
  copyFloor,
  createFloor,
  updateWall,
  updateArea,
  getPOIResources,
  createPOI,
  deletePOI,
  updatePOI,
  updatePipe,
  createPipe,
  deletePipe,
}