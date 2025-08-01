<template>
  <basic-container v-loading="loading">
    <div>
      <SplitPane :initial-ratio="0.6" :min-left-ratio="0.3" :max-left-ratio="0.6">
        <template #left>
          <el-card>
            <iframe
              v-if="!iframeShow"
              class="drawing-wrap"
              :src="iframeSrc"
              title="物料图纸"
              frameBorder="no"
              border="0"
              marginWidth="0"
              marginHeight="0"
              scrolling="no"
              allowTransparency="yes"
            ></iframe>
          </el-card>
        </template>

        <template #right>
          <el-card>
            <template #header>
              <div class="clearfix">
                <el-button type="primary" size="medium" @click="doAction('prev')"
                  >上一页
                </el-button>
                <el-text style="padding: 0 15px"
                  >第{{ currentIndex + 1 }}/{{ tableDataAll.length }}页</el-text
                >
                <el-button type="primary" size="medium" @click="doAction('next')"
                  >下一页
                </el-button>
              </div>
            </template>
            <CollapsePanel>
              <template #title>基本信息</template>
              <div>
                <el-descriptions border class="margin-top" :column="3">
                  <el-descriptions-item
                    v-for="(item, index) in collegeData"
                    :key="index"
                    :label="item.label"
                    >{{ routeRow[item.value] }}</el-descriptions-item
                  >
                </el-descriptions>
              </div>
            </CollapsePanel>
            <CollapsePanel>
              <template #title>原材料绑定</template>
              <div>
                <!-- 表单添加flex容器类 "form-layout" -->
                <el-form
                  ref="dynamicForm"
                  :model="formData"
                  label-width="100px"
                  class="form-layout"
                >
                  <!-- 循环渲染表单项，通过index判断是否为第一个 -->
                  <el-form-item
                    v-for="(item, index) in formConfig"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :rules="item.rules"
                    :class="{ 'full-width': index === 0, 'half-width': index !== 0 }"
                  >
                    <!-- 动态匹配组件（内容不变） -->
                    <template v-if="item.type === 'radio-group'">
                      <el-radio-group
                        class="custom-radio-as-checkbox"
                        v-model="formData[item.prop]"
                        @change="onShapeChange(item.prop)"
                      >
                        <el-radio
                          v-for="option in item.options"
                          :key="option.value"
                          :label="option.value"
                        >
                          {{ option.label }}
                        </el-radio>
                      </el-radio-group>
                    </template>
                    <template v-else-if="item.type === 'select'">
                      <el-select
                        v-model="formData[item.prop]"
                        :placeholder="item.placeholder || ''"
                        clearable
                        filterable
                        :remote="item.remote || false"
                        :remote-method="remoteMethod"
                        :loading="item.loading"
                      >
                        <el-option
                          v-for="option in item.options"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                    </template>
                    <template v-else>
                      <el-input
                        v-model="formData[item.prop]"
                        :placeholder="getPlaceholder(item.prop)"
                        clearable
                        :disabled="item.disabled || false"
                        :readonly="item.readonly || false"
                      />
                    </template>
                  </el-form-item>
                </el-form>
              </div>
            </CollapsePanel>

            <CollapsePanel>
              <template #title>加⼯⼯艺</template>
              <div class="process-section">
                <h4>可选工艺</h4>
                <el-tag
                  v-for="item in optionalProcesses"
                  :key="item.id"
                  :type="item.isSurfaceTreatment ? 'success' : 'warning'"
                  class="process-item"
                  effect="light"
                  @click="moveToSelected(item)"
                  round
                >
                  {{ item.name }}
                </el-tag>
                <!-- 已选工艺列表 -->
                <div class="process-section">
                  <h3>已选工艺</h3>
                  <div class="process-list">
                    <el-table :data="selectedProcesses" stripe border>
                      <el-table-column label="序号" width="60">
                        <template #default="scope">
                          {{ scope.$index + 1 }}
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="name"
                        label="工艺名称"
                        min-width="80"
                      ></el-table-column>
                      <el-table-column label="工艺类型" min-width="80">
                        <template #default="scope">
                          <el-tag :type="scope.row.isSurfaceTreatment ? 'primary' : 'info'">
                            {{ scope.row.isSurfaceTreatment ? '表处类' : '非表处类' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="加工工时(分)" min-width="120">
                        <template #default="scope">
                          <el-input
                            v-model.number="scope.row.workHours"
                            type="number"
                            min="0"
                            max="9999"
                            size="small"
                            style="width: 100px"
                          ></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="计价方式" min-width="120">
                        <template #default="scope">
                          <el-select
                            v-model="scope.row.pricingMethod"
                            size="small"
                            style="width: 120px"
                          >
                            <el-option label="数量" value="quantity"></el-option>
                            <el-option label="重量" value="weight"></el-option>
                            <el-option label="表面积" value="area"></el-option>
                            <el-option label="工时" value="workHours"></el-option>
                          </el-select>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="80">
                        <template #default="scope">
                          <el-icon
                            size="18px"
                            color="red"
                            @click.stop="removeFromSelected(scope.$index)"
                          >
                            <Delete />
                          </el-icon>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </div>

              <div style="text-align: right; padding: 10px; font-size: 14px">
                单价： 123= 材料费：xxx + 加工程费：xxx = 总价：xxx
              </div>
            </CollapsePanel>

            <template #footer>
              <div class="footer">
                <el-button type="primary" @click="handleAddProcess">提交</el-button>
                <el-button type="primary" @click="handleAddProcess">历史工艺</el-button>
              </div>
            </template>
          </el-card>
        </template>
      </SplitPane>
    </div>
  </basic-container>
</template>

<script setup>
// 脚本部分不变，省略（与原代码一致）
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue';
import SplitPane from '../components/splitpane.vue';
import CollapsePanel from '../components/CollapsePanel.vue';
import { useRoute } from 'vue-router';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import Api from '@/api/index';
import {
  ElForm,
  ElFormItem,
  ElRadioGroup,
  ElMessageBox,
  ElRadio,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
} from 'element-plus';
const route = useRoute();
const { markAsSaved, markAsUnsaved } = useUnsavedChanges();
const loading = ref(false);
const iframeShow = ref(false);
const iframeSrc = ref('');
const routeRow = ref({});
const queryParams = ref({
  current: 1,
  size: 9999,
});
const total = ref(0);
const tableDataAll = ref([]);
// 计算当前索引和导航状态
const currentIndex = computed(() => {
  return tableDataAll.value.findIndex(item => item.id === routeRow.value.id);
});
// 验证上下边界
const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < tableDataAll.value.length - 1);
// 上一页
const handlePrevious = () => {
  if (hasPrevious.value) {
    routeRow.value = tableDataAll.value[currentIndex.value - 1];
    setTimeout(() => {
      iframeShow.value = false;
    }, 1000);
  } else {
    ElMessage({
      message: '没有上一页了',
      type: 'warning',
    });
  }
};
// 下一页
const handleNext = () => {
  if (hasNext.value) {
    routeRow.value = tableDataAll.value[currentIndex.value + 1];
    setTimeout(() => {
      iframeShow.value = false;
    }, 1000);
  }
};
const doAction = action => {
  ElMessageBox.confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      iframeShow.value = true;
      if (action === 'prev') {
        handlePrevious();
      } else if (action === 'next') {
        handleNext();
      }
    })
    .catch(() => {
      next(false);
    });
};

