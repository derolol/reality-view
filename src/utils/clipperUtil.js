import toolUtil from './toolUtil'
import mathUtil from './mathUtil'

function testClipper() {
  var subj_paths = [[{ X: 10, Y: 10 }, { X: 150, Y: 10 }, { X: 150, Y: 150 }, { X: 10, Y: 150 }]];
  var clip_paths = [[{ X: 50, Y: 50 }, { X: 150, Y: 50 }, { X: 150, Y: 110 }, { X: 0, Y: 60 }]];
  var scale = 100;
  ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
  ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
  var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clipTypes = [ClipperLib.ClipType.ctUnion, ClipperLib.ClipType.ctDifference, ClipperLib.ClipType.ctXor, ClipperLib.ClipType.ctIntersection];
  for (let i = 0; i < clipTypes.length; i++) {
    let solution_paths = new ClipperLib.Paths();
    cpr.Execute(clipTypes[i], solution_paths, subject_fillType, clip_fillType);
    clipperPathsToCoordinates(solution_paths, scale)
  }
}

/**
 * 接受 Polygon 和 MultiPolygon
 * 形状逆时针
 * 孔洞顺时针
 * @param {形状集} coordinates 
 * @returns 路径
 */
function coordinatesToClipperPaths(coordinates) {
  coordinates = toolUtil.arraySimpleDeepCopy(coordinates);
  let paths = [];
  if (toolUtil.countArrayLevel(coordinates) === 3) {
    coordinates = [coordinates];
  }
  for (let i = 0, len1 = coordinates.length; i < len1; i++) {
    let polygon = coordinates[i];
    for (let j = 0, len2 = polygon.length; j < len2; j++) {
      let layer = polygon[j];
      // 保证起始端点和结束端点不重合
      if (mathUtil.judgePointEqual(layer[0], layer[layer.length - 1])) {
        layer.pop();
      }
      // 保证形状为逆时针
      if (j === 0) {
        if (mathUtil.judgeClockwise(layer)) {
          layer.reverse();
        }
      }
      // 保证孔洞为顺时针
      else {
        if (!mathUtil.judgeClockwise(layer)) {
          layer.reverse();
        }
      }
      // 转换为XY格式，并添加到clipper路径中
      paths.push(layer.map(v => ({ X: v[0], Y: v[1] })))
    }
  }
  return paths;
}

/**
 * Clipper路径转换为MultiPolygon格式的Coordinates
 * @param {Clipper路径} paths 
 * @param {放缩大小} scale 
 * @param {是否需要保证路径闭合} close 
 * @returns 
 */
function clipperPathsToCoordinates(paths, scale = 1, close = false) {
  paths = toolUtil.arraySimpleDeepCopy(paths);
  let coordinates = [];
  let polygon = [];
  for (let i = 0, len = paths.length; i < len; i++) {
    let path = paths[i].map(point => [point.X / scale, point.Y / scale]);
    // 判断是否需要保证形状闭合
    if (close && !mathUtil.judgePointEqual(path[0], path[path.length - 1])) {
      path.push([path[0][0], path[0][1]]);
    }
    // 若路径为逆时针，则创建新多边形
    if (!mathUtil.judgeClockwise(path)) {
      if (polygon.length > 0) {
        coordinates.push(toolUtil.arraySimpleDeepCopy(polygon));
        polygon.splice(0, polygon.length);
      }
      polygon.push(path);
    }
    // 否则直接添加为闭合路径，并转换其点顺序
    else {
      path.reverse();
      polygon.push(path);
    }
  }
  if (polygon.length > 0) {
    coordinates.push(toolUtil.arraySimpleDeepCopy(polygon));
  }
  return coordinates;
}

/**
 * 多线段点集扩张
 * [ 点集
 *  [ 线段 1
 *   [ [点 1],[点 2] ]
 *  ]
 * ]
 * @param {线段点集} coordinates 
 * @param {*} offset 
 * @returns 
 */
function coordinatesLineOffset(coordinates, offset) {
  const scale = 100;
  // 转换coordinates
  let paths = coordinatesToClipperPaths(coordinates);
  // 路径坐标放缩
  ClipperLib.JS.ScaleUpPaths(paths, scale);
  // 设置形状放缩参数
  let co = new ClipperLib.ClipperOffset(2, 0.25);
  // 设置放缩的样式，Butt的线段两端不放缩
  co.AddPaths(paths, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etOpenButt);
  // 创建为空的放缩路径
  let offsettedPaths = new ClipperLib.Paths();
  // 执行放缩操作
  co.Execute(offsettedPaths, offset * scale);
  // 转换paths，需要保证闭合
  return clipperPathsToCoordinates(offsettedPaths, scale, true);
}

/**
 * 放缩多边形
 * @param {点集} coordinates 
 * @param {放缩} offset 
 * @returns 放缩后的多边形
 */
