import request from '@/utils/http';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/WireQc/list',
      method: 'get',
      params,
    });
  },

  // 获取图纸内容
  getDrawContent(params) {
    return request({
      url: '/blade-bip/WireQc/get-draw-content',
      method: 'get',
      params,
    });
  },

  // 批量保存质检单
  batchSave(data) {
    return request({
      url: '/blade-bip/WireQc/batch-save',
      method: 'post',
      data,
    });
  },
};
