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
        <!-- 相机画面 -->
        <div id="reader" class="reader"></div>

        <!-- 取景框 UI（不拦截事件） -->
        <div class="scan-ui" aria-hidden="true">
          <div class="frame" :style="frameStyle">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>
            <div v-if="showScanLine" class="scan-line"></div>
          </div>
        </div>

        <!-- 底部按钮 -->
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
      // UI 配置
      frameWidth: 0, // 运行时计算
      frameHeight: 0, // 运行时计算
      showScanLine: true,
    };
  },
  computed: {
    frameStyle() {
      return {
        '--frame-w': this.frameWidth + 'px',
        '--frame-h': this.frameHeight + 'px',
      };
    },
  },
  beforeUnmount() {
    this.stopScan();
  },
  methods: {
    open() {
      return new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
        this.show = true;
        nextTick(() => {
          this.calcFrameSize();
          this.startScan();
        });
      });
    },

    // 根据屏幕尺寸计算竖向取景框（与截图一致）
    calcFrameSize() {
      const w = window.innerWidth || document.documentElement.clientWidth;
      const h = window.innerHeight || document.documentElement.clientHeight;

      // 竖向：宽度占屏幕 70%，高度占 60%，并做上限保护
      const fw = Math.min(Math.round(w * 0.72), 320);
      const fh = Math.min(Math.round(h * 0.62), 560);

      this.frameWidth = fw;
      this.frameHeight = fh;
    },

    getQrbox() {
      // 与取景框尺寸一致，提升体验
      return { width: this.frameWidth, height: this.frameHeight };
    },

    startScan() {
      if (this.scanning) return;
      if (!this.scanner) {
        this.scanner = new Html5Qrcode('reader');
      }

      this.scanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: this.getQrbox(),
          },
          (code) => {
            if (!this.scanning) return;
            this.scanning = false;
            this.stopScan();
            this.resolveFn?.(code);
            this.cleanup();
          },
          () => {} // 忽略高频错误回调
        )
        .then(() => {
          this.scanning = true;
        })
        .catch((err) => {
          console.error('摄像头启动失败:', err);
          this.rejectFn?.(err);
          this.cleanup();
        });

      // 旋转/尺寸变化时自适应（可选）
      window.addEventListener('resize', this.handleResize, { passive: true });
    },

    stopScan() {
      window.removeEventListener('resize', this.handleResize);
      if (this.scanner && this.scanning) {
        this.scanner.stop().catch((err) => {
          console.error('停止扫码失败:', err);
        });
      }
      this.scanning = false;
    },

    handleResize() {
      // 只更新 UI，不强制重启相机（避免闪烁）
      this.calcFrameSize();
    },

    handleManualClose() {
      this.stopScan();
      this.rejectFn?.(new Error('用户取消扫码'));
      this.cleanup();
    },

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
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  #reader {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* html5-qrcode 会填充 video；确保其铺满 */
    video {
      object-fit: cover !important;
      width: 100% !important;
      height: 100% !important;
    }
  }

  .scan-ui {
    pointer-events: none;
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  /* 中央取景框：用超大 box-shadow 做遮罩，外侧变暗，内侧通透 */
  .frame {
    position: relative;
    width: var(--frame-w);
    height: var(--frame-h);
    border-radius: 8px; /* 取景框圆角（可调） */
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.72);
    /* 让遮罩不过度锐利 */
    outline: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* 四角描边（白色 L 形） */
  .corner {
    position: absolute;
    width: 34px;
    height: 34px;
    border: 3px solid #fff;
  }
  .corner.tl {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 6px;
  }
  .corner.tr {
    top: -2px;
    right: -2px;
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 6px;
  }
  .corner.bl {
    bottom: -2px;
    left: -2px;
    border-right: none;
    border-top: none;
    border-bottom-left-radius: 6px;
  }
  .corner.br {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 6px;
  }

  /* 扫描线（可选） */
  .scan-line {
    position: absolute;
    left: 6%;
    right: 6%;
    height: 2px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 2px;
    animation: slideY 2.2s ease-in-out infinite;
  }
  @keyframes slideY {
    0% {
      top: 8%;
      opacity: 0.2;
    }
    10% {
      opacity: 1;
    }
    50% {
      top: 50%;
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      top: 92%;
      opacity: 0.2;
    }
  }

  .btn {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0;
    z-index: 10000;
    /* 适配 iOS 安全区 */
    padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
  }
}
</style>
