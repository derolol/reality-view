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

export default {
  getMapList,
  createMap,
  createBuilding,
  findMapById,
  uploadMapPreviewImage,
  deleteMap,
  updateBuilding,
}