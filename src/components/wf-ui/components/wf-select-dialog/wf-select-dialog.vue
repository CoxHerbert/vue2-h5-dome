<template>
  <div class="dc-select-dialog">
    <van-field
      v-model="label"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      @blur="openPopup"
    >
      <template #right-icon>
        <van-icon v-if="multiple && label" name="clear" @click.stop="handleClear" />
      </template>
    </van-field>
    <van-popup
      v-model:show="open"
      :round="10"
      :closeable="false"
      :loading="loading"
      :z-index="zIndex"
      :close-on-click-overlay="false"
      position="bottom"
      @close="closePopup"
    >
      <div class="search-box">
        <div class="search-box__title">
          <van-search
            v-model="searchKeyword"
            :placeholder="cacheDataplaceholder"
            show-action
            @search="handleSearch"
            @clear="handleClearSearch"
          >
            <template #action>
              <div @click="handleSearch">搜索</div>
            </template>
          </van-search>
        </div>
        <div style="height: 60px"></div>
        <!-- {{ multiple }}
        {{ column }} -->

        <van-checkbox-group v-if="multiple" v-model="checkboxValue">
          <div
            v-for="item in dataList"
            :key="item.id"
            :class="['radio-item', { selected: checkboxValue.includes(item.id) }]"
          >
            <van-checkbox :name="item.id">
              <div class="radioIndexClass">
                <div v-for="(col, index) in columns" :key="index" class="radio-column">
                  {{ item[col.prop] }}
                </div>
              </div>
            </van-checkbox>
          </div>
        </van-checkbox-group>
        <van-radio-group v-else v-model="radioValue">
          <div
            v-for="item in dataList"
            :key="item.id"
            :class="['radio-item', { selected: radioValue === item.id }]"
            @click="handleRowClick(item)"
          >
            <van-radio :name="item.id">
              <div class="radioIndexClass">
                <div v-for="(col, index) in columns" :key="index" class="radio-column">
                  {{ item[col.prop] }}
                </div>
              </div>
            </van-radio>
          </div>
        </van-radio-group>
        <div style="height: 60px"></div>
        <div v-if="loading" class="loading-container">
          <van-loading type="spinner" size="24px">加载中</van-loading>
        </div>

        <div v-if="dataList.length === 0 && !loading" class="loading-container">
          <van-empty description="暂无数据" />
        </div>

        <div class="dc-select-dialog__footer">
          <van-button type="danger" style="flex: 1" size="small" @click="doAction('close')"
            >关闭</van-button
          >
          <van-button type="warning" style="flex: 1" size="small" @click="doAction('clear')"
            >清空</van-button
          >
          <van-button
            type="primary"
            size="small"
            style="flex: 1"
            :disabled="multiple ? !checkboxValue.length : !radioValue"
            @click="doAction('confirm')"
          >
            确认
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { showToast } from 'vant';
import cacheApi from '@/components/dc-ui/api/index';
import cacheData from '@/components/dc-ui/constant/cacheData';
import Props from '@/components/wf-ui/mixins/props.js';

// 默认的 DIC_PROPS 配置
const DIC_PROPS = { value: 'value', label: 'label', children: 'children' };

