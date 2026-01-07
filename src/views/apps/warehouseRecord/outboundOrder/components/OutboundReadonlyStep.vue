<template>
  <div class="wrap-left-form readonly-step">
    <van-form>
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field label="出库类型" label-align="top" :model-value="outStockTypeLabel" readonly />
        <van-field label="仓库名称" label-align="top">
          <template #input>
            <dc-select-dialog
              v-model="formData.warehouseId"
              placeholder="请点击选择仓库"
              objectName="warehouse"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :disabled="isShow"
            />
          </template>
        </van-field>
        <van-field label="申请人" label-align="top">
          <template #input>
            <dc-select-user
              v-model="formData.applicantId"
              placeholder="请选择"
              :multipleLimit="1"
              :disabled="isShow"
            />
          </template>
        </van-field>
        <van-field label="处理人" label-align="top">
          <template #input>
            <dc-select-user
              v-model="formData.processingPersonnel"
              placeholder="请选择"
              :multipleLimit="1"
              :disabled="isShow"
            />
          </template>
        </van-field>
        <van-field
          v-model="formData.remark"
          label="备注"
          label-align="top"
          type="textarea"
          rows="2"
          placeholder="请输入备注"
          :disabled="isShow"
        />
      </van-cell-group>
      <div class="form-group-title">出库明细</div>
      <van-cell-group inset class="tabel-border">
        <van-cell
          v-for="(item, index) in formData.detailList"
          :key="index"
          :title="item.productName"
          :label="`编码：${item.productCode || '-'}`"
        >
          <template #value>
            <div class="detail-values">
              <div>规格：{{ item.productSpec || '-' }}</div>
              <div>数量：{{ item.productQty ?? '-' }}</div>
              <div>单位：{{ item.productUnit || '-' }}</div>
              <div>
                仓位：
                <dc-view v-model="item.locationId" objectName="warehouseLocation" showKey="locationName" />
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button block @click="cancelSubmit">返回</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup name="OutboundReadonlyStep">
import { reactive, toRefs, getCurrentInstance, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const router = useRouter();
const emit = defineEmits(['detail', 'out-stock-type-change']);
const detail = () => {
  emit('detail');
};
const { DC_WMS_OUT_TYPE_WMS } = proxy.dicts(['DC_WMS_OUT_TYPE_WMS']);
const props = defineProps({
  info: {
    type: Object,
    default: {},
  },
});
const pageData = reactive({
  loading: false,
  rules: {},
  formData: {},
  isShow: true,
});

const { loading, rules, formData, isShow } = toRefs(pageData);
const outStockTypeLabel = computed(() => {
  const list = DC_WMS_OUT_TYPE_WMS?.value || [];
  const hit = list.find((item) => item.dictKey === formData.value.outStockType);
  return hit?.dictValue || '';
});

onMounted(() => {
  formData.value = props.info;
});
watch(
  () => formData.value.outStockType,
  (newVal) => {
    if (newVal) {
      emit('out-stock-type-change', newVal);
    }
  }
);

const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/outboundOrder',
    params: {},
  });
};
</script>

<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
.wrap-left-form {
  padding: 12px;
  background: #f7f8fa;
}
.form-group-title {
  font-weight: 600;
  color: #303133;
  margin: 12px 4px;
}
.detail-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.form-itme-btn {
  margin-top: 16px;
}
.readonly-step {
  padding-bottom: 8px;
}
</style>
