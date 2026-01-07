<template>
  <div class="wrap-left-form">
    <van-form ref="ruleFormRef">
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field
          label="出库类型"
          :model-value="outStockTypeLabel"
          readonly
          is-link
          @click="showOutTypePicker = true"
        />
        <van-popup v-model:show="showOutTypePicker" position="bottom" round>
          <van-picker
            :columns="outStockTypeOptions"
            @confirm="handleOutTypeConfirm"
            @cancel="showOutTypePicker = false"
          />
        </van-popup>
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
              :params="{
                stockType: getStockType(formData.outStockType),
              }"
              @change="handleWarehouseChange"
            />
          </template>
        </van-field>
        <van-field label="申请人">
          <template #input>
            <dc-select-user v-model="formData.applicantId" placeholder="请选择" :multipleLimit="1" />
          </template>
        </van-field>
        <van-field label="处理人">
          <template #input>
            <dc-select-user
              v-model="formData.processingPersonnel"
              placeholder="请选择"
              :multipleLimit="1"
            />
          </template>
        </van-field>
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
      <dc-select-dialog-v2
        v-if="formData.warehouseId"
        objectName="warehouseCount"
        :multiple="true"
        :multiple-limit="0"
        :clearable="true"
        :params="{ warehouseId: ids }"
        @change="handleSerchDetail"
      >
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
        <van-button class="mb-5" type="primary">查询明细</van-button>
      </dc-select-dialog-v2>
      <van-button v-else class="mb-5" type="primary" @click="handleClickQueryDetail">
        查询明细
      </van-button>
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
              <div class="detail-actions">
                <van-button size="small" type="primary" plain @click="handleUpdate(item)">
                  编辑
                </van-button>
                <van-button size="small" type="danger" plain @click="removeEvaluate(item)">
                  删除
                </van-button>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button type="primary" block @click="submitForm">保存</van-button>
        <van-button type="primary" block @click="submitAudit">审核</van-button>
        <van-button block @click="cancelSubmit">取消</van-button>
      </div>
    </van-form>
  </div>
  <van-popup v-model:show="open" position="right" class="drawer-popup" @close="closeDrawer">
    <div class="drawer-content">
      <div class="drawer-title">{{ title }}</div>
      <van-form ref="formRef">
        <van-cell-group inset>
          <van-field
            v-model="formDataTable.productName"
            label="物料名称"
            placeholder="物料名称"
            readonly
          />
          <van-field
            v-model="formDataTable.productCode"
            label="物料编码"
            placeholder="物料编码"
            readonly
          />
          <van-field
            v-model="formDataTable.productSpec"
            label="规格型号"
            placeholder="规格型号"
            readonly
          />
          <van-field label="数量">
            <template #input>
              <van-stepper v-model="formDataTable.productQty" min="1" :max="numbers" />
            </template>
          </van-field>
          <van-field v-model="formDataTable.productUnit" label="单位" placeholder="单位" readonly />
          <van-field label="仓位编号">
            <template #input>
              <dc-view
                v-model="formDataTable.locationId"
                objectName="warehouseLocation"
                showKey="locationName"
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
import { reactive, toRefs, getCurrentInstance, watch, computed, ref, onMounted } from 'vue';
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
    default: {},
  },
});
const { DC_WMS_OUT_TYPE_WMS } = proxy.dicts(['DC_WMS_OUT_TYPE_WMS']);
const showOutTypePicker = ref(false);
const outStockTypeOptions = computed(() =>
  (DC_WMS_OUT_TYPE_WMS?.value || []).map((item) => ({
    text: item.dictValue,
    value: item.dictKey,
  }))
);