export default {
  name: 'WfSelectDialog',
  mixins: [Props],
  props: {
    value: { type: [String, Number, Object, Array, Boolean], default: '' },
    title: { type: String, default: '' },
    objectName: {
      type: String,
      default: '',
      validator: (value) => Object.keys(cacheData).includes(value),
    },
    returnType: {
      type: String,
      default: 'string',
      validator: (value) => ['string', 'object'].includes(value),
    },
    width: { type: String, default: '100%' },
    placeholder: { type: String, default: '请点击选择' },
    disabled: { type: Boolean, default: false },
    dialogWidth: { type: String, default: '1200px' },
    query: { type: Object, default: () => ({}) },
    column: { type: Object, default: () => ({}) },
    dynamicIndex: { type: Number },
    rowKey: { type: String, default: 'id' },
    multiple: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    showKey: { type: String, default: '' },
    inputProps: { type: Object, default: () => ({}) },
  },
  emits: ['input', 'change'],
  data() {
    return {
      // Props mixin 中的数据
      text: undefined,
      stringMode: false,
      textLabel: '',
      blur: this.column.blur,
      focus: this.column.focus,
      change: this.column.change,
      click: this.column.click,

      // 组件状态
      zIndex: 10090,
      open: false,
      loading: false,
      model: null,
      radioValue: '',
      checkboxValue: [],
      paginationProps: {},
      dataList: [],
      inputValue: [],
      selected: [],
      openSelected: false,
      searchKeyword: '',
      searchColumn: 'name',
      searchableColumns: [],
      cacheStore: null,
    };
  },
  computed: {
    // Props mixin 中的计算属性
    isArray() {
      return this.column?.dataType === 'array';
    },
    isString() {
      return this.column?.dataType === 'string';
    },
    isNumber() {
      return this.column?.dataType === 'number';
    },
    valueKey() {
      return { ...DIC_PROPS, ...this.column?.props }.value || 'value';
    },
    labelKey() {
      return { ...DIC_PROPS, ...this.column?.props }.label || 'label';
    },
    childrenKey() {
      return { ...DIC_PROPS, ...this.column?.props }.children || 'children';
    },
    descKey() {
      return { ...DIC_PROPS, ...this.column?.props }.desc || 'desc';
    },

    // 组件计算属性
    label() {
      if (!this.inputValue?.length) return '';

      const labelValue = this.inputValue
        .map((item) => item[this.showKey || this.model?.defaultLabel] || item.id)
        .join(',');

      console.log('label computed:', labelValue);
      return labelValue;
    },

    popuplabel() {
      if (!this.selected?.length) return '';

      return this.selected
        .map((item) => item[this.showKey || this.model?.defaultLabel] || item.id)
        .join(',');
    },

    // 获取可搜索的列
    searchableFields() {
      if (!this.model?.column) return [];
      return this.model.column.filter((col) => col.search === true).map((col) => col.prop);
    },

    cacheDataplaceholder() {
      return this.model?.placeholder || '请选择';
    },

    cacheDatadefaultLabel() {
      return this.model?.defaultLabel || 'name';
    },

    defaultLabel() {
      if (this.model?.url && this.cacheStore) {
        const cachedData = this.cacheStore.globalData[this.model.url] || {};
        return cachedData.defaultLabel || '';
      }
      return '';
    },
  },
  watch: {
    // Props mixin 中的监听器
    text: {
      handler(val) {
        console.log('wf-select-dialog text changed:', val);
        if (typeof this.initValue === 'function') {
          this.initValue();
        }
        if (
          this.column?.type &&
          ['select', 'radio', 'checkbox', 'tree'].includes(this.column.type)
        ) {
          this.initTextLabel();
        }
      },
    },

    modelValue: {
      handler(newVal) {
        console.log('wf-select-dialog value changed:', newVal, 'objectName:', this.objectName);
        this.$nextTick(() => {
          let ids = [];

          // 提取ID数组
          if (typeof newVal === 'string' && newVal) {
            ids = newVal.split(',');
          } else if (Array.isArray(newVal)) {
            ids = newVal.map((item) => item.id).filter(Boolean);
          } else if (typeof newVal === 'object' && newVal?.id) {
            ids = [newVal.id];
          }

          console.log('ids:', ids);

          if (!ids.length) {
            this.inputValue = [];
            this.selected = [];
            this.checkboxValue = [];
            this.radioValue = null;
            return;
          }

          if (!this.model?.url) {
            console.warn('model.url 未定义');
            return;
          }

          console.log('url:', this.model.url);

          cacheApi.cache
            .getView({
              url: this.model.url,
              data: ids,
            })
            .then((response) => {
              console.log('response:', response);
              const data = response || [];
              this.inputValue = this.deepClone(data);
              console.log('wf-select-dialog inputValue:', this.inputValue);
              this.selected = this.deepClone(data);
            })
            .catch((error) => {
              console.error('Error fetching data:', error);
            });
        });
      },
      immediate: true,
      deep: true,
    },

    radioValue: {
      handler(newVal) {
        if (!this.multiple && newVal) {
          const findItem = this.dataList?.find((item) => item.id === newVal);
          if (findItem) {
            this.selected = [findItem];
          }
        }
      },
      immediate: true,
      deep: true,
    },

    checkboxValue: {
      handler(newVal) {
        if (this.multiple && newVal) {
          const currentDataListSelected =
            this.dataList?.filter((item) => newVal.includes(item.id)) || [];

          const otherSelected =
            this.selected?.filter(
              (item) =>
                newVal.includes(item.id) &&
                !currentDataListSelected.some((curr) => curr.id === item.id)
            ) || [];

          this.selected = [...otherSelected, ...currentDataListSelected];
        }
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    // 初始化 cacheStore
    // if (typeof useGlobalCacheStore !== 'undefined') {
    //   this.cacheStore = useGlobalCacheStore();
    // }

    // 初始化 column 事件
    if (this.column) {
      this.blur = this.column.blur;
      this.focus = this.column.focus;
      this.change = this.column.change;
      this.click = this.column.click;
    }

    // 初始化 model，如果 cacheData 不存在则使用默认值
    this.model = cacheData?.[this.objectName] || {
      url: '',
      placeholder: '请选择',
      defaultLabel: 'name',
      column: [],
      query: {},
    };

    console.log('model:', this.model);

    // 初始化 columns
    this.columns = this.model.column || [];

    // 确保 modelValue 有值
    if (!this.modelValue && this.value) {
      this.modelValue = this.value;
    }

    // 初始化值
    this.initVal();
  },
  methods: {
    // Props mixin 中的方法
    getPlaceholder() {
      return this.column?.placeholder || '请选择';
    },

    initTextLabel() {
      if (!this.text || !this.dic?.length) {
        this.$set(this, 'textLabel', '');
        this.$emit('label-change', '');
        return;
      }

      const textLabel = [];
      let arr = this.deepClone(this.dic);
      const val = String(this.text).split(',');

      val.forEach((t) => {
        const { list, label } = this.handleTextLabel(arr, t);
        if (list?.length) arr = list;
        if (label) textLabel.push(label);
      });

      this.$set(this, 'textLabel', textLabel.join('/'));
      this.$emit('label-change', this.stringMode ? textLabel.join('/') : textLabel);
    },

    handleTextLabel(list, value) {
      for (const item of list) {
        if (item[this.valueKey] == value) {
          return { label: item[this.labelKey], list: item[this.childrenKey] };
        }

        const children = item[this.childrenKey];
        if (children?.length) {
          const result = this.handleTextLabel(children, value);
          if (result.label) return result;
        }
      }

      return { list, label: value };
    },

    deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj);
      if (obj instanceof Array) return obj.map((item) => this.deepClone(item));

      const clonedObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    },

    validateNull(val) {
      return val === null || val === undefined || val === '';
    },

    initVal() {
      this.stringMode = typeof this.modelValue === 'string';

      // 确保 modelValue 有值
      if (!this.modelValue && this.value) {
        this.modelValue = this.value;
      }

      // 初始化 text 值
      if (this.modelValue) {
        if (typeof this.modelValue === 'string') {
          this.text = this.modelValue;
        } else if (typeof this.modelValue === 'object' && this.modelValue !== null) {
          // 如果是对象，尝试获取显示值
          const labelKey = this.showKey || this.model?.defaultLabel || 'name';
          this.text = this.modelValue[labelKey] || this.modelValue.id || '';
        } else {
          this.text = String(this.modelValue);
        }
      } else {
        this.text = '';
      }

      console.log('initVal - text:', this.text, 'modelValue:', this.modelValue);
    },
    async initValue() {
      if (!this.modelValue) return;

      // 确保 cacheStore 已初始化
      if (!this.cacheStore) {
        console.warn('cacheStore 未初始化');
        return;
      }

      // 确保 model.url 存在
      if (!this.model?.url) {
        console.warn('model.url 未定义');
        return;
      }

      try {
        const item = await this.cacheStore.getView({
          url: this.model.url,
          data: [this.modelValue],
        });

        if (item?.length > 0) {
          this.text = this.stringMode ? item[0][this.labelKey] : this.modelValue[this.labelKey];
        }
      } catch (error) {
        console.error('初始化值失败:', error);
      }
    },

    handleChange(val, emitUpdate = true) {
      let result = val;

      if (val?.target?.value !== undefined) {
        result = val.target.value;
      }

      const flag =
        this.isString || this.isNumber || this.stringMode || this.listType === 'picture-img';
      if (flag && Array.isArray(result)) {
        result = result.join(this.separator || ',');
      }

      if (typeof this.change === 'function') {
        let changeValue = result;
        if (
          typeof result === 'string' &&
          !this.multiple &&
          this.selected &&
          this.selected.length > 0
        ) {
          changeValue = this.selected[0];
        }
        this.change({ value: changeValue, column: this.column, index: this.dynamicIndex });
      }

      this.$emit('input', result);
      this.$emit('change', result);

      if (emitUpdate) {
        this.$emit('update:modelValue', result);
      }
    },

    async loadData() {
      if (!this.model?.dialogGet) {
        console.error('模型或请求方法未定义');
        return;
      }

      this.loading = true;
      try {
        // 构建请求参数，设置一个较大的页面大小以获取所有数据
        const params = {
          ...this.model.query,
          current: 1,
          size: 10, // 设置一个较大的值以获取所有数据
        };
        const response = await this.model.dialogGet(params);

        // 处理响应数据
        if (response?.data) {
          console.log('loadData - response:', response);
          this.dataList =
            response.data.data.records ||
            response.data.records ||
            response.data ||
            response.data.data.records ||
            [];
          console.log('loadData - dataList:', this.dataList);
        } else {
          this.dataList = [];
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        this.dataList = [];
        showToast({
          title: '加载数据失败',
          icon: 'none',
        });
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      // 确保 model.query 是对象类型
      if (!this.model.query || typeof this.model.query !== 'object') {
        this.model.query = {};
      }
      this.model.query[this.cacheDatadefaultLabel] = this.searchKeyword;
      this.loadData();
    },

    handleClearSearch() {
      this.searchKeyword = '';
    },

    openPopup() {
      this.searchKeyword = '';
      this.open = true;
      this.dataList = [];

      if (this.multiple) {
        this.checkboxValue = this.inputValue?.map((item) => item.id) || [];
        this.selected = this.deepClone(this.inputValue) || [];
      } else {
        this.radioValue = this.inputValue?.[0]?.id || null;
        this.selected = this.deepClone(this.inputValue) || [];
      }
    },

    closePopup() {
      this.open = false;
      this.selected = [];
    },

    doAction(action) {
      const actionMap = {
        close: this.handleClose,
        clear: this.handleClear,
        confirm: this.handleConfirm,
        expand: () => {
          this.openSelected = true;
        },
      };

      const handler = actionMap[action];
      if (handler) handler();
    },

    handleRowClick(row) {
      if (this.multiple) {
        const index = this.checkboxValue.indexOf(row.id);
        if (index >= 0) {
          this.checkboxValue.splice(index, 1);
        } else {
          this.checkboxValue.push(row.id);
        }
      } else {
        this.radioValue = row.id;
      }
    },

    handleConfirm() {
      if (!this.selected || this.selected.length === 0) {
        this.handleClose();
        return;
      }

      this.inputValue = this.selected;

      let changeValue;
      let modelValue;

      if (this.multiple) {
        if (this.returnType === 'array') {
          changeValue = this.selected;
          modelValue = this.selected.map((item) => item.id).join(',');
        } else {
          changeValue = this.selected;
          modelValue = this.selected.map((item) => item.id).join(',');
        }
      } else {
        changeValue = this.selected[0];
        modelValue = this.selected[0].id;
      }

      this.text = modelValue;
      this.$emit('update:modelValue', modelValue);
      this.$emit('input', modelValue);
      this.$emit('change', changeValue);

      if (typeof this.change === 'function') {
        this.change({ value: changeValue, column: this.column, index: this.dynamicIndex });
      }

      this.handleClose();
    },

    handleClear() {
      this.radioValue = null;
      this.checkboxValue = [];
      this.selected = [];
      this.inputValue = [];
      this.text = '';
      this.$emit('update:modelValue', '');
      this.$emit('input', '');
      this.$emit('change', null);
      if (typeof this.change === 'function') {
        this.change({ value: null, column: this.column, index: this.dynamicIndex });
      }
    },

    handleClose() {
      this.open = false;
      this.selected = [];
    },
  },
};
</script>
<style lang="scss" scoped>
// .dc-select-dialog{
// 	width: 100%;
// }
.search-box {
  padding: 0 30rpx;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  height: 50vh;
  overflow-y: scroll;
  // 搜索框标题样式
  .search-box__title {
    padding: 40rpx 0;
    margin: 0 auto;
    position: absolute;
    top: 0;
    left: 0;

    background-color: #fff;
    width: 100%;
    z-index: 100;
  }

  // 单选框组样式
  :deep(.van-radio-group) {
    .radio-item {
      width: 100%;
      padding: 20rpx;

      margin-bottom: 10rpx;
      background-color: #f8f9fa;
      border-radius: 8rpx;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;

      // 选中背景色
      &.selected {
        background-color: #e6f7ff;
        border: 1rpx solid #91d5ff;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .van-radio {
        width: 100%;
        margin: 8px 12px;

        .van-radio__label {
          width: 100%;

          .radioIndexClass {
            display: flex;
            flex-direction: column;
            width: 100%;

            padding: 8rpx 0; // 添加上下内边距，增加间隔

            .radio-column {
              font-size: 26rpx; // 字体从28rpx减小到26rpx
              color: #333;
              line-height: 1.6; // 增加行高，提高可读性
              margin-bottom: 6rpx; // 添加底部间距

              &:last-child {
                margin-bottom: 0; // 最后一个元素不添加底部间距
              }
            }
          }
        }

        // 确保radio图标显示
        .van-radio__icon {
          margin-right: 20rpx;

          .van-radio__icon--checked {
            background-color: #007aff;
            border-color: #007aff;
          }
        }
      }
    }
  }

  // 加载状态样式
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;

    .loading-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #999;
    }
  }

  // 底部按钮区域
  .dc-select-dialog__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 0;
    margin-top: 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #f0f0f0;
  }
}

// 弹窗样式优化
:deep(.van-popup) {
  .van-popup__content {
    border-radius: 20rpx 20rpx 0 0;
    overflow-y: scroll;
    // 确保内容区域有足够的底部间距，避免被固定按钮遮挡
    padding-bottom: 120rpx;
  }
}
</style>
