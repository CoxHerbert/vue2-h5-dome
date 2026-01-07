<template>
  <div class="wrap-left-form">
    <van-form ref="ruleFormRef">
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field label="出库类型" :model-value="outStockTypeLabel" readonly />
        <van-field label="仓库名称">
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
        <van-field label="申请人">
          <template #input>
            <dc-select-user
              v-model="formData.applicantId"
              placeholder="请选择"
              :multipleLimit="1"
              :disabled="isShow"
            />
          </template>
        </van-field>
        <van-field label="处理人">
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
                <dc-view
                  v-model="item.locationId"
                  objectName="warehouseLocation"
                  showKey="locationName"
                />
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button type="primary" block @click="submitAudit">审核</van-button>
        <van-button type="primary" block @click="submitReject">驳回</van-button>
        <van-button block @click="cancelSubmit">取消</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup name="customerSubmit">
import { h, reactive, ref, toRefs, getCurrentInstance, onMounted, watch, computed } from 'vue';
import Api from '@/api';
import { useRouter } from 'vue-router';
import { Field, showConfirmDialog, showToast } from 'vant';

const { proxy } = getCurrentInstance();
const router = useRouter();
// 子组件调用父组件方法
const emit = defineEmits(['detail', 'out-stock-type-change']);
const detail = () => {
  emit('detail');
};

const { DC_WMS_OUT_TYPE_WMS } = proxy.dicts(['DC_WMS_OUT_TYPE_WMS']);
const props = defineProps({
  // 详情
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
const rejectReason = ref('');
const outStockTypeLabel = computed(() => {
  const list = DC_WMS_OUT_TYPE_WMS?.value || [];
  const hit = list.find((item) => item.dictKey === formData.value.outStockType);
  return hit?.dictValue || '';
});

const validateForm = async () => {
  const formRef = proxy.$refs.ruleFormRef;
  if (formRef?.validate) {
    await formRef.validate();
  }
};

onMounted(() => {
  formData.value = props.info;
});
// 监听出库类型变化
watch(
  () => formData.value.outStockType,
  (newVal) => {
    if (newVal) {
      emit('out-stock-type-change', newVal);
    }
  }
);
// 审核
const submitAudit = () => {
  (async () => {
    try {
      await validateForm();
    } catch {
      return;
    }
    const res = await Api.application.outboundOrder.submitAudit({
      ...formData.value,
    });
    const { code, msg } = res.data;
    if (code === 200) {
      showToast({ type: 'success', message: '审核成功' });
      router.push({
        path: '/wms/warehouseRecord/outboundOrder',
        params: {},
      });
    }
  })();
};

const promptRejectReason = async () => {
  rejectReason.value = '';
  await showConfirmDialog({
    title: '驳回原因',
    message: () =>
      h(Field, {
        modelValue: rejectReason.value,
        'onUpdate:modelValue': (value) => {
          rejectReason.value = value;
        },
        placeholder: '请输入驳回原因',
        type: 'textarea',
        autosize: true,
      }),
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });

  if (!rejectReason.value) {
    showToast({ type: 'fail', message: '请输入驳回原因' });
    throw new Error('reject reason required');
  }

  return rejectReason.value;
};

const submitReject = async () => {
  try {
    const reason = await promptRejectReason();
    const res = await Api.application.outboundOrder.submitReject({
      ...formData.value,
      reject: reason,
    });
    const { code, msg } = res.data;
    if (code === 200) {
      showToast({ type: 'success', message: '驳回成功' });
      router.push({
        path: '/wms/warehouseRecord/outboundOrder',
        params: {},
      });
    }
  } catch (error) {
    console.error('Reject cancelled or failed:', error);
  }
};

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
.detail-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.form-itme-btn {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
