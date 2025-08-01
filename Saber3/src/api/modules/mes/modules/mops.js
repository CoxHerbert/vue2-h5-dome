import request from '@/axios';

export default {
  // 生产主计划生成工序
  getProdPlan(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/erp-page-list',
      method: 'get',
      params,
    });
  },
  // 工序计划
  getSolutionPlan(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/plan-list',
      method: 'get',
      params,
    });
  },

  // 获取生成计划详情 entryId
  getGenerateDetail(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-generate-detail',
      method: 'get',
      params,
    });
  },

  // 工序计划-修改详情
  getModifDetail(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-modify-detail',
      method: 'get',
      params,
    });
  },

  // 工序计划-提交
  postModifyMoPlan(data) {
    return request({
      url: '/blade-bip/dc/mops/plan/modify-mo-plan',
      method: 'post',
      data,
    });
  },

  // 生成生产主计划生成工序 entryId
  postGenerate(data) {
    return request({
      url: '/blade-bip/dc/mops/plan/generate-mo-plan',
      method: 'post',
      data,
    });
  },
  // 删除生产主计划生成工序 entryId
  deleteMoPlan(ids) {
    return request({
      url: '/blade-bip/dc/mops/plan/delete-mo-plan',
      method: 'delete',
      params: {
        entryId: ids,
      },
    });
  },
  // 获取工序工时汇报列表
  getProcessWorkTimeReportList(params) {
    return request({
      url: '/blade-bip/dc/mops/wksr/list',
      method: 'get',
      params,
    });
  },
  // 工序工时汇报删除
  deleteProcessWorkTimeReport(ids) {
    return request({
      url: '/blade-bip/dc/mops/wksr/cancel-report',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
  // 获取工序工时汇报列表
  getPlanList(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/plan-list',
      method: 'get',
      params,
    });
  },
  // 展示
  getItemDetail(params) {
    return request({
      url: '/blade-bip/dc/mops/wksr/get-item-getail',
      method: 'get',
      params,
    });
  },
  // 保存工序工时汇报
  saveReport(data) {
    return request({
      url: '/blade-bip/blade-bip/dc/mops/wksr/save-report',
      method: 'post',
      data,
    });
  },
  // 批量生成
  trackBatchGenerate(data) {
    return request({
      url: '/blade-bip/sip/track/batch-generate',
      method: 'post',
      data,
    });
  },
  // 获取工序工时汇报详情
  getReportDetail(params) {
    return request({
      url: '/blade-bip/dc/mops/wksr/get-detail',
      method: 'get',
      params,
    });
  },
  // 生产主计划生成工序-制程卡
  getPdf(params) {
    return request({
      url: '/blade-bip/skip-url/dc/mops/plan/pdf/get-pdf',
      method: 'get',
      params,
    });
  },
  // 获取物料标签列表
  getLabelList(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-label-list',
      method: 'get',
      params,
    });
  },
  // 提交标签列表
  postLabelPdfVo(data) {
    return request({
      url: '/blade-bip/skip-url/dc/mops/plan/pdf/get-label-pdf-vo',
      method: 'post',
      data,
    });
  },
  // 获取历史工艺列表
  getHisProcess(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-history-mo-plan',
      method: 'get',
      params,
    });
  },
  // 获取历史BOM列表
  getHisBom(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-history-material-bom',
      method: 'get',
      params,
    });
  },
  // 获取原材料列表
  getRawList(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/get-raw-list',
      method: 'get',
      params,
    });
  },
  // 提交erp
  pushErpBom(params) {
    return request({
      url: '/blade-bip/dc/mops/plan/push-erp-bom',
      method: 'post',
      params,
    });
  },
};
