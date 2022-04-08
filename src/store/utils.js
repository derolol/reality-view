import { Shape, Path } from "three";

function getShape(geometry, offset) {
  // 多边形
  if (geometry.type === "Polygon") {
    let shape = new Shape();
    if (offset !== null && typeof offset === "number") {
      generateShape(shape, geometry.coordinates, offset);
    }
    else {
      generateShape(shape, geometry.coordinates);
    }
    return shape;
  }
  // 多个多边形
  if (geometry.type === "MultiPolygon") {
    let shapes = [];
    for (let c of geometry.coordinates) {
      let shape = new Shape();
      if (offset !== null && typeof offset === "number") {
        generateShape(shape, c, offset);
      }
      else {
        generateShape(shape, c);
      }
      shapes.push(shape);
    }
    return shapes;
  }
}

function generateShape(shape, coordinates, offset) {

  for (let i = 0; i < coordinates.length; i++) {
    let s = coordinates[i];
    if (offset !== null && typeof offset === "number") {
      s = createEqualDistPoint(s, offset);
    }
    // 拼接轮廓
    if (i === 0) {
      for (let j = 0; j < s.length; j++) {
        let point = s[j];
        if (j === 0) {
          shape.moveTo(point[0], point[1]);
          continue;
        }
        shape.lineTo(point[0], point[1]);
      }
      // shape.lineTo(s[0][0], s[0][1]);
      continue;
    }
    // 填充孔洞
    let path = new Path();
    for (let j = 0; j < s.length; j++) {
      let point = s[j];
      if (j === 0) {
        path.moveTo(point[0], point[1]);
        continue;
      }
      path.lineTo(point[0], point[1]);
    }
    // path.lineTo(s[0][0], s[0][1]);
    shape.holes.push(path);
  }
}

function generateWallGeometryObject(geometry, wallThick) {
  let geometryObject = {
    type: "MultiPolygon",
    coordinates: [],
  };

  let geometries = geometry.coordinates;
  if (countArrayLevel(geometries) === 3) {
    geometries = [geometries];
  }
  // 遍历形状
  for (let i = 0, len1 = geometries.length; i < len1; i++) {
    let coordinate = geometries[i];
    // 遍历形状轮廓和孔洞
    for (let j = 0, len2 = coordinate.length; j < len2; j++) {
      let s = coordinate[j];
      // 轮廓收缩，孔洞扩张
      let thick = j === 0 ? wallThick : -wallThick;
      let coordinates = generateWallCoordinates(s, thick);
      geometryObject.coordinates.push(coordinates);
    }
  }
  return geometryObject;
}

function generateWallCoordinates(points, wallThick) {
  let coordinates = [];
  // 保证点集方向为逆时针
  if (judgeClockwise(points)) {
    points.reverse();
  }
  // 根据收缩和扩张的需求判断形状和孔洞
  if (wallThick > 0) {
    coordinates.push(
      arraySimpleDeepCopy(points),
      createEqualDistPoint(points, wallThick)
    );
  }
  if (wallThick < 0) {
    coordinates.push(
      createEqualDistPoint(points, wallThick),
      arraySimpleDeepCopy(points)
    );
  }
  return coordinates;
}

function normalize(vector) {
  const base = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
  return vector.map(d => d / base);
}

function crossProduct(v1, v2) {
  return v1[0] * v2[1] - v1[1] * v2[0];
}

/**
 * 获取不规则多边形的等距放缩多边形
 * L < 0 放大
 * L > 0 缩小
 * @param {逆时针且相邻无重叠点集} points 
 * @param {放缩的距离} L 
 * @returns 
 */
function createEqualDistPoint(points, L) {
  if (points.length <= 2) return null;

  // 去除收尾重复点
  let len = points.length;
  if (points[0][0] === points[len - 1][0] && points[0][1] === points[len - 1][1]) {
    len -= 1;
  }

  let createPoints = []
  for (let i = 0; i < len; i++) {
    let v1 = [
      points[(i - 1 + len) % len][0] - points[i][0],
      points[(i - 1 + len) % len][1] - points[i][1],
    ];
    let v2 = [
      points[(i + 1) % len][0] - points[i][0],
      points[(i + 1) % len][1] - points[i][1]
    ];
    v1 = normalize(v1);
    v2 = normalize(v2);
    let cross = crossProduct(v1, v2);
    if (cross === 0) {
      let vectorLength = L;
      let p = points[i][0] - v1[0] * vectorLength;
      let q = points[i][1] + v1[1] * vectorLength;
      createPoints.push([p, q]);
    }
    else {
      let vectorLength = - L / cross;
      let p = points[i][0] + (v1[0] + v2[0]) * vectorLength;
      let q = points[i][1] + (v1[1] + v2[1]) * vectorLength;
      createPoints.push([p, q]);
    }
  }

  // 补充收尾重复点
  createPoints.push([createPoints[0][0], createPoints[0][1]]);

  return createPoints;
}

/**
 * 判断是否为顺时针
 * @param {点集} points 
 * @returns false 逆时针 true 顺时针
 */
function judgeClockwise(points) {
  if (points.length <= 2) return null;
  let len = points.length;
  let count = 0;
  for (let i = 0; i < len; i++) {
    count += crossProduct(points[i], points[(i + 1) % len]);
  }
  if (count > 0) return false;
  return true;
}


function distanceBetweenPoints(p1, p2) {
  let dx = p1[0] - p2[0];
  let dy = p1[1] - p2[1];
  return Math.sqrt(dx ** 2 + dy ** 2);
}

/**
 * 防抖
 * @param {方法} method 
 * @param {等待耗时} wait 
 * @returns 
 */
