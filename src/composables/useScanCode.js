import { nextTick, ref } from 'vue';

/**
 * Helper hook to drive DcScanCode instances from setup scripts.
 * It keeps the component mounted only when scanning is in progress
 * and normalises the show/hide lifecycle across the app.
 */
export function useScanCode({ autoClose = true } = {}) {
  const scanVisible = ref(false);
  const scanCodeRef = ref(null);

  async function openScan(options) {
    scanVisible.value = true;
    await nextTick();
    try {
      const result = await scanCodeRef.value?.open?.(options);
      if (autoClose) {
        scanVisible.value = false;
      }
      return result;
    } catch (error) {
      if (autoClose) {
        scanVisible.value = false;
      }
      throw error;
    }
  }

  function closeScan() {
    scanVisible.value = false;
  }

  function handleConfirm(value) {
    if (autoClose) {
      scanVisible.value = false;
    }
    return value;
  }

  function handleError(error) {
    if (autoClose) {
      scanVisible.value = false;
    }
    return error;
  }

  return {
    scanVisible,
    scanCodeRef,
    openScan,
    closeScan,
    handleConfirm,
    handleError,
  };
}
