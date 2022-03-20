import instance from './index'

const PREFIX = 'home';

const userLogin = async () => {
  return instance.request({
    url: `/${PREFIX}/login`,
    method: 'post',
  });
};

export default {
  userLogin
}