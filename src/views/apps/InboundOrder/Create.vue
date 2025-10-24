<template>
  <div class="page inbound-order-create">
    <van-nav-bar
      fixed
      :z-index="999"
      title="新增入库单"
      left-arrow
      :style="{ background: '#F7EEE8' }"
      @click-left="goBack"
    />

    <div class="page-body">
      <van-form ref="formRef" @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.warehouseName"
            label="仓库名称"
            placeholder="请输入仓库名称"
            :rules="[{ required: true, message: '请输入仓库名称' }]"
          />
          <van-field
            v-model="form.inStockNumber"
            label="来源单号"
            placeholder="请输入来源单号"
            :rules="[{ required: true, message: '请输入来源单号' }]"
          />
          <van-field
            v-model="form.processingPersonnelName"
            label="处理人"
            placeholder="请输入处理人"
          />
          <van-field
            v-model="form.applicantName"
            label="申请人"
            placeholder="请输入申请人"
          />
          <van-field v-model="form.remark" label="备注" placeholder="请输入备注" />
        </van-cell-group>

        <div class="section">
          <div class="section__header">
            <h3>入库明细</h3>
            <van-button plain size="small" type="primary" @click="addItem">
              <van-icon name="plus" size="14" /> 添加明细
            </van-button>
          </div>

          <div v-if="form.detailList.length" class="items">
            <div v-for="(item, index) in form.detailList" :key="item.id" class="item-card">
              <div class="item-card__header">
                <span class="index">#{{ index + 1 }}</span>
                <van-button size="mini" type="danger" plain @click="removeItem(index)">删除</van-button>
              </div>
              <van-cell-group inset>
                <van-field
                  v-model="item.productCode"
                  label="物料编号"
                  placeholder="请输入物料编号"
                  :rules="[{ required: true, message: '请输入物料编号' }]"
                />
                <van-field
                  v-model="item.productName"
                  label="物料名称"
                  placeholder="请输入物料名称"
                  :rules="[{ required: true, message: '请输入物料名称' }]"
                />
                <van-field v-model="item.productSpec" label="规格型号" placeholder="请输入规格型号" />
                <van-field v-model="item.productUnit" label="单位" placeholder="请输入单位" />
                <van-field
                  v-model.number="item.productQty"
                  label="数量"
                  type="digit"
                  placeholder="请输入数量"
                  :rules="[{ required: true, message: '请输入数量' }]"
                />
                <van-field v-model="item.locationCode" label="仓位编码" placeholder="请输入仓位编码" />
                <van-field v-model="item.remark" label="备注" type="textarea" rows="2" placeholder="请输入备注" />
              </van-cell-group>
            </div>
          </div>
          <van-empty v-else description="请添加入库明细" />
        </div>

        <div class="form-footer">
          <van-button block type="success" native-type="submit">保存入库单</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { showSuccessToast, showToast } from 'vant';
import { useRouter } from 'vue-router';
import useInboundOrders from '@/composables/useInboundOrders';

const router = useRouter();
const { addOrder } = useInboundOrders();

const form = reactive({
  warehouseName: '',
  inStockNumber: '',
  processingPersonnelName: '',
  applicantName: '当前用户',
  remark: '',
  detailList: [],
});

const goBack = () => {
  router.back();
};

const createEmptyItem = () => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  productCode: '',
  productName: '',
  productSpec: '',
  productQty: null,
  productUnit: '',
  locationCode: '',
  remark: '',
});

const addItem = () => {
  form.detailList.push(createEmptyItem());
};

const removeItem = (index) => {
  form.detailList.splice(index, 1);
};

const validateForm = () => {
  if (!form.warehouseName) {
    showToast({ type: 'fail', message: '请输入仓库名称' });
    return false;
  }
  if (!form.inStockNumber) {
    showToast({ type: 'fail', message: '请输入来源单号' });
    return false;
  }
  if (!form.detailList.length) {
    showToast({ type: 'fail', message: '请添加入库明细' });
    return false;
  }
  const invalidIndex = form.detailList.findIndex((item) => item.productQty === null || item.productQty === '');
  if (invalidIndex !== -1) {
    showToast({ type: 'fail', message: `请填写第 ${invalidIndex + 1} 行的数量` });
    return false;
  }
  const missingMaterial = form.detailList.findIndex((item) => !item.productCode || !item.productName);
  if (missingMaterial !== -1) {
    showToast({ type: 'fail', message: `请完善第 ${missingMaterial + 1} 行的物料信息` });
    return false;
  }
  return true;
};

const resetForm = () => {
  form.warehouseName = '';
  form.inStockNumber = '';
  form.processingPersonnelName = '';
  form.applicantName = '当前用户';
  form.remark = '';
  form.detailList = [];
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  const order = addOrder({
    warehouseName: form.warehouseName,
    inStockNumber: form.inStockNumber,
    processingPersonnelName: form.processingPersonnelName,
    applicantName: form.applicantName,
    remark: form.remark,
    detailList: form.detailList.map((item) => ({
      ...item,
      productQty: Number(item.productQty ?? 0),
    })),
  });

  resetForm();
  showSuccessToast('保存成功');
  router.replace({ name: 'appsInboundOrderDetail', params: { id: order.id } });
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-body {
  padding: 96px 16px 120px;
  box-sizing: border-box;
}

.section {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section__header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff7f0;
}

.item-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-card__header .index {
  font-weight: 600;
  color: #d05507;
}

.form-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
}
</style>
