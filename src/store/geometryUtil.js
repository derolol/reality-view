import clipperUtil from "./clipperUtil";
import toolUtil from "./toolUtil";
import { Shape, Path } from "three";

/**
 * 获取点集包含的向量集
 * @param {点集} coordinates 
 * @returns 向量集
 */
function getCoordinatesVectors(coordinates) {
  let vectors = [];
  let shapes = [];
  // 根据点集层数处理点集
  let level = toolUtil.countArrayLevel(coordinates);
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

/**
 * 生成墙体点集
 * @param {墙体点集} wallCoordinates 
 * @param {内部墙体点集} wallInsideCoordinates 
 * @param {墙体厚度} wallThick 
 * @returns 主功能区、所有功能区、墙体多边形
 */
function generateWallCoordinates(wallCoordinates, wallInsideCoordinates, wallThick) {
  let areaCoordinates = [];
  let shapeCoordinates = [];
  let areaMainCoordinates = clipperUtil.coordinatesPolygonOffset(
    wallCoordinates,
    -wallThick
  );
  // 判断是否存在内墙
  if (
    wallInsideCoordinates.length > 0 &&
    wallInsideCoordinates[0].length > 0
  ) {
    // 存在内墙则将内墙扩张
    let wallClipper = clipperUtil.coordinatesLineOffset(
      wallInsideCoordinates,
      wallThick / 2
    );
    // 主area减去内墙得到area组
    areaCoordinates = clipperUtil.coordinatesPolygonClipper(
      areaMainCoordinates,
      wallClipper,
      "different"
    );
  }
  // 当前area即为主area
  else {
    areaCoordinates = toolUtil.arraySimpleDeepCopy(
      areaMainCoordinates
    );
  }
  // 楼层减去 area 为需要显示的墙体
  shapeCoordinates = clipperUtil.coordinatesPolygonClipper(
    wallCoordinates,
    areaCoordinates,
    "different"
  );
  return { areaMainCoordinates, areaCoordinates, shapeCoordinates };
}

/**
 * 根据多边形点集生成shape集合
 * @param {点集} coordinates 
 * @returns THREE Shape 列表
 */
function getShapeByCoordinates(coordinates) {
  if (toolUtil.countArrayLevel(coordinates) === 3) {
    coordinates = [coordinates];
  }
  let shapes = [];
  for (let polygon of coordinates) {
    let shape = new Shape();
    generatePolygonShape(shape, polygon);
    shapes.push(shape);
  }
  return shapes;
}

function generatePolygonShape(shape, polygon) {
  for (let i = 0; i < polygon.length; i++) {
    let points = polygon[i];
    // 拼接轮廓
    if (i === 0) {
      for (let j = 0; j < points.length; j++) {
        let point = points[j];
        if (j === 0) {
          shape.moveTo(point[0], point[1]);
          continue;
        }
        shape.lineTo(point[0], point[1]);
      }
      continue;
    }
    // 填充孔洞
    let path = new Path();
    for (let j = 0; j < points.length; j++) {
      let point = points[j];
      if (j === 0) {
        path.moveTo(point[0], point[1]);
        continue;
      }
      path.lineTo(point[0], point[1]);
    }
    shape.holes.push(path);
  }
}

/**
* 根据点集生成shape绘制函数
*/
function generateSceneFunc(coordinates, scale, width, height) {
  coordinates = toolUtil.arraySimpleDeepCopy(coordinates);
  let level = toolUtil.countArrayLevel(coordinates);
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
 * 获取形状的外包矩形
 */
function getCoordinatesBox(coordinates) {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  let flatGeometry = coordinates.flat(Infinity);
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

export default {
  getBoxScale,
  getCoordinatesBox,
  getCoordinatesVectors,
  generateWallCoordinates,

  getShapeByCoordinates,
  generateSceneFunc,
}