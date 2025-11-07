import request from '@/utils/http';

const BASE_URL = '/blade-bip/dc-wire-qc';

export default {
  list(params) {
    return request({
      url: `${BASE_URL}/page`,
      method: 'get',
      params,
    });
  },

  getDrawContent(params) {
    return request({
      url: `${BASE_URL}/draw-content`,
      method: 'get',
      params,
    });
  },

  batchSave(data) {
    return request({
      url: `${BASE_URL}/batch-save`,
      method: 'post',
      data,
    });
  },
};
