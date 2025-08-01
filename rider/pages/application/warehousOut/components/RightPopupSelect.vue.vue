<template>
  <view class="right-popup-container" :class="{ 'show': visible }">
    <!-- 遮罩层 -->
    <view class="mask" @click="handleClose"></view>
    
    <!-- 弹框内容 -->
    <view class="popup-content" :style="{ width: `${width}rpx` }">
      <!-- 标题栏 -->
      <view class="popup-header">
        <text class="title">{{ title }}</text>
        <text class="close-btn" @click="handleClose">✕</text>
      </view>
      
      <!-- 列表内容 -->
      <view class="popup-list">
        <view 
          class="list-item" 
          v-for="(item, index) in processedList" 
          :key="index"
          @click="handleSelectItem(item, index)"
        >
          <!-- 单选框 -->
          <uni-icons 
            :type="item.checked ? 'checkbox-filled' : 'circle'" 
            size="26" 
            color="#007aff"
            class="item-icon"
          ></uni-icons>
          
          <!-- 自定义内容区域 -->
          <view class="item-content">
            <slot :item="item" :index="index">
              <!-- 默认显示文本 -->
              <text class="item-text">{{ item[labelKey] }}</text>
            </slot>
          </view>
        </view>
      </view>
      
      <!-- 底部操作栏 -->
      <view class="popup-footer" v-if="showFooter">
        <button class="confirm-btn" @click="handleConfirm">确认</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RightPopupSelect',
  props: {
    // 控制显示/隐藏
    visible: {
      type: Boolean,
      default: false
    },
    // 列表数据
    listData: {
      type: Array,
      default: () => []
    },
    // 选项文本字段名
    labelKey: {
      type: String,
      default: 'label'
    },
    // 选项值字段名
    valueKey: {
      type: String,
      default: 'value'
    },
    // 弹框标题
    title: {
      type: String,
      default: '请选择'
    },
    // 弹框宽度（rpx）
    width: {
      type: Number,
      default: 600
    },
    // 是否显示底部确认栏
    showFooter: {
      type: Boolean,
      default: true
    },
    // 初始选中值（可选）
    defaultSelected: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      // 处理后的列表（添加checked属性）
      processedList: []
    };
  },
  computed: {
    // 选中的结果（返回单个值）
    selectedValue() {
      const selected = this.processedList.find(item => item.checked);
      return selected ? selected[this.valueKey] : null;
    },
    // 选中的结果（返回单个对象）
    selectedItem() {
      return this.processedList.find(item => item.checked) || null;
    }
  },
  watch: {
    // 监听原始数据变化，初始化checked状态
    listData: {
      handler(newVal) {
        this.processedList = newVal.map(item => ({
          ...item,
          // 初始化时根据defaultSelected设置选中状态
          checked: this.defaultSelected !== null 
            ? item[this.valueKey] === this.defaultSelected 
            : false
        }));
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 单选单个选项（自动取消其他选项）
    handleSelectItem(selectedItem) {
      // 取消所有选中状态
      this.processedList.forEach(item => {
        item.checked = false;
      });
      // 选中当前项
      selectedItem.checked = true;
      
      // 触发选中事件（实时返回结果，无需等确认）
      this.$emit('select', {
        value: this.selectedValue,
        item: this.selectedItem
      });
    },
    
    // 确认选择（可选，用于需要显式确认的场景）
    handleConfirm() {
      this.$emit('confirm', {
        value: this.selectedValue,
        item: this.selectedItem
      });
      this.handleClose();
    },
    
    // 关闭弹框
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.right-popup-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  pointer-events: none;
}

/* 遮罩层 */
.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* 弹框内容 */
.popup-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

/* 显示状态 */
.show .mask {
  opacity: 1;
  pointer-events: auto;
}
.show .popup-content {
  transform: translateX(0);
}

/* 标题栏 */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.close-btn {
  font-size: 36rpx;
  color: #666;
}

/* 列表样式 */
.popup-list {
  flex: 1;
  overflow-y: auto;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.2s;
}
.list-item:active {
  background-color: #f5f5f5;
}
.item-icon {
  margin-right: 20rpx;
}
.item-content {
  flex: 1;
}
.item-text {
  font-size: 28rpx;
  color: #333;
}

/* 底部操作栏 */
.popup-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}
.confirm-btn {
  padding: 15rpx 40rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 6rpx;
  font-size: 28rpx;
}
</style>