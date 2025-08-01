<template>
    <u-popup v-model="show">
        <view class="page-container">
            <u-navbar
                :is-fixed="true"
                :border-bottom="false"
                back-icon-name="arrow-leftward"
                title="扫一扫"
                :background="{ background: '#F7EEE8' }"
                z-index="999"
                title-color="#333333"
            />
            <view class="page-body">
                <view class="scan-code">
                    <view id="reader"></view>
                </view>
            </view>
        </view>
    </u-popup>
</template>
<script>
import { Html5Qrcode } from 'html5-qrcode';

export default {
    data() {
        return {
            show: true,
            scanner: null, // 保存扫码实例
        };
    },
    mounted() {
        this.handleScan();
    },
    onUnload() {
        this.stopScan();
    },
    methods: {
        // 开始扫码
        async handleScan() {
            this.$nextTick(async () => {
                if (!this.scanner) {
                    this.scanner = new Html5Qrcode('reader');
                }
                try {
                    await this.scanner.start(
                        { facingMode: 'environment' },
                        {
                            fps: 300,
                        },
                        (planId) => {
                            this.getPlanDetail(planId); // 获取计划详情
                            this.stopScan(); // 关闭摄像头
                        },
                        (error) => {
                            console.log('扫描失败:', error);
                        }
                    );
                } catch (err) {
                    console.error('获取摄像头失败:', err);
                }
            });
        },
        // 停止扫码
        stopScan() {
            if (this.scanner) {
                this.scanner
                    .stop()
                    .then(() => {
                        this.isReaderVisible = false; // 隐藏扫码区域
                    })
                    .catch((err) => console.error('停止扫码失败:', err));
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    // display: flex;
    // flex-direction: column;
    .page-body {
        flex: 1;
        overflow: auto;
        .scan-code {
            height: 100%;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            #reader {
            }
        }
    }
}
</style>
