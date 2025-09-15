import request from '@/utils/http';

export default {
  getUserInfo() {
    return request({
      url: '/blade-system/user/info',
      method: 'get',
    });
  },
  talentRegister(data) {
    return request({
      url: '/blade-rbac/TalentUser/user-create',
      method: 'post',
      data,
    });
  },
  laborRegister(data) {
    return request({
      url: '/blade-bip/laborRegister/user-create',
      method: 'post',
      data,
    });
  },
};
