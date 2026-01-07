<template>
  <div class="wrap-left-form">
    <van-form ref="ruleFormRef">
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field label="入库类型" :model-value="inTypeLabel" readonly />
        <van-field label="仓库名称">
          <template #input>
            <dc-select-dialog
              v-model="formData.warehouseId"
              placeholder="请点击选择仓库"
              object-name="warehouse"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :disabled="show"
            />
          </template>
        </van-field>
        <van-field label="来源单号">
          <template #input>
            <dc-select-dialog
              v-if="formData.inType === 'DC_WMS_IN_TYPE_RETURN'"
              v-model="formData.inSourceNumber"
              object-name="outboundOrder"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :disabled="show"
              :params="{
                outStockStatus: 'DC_WMS_OUT_STATUS_BORROW',
              }"
              @change="(row) => handleWarehouseChange(row, 'outboundOrder')"
            />
            <van-field
              v-else
              v-model="formData.inSourceNumber"
              placeholder="请输入来源单号点击查询"
              readonly
            />
          </template>
        </van-field>
        <van-field label="申请人">
          <template #input>
            <dc-select-user
              v-model="formData.applicantId"
              placeholder="请选择"
              :multiple-limit="1"
              disabled
            />
          </template>
        </van-field>
        <van-field label="处理人">
          <template #input>
            <dc-select-user
              v-model="formData.processingPersonnel"
              placeholder="请选择"
              :multiple-limit="1"
              disabled
            />
          </template>
        </van-field>
      </van-cell-group>
      <div class="form-group-title">入库明细</div>
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
                  object-name="warehouseLocation"
                  show-key="locationName"
                />
              </div>
              <div class="detail-actions" v-if="btnOpen">
                <van-button size="small" type="primary" plain @click="handleUpdate(item)">
                  编辑
                </van-button>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button type="primary" block @click="submitAudit">通过</van-button>
        <van-button type="primary" block @click="submitReject">驳回</van-button>
        <van-button block @click="cancelSubmit">取消</van-button>
      </div>
    </van-form>
  </div>

  <van-popup v-model:show="open" position="right" class="drawer-popup" @close="closeDrawer">
    <div class="drawer-content">
      <div class="drawer-title">{{ title }}</div>
      <van-form ref="formRef">
        <van-cell-group inset>
          <van-field v-model="formDataTable.productCode" label="物料编号" readonly />
          <van-field v-model="formDataTable.productName" label="物料名称" readonly />
          <van-field v-model="formDataTable.productSpec" label="规格型号" readonly />
          <van-field label="数量">
            <template #input>
              <van-stepper v-model="formDataTable.productQty" disabled />
            </template>
          </van-field>
          <van-field v-model="formDataTable.productUnit" label="单位" readonly />
          <van-field label="仓位编号">
            <template #input>
              <dc-select-dialog
                v-model="formDataTable.locationId"
                placeholder="请点击仓位编号"
                object-name="warehouseLocation"
                type="input"
                :multiple="false"
                :multiple-limit="1"
                :clearable="true"
                :params="{
                  warehouseId: props.info.warehouseId,
                }"
              />
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
      <div class="drawer-footer">
        <van-button type="primary" block @click="submitFormTable">提交</van-button>
        <van-button block @click="closeDrawer">取消</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup name="customerSubmit">
import { h, reactive, ref, toRefs, getCurrentInstance, onMounted, watch, computed } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { Field, showConfirmDialog, showToast } from 'vant';
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
// 子组件调用父组件方法
const emit = defineEmits(['detail']);
const detail = () => {
  emit('detail');
};
const { DC_WMS_IN_TYPE_WMS } = proxy.dicts(['DC_WMS_IN_TYPE_WMS']);
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
  show: true,
  open: false,
  title: '',
  formDataTable: {},
  btnOpen: false,
  unitList: [],
});

const { loading, rules, formData, show, open, title, formDataTable, btnOpen, unitList } = toRefs(
  pageData
);
const inTypeLabel = computed(() => {
  const list = DC_WMS_IN_TYPE_WMS?.value || [];
  const hit = list.find((item) => item.dictKey === formData.value.inType);
  return hit?.dictValue || '';
});

const validateForm = async () => {
  const formRef = proxy.$refs.ruleFormRef;
  if (formRef?.validate) {
    await formRef.validate();
  }
};

const rejectReason = ref('');

onMounted(() => {
  formData.value = props.info;
});

const handleWarehouseChange = (row, type) => {
  if (type === 'outboundOrder') {
    formData.value.processingPersonnel = row.processingPersonnel;
  }
};

const submitAudit = () => {
  (async () => {
    try {
      await validateForm();
    } catch {
      return;
    }
    const res = await Api.application.warehousingEntry.submitAudit({
      ...formData.value,
    });
    const { code, msg } = res.data;
    if (code === 200) {
      showToast({ type: 'success', message: '审核成功' });
      router.push({
        path: '/wms/warehouseRecord/warehousingEntry',
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
    const res = await Api.application.warehousingEntry.submitReject({
      ...formData.value,
      reject: reason,
    });
    const { code, msg } = res.data;
    if (code === 200) {
      showToast({ type: 'success', message: '驳回成功' });
      router.push({
        path: '/wms/warehouseRecord/warehousingEntry',
        params: {},
      });
    }
  } catch (error) {
    console.error('Reject cancelled or failed:', error);
  }
};

const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};

const handleUpdate = (row) => {
  formDataTable.value = { ...row };
  open.value = true;
};

const submitFormTable = async () => {
  open.value = false;
};

const closeDrawer = () => {
  open.value = false;
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
.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.form-itme-btn {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-popup {
  width: 85%;
  max-width: 420px;
}
.drawer-content {
  padding: 16px;
}
.drawer-title {
  font-weight: 600;
  margin-bottom: 12px;
}
.drawer-footer {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
