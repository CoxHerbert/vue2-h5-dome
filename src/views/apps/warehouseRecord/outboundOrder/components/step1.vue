<template>
  <van-form ref="ruleFormRef">
    <div class="form-group-title">基本信息</div>
    <van-cell-group inset>
      <dc-selector
        v-model="formData.outStockType"
        label="出库类型"
        placeholder="请点击选择出库类型"
        title="出库类型"
        :options="DC_WMS_OUT_TYPE_WMS"
        disabled
      />

      <dc-select-dialog
        v-model="formData.warehouseId"
        placeholder="请点击选择仓库"
        label="仓库名称"
        object-name="warehouse"
        type="input"
        return-type="string"
        :multiple="false"
        :multiple-limit="1"
        :clearable="true"
        :params="{
          stockType: getStockType(formData.outStockType),
        }"
        disabled
        @change="handleWarehouseChange"
      />

      <dc-select-dialog
        v-model="formData.applicantId"
        label="申请人"
        placeholder="请选择"
        object-name="user"
        :multiple="false"
        return-type="string"
      />

      <dc-select-dialog
        v-model="formData.processingPersonnel"
        label="处理人"
        placeholder="请选择"
        object-name="user"
        :multiple="false"
        return-type="string"
      />

      <van-field
        v-model="formData.remark"
        label="备注"
        type="textarea"
        rows="2"
        placeholder="请输入备注"
      />

      <van-field
        v-if="formData.reject"
        v-model="formData.reject"
        label="驳回原因"
        type="textarea"
        rows="2"
        readonly
      />
    </van-cell-group>

    <div class="form-group-title">出库明细</div>

    <dc-select-dialog
      v-if="formData.warehouseId"
      object-name="warehouseCount"
      :multiple="true"
      :multiple-limit="0"
      :clearable="true"
      :params="{ warehouseId: ids }"
      @change="handleSerchDetail"
    >
      <template #customize>
        <van-button class="mb-5" type="primary" size="mini">查询明细</van-button>
      </template>

      <template #search-items="{ queryParams, currentObject }">
        <div class="dialog-search-box">
          <van-field
            v-model="queryParams.mtoNo"
            label="计划跟踪号"
            placeholder="请输入计划跟踪号"
          />
          <van-field
            v-model="queryParams[currentObject?.defaultLabel]"
            :placeholder="currentObject?.placeholder"
            label="物料名称"
            clearable
          />
        </div>
      </template>
    </dc-select-dialog>

    <!-- 出库明细：一行一项（每条明细一行展示：名称/数量/仓位/删除） -->
    <div v-for="(item, index) in formData.detailList" :key="index" class="card__meta">
      <div class="row">
        <span class="label">物料名称</span>
        <span class="value">
          {{ item.productName || '-' }}
        </span>
      </div>
      <div class="row">
        <span class="label">物料编码</span>
        <span class="value">
          {{ item.productCode || '-' }}
        </span>
      </div>
      <div class="row">
        <span class="label">规格型号</span>
        <span class="value">
          {{ item.productSpec || '-' }}
        </span>
      </div>
      <div class="row">
        <span class="label">数量</span>
        <span class="value">
          <van-stepper
            v-model="item.productQty"
            integer
            min="0"
            :max="999999999"
            theme="round"
            button-size="22"
            input-width="70"
          />
        </span>
      </div>
      <div class="row">
        <span class="label">单位</span>
        <span class="value">
          {{ item.productUnit || '-' }}
        </span>
      </div>
      <div class="row">
        <span class="label">仓位编号</span>
        <span class="value"
          ><dc-view
            v-model="item.locationId"
            object-name="warehouseLocation"
            show-key="locationName"
        /></span>
      </div>
      <div class="row">
        <van-button size="mini" type="danger" plain @click="removeEvaluate(item)">
          删除
        </van-button>
      </div>
    </div>

    <div class="form-itme-btn">
      <van-button type="primary" size="mini" block @click="submitForm">保存</van-button>
      <van-button type="primary" size="mini" block @click="submitAudit">审核</van-button>
      <van-button size="mini" block @click="cancelSubmit">取消</van-button>
    </div>
  </van-form>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, watch, computed, onMounted } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';

