import request from '@/utils/http';

// 登记列表
const getList = (params) => {
  return request({
    url: '/blade-bip/laborRegister/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};

const getDetail = (params) => {
  return request({
    url: '/blade-bip/laborRegister/detail',
    method: 'get',
    params: {
      ...params,
    },
  });
};

// 登记面试审批
const laborRegisterUpdate = (row) => {
  return request({
    url: '/blade-bip/laborRegister/update',
    method: 'post',
    data: row,
  });
};

const laborRegisterLeave = (row) => {
  return request({
    url: '/blade-bip/laborRegister/leave',
    method: 'post',
    data: row,
  });
};

// 登记删除
const remove = (ids) => {
  return request({
    url: '/blade-bip/laborRegister/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};

// 登记面试审批
const laborDecision = (row) => {
  return request({
    url: '/blade-bip/laborRegister/labor-decision',
    method: 'post',
    data: row,
  });
};

// 劳务公司列表
const getLaborCompanyList = (params) => {
  return request({
    url: '/blade-bip/LaborCompany/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};

// 劳务公司添加和修改
const addEditeLaborCompany = (row) => {
  return request({
    url: '/blade-bip/LaborCompany/submit',
    method: 'post',
    data: row,
  });
};

// 劳务公司删除
const laborCompanyRemove = (ids) => {
  return request({
    url: '/blade-bip/LaborCompany/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};

// 批量入职
const onboarding = (ids) => {
  return request({
    url: '/blade-bip/laborRegister/onboarding',
    method: 'post',
    data: ids,
  });
};

// 批量离职
const leaving = (ids) => {
  return request({
    url: '/blade-bip/laborRegister/leaving',
    method: 'post',
    data: ids,
  });
};

export default {
  getList,
  getDetail,
  laborRegisterUpdate,
  laborRegisterLeave,
  remove,
  laborDecision,
  getLaborCompanyList,
  addEditeLaborCompany,
  laborCompanyRemove,
  onboarding,
  leaving,
};
