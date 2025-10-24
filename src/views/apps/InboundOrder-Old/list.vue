<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="入库单"
            z-index="999"
            :background="{ background: '#F7EEE8' }"
            title-color="#333333"
        >
            <view slot="right">
                <view class="add-btn" @click="goAdd"> <u-icon size="34" name="plus"></u-icon>新增</view>
            </view>
        </u-navbar>
        <view
            class="head-item"
            :class="{
                'hide-mode': !showTitleBar,
            }"
        >
            <view class="search-item">
                <u-search
                    borderColor="#efefef"
                    placeholder="请输入入库单号"
                    v-model="searchValue"
                    bgColor="#fff"
                    :clearabled="true"
                    :show-action="false"
                    @search="getList(true)"
                    @clear="getList(true)"
                ></u-search>
                <view class="search-btn" @click.stop="getList(true)">搜索</view>
            </view>
            <view v-if="!showTitleBar" class="add-btn" @click="goAdd">
                <u-icon size="34" name="plus"></u-icon>新增</view
            >
        </view>

        <u-tabs
            :list="tabList"
            :current="current"
            bg-color="transparent"
            active-color="#F78431"
            inactive-color="#333333"
            @change="handleTabClick"
        ></u-tabs>

        <view class="main" v-if="list.length > 0">
            <wkf-card :list="list" :show-btn="showBtn" :type="current" @refresh="getList(true)"></wkf-card>
            <u-loadmore :status="loadStatus" @loadmore="getList()" />
        </view>
        <wf-empty v-else text="暂无数据"></wf-empty>
        <u-back-top :scroll-top="scrollTop"></u-back-top>
    </view>
</template>
<script>
import { inventorylist } from '@/api/application';
import wkfCard from './listCard.vue';
import { needHideTitleBar } from '@/utils/utils';
export default {
    components: { wkfCard },
    data() {
        return {
            showTitleBar: false,
            background: { backgroundColor: 'transparent' },
            searchValue: null,
            current: 0,
            showBtn: false,
            loadStatus: 'loadmore',
            page: {
                current: 1,
                size: 5,
            },
            tabList: [
                { name: '全部', method: null },
                { name: '已审核', method: 'DC_WMS_IN_STATUS_C' },
                { name: '待审核', method: 'DC_WMS_IN_STATUS_A' },
            ],
            list: [],
            scrollTop: 0,
        };
    },
    onLoad({ current }) {
        if (current) {
            this.handleTabClick(Number(current), false);
        }
        this.$nextTick(() => {
            uni.startPullDownRefresh();
        });
    },
    onPullDownRefresh() {
        this.getList(true);
    },
    onReachBottom() {
        if (this.loadStatus == 'nomore') return;
        this.getList();
    },
    onPageScroll(e) {
        this.scrollTop = e.scrollTop;
    },

    onShow() {
        this.showTitleBar = !needHideTitleBar();
        this.getList(true);
        console.log('刷新11');
        // 监听刷新事件
        uni.$on('refreshData', (refresh) => {
            if (refresh) {
                this.getList(true);
            }
        });
    },
    methods: {
        getList(clear = false) {
            uni.showLoading({
                title: '加载中...',
                mask: true, // 是否显示透明蒙层，防止触摸穿透
            });
            if (clear) {
                this.page = {
                    current: 1,
                    size: 5,
                };
            }
            this.showBtn = false;
            const { current, size } = this.page;
            this.loadStatus = 'loading';
            inventorylist({
                inStockCode: this.searchValue,
                inStockStatus: this.tabList[this.current].method,
                current,
                size,
            })
                .then((res) => {
                    uni.hideLoading();
                    const { records, total } = res.data;
                    if (this.current == 0) {
                        this.showBtn = true;
                    }
                    if (records.length < size) this.loadStatus = 'nomore';
                    else this.loadStatus = 'loadmore';
                    if (clear) {
                        this.list = records;
                    } else {
                        this.list = this.list.concat(records);
                    }
                    console.log(this.list);
                    this.page.current++;
                    uni.stopPullDownRefresh();
                })
                .catch(() => {
                    uni.hideLoading();
                });
        },

        handleTabClick(index, request = true) {
            console.log(index);
            this.current = index;
            if (request) this.getList(true);
        },

        //  跳转新增入库单
        goAdd() {
            uni.navigateTo({
                url: '/pages/application/warehousingentry/addWarehouseReceipt',
            });
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background: #f6f6f6;
}

.container {
    padding-top: 20rpx;
    box-sizing: border-box;
    background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 12%) !important;
    ::v-deep.u-content {
        border-radius: 24rpx !important;
        height: 72rpx !important;
    }

    .add-btn {
        font-size: 30rpx;
        color: #666666;
        margin-right: 24rpx;
        display: flex;
        align-items: center;
    }
}
.head-item {
    width: 100%;
    position: relative;
    padding: 0 30rpx;
    &.hide-mode {
        display: flex;
        flex-flow: row nowrap;
        .search-item {
            width: calc(100vw - 200rpx);
            margin-right: 10rpx;
        }
        .add-btn {
            font-size: 30rpx;
            color: #666666;
            margin-right: 20rpx;
            display: flex;
            align-items: center;
        }
        .search-btn {
            right: 170rpx;
        }
    }
    .search-btn {
        width: 112rpx;
        height: 60rpx;
        line-height: 60rpx;
        background: #f78431;
        border-radius: 24rpx 24rpx 24rpx 24rpx;
        color: #fff;
        font-size: 28rpx;
        text-align: center;
        position: absolute;
        top: -2rpx;
        bottom: 0px;
        right: 34rpx;
        margin: auto;
    }
}

.main {
    padding: 16rpx 0 30rpx;
}
</style>
<style>
page {
    background: #f6f6f6;
}
</style>
