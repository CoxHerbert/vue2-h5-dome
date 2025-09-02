<template>
    <view class="container">
        <view class="head" :style="{ height: `${headHeight}rpx` }">
            <u-navbar
                :is-fixed="false"
                :border-bottom="false"
                :is-back="false"
                :title="showTitleBar? '个人中心': ''"
                :background="{ background: 'transprent' }"
                title-color="#FFFFFF"
            >
                <view @click="$u.func.route('/pages/system/setting')" slot="right">
                    <image src="/static/images/user/setting.png" class="set-icon" mode="widthFix"></image>
                </view>
            </u-navbar>
            <image src="/static/images/user/bg.png" class="head-bg" :style="{ height: `${headHeight}rpx` }" />
            <!-- 用户信息 -->
            <view class="user-box">
                <view class="left">
                    <image :src="userInfo.avatarId" class="avatar" mode=""></image>
                    <view class="user-name">{{ userInfo.name }}</view>
                    <view class="tag">{{ userInfo.tenantId }}</view>
                </view>
                <view @click="$u.func.route('/pages/user/profile')" class="edit-btn">编辑资料</view>
            </view>
            <!-- 操作按钮 -->
            <view class="nav">
                <navigator url="" hover-class="none" class="nav-item">
                    <image src="/static/images/user/n1.png" class="icon" mode=""></image>
                    <view class="name">我的消息</view>
                </navigator>
                <navigator url="" hover-class="none" class="nav-item">
                    <image src="/static/images/user/n2.png" class="icon" mode=""></image>
                    <view class="name">我的待办</view>
                </navigator>
                <navigator url="" hover-class="none" class="nav-item">
                    <image src="/static/images/user/n3.png" class="icon" mode=""></image>
                    <view class="name">我的地址</view>
                </navigator>
                <navigator url="" hover-class="none" class="nav-item">
                    <image src="/static/images/user/n4.png" class="icon" mode=""></image>
                    <view class="name">我的收藏</view>
                </navigator>
            </view>
        </view>
        <!-- 功能列表 -->
        <view class="cell-box">
            <u-cell-group :border="false">
                <u-cell-item title="我的评价">
                    <image slot="icon" src="/static/images/user/c1.png" class="icon" mode=""></image>
                </u-cell-item>
                <u-cell-item title="常见问题">
                    <image slot="icon" src="/static/images/user/c2.png" class="icon" mode=""></image>
                </u-cell-item>
                <u-cell-item title="客服中心" :border-bottom="false">
                    <image slot="icon" src="/static/images/user/c3.png" class="icon" mode=""></image>
                </u-cell-item>
            </u-cell-group>
        </view>
        <view class="cell-box">
            <u-cell-group :border="false">
                <u-cell-item title="推荐">
                    <image slot="icon" src="/static/images/user/c4.png" class="icon" mode=""></image>
                </u-cell-item>
                <u-cell-item title="评分">
                    <image slot="icon" src="/static/images/user/c5.png" class="icon" mode=""></image>
                </u-cell-item>
                <u-cell-item title="反馈">
                    <image slot="icon" src="/static/images/user/c6.png" class="icon" mode=""></image>
                </u-cell-item>
                <u-cell-item title="关于" :border-bottom="false">
                    <image slot="icon" src="/static/images/user/c7.png" class="icon" mode=""></image>
                </u-cell-item>
            </u-cell-group>
        </view>
        <view class="cell-box">
            <u-cell-group :border="false">
                <u-cell-item title="设置" :border-bottom="false" @click="$u.func.route('/pages/system/setting')">
                    <image slot="icon" src="/static/images/user/c8.png" class="icon" mode=""></image>
                </u-cell-item>
            </u-cell-group>
        </view>
    </view>
</template>

<script>
import { laborRegisterDetail } from '@/api/user.js';
import { needHideTitleBar } from "@/utils/utils"
export default {
    data() {
        return {
            showTitleBar: false,
            headHeight: 582,
            userInfo: {},
        };
    },
    mounted() {
        this.showTitleBar = !needHideTitleBar();
        this.setHeadHeight();
        console.log(this.$store.getters.userInfo);
        this.getlaborRegisterDetail();
    },
    methods: {
        // 获取用户的登记信息
        getlaborRegisterDetail() {
            laborRegisterDetail({
                createUser: this.$store.getters.userInfo.user_id,
            }).then(async (res) => {
                if (res.code == 200) {
                    this.userInfo = res.data;
                }
            });
        },
        setHeadHeight() {
            const that = this;
            // #ifndef H5
            uni.getSystemInfo({
                success: function (res) {
                    that.headHeight = Number(res.statusBarHeight) + Number(res.platform == 'ios' ? 44 : 48) + 582;
                },
            });
            // #endif
        },
    },
};
</script>

<style lang="scss">
.container {
    background-color: #f7f7f7;
    min-height: 100vh;
    overflow: hidden;
}

.head {
    position: relative;
    top: 0;
    left: 0;
    z-index: 1;
    min-height: 582rpx;
    overflow: hidden;
    background: #55a2f9;

    .set-icon {
        vertical-align: middle;
        width: 41rpx;
        height: auto;
        margin-right: 35rpx;
    }

    .head-bg {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: -1;
        width: 750rpx;
        height: 582rpx;
        background: #55a2f9;
    }
}

.user-box {
    display: flex;
    justify-content: space-between;
    padding: 0 20rpx 0 64rpx;
    margin-top: 36rpx;

    .left {
        display: flex;
        flex-direction: column;
        align-items: center;

        .avatar {
            width: 128rpx;
            height: 128rpx;
            background: #ffffff;
            border-radius: 50%;
        }

        .user-name {
            margin-top: 20rpx;
            font-size: 36rpx;
            font-family: Source Han Sans CN;
            font-weight: 500;
            color: #ffffff;
        }

        .tag {
            margin-top: 20rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 5rpx 16rpx;
            border: 1px solid #f5f5f5;
            border-radius: 7rpx;

            font-size: 19rpx;
            font-family: Source Han Sans CN;
            font-weight: 300;
            color: #ffffff;
        }
    }

    .edit-btn {
        margin-top: 20rpx;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        width: 165rpx;
        height: 54rpx;
        border: 2rpx solid #f5f5f5;
        border-radius: 11rpx;

        font-size: 27rpx;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #ffffff;
    }
}

.nav {
    display: flex;
    //border-top: 2rpx solid #7dcdd6;
    margin: 36rpx 38rpx 0;
    padding: 36rpx 0 42rpx;

    .nav-item {
        width: calc(100% / 4);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        font-size: 25rpx;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #ffffff;

        &:not(:last-of-type) {
            position: relative;

            &::after {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                content: '';
                display: block;
                width: 2rpx;
                background-color: #fff;
                height: 30rpx;
            }
        }

        .icon {
            width: 48rpx;
            height: 48rpx;
            margin-bottom: 6rpx;
        }
    }
}

.cell-box {
    background: #ffffff;
    margin: 18rpx;

    .icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 22rpx;
    }
}
</style>
