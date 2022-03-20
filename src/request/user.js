import JSEncrypt from 'jsencrypt'
import instance from './index'

const PREFIX = 'user';

/**
 * 测试是否能像后端发送请求
 * @returns 测试请求
 */
const requestTest = async () => {
  return instance.request({
    url: `/${PREFIX}/test`,
    method: 'get',
  });
}

/**
 * 验证是否满足访问前端路由的权限
 * @param {当前路由} before 
 * @returns 请求
 */
const userAuthorization = async (before) => {
  const token = localStorage.getItem("reality_token");
  if (!token) return { code: 401000 };
  return instance.request({
    url: `/${PREFIX}/check?before=${before}`,
    method: 'get',
  });
}

/**
 * 从后端获取信息加密公钥
 * @returns 公钥字符串
 */
const getPublicKey = async () => {
  return instance.request({
    url: `/${PREFIX}/key`,
    method: 'get',
  });
}

const secretPassword = (publicKey, password) => {
  let encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(password);
}

/**
 * 用户登录
 * @param {公钥} publicKey 
 * @param {用户名} user_name 
 * @param {用户密码} user_password 
 * @returns 用户登录请求
 */
const userLogin = async (publicKey, user_name, user_password) => {
  user_password = secretPassword(publicKey, user_password);
  const data = { user_name, user_password };
  return instance.request({
    url: `/${PREFIX}/login`,
    method: 'post',
    data
  });
};

/**
 * 用户注册
 * @param {公钥} publicKey 
 * @param {用户名} user_name 
 * @param {用户密码} user_password 
 * @returns 用户注册请求
 */
const userRegister = async (publicKey, user_name, user_password) => {
  user_password = secretPassword(publicKey, user_password);
  const data = { user_name, user_password };
  return instance.request({
    url: `/${PREFIX}/register`,
    method: 'post',
    data
  });
}

export default {
  userAuthorization,
  getPublicKey,
  userLogin,
  userRegister,
  requestTest
}