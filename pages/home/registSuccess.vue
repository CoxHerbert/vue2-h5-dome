<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :isBack="false"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            :title="$LT('selfRegistration')"
            :background="{ background: '#F7E9DF' }"
            title-color="#333333"
        >
        </u-navbar>
        <view class="box">
            <image src="@/static/images/djsuccess.png" class="img"></image>
            <template>
                <p class="t">{{$LT('successfullyRegistered')}}</p>
                <p class="b">{{$LT('AndInterviewCredentialsHaveBeenGenerated')}}</p>
                <button class="submitBtn" type="primary" @click="goHome()">{{$LT('backHome')}}</button>
            </template>
        </view>
    </view>
</template>
<script>
import getLangLabel from '../../i18n';
import { needHideTitleBar } from '@/utils/utils'
export default {
    data() {
        return {
            showTitleBar: false
        };
    },
    computed: {
        lang() {
            return this.$store.state.loginInfo.lang
        }
    },
    created() {
        this.showTitleBar = !needHideTitleBar()
    },
    methods: {
         $LT(key){
            return getLangLabel('registSuccess', key, this.lang);
        },
        goHome() {
            uni.redirectTo({
                url: '/pages/home/auditResult',
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.container {
    height: 100vh;
    text-align: center;
    overflow: hidden;
    color: #000;

    .box {
        padding: 280rpx 0px 0px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;

        .submitBtn {
            width: 520rpx;
            height: 80rpx;
            background: #f78431;
            border-radius: 12rpx;
            font-size: 28rpx;
            line-height: 80rpx;
            margin-top: 54rpx;
            box-sizing: border-box;
        }

        .subDetails {
            background: #fff;
            color: #b41701;
            margin-top: 32rpx;
        }

        .img {
            display: flex;
            width: 240rpx;
            height: 240rpx;
            justify-content: center;
        }

        .t {
            font-size: 32rpx;
            font-weight: bold;
            margin: 38rpx 0px 24rpx;
        }

        .b {
            font-size: 26rpx;

            color: #999999;
        }
    }
}
</style>
