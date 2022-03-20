import instance from './index'

const PREFIX = 'editor';

const userLogin = async () => {
  return instance.request({
    url: `/${PREFIX}/login`,
    method: 'post',
  });
};

export default {
  userLogin
}