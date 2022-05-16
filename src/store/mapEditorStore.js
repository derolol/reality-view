export default {
  namespaced: true,
  state: {
    mapScene: null,
    mapObjectRefs: null,
    mapClickableObjects: [],
    mapPOIImageList: {},
    mapPOIResList: {},

    map: null,
    buildings: [],
    floors: [],
    walls: [],
    areas: [],
    pois: [],
    pipes: [],
    components: [],

    currentBuilding: -1,
    currentFloor: -1,
    currentWall: -1,
    currentArea: -1,
    currentPOI: -1,
    currentPipe: -1,
    currentComponent: -1,

    buildingRef: null,
    floorRef: null,
    wallRef: null,
    areaRef: null,
    poiRef: null,
    pipeRef: null,
    componentRef: null,

    buildingMeshVisible: false,
    allFloorMeshVisible: true,
    floorMeshVisible: true,
  },
  getters: {

  },
  mutations: {
    setMapScene(state, scene) {
      state.mapScene = scene;
    },
    setMapObjectRefs(state, refs) {
      state.mapObjectRefs = refs;
    },
    addMapClickableObjects(state, ...objects) {
      state.mapClickableObjects.push(...objects);
    },
    removeMapClickableObjects(state, ...objects) {
      for (let obj of objects) {
        let index = state.mapClickableObjects.indexOf(obj);
        state.mapClickableObjects.splice(index, 1);
      }
    },
    setMap(state, map) {
      state.map = map;
    },
    setBuildings(state, buildings) {
      state.buildings = buildings;
    },
    setFloors(state, floors) {
      state.floors = floors;
    },
    addFloor(state, floor) {
      state.floors.push(floor);
    },
    setWalls(state, walls) {
      state.walls = walls;
    },
    addWall(state, wall) {
      state.walls.push(wall);
    },
    setAreas(state, areas) {
      state.areas = areas;
    },
    addArea(state, area) {
      state.areas.push(area);
    },
    removeArea(state, areaId) {
      let index = state.areas.findIndex(a => a.properties.area_id == areaId);
      state.areas.splice(index, 1);
    },
    setPOIs(state, pois) {
      state.pois = pois;
    },
    addPOI(state, poi) {
      state.pois.push(poi);
    },
    removePOI(state, poiId) {
      let index = state.pois.findIndex(p => p.properties.poi_id == poiId);
      state.pois.splice(index, 1);
    },
    setPipes(state, pipes) {
      state.pipes = pipes;
    },
    addPipe(state, pipe) {
      state.pipes.push(pipe);
    },
    removePipe(state, pipeId) {
      let index = state.pipes.findIndex(p => p.properties.pipe_id == pipeId);
      state.pipes.splice(index, 1);
    },
    setComponents(state, components) {
      state.components = components;
    },
    addComponent(state, component) {
      state.components.push(component);
    },
    setCurrentBuilding(state, building) {
      state.currentBuilding = building;
      state.buildingRef = state.mapObjectRefs[`building${building}`][0];
    },
    setCurrentFloor(state, floor) {
      state.currentFloor = floor;
      state.floorRef = state.mapObjectRefs[`floor${floor}`][0];
      let wallId = state.floorRef.floorAttachWall();
      state.currentWall = wallId;
      state.wallRef = state.mapObjectRefs[`wall${wallId}`][0];
    },
    setCurrentWall(state, wall) {
      state.currentWall = wall;
      state.wallRef = state.mapObjectRefs[`wall${wall}`][0];
    },
    setCurrentArea(state, area) {
      state.currentArea = area;
      if (area === -1) {
        state.areaRef = null;
        return;
      }
      state.areaRef = state.mapObjectRefs[`area${area}`][0];
    },
    setCurrentPOI(state, poi) {
      state.currentPOI = poi;
      if (poi === -1) {
        state.poiRef = null;
        return;
      }
      state.poiRef = state.mapObjectRefs[`poi${poi}`][0];
    },
    setCurrentPipe(state, pipe) {
      state.currentPipe = pipe;
      if (pipe === -1) {
        state.pipeRef = null;
        return;
      }
      state.pipeRef = state.mapObjectRefs[`pipe${pipe}`][0];
    },
    setCurrentComponent(state, component) {
      state.currentComponent = component;
    },
    initMapPOIImageList(state, res) {
      state.mapPOIImageList = res;
    },
    initMapPOIResList(state, res) {
      state.mapPOIResList = res;
    },
    setBuildingMeshVisible(state, visible) {
      state.buildingMeshVisible = visible;
    },
    setAllFloorMeshVisible(state, visible) {
      state.allFloorMeshVisible = visible;
    },
    setFloorMeshVisible(state, visible) {
      state.floorMeshVisible = visible;
    },
  },
  actions: {},
}