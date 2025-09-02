<template>
    <view class="container1">
        <image src="@/static/images/404.png" model="aspectFill" class="image-icon"></image>

        <!-- <view class="back" @click="logout">未找到用户，请重新授权</view> -->
    </view>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
    data() {
        return {};
    },

    methods: {
        ...mapMutations(['LOGOUT']),
        logout() {
            this.LOGOUT();
        },
    },
};
</script>

<style lang="scss">
.container1 {
    padding: 0rpx 50rpx 200rpx;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .image-icon {
        width: 400rpx;
        height: 200rpx;
        margin-top: 300rpx;
    }
}

.back {
    margin-top: 40rpx;
    text-align: center;
    height: 80rpx;
    background: #ffffff;
    border-radius: 40rpx;
    font-size: 34rpx;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #141414;
    line-height: 80rpx;
}
</style>
