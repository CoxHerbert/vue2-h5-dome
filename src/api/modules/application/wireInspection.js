import request from '@/utils/http';

const prefix = '/blade-bip/mps/wire-qc';

export default {
  list(params) {
    return request({
      url: `${prefix}/list`,
      method: 'get',
      params,
    });
  },
  getDrawContent(params) {
    return request({
      url: `${prefix}/draw-content`,
      method: 'get',
      params,
    });
  },
  batchSave(data) {
    return request({
      url: `${prefix}/batch-save`,
      method: 'post',
      data,
    });
  },
};
