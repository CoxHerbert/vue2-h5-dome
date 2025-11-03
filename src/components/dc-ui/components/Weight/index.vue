<!-- DcWeightPicker.vue -->
<template>
  <div class="comp-dc-weght comp-dc-weight" :class="{ disabled }">
    <div class="input-wrapper">
      <!-- 替代 dc-number：用 Vant Field 数字输入 -->
      <van-field
        :model-value="displayValue"
        type="number"
        :placeholder="placeholder || '请输入重量'"
        :disabled="disabled"
        @update:model-value="onInputUpdate"
      />
      <div class="btn-done" @click="handleInputClick">取称重</div>
    </div>

    <!-- 替代 u-popup：Vant Popup -->
    <van-popup v-model:show="visible" position="bottom" round :style="{ height: '90vh' }">
      <div class="weight-popup">
        <div class="popup-header">请选择称重设备</div>

        <!-- 用 Vant Radio 列表替代 dc-radio，并在 cell 中展示重量/单位 -->
        <van-radio-group v-model="selectedValue" @change="handleSelectChange">
          <van-cell-group inset>
            <van-cell
              v-for="opt in options"
              :key="opt.value"
              clickable
              :title="opt.label"
              @click="selectedValue = opt.value"
            >
              <template #label>
                <div class="info">
                  <div class="weight">{{ weightInfo[opt.value]?.weight ?? '-' }}</div>
                  <div class="unit">{{ weightInfo[opt.value]?.unit ?? '-' }}</div>
                </div>
              </template>
              <template #right-icon>
                <van-radio :name="opt.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>

        <div class="popup-actions">
          <van-button block plain type="primary" @click="visible = false">取消</van-button>
          <van-button block type="primary" @click="confirmSelect">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { showToast } from 'vant';
import { io } from 'socket.io-client';

/** Props / Emits */
const props = defineProps({
  disabled: { type: Boolean, default: false },
  modelValue: { type: [String, Number], default: '' }, // 原 value
  placeholder: { type: String, default: '' },
  /** 可配置命名空间，默认 /weight */
  namespace: { type: String, default: '/weight' },
});
const emit = defineEmits(['update:modelValue', 'change']);

/** UI state */
const visible = ref(false);
const selectedValue = ref('');
const options = ref([
  { label: '地磅', value: '01' },
  { label: '台秤', value: '02' },
]);

/** 称重数据缓存（按设备 id 存） */
const weightInfo = reactive({
  '01': {}, // { weight, unit, ... }
  '02': {},
});

/** socket */
let socket = null;

/** 输入框显示值（保证受控） */
const displayValue = computed(() => props.modelValue ?? '');

/** 连接 socket.io，监听称重数据 */
function initWebsocket() {
  socket = io(props.namespace, { transports: ['websocket'] });

  socket.on('connect', () => {
    // 可选：告知后端前端已连接
    socket.emit('message', 'front connected');
  });

  socket.on('weightChange', (data) => {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      const id = payload?.eqId;
      if (id && weightInfo[id] !== undefined) {
        weightInfo[id] = { ...payload };
      }
    } catch (e) {
      // 数据异常忽略
    }
  });

  socket.on('disconnect', () => {
    // noop
  });
}

onMounted(() => {
  initWebsocket();
});

onBeforeUnmount(() => {
  try {
    socket && socket.disconnect();
  } finally {
    socket = null;
  }
});

/** 交互逻辑 */
function handleInputClick() {
  if (props.disabled) return;
  visible.value = true;
  // 默认选中第一个设备（如已有选中则保留）
  if (!selectedValue.value) {
    selectedValue.value = options.value[0]?.value || '';
  }
}

function handleSelectChange() {
  // 仅更新选中，不立刻提交；交给“确定”按钮
}

function confirmSelect() {
  const val = weightInfo[selectedValue.value]?.weight;
  if (val === undefined || val === null || val === '') {
    showToast({ message: '当前设备尚未上报重量' });
    return;
  }
  emit('update:modelValue', val);
  emit('change', val);
  visible.value = false;
}

/** 直接手工编辑输入框 */
function onInputUpdate(v) {
  emit('update:modelValue', v);
  emit('change', v);
}
</script>

<style lang="scss" scoped>
.comp-dc-weght,
.comp-dc-weight {
  position: relative;
  width: 100%;
  min-height: 40px;

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;

    :deep(.van-field) {
      flex: 1;
    }
  }

  .btn-done {
    margin-right: 8px;
    display: inline-block;
    border-radius: 6px;
    width: 72px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #2979ff;
    background: rgba(41, 121, 255, 0.08);
  }

  &.disabled {
    width: calc(100% - 8px);
    background-color: rgba(0, 0, 0, 0.05);
    .btn-done {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .weight-popup {
    display: flex;
    flex-direction: column;
    height: 100%;

    .popup-header {
      padding: 12px 16px;
      font-weight: 600;
      font-size: 15px;
    }

    .info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 6px;

      .weight {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.2;
      }
      .unit {
        color: #86909c;
      }
    }

    .popup-actions {
      margin: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  }
}
</style>
