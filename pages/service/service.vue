<template>
    <view class="container">
        <view class="head">
            <u-navbar
            v-if="showTitleBar"
                :is-fixed="false"
                :border-bottom="false"
                :is-back="true"
                back-icon-name="arrow-leftward"
                back-icon-color="#fff"
                back-icon-size="35"
                :background="{ background: 'linear-gradient(90deg, #69b0ff, #f78431)' }"
                title="服务"
                title-color="#fff"
            ></u-navbar>
            <view v-else class="top-bar"></view>
            <view class="head-bg"></view>
            <!-- 我的订阅 start -->
            <view class="card sub">
                <view class="title">我的订阅</view>
                <view class="list">
                    <u-grid :col="4" :border="false">
                        <u-grid-item bg-color="transparent" v-for="(item, index) in subscribeList" :key="index">
                            <navigator url="" hover-class="none" class="nav-item">
                                <image :src="item.img" mode="widthFix" class="nav-item-img"></image>
                                <view class="nav-item-name">{{ item.name }}</view>
                            </navigator>
                        </u-grid-item>
                    </u-grid>
                </view>
            </view>
            <!-- 我的订阅 end -->

            <!-- 服务列表 start -->
            <view class="card wrap" v-for="(item, index) in serviceList" :key="index">
                <view class="title">{{ item.name }}</view>
                <view class="list">
                    <u-grid :col="4" :border="false">
                        <u-grid-item bg-color="transparent" v-for="(_item, _index) in item.list" :key="_index">
                            <navigator url="" hover-class="none" class="nav-item">
                                <image :src="_item.img" mode="widthFix" class="nav-item-img"></image>
                                <view class="nav-item-name">{{ _item.name }}</view>
                            </navigator>
                        </u-grid-item>
                    </u-grid>
                </view>
            </view>
            <!-- 服务列表 end -->
        </view>
    </view>
</template>

<script>
import { fakeSubscribeList, fakeServiceList } from '@/api/mock/service.js';
import { needHideTitleBar } from "@/utils/utils";
export default {
    data() {
        return {
            showTitleBar: true,
            // 我的订阅
            subscribeList: [],
            // 服务列表
            serviceList: [],
        };
    },
    onLoad() {
        this.showTitleBar = !needHideTitleBar();
        // 后续将改为与后端联动
        // 加载我的订阅数据
        fakeSubscribeList().then((data) => {
            this.subscribeList = data;
        });
        // 加载服务集合数据
        fakeServiceList().then((data) => {
            this.serviceList = data;
        });
    },
};
</script>

<style lang="scss">
.container {
    background-color: #f7f7f7;
    min-height: 100vh;
    overflow: hidden;
}

.top-bar  {
    height: 20px;
}

.head {
    position: relative;
    top: 0;
    left: 0;
    z-index: 1;
}

.head-bg {
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: -1;
    width: 750rpx;
    height: 270rpx;
    background: linear-gradient(90deg, #69b0ff, #f78431);
}

.card {
    margin: 30rpx;
    background: #ffffff;
    border-radius: 20rpx;
    margin-top: 36rpx;
}

.sub {
    .title {
        padding-top: 36rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 30rpx;
        font-family: Source Han Sans CN;
        font-weight: 500;
        color: #000000;

        &::before {
            content: '';
            display: block;
            width: 135rpx;
            height: 1rpx;
            background: #e4e7ed;
            margin: 0 17rpx;
        }

        &::after {
            content: '';
            display: block;
            width: 135rpx;
            height: 1rpx;
            background: #e4e7ed;
            margin: 0 17rpx;
        }
    }
}

.list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0 30rpx;

    .nav-item {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        font-size: 30rpx;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #131313;
        line-height: 48rpx;
        opacity: 0.77;

        &-img {
            width: 54rpx;
            height: 54rpx;
            margin-bottom: 30rpx;
        }

        &-name {
            font-size: 26rpx;
            font-family: PingFang SC;
            font-weight: 400;
            color: #585b61;
        }
    }
}

.wrap {
    .title {
        padding: 36rpx 16rpx;
        display: flex;
        align-items: center;
        font-size: 32rpx;
        font-family: Source Han Sans CN;
        font-weight: 500;
        color: #000000;

        &::before {
            content: '';
            display: block;
            width: 5rpx;
            height: 36rpx;
            margin-right: 10rpx;
            background: #3ac4d1;
        }
    }
}
</style>
