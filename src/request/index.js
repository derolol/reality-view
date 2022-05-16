import router from "@/router";
import data from "@/utils/data";
import axios from "axios";

const instance = axios.create({
  baseURL: data.Server + "reality/api",
  timeout: 1000,
});

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("reality_token");
  if (token && token !== "") {
    Object.assign(config.headers, {
      Authorization: `Bearer ${token}`,
    });
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
  const res = response.data;
  if (Math.floor(res.code / 1000) !== 401 || (res.data && res.data.before)) {
    return response.data;
  }
  if (router.history.current.name !== "login") {
    router.replace({ name: "login" });
  }
  return null;
}, function (error) {
  return Promise.reject(error);
});

export default instance