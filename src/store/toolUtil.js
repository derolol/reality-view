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
 * 简单数组深拷贝
 */
function arraySimpleDeepCopy(list) {
  return JSON.parse(JSON.stringify(list));
}

/**
 * 计算数据层数
 * @param {数组} list 
 * @returns 层数
 */
function countArrayLevel(list) {
  for (let i = 0, len = list.length; i < len; i++) {
    if (Array.isArray(list[i])) {
      return countArrayLevel(list[i]) + 1;
    }
  }
  return 1;
}



export default {
  debounce,
  throttle,
  arraySimpleDeepCopy,
  countArrayLevel,
}