<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="false"
            :border-bottom="false"
            :is-back="false"
            back-icon-name="arrow-leftward"
            title="登录"
            :background="{ background: '#F7E9DF' }"
            title-color="#000000"
        >
        </u-navbar>

        <view class="content">
            <view class="top">
                <image src="/static/images/logo.png" class="logo" mode="widthFix"></image>
                <view class="cell">
                    <view class="name">手机号</view>
                    <view class="input-box">
                        <input
                            type="number"
                            v-model="phone"
                            placeholder="请输入手机号码"
                            class="ipt"
                            placeholder-class="hold"
                            @blur="handleInputCheck"
                        />
                    </view>
                </view>
                <view class="cell">
                    <view class="name">短信验证码</view>
                    <view class="input-box">
                        <input
                            type="number"
                            v-model="code"
                            placeholder="请输入验证码"
                            class="ipt"
                            placeholder-class="hold"
                            @blur="handleInputCheck"
                        />
                        <view class="code" @click="sendCode" v-if="count === 60">获取验证码</view>
                        <view class="code" v-else
                            ><text>{{ count }}</text
                            >秒重新获取</view
                        >
                    </view>
                </view>

                <button class="submit" @click="submit" :disabled="disabled">登录</button>
                <!-- <view class="tip">未注册用户验证后将自动注册并登录</view> -->
                <navigator url="/pages/login/login-account" hover-class="none" class="change">密码登录 ></navigator>
            </view>
        </view>
        <!--  -->
    </view>
</template>

<script>
import { needHideTitleBar } from '@/utils/utils';
export default {
    data() {
        return {
            showTitleBar: true,
            phone: '',
            code: '',
            disabled: true,
            count: 60,
            timer: '',
        };
    },
    created() {
        this.showTitleBar = !needHideTitleBar();
    },
    methods: {
        submit() {
            this.$u.func.showToast({
                title: '新版本即将到来',
            });
        },
        handleInputCheck() {
            if (!this.phone && !/^1\d{10}$/.test(this.phone)) {
                this.disabled = true;
                return uni.showToast({
                    title: '请输入正确的手机号',
                    duration: 2000,
                    icon: 'none',
                });
            }
            if (!this.code) {
                this.disabled = true;
                return uni.showToast({
                    title: '请输入验证码',
                    duration: 2000,
                    icon: 'none',
                });
            }
            this.disabled = false;
        },
        async sendCode() {
            this.count = this.count - 1;
            this.timer = setInterval(() => {
                if (this.count == 0) {
                    clearInterval(this.timer);
                    this.count = 60;
                    return;
                }
                this.count = this.count - 1;
            }, 1000);
        },
    },
};
</script>

<style lang="scss">
.container {
    min-height: 100vh;
    overflow: hidden;
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    height: 60vh;
    width: 100%;

    .top {
        width: 100%;
    }

    .logo {
        display: block;
        width: 310rpx;
        height: auto;
        margin: 0 auto 120rpx;
    }

    .change {
        margin-top: 20rpx;
        text-align: center;
        font-size: 22rpx;
        font-family: Adobe Heiti Std;
        font-weight: normal;
        // color: #14b9c8;
        color: #f78431;
        line-height: 34rpx;
    }

    .cell {
        width: 100%;
        padding: 0 85rpx;
        box-sizing: border-box;
        margin-top: 36rpx;

        .name {
            font-size: 22rpx;
            font-family: Source Han Sans CN;
            font-weight: 400;
            color: #3e4a59;
            line-height: 30rpx;
            opacity: 0.72;
        }

        .input-box {
            padding: 30rpx 0;
            border-bottom: 2rpx solid #f0f2f5;
            display: flex;
            align-items: center;

            .code {
                font-size: 22rpx;
                font-family: Source Han Sans CN;
                font-weight: 400;
                color: #0d0d0d;
                line-height: 30rpx;

                text {
                    // color: #14b9c8;
                    color: #f78431;
                }
            }

            .ipt {
                flex: 1;
                // height: 24rpx;
                font-size: 24rpx;
            }

            .hold {
                font-size: 26rpx;
                font-family: Source Han Sans CN;
                font-weight: 400;
                color: #3e4a59;
                line-height: 30px;
                opacity: 0.45;
            }
        }
    }

    .submit {
        margin: 60rpx 90rpx 0;
        border: none;
        width: 572rpx;
        height: 86rpx;
        line-height: 86rpx;
        box-sizing: border-box;
        border-radius: 15rpx;
        background-color: #f78431;
        color: #ffffff;

        &::after {
            content: none;
        }

        &::before {
            content: none;
        }

        &[disabled='true'] {
            background: #e4e4e4;
            font-size: 36rpx;
            font-family: Source Han Sans CN;
            font-weight: 500;
            color: #ffffff;
        }
    }

    .tip {
        margin-top: 30rpx;
        text-align: center;
        font-size: 22rpx;
        font-family: Adobe Heiti Std;
        font-weight: normal;
        color: #cacaca;
        line-height: 34rpx;
    }
}
</style>
