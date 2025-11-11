<template>
  <div class="search-panel">
    <div class="search-panel__row">
      <van-search
        v-model="keyword"
        placeholder="请输入出库单据编号"
        shape="square"
        background="#fff"
        :clearable="false"
        @search="emitSearch"
      />
      <van-button class="search-panel__btn" type="primary" @click="emitSearch">
        <van-icon name="search" size="18" />
        查询
      </van-button>
      <dc-scan-code
        v-model="keyword"
        @confirm="handleScanSuccess"
        @error="handleScanError"
      >
        <van-button class="search-panel__scan" type="success" block>
          <van-icon name="scan" size="18" />
        </van-button>
      </dc-scan-code>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['search']);

const keyword = ref('');

function emitSearch() {
  const value = keyword.value.trim();
  if (!value) return;
  emit('search', value);
}

function handleScanSuccess(code) {
  if (!code) return;
  keyword.value = code;
  emitSearch();
}

function handleScanError(error) {
  const message = error?.message || '';
  if (message.includes('取消') || message.toLowerCase().includes('cancel')) return;
  console.error('scan failed', error);
}

</script>

<style scoped>
.search-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-panel__row {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fff;
}

.search-panel__btn {
  flex-shrink: 0;
  height: 44px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.search-panel__scan {
  width: 60px;
  height: 44px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
