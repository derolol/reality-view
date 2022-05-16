/**
 * 将向量转换为单位向量
 * @param {向量} vector 
 * @returns 单位向量
 */
function normalize(vector) {
  const base = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
  return vector.map(d => d / base);
}

/**
 * 计算向量的叉积
 * @param {向量1} v1 
 * @param {向量2} v2 
 * @returns 
 */
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
 * 计算点之间的距离
 * @param {点1} p1 
 * @param {点2} p2 
 * @returns 距离
 */
function distanceBetweenPoints(p1, p2) {
  let dx = p1[0] - p2[0];
  let dy = p1[1] - p2[1];
  return Math.sqrt(dx ** 2 + dy ** 2);
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

/**
 * 判断当前点与某个向量集中的各向量的距离
 * 整合距离小于指定距离的向量集合
 * 并将向量集的交点作为点的粘性点返回
 * @param {点} point 
 * @param {向量集} vectors 
 * @param {距离} near 
 * @returns 向量集
 */
function checkPointNearVectors(point, vectors, near) {
  let nearVectors = [];
  let containVectors = [];
  let extendVectors = [];
  let nearPoint = [];
  // 遍历所有向量，获取所有点靠近的向量
  for (let vector of vectors) {
    let { distance, cross } = distanceBetweenPointLine(point, vector);
    // 满足限定的距离条件
    if (distance <= near) {
      // 若垂足在线段上
      if (checkPointOnSegment(cross, vector)) {
        containVectors.push({ vector, cross });
      }
      // 若垂足在延长线上，则保证相同斜率的向量仅有一条
      else {
        let check = true;
        for (let info of extendVectors) {
          let v = info.vector;
          if (crossProduct([v[0][0] - v[1][0], v[0][1] - v[1][1]], [vector[0][0] - vector[1][0], vector[0][1] - vector[1][1]]) === 0) {
            check = false;
            break;
          }
        }
        if (!check) continue;
        extendVectors.push({ vector, cross });
      }
    }
  }
  // 检查延长向量是否与在点向量共线
  let i = 0;
  let count = 0;
  while (i < extendVectors.length) {
    count += 1;
    if (count > 100) break;
    for (let j = 0, len2 = containVectors.length; j < len2; j++) {
      let v1 = extendVectors[i].vector;
      let v2 = containVectors[j].vector;
      if (Math.abs(crossProduct([v1[0][0] - v1[1][0], v1[0][1] - v1[1][1]], [v2[0][0] - v2[1][0], v2[0][1] - v2[1][1]])) < 0.0001) {
        extendVectors.splice(i, 1);
        break;
      }
      else {
        i += 1;
        if (i >= extendVectors.length) {
          break;
        }
      }
    }
  }
  // 遍历点在线段上的向量
  for (let info of containVectors) {
    let { vector, cross } = info;
    // 若未有交点则初始化
    if (nearPoint.length === 0) {
      nearPoint = cross;
      nearVectors.push(vector);
      continue;
    }
    // 若已有交点则判断两线交点是否与原垂足距离较近
    let p = vectorsCrossPoint(vector, nearVectors[nearVectors.length - 1]);
    // 若交点距离现有垂足过远则忽略该交点
    if (distanceBetweenPoints(p, nearPoint) <= near) {
      nearPoint = p;
      nearVectors.push(vector);
    }
  }
  for (let info of extendVectors) {
    let { vector, cross } = info;
    // 如果包含点的向量列表不为空，则仅需判断点到向量垂足与当前垂足是否接近
    if (containVectors.length > 0) {
      // 若已有交点则判断两线交点是否与原垂足距离较近
      let p = vectorsCrossPoint(vector, nearVectors[nearVectors.length - 1]);
      // 若交点距离现有垂足过远则忽略该交点
      if (distanceBetweenPoints(p, nearPoint) <= near) {
        nearPoint = p;
        nearVectors.push(vector);
      }
      continue;
    }
    // 如果当前没有交点
    if (nearPoint.length === 0) {
      nearPoint = cross;
      nearVectors.push(vector);
      continue;
    }
    // 若已有交点则判断两线交点是否与原垂足距离较近
    let p = vectorsCrossPoint(vector, nearVectors[nearVectors.length - 1]);
    // 若交点距离现有垂足过远则忽略该交点
    if (distanceBetweenPoints(p, nearPoint) <= near) {
      nearPoint = p;
      nearVectors.push(vector);
    }
  }
  return { nearVectors, nearPoint };
}

/**
 * 判断点是否在线段上
 * @param {点} point 
 * @param {线段} vector 
 * @returns 判断得到的布尔值
 */
function checkPointOnSegment(point, vector) {
  // 是否与端点接近
  if (distanceBetweenPoints(vector[0], point) < 0.0001) {
    return true;
  }
  if (distanceBetweenPoints(vector[1], point) < 0.0001) {
    return true;
  }
  let v1 = [point[0] - vector[0][0], point[1] - vector[0][1]];
  let v2 = [vector[1][0] - vector[0][0], vector[1][1] - vector[0][1]];
  let cond = Math.abs(crossProduct(v1, v2)) < 0.001;
  // 若叉乘结果较大则点不在线段上
  if (!cond) {
    return false;
  }
  // 若线段垂直或平行仅判断点是否在一个方向的区间内
  if (Math.abs(vector[0][0] - vector[1][0]) < 0.0001) {
    return (Math.min(vector[0][1], vector[1][1]) <= point[1])
      && (Math.max(vector[0][1], vector[1][1]) >= point[1]);
  }
  if (Math.abs(vector[0][1] - vector[1][1]) < 0.0001) {
    return (Math.min(vector[0][0], vector[1][0]) <= point[0])
      && (Math.max(vector[0][0], vector[1][0]) >= point[0]);
  }
  // 否则需要保证点在线段为对角线构成的矩形区域内
  return (Math.min(vector[0][0], vector[1][0]) <= point[0])
    && (Math.max(vector[0][0], vector[1][0]) >= point[0])
    && (Math.min(vector[0][1], vector[1][1]) <= point[1])
    && (Math.max(vector[0][1], vector[1][1]) >= point[1]);
}

/**
 * 点到该线段所在直线的距离
 * @param {点} point 
 * @param {线段} vector 
 * @returns 距离和点到直线的垂足
 */
function distanceBetweenPointLine(point, vector) {
  // 是否与端点接近
  if (distanceBetweenPoints(vector[0], point) < 1) {
    return { distance: distanceBetweenPoints(vector[0], point), cross: vector[0] };
  }
  if (distanceBetweenPoints(vector[1], point) < 1) {
    return { distance: distanceBetweenPoints(vector[1], point), cross: vector[1] };
  }
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

/**
 * 向量的交点
 * @param {向量1} v1 
 * @param {向量2} v2 
 * @returns 交点
 */
function vectorsCrossPoint(v1, v2) {
  if (judgePointEqual(v1[1], v2[0])) return v1[1];
  if (judgePointEqual(v1[0], v2[1])) return v1[0];
  if (judgePointEqual(v1[0], v2[0])) return v1[0];
  if (judgePointEqual(v1[1], v2[1])) return v1[1];
  let a1 = v1[0];
  let b1 = v2[0];
  let va = [v1[1][0] - v1[0][0], v1[1][1] - v1[0][1]];
  let vb = [v2[1][0] - v2[0][0], v2[1][1] - v2[0][1]];
  let div = crossProduct(va, vb);
  if (Math.abs(div) < 0.001) {
    return [];
  }
  let t = (crossProduct(b1, vb) - crossProduct(a1, vb)) / div;
  return [a1[0] + va[0] * t, a1[1] + va[1] * t];
}

/**
 * 求两条线段的交点
 * 没有则返回 []
 * @param {线段1} seg1 
 * @param {线段2} seg2 
 */
function segmentIntersect(seg1, seg2) {
  let p = seg1[0];
  let r = [seg1[1][0] - seg1[0][0], seg1[1][1] - seg1[0][1]];
  let q = seg2[0];
  let s = [seg2[1][0] - seg2[0][0], seg2[1][1] - seg2[0][1]];
  let denom = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(denom) < 0.001) {
    return [];
  }
  let t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / denom;
  let u = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / denom;
  if ((t < 0 || t > 1) || (u < 0 || u > 1)) {
    return [];
  }
  let x = p[0] + t * r[0];
  let y = p[1] + t * r[1];
  return [x, y];
}

/**
 * 两点是否相等
 * @param {点1} p1 
 * @param {点2} p2 
 * @returns 是否相等
 */
function judgePointEqual(p1, p2) {
  return Math.abs(p1[0] - p2[0]) < 0.0001 && Math.abs(p1[1] - p2[1]) < 0.0001;
}

/**
 * 距离该线段为 d 的平行线段
 * @param {线段} vector 
 * @param {距离} d 
 * @returns 
 */
function distanceParallelLine(vector, d) {
  let p1 = vector[0];
  let p2 = vector[1];
  if (p1[0] === p2[0]) {
    if (p1[1] < p2[1]) d = -d;
    return [[p1[0] + d, p1[1]], [p2[0] + d, p2[1]]]
  }
  let degree = getPointAngleDegree(p1, p2);
  let r = degree / 180 * Math.PI;
  return [
    [
      p1[0] - d * Math.sin(r),
      p1[1] + d * Math.cos(r)
    ],
    [
      p2[0] - d * Math.sin(r),
      p2[1] + d * Math.cos(r)
    ]
  ];
}

/**
 * 获取线段所在直线的一般式参数
 * @param {线段} vector 
 * @returns 参数 A B C
 */
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

/**
 * 获取向量 [p1, p2] 与 x 轴正方向的夹角
 * 取值范围 (-180,180] 0 表示与 x 轴正方向夹角为 0
 * @param {点1} p1 
 * @param {点2} p2 
 * @returns 夹角
 */
function getPointAngleDegree(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) / Math.PI * 180;
}

export default {
  normalize,
  crossProduct,
  generateLineEquation,

  checkPointOnSegment,
  checkPointNearVectors,
  distanceBetweenPoints,
  distanceBetweenPointLine,
  distanceParallelLine,
  getPointAngleDegree,
  judgePointEqual,
  vectorsCrossPoint,
  segmentIntersect,
  judgePointEqual,

  createEqualDistPoint,
  judgeClockwise,
}