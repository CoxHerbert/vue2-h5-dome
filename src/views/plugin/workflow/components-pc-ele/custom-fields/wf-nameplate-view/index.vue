<template>
  <div class="wf-nameplate-container" v-if="!isButtonDisabled">
    <div class="nameplate" :class="getNameplateSizeClass()">
      <!-- 四个角的白色打孔 -->
      <div class="hole hole-top-left"></div>
      <div class="hole hole-top-right"></div>
      <div class="hole hole-bottom-left"></div>
      <div class="hole hole-bottom-right"></div>

      <div class="content">
        <div class="info-list">
          <div class="info-item" v-for="(item, index) in sortedCustomerDetails" :key="index">
            <span class="info-label">
              <span class="" v-if="item.nameplateName">{{ item.nameplateName }}:</span>
              <span class="info-value">{{ item.defaultValue }}</span>
            </span>
          </div>
        </div>
        <!-- 右侧二维码 -->
        <div class="qr-section">
          <div class="qr-placeholder" v-if="lookQtCode == 1">
            <div class="qr-text">QR</div>
            <div class="qr-text">二维码</div>
          </div>
        </div>
      </div>
      <!-- 底部信息 -->
      <div class="footer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'wf-nameplate-view',
  props: {
    // 是否显示二维码
    lookQtCode: {
      type: [String, Number],
      default: 1,
    },
    // 铭牌标题
    title: {
      type: String,
      default: '铭牌',
    },

    nameplateView: {
      type: Object,
      default: () => ({}),
    },
    // 铭牌大小名称（用于背景色）
    // nameplateSizeName: {
    //   type: String,
    //   default: '',
    // },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 需要监听的表单字段
    watchFields: {
      type: Array,
      default: () => ['nameplateBatchDeatilsList', 'nameplateSizeNameT', 'nameplateTypeNameT'], // 专案号、客户、交货日期
    },
  },
  data() {
    return {
      submitLoading: false,
      formData: {},
      // 是否显示二维码
      lookQtCode: 1,
      nameplateCustomerDeatilsList: [],
      nameplateSizeName: '',
    };
  },

  computed: {
    // 判断按钮是否应该禁用
    isButtonDisabled() {
      // 检查所有需要监听的字段是否有值
      return this.watchFields.some(field => {
        const value = this.formData.form && this.formData.form[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
    },
    // 计算属性：排序后的客户详情列表（按nameplateSort降序）
    sortedCustomerDetails() {
      return this.nameplateCustomerDeatilsList
        .filter(item => item.isDeleted !== 1)
        .sort((a, b) => {
          const sortA = a.nameplateSort || 0;
          const sortB = b.nameplateSort || 0;
          return sortA - sortB;
        });
    },
  },
  watch: {
    // 监听表单数据变化
    'formData.form': {
      handler(newVal) {
        if (newVal) {
          // 表单数据变化时，可以在这里执行一些逻辑
          // console.log('表单数据变化21312312:', newVal);
          if (newVal.nameplateBatchDeatilsList && newVal.nameplateBatchDeatilsList.length > 0) {
            this.nameplateCustomerDeatilsList = newVal.nameplateBatchDeatilsList;
          }
          this.nameplateSizeName = newVal.nameplateTypeNameT;
          this.lookQtCode = newVal.lookQtCode;
          // console.log('this.lookQtCode', this.lookQtCode);
          this.getNameplateSizeClass();
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
    getNameplateSizeClass() {
      // console.log('this.nameplateSizeName', this.nameplateSizeName);
      const sizeName = this.nameplateSizeName || '';
      if (sizeName.includes('DC_NAMEPLATE_TYPE_B')) {
        // 当包含 DC_NAMEPLATE_TYPE_B 时，使用白底黑字样式
        return 'nameplate-size-small';
      } else {
        // 默认使用深色背景样式
        return 'nameplate-size-default';
      }
    },
    // 更新表单数据
    updateFormData() {
      const parentForm = this.getParentForm();
      // console.log('parentForm', parentForm);
      if (parentForm && parentForm.form) {
        this.formData = {
          form: parentForm.form,
        };
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
.wf-nameplate-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
}

/* 铭牌大小背景色 */
.nameplate-size-small {
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%) !important;
}

/* 小尺寸铭牌深色字体样式 */
.nameplate-size-small .info-label {
  color: rgba(0, 0, 0, 0.85) !important;
}

.nameplate-size-small .info-value {
  color: rgba(0, 0, 0, 0.7) !important;
}

.nameplate-size-small .info-item {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.nameplate-size-small .qr-section .qr-placeholder {
  background-color: #e5e7eb !important;
  background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
}

.nameplate-size-small .qr-text {
  color: rgba(102, 101, 101, 0.6) !important;
}

.nameplate-size-small .footer {
  background-color: #e5e7eb !important;
}

.nameplate-size-default {
  background: linear-gradient(135deg, #232b38 0%, #232b38 100%) !important;
}

/* 铭牌容器 */
.nameplate {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #232b38;
  color: #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.nameplate:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 打孔样式 */
.hole {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  position: absolute;
}

.hole-top-left {
  top: 8px;
  left: 8px;
}

.hole-top-right {
  top: 8px;
  right: 8px;
}

.hole-bottom-left {
  bottom: 8px;
  left: 8px;
}

.hole-bottom-right {
  bottom: 8px;
  right: 8px;
}

/* 内容区域 */
.content {
  display: flex;
  /* padding: 12px; */
  margin: 20px;
  /* padding-top: 16px; */
  /* padding-bottom: 8px; */
}

/* 信息列表 */
.info-list {
  flex: 1;
  margin-right: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 3px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  margin-bottom: 1px;
}

.info-label {
  color: #a0aec0;
  font-size: 0.65rem;
  padding-left: 5px;
  line-height: 1;
}

.info-value {
  color: #ffffff;
  font-size: 0.65rem;
  line-height: 1;
}

/* 二维码区域 */
.qr-section {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-placeholder {
  width: 64px;
  height: 64px;
  background-color: #374151;
  border-radius: 4px;
  margin-bottom: 4px;
  background-image: linear-gradient(45deg, #374151 25%, transparent 25%),
    linear-gradient(-45deg, #374151 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #374151 75%),
    linear-gradient(-45deg, transparent 75%, #374151 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}

.qr-text {
  text-align: center;
  font-size: 7px;
  color: #a0aec0;
}

/* 底部信息 */
.footer {
  background-color: #374151;
  text-align: center;
  margin-top: 8px;
}
</style>
