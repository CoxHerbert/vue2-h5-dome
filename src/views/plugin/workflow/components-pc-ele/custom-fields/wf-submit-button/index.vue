<template>
  <div class="wf-submit-button-container">
    <el-button
      :type="buttonType"
      :size="buttonSize"
      :icon="buttonIcon"
      :loading="submitLoading"
      :disabled="isButtonDisabled"
      @click="handleSubmit"
    >
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'wf-submit-button',
  props: {
    // 按钮类型
    buttonType: {
      type: String,
      default: 'primary',
    },
    // 按钮大小
    buttonSize: {
      type: String,
      default: 'default',
    },
    // 按钮图标
    buttonIcon: {
      type: String,
      default: '',
    },
    // 按钮文本
    buttonText: {
      type: String,
      default: '获取开始序号',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 请求URL
    apiUrl: {
      type: String,
      default: '/blade-bip/NameplateBatch/list',
    },
    // 请求方法
    requestMethod: {
      type: String,
      default: 'get',
    },
    // 是否获取表单数据
    getFormData: {
      type: Boolean,
      default: true,
    },
    // 是否获取整个表单配置
    getFormConfig: {
      type: Boolean,
      default: false,
    },
    // 额外参数
    extraParams: {
      type: String,
      default: '{}', // 字符串形式的JSON对象
    },
    // 成功提示信息
    successMessage: {
      type: String,
      default: '提交成功',
    },
    // 失败提示信息
    errorMessage: {
      type: String,
      default: '提交失败',
    },
    // 需要监听的表单字段
    watchFields: {
      type: Array,
      default: () => ['moNumber', 'customerId', 'moTime'], // 专案号、客户、交货日期
    },
  },
  data() {
    return {
      submitLoading: false,
      formData: {},
    };
  },
  computed: {
    // 解析额外参数
    parsedExtraParams() {
      try {
        return JSON.parse(this.extraParams || '{}');
      } catch (e) {
        console.error('解析额外参数失败:', e);
        return {};
      }
    },
    // 判断按钮是否应该禁用
    isButtonDisabled() {
      if (this.disabled) return true;

      // 检查所有需要监听的字段是否有值
      return this.watchFields.some(field => {
        const value = this.formData.form && this.formData.form[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
    },
  },
  watch: {
    // 监听表单数据变化
    'formData.form': {
      handler(newVal) {
        if (newVal) {
          // 表单数据变化时，可以在这里执行一些逻辑
          // console.log('表单数据变化:', newVal);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    // 组件创建时获取表单数据
    this.updateFormData();
  },
  methods: {
    // 更新表单数据
    updateFormData() {
      const parentForm = this.getParentForm();
      if (parentForm && parentForm.form) {
        this.formData = {
          form: parentForm.form,
        };
      }
    },

    async handleSubmit() {
      // if (!this.apiUrl) {
      //   this.$message.warning('请设置请求地址');
      //   return;
      // }

      try {
        this.submitLoading = true;

        // 获取表单数据
        const formData = {};

        // 获取表单数据
        if (this.getFormData) {
          // 通过父组件获取表单数据
          const parentForm = this.getParentForm();
          if (parentForm) {
            formData.form = parentForm.form;
          }
        }

        // 获取表单配置
        if (this.getFormConfig) {
          // 通过父组件获取表单配置
          const parentForm = this.getParentForm();
          if (parentForm && parentForm.option) {
            formData.formConfig = parentForm.option;
          }
        }

        console.log('formData', formData);
        // 合并额外参数
        const requestData = {
          customerId: formData.form.customerId,
          moNumber: formData.form.moNumber,
          isDeleted: formData.form.isDeleted,
          currentPage: 1,
          size: 9999,
        };

        // 发送请求
        const response = await this.$axios({
          url: this.apiUrl,
          method: this.requestMethod,
          params: requestData,
        });
        formData.form.qrCode =
          'EW' + formData.form.moNumber + (formData.form.moTime || '').replace(/-/g, '');
        if (response.data.data.records.length > 0) {
          formData.form.beginNumber =
            response.data.data.records[response.data.data.records.length - 1].beginNumber;
        } else {
          formData.form.beginNumber = 1;
        }
        this.$message({
          type: 'success',
          message: this.successMessage,
        });
        // console.log(response.data.data.records);
        // 触发成功事件
        this.$emit('submit-success', response.data);
      } catch (error) {
        console.error('提交失败:', error);

        // 显示错误消息
        this.$message({
          type: 'error',
          message: this.errorMessage + ': ' + (error.message || '未知错误'),
        });

        // 触发失败事件
        this.$emit('submit-error', error);
      } finally {
        this.submitLoading = false;
      }
    },

    // 获取父级表单组件
    getParentForm() {
      let parent = this.$parent;
      while (parent && !parent.form && !parent.option) {
        parent = parent.$parent;
      }
      return parent;
    },
  },
};
</script>

<style scoped>
.wf-submit-button-container {
  display: inline-block;
}
</style>
