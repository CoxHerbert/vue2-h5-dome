// src/api/modules/inventory.js
import request from '@/utils/http';

export default {
  // 入库单列表
  inventoryList(params) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock/list',
      method: 'GET',
      params,
    });
  },

  // 入库单详情
  inventoryDetail(params) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock/detail',
      method: 'GET',
      params,
    });
  },

  // 根据单据查询入库单详情
  detailByInStockNumber(params) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock-detail/query-source-documents-by-type',
      method: 'GET',
      params,
    });
  },

  // 入库单审核通过
  inventoryAudit(data) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock/submit-audit',
      method: 'POST',
      data,
    });
  },

  // 入库单审核驳回
  inventoryAuditReject(data) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock/reject',
      method: 'POST',
      data,
    });
  },

  // 入库单保存
  inventoryAdd(data) {
    return request({
      url: '/api/blade-bip/dc-wms-in-stock/submit-detail',
      method: 'POST',
      data,
    });
  },

  // 用户列表
  userList(data) {
    return request({
      url: '/api/blade-bip/bip-blade-user/select-data',
      method: 'POST',
      data,
    });
  },
};
