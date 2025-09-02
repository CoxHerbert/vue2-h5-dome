<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="false"
            :border-bottom="false"
            :is-back="false"
            title="管理"
            :background="{ background: 'linear-gradient(270deg, #f29346 0%, #f05466 100%)' }"
            title-color="#fff"
        >
            <image slot="right" src="/static/images/home/message.png" class="message-icon" mode="widthFix"></image>
        </u-navbar>

        <view class="tab">
            <u-tabs
                :list="list"
                :is-scroll="false"
                :current="current"
                active-color="#f78431"
                inactive-color="#595959"
                height="100"
                @change="change"
            ></u-tabs>
        </view>

        <swiper id="swiperBox" :style="{ height: swiperHeight + 'px' }" :current="current" @change="tabsChange">
            <swiper-item class="swiper-item" key="0">
                <scroll-view scroll-y style="width: 100%; height: 100%" @scrolltolower="onreachBottom">
                    <view class="content">
                        <u-grid :col="3">
                            <u-grid-item v-for="(_item, _index) in deskList" :key="_index">
                                <navigator :url="_item.path" hover-class="none" class="gitem">
                                    <image
                                        :src="require(`@/static/images/manage/${_item.type}.png`)"
                                        class="img"
                                        mode="widthFix"
                                    ></image>
                                    <view class="name">{{ _item.name }}</view>
                                </navigator>
                            </u-grid-item>
                        </u-grid>
                    </view>
                </scroll-view>
            </swiper-item>

            <swiper-item class="swiper-item" key="1">
                <scroll-view scroll-y style="width: 100%; height: 100%" @scrolltolower="onreachBottom">
                    <view class="content">
                        <u-grid :col="3">
                            <u-grid-item v-for="(_item, _index) in systemList" :key="_index">
                                <navigator :url="_item.path" hover-class="none" class="gitem">
                                    <image
                                        :src="require(`@/static/images/manage/${_item.type}.png`)"
                                        class="img"
                                        mode="widthFix"
                                    ></image>
                                    <view class="name">{{ _item.name }}</view>
                                </navigator>
                            </u-grid-item>
                        </u-grid>
                    </view>
                </scroll-view>
            </swiper-item>
        </swiper>
    </view>
</template>

<script>
import { needHideTitleBar } from '@/utils/utils'
export default {
    data() {
        return {
            showTitleBar: false,
            current: 0,
            swiperHeight: 0,
            list: [
                {
                    name: '工作台',
                },
                {
                    name: '系统',
                },
            ],
            deskList: [
                {
                    name: '公告',
                    type: 'notice',
                    path: '/pages/manage/notice',
                },
            ],
            systemList: [
                {
                    name: '角色',
                    type: 'role',
                    path: '/pages/manage/role',
                },
                {
                    name: '部门',
                    type: 'dept',
                    path: '/pages/manage/dept',
                },
                {
                    name: '字典',
                    type: 'dict',
                    path: '/pages/manage/dict',
                },
                {
                    name: '岗位',
                    type: 'post',
                    path: '/pages/manage/post',
                },
            ],
        };
    },
    onReady() {
        this.showTitleBar = !needHideTitleBar();
        let that = this;
        uni.getSystemInfo({
            success(e) {
                console.log(e);
                let { windowWidth, windowHeight, safeArea } = e;
                const query = uni.createSelectorQuery().in(that);
                query
                    .select('#swiperBox')
                    .boundingClientRect((data) => {
                        that.swiperHeight = safeArea.bottom - data.top;
                    })
                    .exec();
            },
        });
    },
    methods: {

        tabsChange(e) {
            this.current = e.detail.current;
        },
        change(index) {
            this.current = index;
        },
    },
};
</script>

<style lang="scss">
.swiper-box {
    height: 100vh;
}

.message-icon {
    width: 32rpx;
    height: auto;
    margin-right: 27rpx;
}

.tab {
    margin-bottom: 10rpx;
}

.gitem {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .img {
        width: 54rpx;
        height: auto;
        margin-bottom: 26rpx;
    }

    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #030305;
    line-height: 36rpx;
}
</style>
