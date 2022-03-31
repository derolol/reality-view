import { Shape, Path } from "three";

function getShape(geometry, offset) {
  if (!geometry.hasOwnProperty("type")) {
    if (geometry.length <= 0) return null;
    let shapes = []
    for (let geo of geometry) {
      if (geo.type === "MultiPolygon") {
        // 遍历形状
        for (let i = 0, len1 = geo.coordinates.length; i < len1; i++) {
          let coordinate = geo.coordinates[i];
          // 遍历形状轮廓和孔洞
          for (let j = 0, len2 = coordinate.length; j < len2; j++) {
            let s = coordinate[j];
            let shape = new Shape();
            // 轮廓
            if (j === 0) {
              generateWall(shape, s, offset);
            }
            // 孔洞
            else {
              generateWall(shape, s, -offset);
            }
            shapes.push(shape);
          }
        }
        continue;
      }
      if (geo.type === "MultiLineString") {
        continue;
      }
    }
    return shapes;
  }
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
      generateShape(shape, c);
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
      shape.lineTo(s[0][0], s[0][1]);
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
    path.lineTo(s[0][0], s[0][1]);
    shape.holes.push(path);
  }
}

function generateWall(shape, coordinates, wallThick) {
  let outside = null;
  let inside = null;
  if (judgeClockwise(coordinates)) { coordinates.reverse(); }
  if (wallThick > 0) {
    outside = coordinates;
    inside = createEqualDistPoint(coordinates, wallThick);
  }
  if (wallThick < 0) {
    outside = createEqualDistPoint(coordinates, wallThick);
    inside = coordinates;
  }
  if (outside === null || inside === null) return null;
  // 拼接轮廓
  for (let i = 0, len = outside.length; i < len; i++) {
    let point = outside[i];
    if (i === 0) {
      shape.moveTo(point[0], point[1]);
      continue;
    }
    shape.lineTo(point[0], point[1]);
  }
  shape.lineTo(outside[0][0], outside[0][1]);
  // 填充孔洞
  let path = new Path();
  for (let i = 0, len = inside.length; i < len; i++) {
    let point = inside[i];
    if (i === 0) {
      path.moveTo(point[0], point[1]);
      continue;
    }
    path.lineTo(point[0], point[1]);
  }
  path.lineTo(inside[0][0], inside[0][1]);
  shape.holes.push(path);
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

  let len = points.length;
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
    let vectorLength = - L / cross;
    let p = points[i][0] + (v1[0] + v2[0]) * vectorLength;
    let q = points[i][1] + (v1[1] + v2[1]) * vectorLength;
    createPoints.push([p, q]);
  }

  return createPoints
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

function debounce(method, wait) {
  let timer;
  return function (e) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      method.apply(null, [e]);
    }, wait);
  }
}

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

export default {
  getShape,
  judgeClockwise,
  distanceBetweenPoints,
  debounce,
  throttle,
}