function coordinatesPolygonOffset(coordinates, offset) {
  const scale = 100;
  // 转换coordinates
  let paths = coordinatesToClipperPaths(coordinates);
  // 坐标放缩
  ClipperLib.JS.ScaleUpPaths(paths, scale);
  // 设置形状放缩参数
  let co = new ClipperLib.ClipperOffset(2, 0.25);
  co.AddPaths(paths, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
  let offsettedPaths = new ClipperLib.Paths();
  // 执行放缩操作
  co.Execute(offsettedPaths, offset * scale);
  return clipperPathsToCoordinates(offsettedPaths, scale, true);
}

const clipTypes = {
  union: ClipperLib.ClipType.ctUnion,
  diff: ClipperLib.ClipType.ctDifference,
  xor: ClipperLib.ClipType.ctXor,
  intersection: ClipperLib.ClipType.ctIntersection
}

/**
 * 多边形集合布尔运算
 * union 并
 * diff 剪裁
 * xor 异或
 * intersection 交
 * @param {主路径} subjCoordinates 
 * @param {剪裁路径} clipCoordinates 
 * @param {运算类型} clipType 
 * @returns 多边形路径
 */
function coordinatesPolygonClipper(subjCoordinates, clipCoordinates, clipType) {
  const scale = 100;
  // 转换coordinates
  let subjPaths = coordinatesToClipperPaths(subjCoordinates);
  let clipPaths = coordinatesToClipperPaths(clipCoordinates);
  // 路径缩放
  ClipperLib.JS.ScaleUpPaths(subjPaths, scale);
  ClipperLib.JS.ScaleUpPaths(clipPaths, scale);
  // 创建剪裁器
  var cpr = new ClipperLib.Clipper();
  // 添加路径
  cpr.AddPaths(subjPaths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clipPaths, ClipperLib.PolyType.ptClip, true);
  // 设置多边形填充格式为非0填充
  let subjectFillType = ClipperLib.PolyFillType.pftNonZero;
  let clipFillType = ClipperLib.PolyFillType.pftNonZero;
  // 创建路径存储容器
  let solutionPaths = new ClipperLib.Paths();
  cpr.Execute(clipTypes[clipType], solutionPaths, subjectFillType, clipFillType);
  return clipperPathsToCoordinates(solutionPaths, scale, true);
}

/**
 * 计算多边形和线段点击的交集
 * @param {多边形点集} polygonCoordinates 
 * @param {线段点集} segmentCoordinates 
 * @returns 点集
 */
function coordinatesPolygonSegmentIntersection(segmentCoordinates, polygonCoordinates) {
  const scale = 100;
  // 转换coordinates
  let segmentPaths = coordinatesToClipperPaths(segmentCoordinates);
  let polygonPaths = coordinatesToClipperPaths(polygonCoordinates);
  // 路径缩放
  ClipperLib.JS.ScaleUpPaths(segmentPaths, scale);
  ClipperLib.JS.ScaleUpPaths(polygonPaths, scale);
  // 创建剪裁器
  var cpr = new ClipperLib.Clipper();
  // 添加路径
  cpr.AddPaths(segmentPaths, ClipperLib.PolyType.ptSubject, false);
  cpr.AddPaths(polygonPaths, ClipperLib.PolyType.ptClip, true);
  // 设置多边形填充格式为非0填充
  let subjectFillType = ClipperLib.PolyFillType.pftNegative;
  let clipFillType = ClipperLib.PolyFillType.pftNonZero;
  // 创建路径存储容器
  let solutionPaths = new ClipperLib.PolyTree();
  cpr.Execute(ClipperLib.ClipType.ctIntersection, solutionPaths, subjectFillType, clipFillType);
  let resultPaths = ClipperLib.Clipper.OpenPathsFromPolyTree(solutionPaths);
  for (let i = 0, len = resultPaths.length; i < len; i++) {
    if (resultPaths[i].length > 2) {
      resultPaths[i] = ClipperLib.JS.Lighten(resultPaths[i], 0.000001);
    }
  }
  return clipperPathsToCoordinates(resultPaths, scale, false);
}

/**
 * 计算点集代表的多边形面积
 * @param {点集} coordinates 
 * @returns 面积
 */
function coordinatesPolygonArea(coordinates) {
  const scale = 100;
  // 转换coordinates
  let paths = coordinatesToClipperPaths(coordinates);
  // 坐标放缩
  ClipperLib.JS.ScaleUpPaths(paths, scale);
  // 计算面积
  let area = ClipperLib.JS.AreaOfPolygons(paths);
  return Math.abs(area);
}

export default {
  coordinatesToClipperPaths,
  clipperPathsToCoordinates,
  coordinatesLineOffset,
  coordinatesPolygonOffset,
  coordinatesPolygonClipper,
  coordinatesPolygonSegmentIntersection,
  coordinatesPolygonArea,
}