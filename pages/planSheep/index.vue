<template>
    <view class="cnt">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="现场计划单"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        >
        </u-navbar>
        <view class="base-wrapper mtop20">
            <view class="title">{{ form.orderCode }}</view>
            <view class="baseinfo">
                <u-form labelPosition="left" :model="form" ref="uForm">
                    <view class="form-wrapper">
                        <u-form-item label="阶段编码" :label-width="160">
                            <u-input v-model="form.phaseCode" disabled="true" />
                        </u-form-item>
                        <u-form-item label="阶段名称" :label-width="160">
                            <u-input v-model="form.phaseName" disabled="true" />
                        </u-form-item>
                        <u-form-item label="开始时间" :label-width="160">
                            <u-input v-model="form.startDate" disabled="true" />
                        </u-form-item>
                        <u-form-item label="结束时间" :label-width="160">
                            <u-input v-model="form.endDate" disabled="true" />
                        </u-form-item>
                        <u-form-item label="延期说明" :label-width="160">
                            <u-input v-model="form.overdueExplanation" clearable placeholder="请输入" />
                        </u-form-item>
                    </view>
                    <u-button type="success" @click="handleConfig">保存</u-button>
                </u-form>
            </view>
        </view>
    </view>
</template>

<script>
import { detail, submit } from '@/api/planSheep';
import { needHideTitleBar } from '@/utils/utils';

export default {
    data() {
        return {
            showTitleBar: true,
            form: {
                timer: null,
            },
            detailData: [],
        };
    },

    created() {
        this.showTitleBar = !needHideTitleBar();
        this.getDetail();
    },
    methods: {
        // 获取详情
        getDetail() {
            detail({
                id: this.$route.query.id,
            }).then((res) => {
                this.form = res.data;
            });
        },
        handleConfig() {
            let that = this;
            uni.showModal({
                title: '提示',
                content: '确认保存吗',
                confirmColor: '#fff',
                success: function (res) {
                    if (res.confirm) {
                        submit(that.form)
                            .then((res) => {
                                uni.showToast({
                                    title: res.msg,
                                    icon: 'none',
                                });
                                setTimeout(() => {
                                    uni.navigateTo({
                                        url: '/pages/home/home',
                                    });
                                }, 1000);
                            })
                            .catch((error) => {
                                uni.showToast({
                                    title: '系统异常',
                                    icon: 'error',
                                });
                            });
                    }
                },
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.name {
    font-weight: 600;
    font-size: 30rpx;
}

::v-deep.uni-modal__btn_primary {
    color: #fff !important;
}

.cnt {
    background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 12%) !important;
    padding-bottom: 200rpx;
    box-sizing: border-box;
    .title {
        font-weight: 600;
        font-size: 30rpx;
        line-height: 30rpx;
        margin-bottom: 32rpx;
    }
    .u-form {
        margin-top: -40rpx;
    }
    .detail-title {
        padding: 40rpx 30rpx 0rpx;
    }
    .mtop20 {
        margin-top: 20rpx;
    }

    .base-wrapper {
        padding: 0rpx 26rpx;
        box-sizing: border-box;
        .baseinfo {
            padding: 32rpx 24rpx;
            box-sizing: border-box;
            border-radius: 20rpx;
            background-color: #fff;
            position: relative;
            .edite-btn {
                color: #fff;
                font-weight: 500;
                font-size: 28rpx;
                padding: 0px 26rpx;
                height: 48rpx;
                line-height: 48rpx;
                background: #f78431;
                border-radius: 24rpx 24rpx 24rpx 24rpx;
                text-align: center;
                position: absolute;
                bottom: 22rpx;
                right: 18rpx;
            }
        }
    }
}

.head {
    margin-bottom: 24rpx;
    .title {
        font-size: 28rpx;
        color: #222;
        font-weight: 600;
        margin: 0 10rpx;
    }
    .avatar {
        width: 66rpx;
        height: 66rpx;
        border-radius: 50%;
    }
    .status-icon {
        width: 74rpx;
        color: #fff;
        &-delay {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            padding-right: 8rpx;

            background-size: 100% 100%;
        }
        &-normal {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            padding-right: 8rpx;

            background-size: 100% 100%;
        }
    }
}

.cell + .cell {
    margin-top: 24rpx;
}
.cell {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    .label {
        color: #999;
        width: 150rpx;
    }
    .value {
        color: #565656;
        margin-left: 10rpx;
        flex: 1;
    }
}

.foot {
    font-size: 34rpx;
    display: flex;
    justify-content: space-evenly;
    position: fixed;
    bottom: 0px;
    width: 100%;
    text-align: center;
    align-items: center;
    background-color: #fff;
    padding: 24rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);

    .pass {
        border-radius: 8rpx;
        color: #f40;
        flex: 1;
        width: 288rpx;
        height: 80rpx;
        line-height: 80rpx;
        background: #f78431;
        color: #fff;
    }
}

.input-right {
    display: flex;
    align-items: center;
    .label {
        margin-right: 10rpx;
        font-size: 28rpx;
    }
}
</style>
