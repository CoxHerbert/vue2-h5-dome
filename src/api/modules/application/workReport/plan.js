import request from '@/utils/http';

export default {
  // 明细列表
  getPlanId(params) {
    return request({
      url: '/api/blade-bip/plan/find-plan-id-by-sn',
      method: 'get',
      params,
    });
  },
  // 详情
  getPlanDetail(params) {
    return request({
      url: '/api/blade-bip/plan/find-plan-id-by-plan',
      method: 'get',
      params,
    });
  },
};
