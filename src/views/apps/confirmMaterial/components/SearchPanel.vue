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
    </div>

    <van-button class="search-panel__scan" type="success" block @click="handleScan">
      <van-icon name="scan" size="18" />
      扫描出库单据编号
    </van-button>

    <dc-scan-code v-if="showScanner" ref="scannerRef" @confirm="handleScanResult" />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const emit = defineEmits(['search']);

const keyword = ref('');
const showScanner = ref(false);
const scannerRef = ref(null);

function emitSearch() {
  const value = keyword.value.trim();
  if (!value) return;
  emit('search', value);
}

function handleScan() {
  showScanner.value = true;
  nextTick(() => {
    scannerRef.value
      ?.open()
      .then((code) => {
        if (!code) return;
        keyword.value = code;
        emitSearch();
      })
      .catch(() => {})
      .finally(() => {
        showScanner.value = false;
      });
  });
}

function handleScanResult(code) {
  if (!code) return;
  keyword.value = code;
  emitSearch();
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
  height: 44px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
