import request from '@/utils/http';

export default {
  // 企微推送卡片消息
  sendWechatMessage(params) {
    return request({
      url: '/blade-bip/wechat/message/send',
      method: 'GET',
      params,
    });
  },
};
