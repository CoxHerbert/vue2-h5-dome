<template>
  <div>
    <van-popup
      v-model:show="show"
      position="top"
      :closeable="true"
      :style="{ width: '100vw', height: '100vh' }"
      @close="handleManualClose"
    >
      <div class="scan-code">
        <div id="reader"></div>
        <van-button class="btn" type="success" block @click="handleManualClose">关闭</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { nextTick } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';

export default {
  name: 'DcScanCode',
  data() {
    return {
      loading: false,
      scanResult: '',
      show: false,
      scanner: null,
      scanning: false,
      resolveFn: null,
      rejectFn: null,
      wxSdkServicecode: null,
    };
  },
  mounted() {
    // 可留空；在 open() -> startScan() 时创建 scanner
  },
  beforeUnmount() {
    // Vue 3 生命周期
    this.stopScan();
  },
  methods: {
    /**
     * 打开扫码，返回 Promise
     */
    open() {
      return new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
        this.show = true;
        nextTick(() => {
          this.startScan();
        });
      });
    },

    /**
     * 开始扫码
     */
    startScan() {
      if (this.scanning) return;
      if (!this.scanner) {
        // 与模板中的容器 id 对应
        this.scanner = new Html5Qrcode('reader');
      }

      this.scanner
        .start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: 250 },
          (code) => {
            if (!this.scanning) return;
            this.scanning = false;
            this.stopScan();
            this.resolveFn?.(code); // 返回扫码结果
            this.cleanup();
          },
          (error) => {
            // 高频回调，保持安静即可
            // console.debug('扫描失败:', error);
          }
        )
        .then(() => {
          this.scanning = true;
        })
        .catch((err) => {
          console.error('摄像头启动失败:', err);
          this.rejectFn?.(err);
          this.cleanup();
        });
    },

    /**
     * 停止扫码
     */
    stopScan() {
      if (this.scanner && this.scanning) {
        this.scanner.stop().catch((err) => {
          console.error('停止扫码失败:', err);
        });
      }
      this.scanning = false;
    },

    /**
     * 手动关闭（点击按钮或关闭弹窗）
     */
    handleManualClose() {
      this.stopScan();
      // 若还未成功，则认为用户取消
      this.rejectFn?.(new Error('用户取消扫码'));
      this.cleanup();
    },

    /**
     * 清理状态
     */
    cleanup() {
      this.show = false;
      this.resolveFn = null;
      this.rejectFn = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.scan-code {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);

  #reader {
    width: 100%;
    height: calc(100% - 50px);
  }

  .btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 0;
    z-index: 10000;
  }
}
</style>