const pageData = reactive({
  loading: false,
  formRules: {
    warehouseId: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, undefined, ''].includes(value)) {
            callback(new Error('请选择仓库名称'));
          } else {
            callback();
          }
        },
        trigger: ['blur'],
      },
    ],
    processingPersonnel: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, '', undefined].includes(value)) {
            callback(new Error('请选择处理人'));
          }
          if (value && value?.split?.(',')?.length > 1) {
            callback(new Error('不允许有多个处理人'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
    outStockType: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, undefined, ''].includes(value)) {
            callback(new Error('请选择出库类型'));
          } else {
            callback();
          }
        },
        trigger: ['blur'],
      },
    ],
  },
  rules: {},
  formData: {
    outStockType: 'DC_WMS_OUT_TYPE_OTHER',
  },
  formDataTable: {},
  open: false,
  title: '',
  editIndex: null,
  isDisabled: true,
  ids: null,
  numbers: null,
});

const {
  loading,
  formRules,
  rules,
  formData,
  formDataTable,
  open,
  title,
  editIndex,
  isDisabled,
  ids,
  numbers,
} = toRefs(pageData);

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

const handleOutTypeConfirm = (value) => {
  const selected = Array.isArray(value) ? value[0] : value;
  formData.value.outStockType = selected?.value ?? selected;
  showOutTypePicker.value = false;
};

onMounted(() => {
  formData.value.applicantId = userinfo.value.user_id;
  if (route.params.id != 'create') {
    const timer = setTimeout(() => {
      formData.value = props.info;
      clearTimeout(timer);
    }, 300);
  }
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

// 确认创建
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
    warehouseId: warehouseId,
  };

  const res = await Api.application.outboundOrder.submit(form);
  const { code, msg } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: '保存成功' });
    router.push({
      path: '/wms/warehouseRecord/outboundOrder',
      params: {},
    });
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
      warehouseId: warehouseId,
    };

    const res = await Api.application.outboundOrder.submitAudit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message({ type: 'success', message: '审核成功' });
      router.push({
        path: '/wms/warehouseRecord/outboundOrder',
        params: {},
      });
    }
  })();
};

// 表格编辑
const handleUpdate = (row) => {
  editIndex.value = formData.value.detailList.findIndex((item) => item === row);
  if (editIndex.value !== -1) {
    open.value = true;
    numbers.value = row.productQty;
    formDataTable.value = { ...row }; // 创建一个新对象，避免直接修改引用
  }
};

// 提交修改
const submitFormTable = async () => {
  if (editIndex.value !== null && editIndex.value !== -1) {
    // 编辑模式：更新原列表中的数据
    formData.value.detailList[editIndex.value] = { ...formDataTable.value };
    editIndex.value = null;
  } else {
    // 新增模式
    formData.value.detailList.push({ ...formDataTable.value });
  }
  formDataTable.value = {}; // 清空表单
  open.value = false; // 关闭抽屉
};

// 表格删除
const removeEvaluate = async (row) => {
  const index = formData.value.detailList.findIndex((item) => item === row);
  if (index !== -1) {
    formData.value.detailList.splice(index, 1);
  }
};

// 抽屉取消
const closeDrawer = () => {
  formDataTable.value = {};
  open.value = false;
};
// 取消
const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/outboundOrder',
    params: {},
  });
};

//仓库监听事件
const handleWarehouseChange = async (row) => {
  formData.value.processingPersonnel = row.warehouseSupervisor;
  isDisabled.value = false;
  ids.value = row.id;
};

// 查询明细
const handleSerchDetail = (row) => {
  formData.value.detailList = row;
  formData.value.detailList = row.map((item) => ({
    warehouseId: item.warehouseId,
    productName: item.productName,
    productCode: item.productCode,
    productSpec: item.productSpec,
    productQty: item.number,
    productUnit: item.unit,
    outStockId: item.locationId,
    warehouseCountId: item.id,
    locationId: item.locationId,
    productVersion: item.productVersion,
    mtoNo: item.mtoNo,
  }));
};

/** 查询详情点击 */
const handleClickQueryDetail = () => {
  if (!formData.value.warehouseId) {
    proxy.$refs.ruleFormRef.validateField(['warehouseId']);
    proxy.$message.error('请先选择基本信息里的仓库名称');
  }
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
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
