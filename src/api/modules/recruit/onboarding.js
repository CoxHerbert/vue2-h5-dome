import request from '@/utils/http';

export default {
  getLaborRegisterDetail(params) {
    return request({
      url: '/blade-bip/LaborRegister/detail',
      method: 'get',
      params,
    });
  },

  createLaborRegister(data) {
    return request({
      url: '/blade-bip/LaborRegister/user-create',
      method: 'post',
      data,
    });
  },

  updateLaborRegister(data) {
    return request({
      url: '/blade-bip/LaborRegister/update',
      method: 'post',
      data,
    });
  },

  getLaborCompanyList(params) {
    return request({
      url: '/blade-bip/LaborCompany/list',
      method: 'get',
      params,
    });
  },
};
