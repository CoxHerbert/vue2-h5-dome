import request from '@/utils/http';

export default {
  // 缺料查询接口
  getMaterialInfo(params) {
    return request({
      url: '/blade-bip/mps/work-schedule/get-material-info',
      method: 'get',
      params,
    });
  },
};
