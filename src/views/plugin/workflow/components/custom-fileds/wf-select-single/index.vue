<template>
  <el-input
    v-model="value"
    v-bind="inputProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="true"
    prefix-icon="Search"
    @click="openDialog"
    @change="
      (value) => {
        handleChange(value);
      }
    "
  />
  <el-dialog
    v-model="open"
    class="select-dialog"
    :show-close="false"
    :width="dialogWidth"
    modal
    draggable
    destroy-on-close
    append-to-body
    @close="closeDialog"
  >
    <template #header>
      <div class="head-title">{{ title || model?.title || '-' }}</div>
      <div class="head-close" @click="closeDialog">
        <el-icon><Close /></el-icon>
      </div>
    </template>

    <div v-loading="loading" class="dialog-body w-full h-full">
      <div class="data-content">
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="tableData"
            :row-class-name="tableRowClassName"
            :row-key="rowKey || 'id'"
            height="100%"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column label="序号" width="80" type="index" align="center">
              <template #default="scoped">
                <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column
              v-for="(column, index) in model?.column || []"
              :key="index"
              :prop="column?.prop"
              :label="column?.label"
              :align="column?.align || 'center'"
              :show-overflow-tooltip="!!column?.tooltip"
            >
              <template #default="scoped">
                <dc-view
                  v-if="column?.component === 'dc-view'"
                  v-model="scoped.row[column?.prop]"
                  color="#666"
                  :object-name="column?.objectName"
                />
                <dc-dict
                  v-else-if="column?.component === 'dc-dict'"
                  color="#666"
                  :value="scoped.row[column?.prop]"
                  :options="dicts[column?.dictData]"
                />
                <span v-else>{{ scoped.row[column?.prop] }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <dc-pagination
          v-show="total > 0"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          :total="total"
          @pagination="getData"
        />
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import cacheData from '@/components/dc-ui/constant/cacheData';
import selectProps from '@/views/plugin/workflow/mixins/select-props';

export default {
  name: 'SelectSingle',
  mixins: [selectProps],
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      rowKey: 'id',
      value: null,
      open: false,
      loading: false,
      total: 0,
      queryParams: { current: 1, size: 20 },
      tableData: [],
      dicts: {},
      selectedRow: null,
      callBack: (res) => {
        return {
          ...res.data.data,
        };
      },
      initDefaultSearch: true,
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.value = newVal;
      },
      deep: true,
      immediate: true,
    },
    objectName: {
      handler(newVal) {
        this.model = cacheData[newVal];
        this.columns = this.model.column;
        this.initSearchConfig();
        if (this.model?.rowKey) {
          this.rowKey = this.model.rowKey;
        }
        if (this.initDefaultSearch) {
          if (
            ![undefined, null, ''].includes(this.model.search) &&
            ![undefined, null, ''].includes(this.model.search.config)
          ) {
            this.searchConfig.searchItemConfig.paramType = {
              ...this.searchConfig.searchItemConfig.paramType,
              ...this.model.search.config,
            };
          }
          if (
            ![undefined, null, ''].includes(this.model.search) &&
            ![undefined, null, ''].includes(this.model.search.params)
          ) {
            this.queryParams = {
              ...this.queryParams,
              ...this.model.search.params,
            };
          }
          this.initDefaultSearch = false;
        }
        this.getDictData();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    openDialog() {
      this.open = true;
      this.getData();
    },
    getData() {
      this.loading = true;
      //添加默认参数...this.model?.defaultParams,
      this.model
        .dialogGet({ ...this.model?.defaultParams, ...this.queryParams, ...this.query })
        .then((res) => {
          const callBackData = this.model?.callBack
            ? this.model?.callBack(res)
            : this.callBack(res);
          this.tableData = callBackData?.records;
          this.total = callBackData?.total;
          this.loading = false;
        })
        .catch((err) => {
          console.error(err);
          this.loading = false;
        });
    },
    handleRowClick(row) {
      // console.log(row);
      // const isSelected = this.selectedRow?.id === row.id;
      // this.selectedRow = isSelected ? null : row;
      // console.log(this.selectedRow);

      // 容错处理：如果 row 为空，直接返回（避免后续报错）以下lihaiyang修改
      if (!row) return;
      const currentKey = row[this.rowKey];
      const selectedKey = this.selectedRow ? this.selectedRow[this.rowKey] : null;
      const isSelected = currentKey === selectedKey;
      this.selectedRow = isSelected ? null : row;
    },
    handleRowDblClick(row) {
      this.handleRowClick(row);
      this.confirm();
    },
    confirm() {
      this.$emit('update:modelValue', this.selectedRow[this.model?.defaultLabel]);
      this.$emit('change', this.selectedRow);
      this.handleChange(this.selectedRow);
      this.closeDialog();
    },
    handleChange(value) {
      const obj = {
        value: value || {},
        column: this.column,
        index: this.dynamicIndex,
      };
      if (typeof this.change === 'function') {
        this.change(obj);
      }
    },
    closeDialog() {
      this.open = false;
    },
    tableRowClassName({ row }) {
      return this.selectedRow?.[this.rowKey] === row?.[this.rowKey] ? 'row-selected' : '';
    },
    async getDicts() {
      try {
        const res = await this.useAsyncCache([
          { key: 'DC_PMS_PLAN_STATUS' },
          { key: 'DC_PMS_TEMPITEM_TYPE' },
        ]);
        this.dicts = res;
      } catch (error) {
        console.error('获取枚举失败', error);
      }
    },
  },
};
</script>

<style lang="scss">
@use '@/components/dc/styles/select-dialog.scss';
</style>

<style lang="scss" scoped>
.dialog-body {
  height: 70vh !important;
}
.table-container {
  height: calc(70vh - 100px);
}
</style>