function debounce(method, wait) {
  let timer;
  return function (e) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      method.apply(null, [e]);
    }, wait);
  }
}

/**
 * 节流函数
 * @param {方法} method 
 * @param {间隔} interval 
 * @returns 
 */
function throttle(method, interval) {
  var prev = Date.now();
  return function () {
    var now = Date.now();
    if (now - prev >= interval) {
      method.apply(null, arguments);
      prev = Date.now();
    }
  }
}

/**
* 根据点集生成shape绘制函数
*/
function generateSceneFunc(pointList, scale, width, height) {
  let coordinates = arraySimpleDeepCopy(pointList);
  let level = countArrayLevel(coordinates);
  if (level === 1) return;
  if (level === 2) {
    coordinates = [coordinates];
  }
  if (level > 3) {
    coordinates = coordinates.flat();
  }
  return (context, shape) => {
    context.beginPath();
    for (let i = 0, len1 = coordinates.length; i < len1; i++) {
      let coordinate = coordinates[i];
      for (let j = 0, len2 = coordinate.length; j < len2; j++) {
        let point = coordinate[j];
        let x = point[0] * scale + width / 2;
        let y = height / 2 - point[1] * scale;
        if (j === 0) {
          context.moveTo(x, y);
          continue;
        }
        context.lineTo(x, y);
      }
    }
    context.fillStrokeShape(shape);
  };
}

/**
 * 简单数组深拷贝
 */
function arraySimpleDeepCopy(list) {
  return JSON.parse(JSON.stringify(list));
}

/**
 * 数组层数计数
 */
function countArrayLevel(list) {
  for (let i = 0, len = list.length; i < len; i++) {
    if (Array.isArray(list[i])) {
      return countArrayLevel(list[i]) + 1;
    }
  }
  return 1;
}

/**
 * 获取形状的外包矩形
 */
function getShapeBox(geometry) {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  let flatGeometry = geometry.flat(Infinity);
  for (let i = 0, len = flatGeometry.length; i < len; i += 2) {
    let x = flatGeometry[i];
    let y = flatGeometry[i + 1];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * 计算形状需要缩放的大小
 */
function getBoxScale(showWidth, showHeight, box) {
  let scaleX = showWidth / box.width;
  let scaleY = showHeight / box.height;
  return scaleX < scaleY ? scaleX : scaleY;
}

function getCoordinatesVectors(coordinates) {
  let vectors = [];
  let shapes = [];
  // 更具点集层数处理点集
  let level = countArrayLevel(coordinates);
  if (level === 2) {
    shapes.push(coordinates);
  }
  else if (level === 3) {
    shapes = coordinates;
  }
  else if (level === 4) {
    shapes = coordinates.flat();
  }
  else {
    return [];
  }
  for (let i = 0, len1 = shapes.length; i < len1; i++) {
    let points = shapes[i];
    for (let j = 0, len2 = points.length - 1; j < len2; j++) {
      let p1 = [points[j][0], points[j][1]];
      let p2 = [points[j + 1][0], points[j + 1][1]];
      vectors.push([p1, p2]);
    }
  }
  return vectors;
}

function checkPointNearVectors(point, vectors, near) {
  for (let vector of vectors) {
    let { distance, cross } = distanceBetweenPointLine(point, vector);
    // 满足限定的距离条件
    if (distance <= near) {
      return {
        vector, point: cross
      }
    }
  }
  return { vector: null, point };
}

function checkPointOnSegment(point, vector) {
  let v1 = [point[0] - vector[0][0], point[1] - vector[0][1]];
  let v2 = [vector[1][0] - vector[0][0], vector[1][1] - vector[0][1]];
  const cond1 = crossProduct(v1, v2) <= 0.1;
  const cond2 = (Math.min(vector[0][0], vector[1][0]) <= point[0])
    && (Math.max(vector[0][0], vector[1][0]) >= point[0])
    && (Math.min(vector[0][1], vector[1][1]) <= point[1])
    && (Math.max(vector[0][1], vector[1][1]) >= point[1]);
  return cond1 && cond2;
}

function distanceBetweenPointLine(point, vector) {
  const { A, B, C } = generateLineEquation(vector);
  const div = A ** 2 + B ** 2;
  const distance = Math.abs(A * point[0] + B * point[1] + C) / Math.sqrt(div);
  const x0 = (B * B * point[0] - A * B * point[1] - A * C) / div;
  const y0 = (A * A * point[1] - A * B * point[0] - B * C) / div;
  return {
    distance,
    cross: [x0, y0]
  }
}

function generateLineEquation(vector) {
  const p1 = vector[0];
  const p2 = vector[1];
  // 判断直线是否平行于y轴
  if (p1[0] === p2[0]) {
    return { A: -1, B: 0, C: p1[0] };
  }
  // 判断直线是否平行于x轴
  if (p1[1] === p2[1]) {
    return { A: 0, B: -1, C: p1[1] };
  }
  const k = (p1[1] - p2[1]) / (p1[0] - p2[0]);
  return {
    A: k,
    B: -1,
    C: p1[1] - k * p1[0]
  }
}

function getPointAngleDegree(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) / Math.PI * 180;
}

export default {
  debounce,
  throttle,

  getShape,

  createEqualDistPoint,
  judgeClockwise,
  arraySimpleDeepCopy,
  countArrayLevel,

  distanceBetweenPoints,
  distanceBetweenPointLine,
  checkPointNearVectors,
  checkPointOnSegment,
  getPointAngleDegree,

  generateSceneFunc,
  getShapeBox,
  getBoxScale,

  generateWallGeometryObject,
  getCoordinatesVectors,
}