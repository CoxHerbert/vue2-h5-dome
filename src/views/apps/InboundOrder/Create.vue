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
            v-model="form.locatorNo"
            label="库位编码"
            placeholder="请输入库位编码"
            :rules="[{ required: true, message: '请输入库位编码' }]"
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

          <div v-if="form.items.length" class="items">
            <div v-for="(item, index) in form.items" :key="item.id" class="item-card">
              <div class="item-card__header">
                <span class="index">#{{ index + 1 }}</span>
                <van-button size="mini" type="danger" plain @click="removeItem(index)">删除</van-button>
              </div>
              <van-cell-group inset>
                <van-field v-model="item.bomNo" label="BOM编码" placeholder="请输入" />
                <van-field v-model="item.bomVersion" label="BOM版本" placeholder="请输入" />
                <van-field v-model="item.no" label="执行单单号" placeholder="请输入" />
                <van-field v-model="item.exeMaterialNumber" label="物料编码" placeholder="请输入" />
                <van-field v-model="item.exeMaterialName" label="物料名称" placeholder="请输入" />
                <van-field v-model="item.finishMaterialNumber" label="成品物料编码" placeholder="请输入" />
                <van-field v-model="item.finishMaterialName" label="成品物料名称" placeholder="请输入" />
                <van-field v-model="item.mtoNo" label="专案号" placeholder="请输入" />
                <van-field v-model="item.unit" label="单位" placeholder="请输入" />
                <van-field
                  v-model.number="item.drawQty"
                  label="图档数量"
                  type="digit"
                  placeholder="请输入数量"
                  :rules="[{ required: true, message: '请输入图档数量' }]"
                />
                <div class="field-block">
                  <div class="field-block__label">是否合格</div>
                  <van-radio-group v-model="item.isQualified" direction="horizontal">
                    <van-radio name="1">合格</van-radio>
                    <van-radio name="0">不合格</van-radio>
                  </van-radio-group>
                </div>
                <van-field
                  v-if="item.isQualified === '0'"
                  v-model="item.execeptionType"
                  label="异常类型"
                  placeholder="请输入异常类型"
                />
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
  locatorNo: '',
  remark: '',
  items: [],
});

const goBack = () => {
  router.back();
};

const createEmptyItem = () => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  bomNo: '',
  bomVersion: '',
  drawAddress: '',
  drawQty: null,
  exeMaterialNumber: '',
  exeMaterialName: '',
  finishMaterialNumber: '',
  finishMaterialName: '',
  mtoNo: '',
  unit: '',
  no: '',
  isQualified: '1',
  execeptionType: '',
  remark: '',
});

const addItem = () => {
  form.items.push(createEmptyItem());
};

const removeItem = (index) => {
  form.items.splice(index, 1);
};

const validateForm = () => {
  if (!form.locatorNo) {
    showToast({ type: 'fail', message: '请输入库位编码' });
    return false;
  }
  if (!form.items.length) {
    showToast({ type: 'fail', message: '请添加入库明细' });
    return false;
  }
  const invalidIndex = form.items.findIndex((item) => item.drawQty === null || item.drawQty === '');
  if (invalidIndex !== -1) {
    showToast({ type: 'fail', message: `请填写第 ${invalidIndex + 1} 行的图档数量` });
    return false;
  }
  return true;
};

const resetForm = () => {
  form.locatorNo = '';
  form.remark = '';
  form.items = [];
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  const order = addOrder({
    locatorNo: form.locatorNo,
    remark: form.remark,
    items: form.items.map((item) => ({
      ...item,
      drawQty: Number(item.drawQty ?? 0),
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

.field-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
}

.field-block__label {
  color: #646566;
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
