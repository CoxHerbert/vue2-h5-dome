<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="false"
            :border-bottom="false"
            :is-back="false"
            title="我的"
            :background="{ background: '#3060ED' }"
            title-color="#fff"
        >
        </u-navbar>

        <view class="content">
            <view class="avatar">
                <image
                    :src="detail.avatarId ? detail.avatarId : userInfo.avatar"
                    class="avatar-image"
                    mode="aspectFill"
                ></image>
            </view>

            <view class="form">
                <view class="cell">
                    <view class="name">姓名</view>
                    <view class="hold">{{ detail.name || userInfo.realName || '-' }}</view>
                </view>
                <view class="cell">
                    <view class="name">工号</view>
                    <view class="hold">{{ userInfo.jobnum || '-' }}</view>
                </view>
                <view class="cell">
                    <view class="name">岗位</view>
                    <view class="hold">{{ detail.positionDict || userInfo.postName || '-' }}</view>
                </view>
                <view class="cell">
                    <view class="name">电话</view>
                    <view class="hold">{{ detail.mobile || userInfo.phone || '-' }}</view>
                </view>
                <view class="cell">
                    <view class="name">部门</view>
                    <view class="hold">{{ userInfo.deptName || '-' }}</view>
                </view>
                <view class="cell">
                    <view class="name">加入东创</view>
                    <view class="hold">{{ calculateDaysBetweenDates(userInfo.joinedDate) || 0 }}天</view>
                </view>
            </view>
        </view>
        <view class="back" @click="logout">清除缓存</view>
    </view>
</template>

<script>
import pickRegions from '@/components/pick-regions/pick-regions.vue';
import UploadImg from '@/components/uploadImg';
import { mapMutations } from 'vuex';
import { getlabelByValue, needHideTitleBar } from '@/utils/utils';
import store from '@/store/';
export default {
    components: {
        pickRegions,
        UploadImg,
    },
    data() {
        return {
            showTitleBar: true,
            userInfo: {},
            loginInfo: {},
            detail: {},
            positionDictList: [],
        };
    },
    async created() {
        this.showTitleBar = !needHideTitleBar()
        this.userInfo = this.$store.getters.userInfo || uni.getStorageSync('userInfo') || {};
        this.loginInfo = this.$store.getters.loginInfo || uni.getStorageSync('loginInfo') || {};
        this.getlaborRegisterDetail();
        if (!this.userInfo.id) {
            this.userInfo = await store.dispatch('getUserInfo');
        }
    },

    methods: {
        ...mapMutations(['LOGOUT']),
        logout() {
            this.LOGOUT();
        },

        // 获取用户的登记信息
        getlaborRegisterDetail() {
            this.$u.api
                .laborRegisterDetail({
                    createUser: this.userInfo.id || this.loginInfo.user_id,
                })
                .then(async (res) => {
                    console.log('res====>', res);
                    console.log(this.userInfo);
                    console.log(this.loginInfo);
                    if (res.code == 200) {
                        if (res.data) {
                            this.detail = res.data || {};
                            let positionDict = await getlabelByValue('DC_LABOR_POSITION', res.data.jobGradeDictCode);
                            if (positionDict) {
                                this.$set(this.detail, 'positionDict', positionDict);
                            }
                        }
                    }
                });
        },

        calculateDaysBetweenDates(date) {
            const nowDate = new Date();
            const joinDate = new Date(date);
            // 将日期转换为毫秒
            const diffInMs = Math.abs(nowDate - joinDate);
            // 将毫秒转换为天数
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
            return diffInDays;
        },
    },
};
</script>

<style lang="scss">
.container {
    background-color: #f7f7f7;
    padding: 0rpx 0 200rpx;
    overflow: hidden;
}

.content {
    background-color: #ffffff;
    overflow: hidden;
}

.avatar {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    font-size: 30rpx;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #f78431;
    .avatar-image {
        width: 162rpx;
        height: 162rpx;
        background: #ffffff;
        border-radius: 50%;
        background-color: #82848a;
        margin-bottom: 15rpx;
    }
}

.form {
    padding: 0 36rpx;

    .cell {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40rpx 0;
        font-size: 30rpx;
        font-family: Source Han Sans CN;
        font-weight: bold;
        color: #666666;

        &:not(:last-of-type) {
            border-bottom: 2rpx solid #efefef;
        }

        .name {
            width: 30%;
        }

        .hold {
            flex: 1;
            font-size: 27rpx;
            font-family: Source Han Sans CN;
            font-weight: 400;
            color: #666;
            text-align: right;
        }
    }
}

.back {
    margin-top: 40rpx;
    text-align: center;
    height: 109rpx;
    background: #ffffff;

    font-size: 34rpx;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #141414;
    line-height: 109rpx;
}
</style>
