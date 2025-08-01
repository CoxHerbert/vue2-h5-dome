<template>
    <view>
        <u-card
            v-for="(item, index) in list"
            :key="index"
            :border="false"
            :show-head="false"
            :head-border-bottom="false"
            margin="0 30rpx 30rpx"
        >
            <view slot="body" @click="goURL(item.id)">
                <view class="status-row">
                    <text class="sleft">入库单号: {{ item.inStockCode }}</text>
                    <text
                        class="sright"
                        :class="
                            item.inStockStatus == 'DC_WMS_IN_STATUS_C'
                                ? 'ysh'
                                : item.inStockStatus == 'DC_WMS_IN_STATUS_A'
                                ? 'dsh'
                                : ''
                        "
                        >{{
                            item.inStockStatus == 'DC_WMS_IN_STATUS_C'
                                ? '已审核'
                                : item.inStockStatus == 'DC_WMS_IN_STATUS_A'
                                ? '待审核'
                                : '已完成'
                        }}</text
                    >
                </view>

                <view class="cell">
                    <text class="label">处理人</text>
                    <text class="value"> <dc-view :value="item.processingPersonnel" objectName="user" /></text>
                </view>
                <view class="cell">
                    <text class="label">登记时间</text>
                    <text class="value">{{ item.createTime }}</text>
                </view>

                <view class="cell" style="margin-bottom: 10rpx">
                    <text class="label">备注</text>
                    <text class="value">{{ item.remark }}</text>
                </view>

                <u-line class="u-line" direction="col"></u-line>
            </view>
        </u-card>
    </view>
</template>
<script>
import useCache from '@/components/dc/utils/cache.js';
import { userList } from '@/api/application';
export default {
    name: 'wf-card',
    props: {
        list: {
            type: Array,
        },
        showBtn: {
            default: false,
        },
        type: Number,
    },
    data() {
        return {
            show: false,
            form: {},
            task: {},
            pass: false,
            useCacheData: {},
        };
    },

    async created() {
        const data = await useCache([{ key: 'DC_WMS_IN_TYPE' }, { key: 'DC_WMS_IN_STATUS' }]);
        this.useCacheData = data;
        console.log(this.useCacheData.DC_WMS_IN_STATUS);
    },
    methods: {
        getUserList(id) {
            let that = this;
            userList([id + '']).then((res) => {
                console.log('haah1');
                console.log(res.data[0].realName);
                that.detail.processingPersonnel = res.data[0].realName;
            });
        },
        review(value, list) {
            return list && list.find((item) => item.dictKey == value)?.dictValue;
        },

        goURL(id) {
            uni.navigateTo({
                url: `/pages/application/warehousingentry/detail?id=${id}`,
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

.status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 32rpx;
    border-bottom: 1rpx solid #f7eee8;
    margin-bottom: 24rpx;
    font-weight: bold;
    .sleft {
        font-size: 30rpx;
        color: #333333;
    }
    .ysh {
        color: #23c69f !important;
    }
    .dsh {
        color: #1d65f3 !important;
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
        color: #666666;
        width: 150rpx;
    }
    .value {
        color: #333333;
        margin-left: 10rpx;
    }
}

.foot {
    font-size: 28rpx;
    display: flex;
    justify-content: space-evenly;
}
</style>
