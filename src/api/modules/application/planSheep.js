import request from '@/utils/http';

export default {
  detail(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-phase/detail',
      method: 'GET',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/mmr-plan-order-phase/submit',
      method: 'POST',
      data,
    });
  },
};