/** 获取列表数据 **/
const getData = () => {
  loading.value = true;
  try {
    Api.system.OutsourceQuotation.list(queryParams.value).then(res => {
      const { code, data } = res.data;

      if (code === 200) {
        tableDataAll.value = data.records;
        total.value = data.total;
        routeRow.value = tableDataAll.value.find(item => item.id == route.query.id);
        iframeSrc.value = `https://www.eastwinbip.com/drawing/${routeRow.fnumber}`;
        loading.value = false;
      }
    });
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    // loading.value = false;
  }
};
const collegeData = ref([
  { label: '下单数量', value: 'qty' },
  { label: '材质', value: 'erpSpecificationName' },
  { label: '物料名称', value: 'materialName' },
]);
// 形状与尺寸placeholder的映射关系
const shapePlaceholders = {
  board: '请输入长*宽*厚 (例如: 1000*500*10)',
  stick: '请输入直径*长度 (例如: 50*2000)',
  tube: '请输入外径*壁厚*长度 (例如: 108*4*6000)',
  squareTube: '请输入边长*壁厚*长度 (例如: 100*5*6000)',
};
const formConfig = reactive([
  {
    type: 'radio-group',
    label: '形状属性',
    prop: 'shape',
    options: [
      { label: '板', value: 'board' },
      { label: '棒', value: 'stick' },
      { label: '管', value: 'tube' },
      { label: '方管', value: 'squareTube' },
    ],
  },
  {
    type: 'radio-group',
    label: '是否抗静电',
    prop: 'antistatic',
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
  {
    type: 'radio-group',
    label: '供应商包料',
    prop: 'supplierMaterial',
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
  {
    type: 'select',
    label: '原材料名称',
    prop: 'material',
    placeholder: '模糊搜索/下拉框',
    filterable: true,
    remote: true,
    loading: false,
    options: [],
  },
  {
    type: 'input',
    label: '料号',
    prop: 'materialCode',
    placeholder: '料号/不可编辑',
    disabled: true,
    readonly: true,
  },
  {
    type: 'input',
    label: '下料尺寸',
    prop: 'size',
    placeholder: '提示规范，输入校验 (1000*100*100)',
    rules: [
      {
        validator: (rule, value, callback) => {
          if (!/^\d+\*\d+\*\d+$/.test(value)) {
            callback(new Error('请按“数字*数字*数字”格式输入'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  },
  {
    type: 'input',
    label: 'BOM用量',
    prop: 'bomQty',
    placeholder: '可编辑/自动计算',
  },
]);

const formData = reactive({
  shape: 'board',
  antistatic: 'yes',
  supplierMaterial: 'no',
  material: '',
  materialCode: '',
  size: '',
  bomQty: '',
  pricePage: '',
});

const dynamicForm = ref(null);
// 形状变更时的处理函数
const onShapeChange = prop => {
  if (prop === 'shape') {
    // 重置尺寸输入框
    formData.size = '';
  }
};
// 根据形状动态获取placeholder
const getPlaceholder = prop => {
  if (prop === 'size') {
    return shapePlaceholders[formData.shape] || '请输入尺寸';
  }
  // 其他字段使用默认placeholder
  const fieldConfig = formConfig.find(item => item.prop === prop);
  return fieldConfig?.placeholder || '';
};

const remoteMethod = query => {
  if (query) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      options.value = list.value.filter(item => {
        return item.label.toLowerCase().includes(query.toLowerCase());
      });
    }, 200);
  } else {
    options.value = [];
  }
};

// 工艺数据
const allProcesses = ref([
  { id: 1, name: '切割', isSurfaceTreatment: true },
  { id: 2, name: '打磨', isSurfaceTreatment: true },
  { id: 3, name: '焊接', isSurfaceTreatment: true },
  { id: 4, name: '电镀', isSurfaceTreatment: true },
  { id: 5, name: '喷漆', isSurfaceTreatment: true },
  { id: 6, name: '抛光', isSurfaceTreatment: true },
  { id: 7, name: '氧化', isSurfaceTreatment: true },
  { id: 8, name: '折弯', isSurfaceTreatment: true },
  { id: 9, name: '淬火', isSurfaceTreatment: true },
  { id: 10, name: '磷化', isSurfaceTreatment: true },
  { id: 11, name: '切割', isSurfaceTreatment: true },
  { id: 12, name: '打磨', isSurfaceTreatment: true },
  { id: 13, name: '焊接', isSurfaceTreatment: true },
  { id: 14, name: '电镀', isSurfaceTreatment: true },
  { id: 15, name: '喷漆', isSurfaceTreatment: true },
  { id: 16, name: '抛光', isSurfaceTreatment: false },
  { id: 17, name: '氧化', isSurfaceTreatment: false },
  { id: 18, name: '折弯', isSurfaceTreatment: false },
  { id: 19, name: '淬火', isSurfaceTreatment: false },
  { id: 10, name: '磷化', isSurfaceTreatment: false },
]);

// 可选工艺
const optionalProcesses = ref([...allProcesses.value]);

// 已选工艺
const selectedProcesses = ref([]);
// 移动到已选
const moveToSelected = process => {
  // 从可选列表移除
  optionalProcesses.value = optionalProcesses.value.filter(p => p.id !== process.id);

  // 添加到已选列表，复制对象并添加编辑字段
  const processWithEdit = {
    ...process,
    workHours: 0,
    pricingMethod: 'quantity',
  };
  selectedProcesses.value.push(processWithEdit);
};
// 从已选列表移除
const removeFromSelected = index => {
  const removed = selectedProcesses.value.splice(index, 1)[0];
  // 还原为原始数据结构（移除编辑字段）
  const { workHours, pricingMethod, ...original } = removed;
  optionalProcesses.value.push(original);
  // 排序可选列表
  optionalProcesses.value.sort((a, b) => a.id - b.id);
};
const handleSubmit = () => {
  dynamicForm.value.validate(valid => {
    if (valid) {
      console.log('提交数据：', formData);
    } else {
      console.log('校验失败');
    }
  });
};

const handleReset = () => {
  dynamicForm.value.resetFields();
};
watch(
  () => formData,
  (newValue, oldValue) => {
    markAsUnsaved();
    // 尺寸输入框内容改变时触发
    console.log('尺寸输入框内容改变:', newValue);
  },
  { deep: true }
);

const submitForm = () => {};
onMounted(() => {
  getData();
});
</script>

<style scoped lang="scss">
// 原有样式不变，新增以下布局样式
.form-layout {
  // 启用Flex布局，自动换行
  display: flex;
  flex-wrap: wrap;
  // 表单项之间的间距
  gap: 10px;
  // padding: 10px 0;
}

// 第一个表单项占满一行
.full-width {
  width: 100% !important;
}

// 其余表单项占50%宽度（两列）
.half-width {
  width: calc(50% - 10px) !important; // 减去一半gap间距，避免换行
}

// 调整表单项内部组件宽度，适应布局
::v-deep .el-form-item__content {
  width: 100%;
  max-width: 300px; // 限制最大宽度，避免过宽
}
::v-deep .el-form-item {
  margin-bottom: 0;
}
// 原有样式保持不变
.drawing-wrap {
  height: calc(100vh - 100px);
}
.demo-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
// .quote-form {
//   padding: 20px;
// }
.price-calculation {
  font-weight: bold;
  color: #333;
  margin-top: 10px;
}
.el-divider {
  margin: 20px 0;
}
.pagination-nav {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}
.custom-radio-as-checkbox ::v-deep .el-radio {
  .el-radio__input {
    .el-radio__inner {
      border-radius: 2px !important;
      &::after {
        width: 8px;
        height: 5px;
        border: 2px solid white;
        border-top: transparent;
        border-right: transparent;
        text-align: center;
        display: block;
        position: absolute;
        top: 2px;
        left: 3px;
        vertical-align: middle;
        transform: rotate(-45deg);
        border-radius: 2px;
        background: none;
      }
    }
    &.is-checked {
      .el-radio__inner {
        &::after {
          display: block;
        }
      }
    }
  }
}
.process-item {
  cursor: pointer;
  width: 100px;
  text-align: center;
  height: 30px;
  font-size: 14px;
  margin: 10px;
}
.clearfix {
  display: flex;
  justify-content: center;
}
</style>
