import request from '@/utils/http';

export default {
  // 提交入职信息
  postTalentUser(data) {
    return request({
      url: '/blade-rbac/TalentUser/skip-url/submmit',
      method: 'post',
      data,
    });
  },
  // 获取招收岗位列表
  getPositionList(params) {
    return request({
      url: '/blade-rbac/TalentPosition/get-position-list',
      method: 'get',
      params,
    });
  },
};
