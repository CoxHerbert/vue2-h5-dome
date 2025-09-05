import request from '@/utils/http';

export default {
  getUserInfo() {
    return request({
      url: '/blade-system/user/info',
      method: 'get',
    });
  },
};