const outStockTypeMap = {
  // 现场出库
  DC_WMS_OUT_TYPE_SCENE: 'DC_WMS_STOCK_TYPE_SCENE',
  // 线边仓出库
  DC_WMS_OUT_TYPE_LINE_EDGE: 'DC_WMS_STOCK_TYPE_LINE_EDGE',
  // 其他出库
  DC_WMS_OUT_TYPE_OTHER: '',
  // 领用出库
  DC_WMS_OUT_TYPE_USE: '',
};

// 获取入库类型
const getStockType = (outType) => {
  return outType && outStockTypeMap[outType] ? outStockTypeMap[outType] : undefined;
};

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const userinfo = computed(() => proxy.$store.getters.userInfo);

// 子组件调用父组件方法
const emit = defineEmits(['out-stock-type-change']);

const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: () => ({}),
  },
});

const { DC_WMS_OUT_TYPE_WMS } = proxy.dicts(['DC_WMS_OUT_TYPE_WMS']);

const pageData = reactive({
  formData: {
    outStockType: 'DC_WMS_OUT_TYPE_BORROW',
    detailList: [],
  },
  isDisabled: true,
  ids: null,
});

const { formData, isDisabled, ids } = toRefs(pageData);

const validateForm = async () => {
  const formRef = proxy.$refs.ruleFormRef;
  if (formRef?.validate) {
    await formRef.validate();
  }
};

onMounted(() => {
  formData.value.applicantId = userinfo.value.user_id;
  formData.value.warehouseId = '2008344171069898753';

  if (route.params.id !== 'create') {
    const timer = setTimeout(() => {
      formData.value = {
        ...props.info,
        // 保底，避免 detailList 为空时报错
        detailList: props.info?.detailList || [],
      };
      clearTimeout(timer);
    }, 300);
  }
});

// 监听出库类型变化
watch(
  () => formData.value.outStockType,
  (newVal) => {
    if (newVal) emit('out-stock-type-change', newVal);
  }
);

// 保存
const submitForm = async () => {
  try {
    await validateForm();
  } catch {
    return;
  }

  const warehouseId =
    typeof formData.value.warehouseId === 'object'
      ? formData.value.warehouseId?.id
      : formData.value.warehouseId;

  const form = {
    ...formData.value,
    warehouseId,
  };

  const res = await Api.application.outboundOrder.submit(form);
  const { code } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: '保存成功' });
    router.push({ name: 'appsWarehouseRecord' });
  }
};

// 审核
const submitAudit = () => {
  (async () => {
    try {
      await validateForm();
    } catch {
      return;
    }

    const warehouseId =
      typeof formData.value.warehouseId === 'object'
        ? formData.value.warehouseId?.id
        : formData.value.warehouseId;

    const form = {
      ...formData.value,
      warehouseId,
    };

    const res = await Api.application.outboundOrder.submitAudit(form);
    const { code } = res.data;
    if (code === 200) {
      proxy.$message({ type: 'success', message: '审核成功' });
      router.push({ name: 'appsWarehouseRecord' });
    }
  })();
};

// 删除明细
const removeEvaluate = async (row) => {
  const index = formData.value.detailList.findIndex((item) => item === row);
  if (index !== -1) {
    formData.value.detailList.splice(index, 1);
  }
};

// 取消
const cancelSubmit = () => {
  router.push({ name: 'appsWarehouseRecord' });
};

// 仓库监听事件
const handleWarehouseChange = async (row) => {
  formData.value.processingPersonnel = row.warehouseSupervisor;
  isDisabled.value = false;
  ids.value = row.id;
};

// 查询明细（把接口返回映射成 detailList）
const handleSerchDetail = (row) => {
  formData.value.detailList = (row || []).map((item) => ({
    warehouseId: item.warehouseId,
    productName: item.productName,
    productCode: item.productCode,
    productSpec: item.productSpec,
    productQty: item.number, // 数量后续在 card 内直接改这个字段
    productUnit: item.unit,
    outStockId: item.locationId,
    warehouseCountId: item.id,
    locationId: item.locationId,
    productVersion: item.productVersion,
    mtoNo: item.mtoNo,
  }));
};
</script>

<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
.form-group-title {
  font-weight: 600;
  color: #303133;
  margin: 16px 4px 12px;
  font-size: 15px;
}
:deep(.van-cell-group) {
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
:deep(.van-cell) {
  padding-left: 12px;
  padding-right: 12px;
}
.dialog-search-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
}
.detail-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.qty-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.form-itme-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff;
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

.card__meta {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
}
.card__meta .row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.card__meta .label {
  color: #888;
  min-width: 40px;
}
</style>
