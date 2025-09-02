<template>
    <view class="cnt">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="入库详情"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        >
        </u-navbar>
        <view class="base-wrapper">
            <view class="title">基本信息</view>
            <view class="baseinfo">
                <view class="cell">
                    <text class="label">仓库名称</text>
                    <text class="value"> <dc-view :value="detail.warehouseId" objectName="warehouse" /></text>
                </view>
                <view class="cell">
                    <text class="label">入库类型</text>
                    <text class="value">
                        <dc-dict-key :options="useCacheData.DC_WMS_IN_TYPE_SCM" :value="detail.inType" />
                    </text>
                </view>
                <view class="cell">
                    <text class="label">来源单号</text>
                    <text class="value">{{ detail.inStockNumber }}</text>
                </view>
                <view class="cell">
                    <text class="label">状态</text>
                    <text class="value">
                        {{
                            detail.inStockStatus == 'DC_WMS_IN_STATUS_C'
                                ? '已审核'
                                : detail.inStockStatus == 'DC_WMS_IN_STATUS_A'
                                ? '待审核'
                                : '已完成'
                        }}
                    </text>
                </view>
                <view class="cell">
                    <text class="label">入库单号</text>
                    <text class="value">{{ detail.inStockCode }}</text>
                </view>
                <view class="cell">
                    <text class="label">申请人</text>
                    <text class="value"
                        ><dc-view :key="Math.random()" :value="detail.applicantId" objectName="user"
                    /></text>
                </view>
                <view class="cell">
                    <text class="label">处理人</text>
                    <text class="value">
                        <dc-view :key="Math.random()" :value="detail.processingPersonnel" objectName="user" />
                    </text>
                </view>
                <view class="cell">
                    <text class="label">登记时间</text>
                    <text class="value">{{ detail.createTime }}</text>
                </view>

                <view class="cell" style="margin-bottom: 10rpx">
                    <text class="label">备注</text>
                    <text class="value">{{ detail.remark || '-' }}</text>
                </view>
            </view>
        </view>
        <view class="title detail-title">入库明细</view>
        <u-card
            v-for="(item, index) in detail.detailList"
            :key="index"
            :border="false"
            :show-head="false"
            :head-border-bottom="false"
            margin="20rpx 30rpx 30rpx"
        >
            <view slot="body" @click="dynamicRoute(item, 'detail')">
                <view class="cell">
                    <text class="label">物料编号</text>
                    <text class="value"> {{ item.productCode }}</text>
                </view>
                <view class="cell">
                    <text class="label">物料名称</text>
                    <text class="value">
                        {{ item.productName }}
                    </text>
                </view>
                <view class="cell">
                    <text class="label">规格型号</text>
                    <text class="value">{{ item.productSpec }}</text>
                </view>
                <view class="cell">
                    <text class="label">数量</text>
                    <text class="value">
                        {{ item.productQty }}
                    </text>
                </view>
                <view class="cell">
                    <text class="label">单位</text>
                    <text class="value">{{ item.productUnit }}</text>
                </view>
                <view class="cell">
                    <text class="label">仓位编号</text>
                    <text class="value"><dc-view :value="item.locationId" objectName="warehouseLocation" /> </text>
                </view>

                <u-line class="u-line" direction="col"></u-line>
            </view>
        </u-card>
        <view class="foot" v-if="detail.inStockStatus == 'DC_WMS_IN_STATUS_A'">
            <view class="reject" @click.stop="pass('reject')">拒绝</view>
            <view class="pass" @click.stop="pass('pass')">审核通过</view>
        </view>
    </view>
</template>
<script>
import useCache from '@/components/dc/utils/cache.js';
import { inventoryDetail, inventoryAudit, inventoryAuditReject } from '@/api/application';
import { needHideTitleBar } from '@/utils/utils';
export default {
    name: 'wf-card',
    data() {
        return {
            showTitleBar: true,
            show: true,
            useCacheData: {},
            detail: {},
        };
    },

    onLoad(options) {
        this.getDetail(options.id);
    },

    async created() {
        this.showTitleBar = !needHideTitleBar();
        const data = await useCache([{ key: 'DC_WMS_IN_TYPE_SCM' }, { key: 'DC_WMS_IN_STATUS' }]);
        this.useCacheData = data;
    },
    methods: {
        // 审核
        pass(type) {
            let that = this;
            uni.showModal({
                title: '提示',
                content: type == 'pass' ? '确认通过吗' : '确定驳回吗',
                confirmColor: '#fff',
                success: function (res) {
                    if (res.confirm) {
                        let Fn = type == 'pass' ? inventoryAudit : inventoryAuditReject;
                        Fn({
                            ...that.detail,
                        })
                            .then((res) => {
                                uni.showToast({
                                    title: type == 'pass' ? '审核通过' : '驳回成功',
                                    icon: 'none',
                                });
                                that.getDetail(that.detail.id);
                            })
                            .catch((error) => {
                                that.getDetail(that.detail.id);
                            });
                    }
                },
            });
        },

        // 获取详情
        getDetail(id) {
            inventoryDetail({
                id: id,
            }).then((res) => {
                this.detail = res.data;
            });
        },
        review(value, list) {
            console.log(list);
            if (!value) {
                return false;
            }
            return list.find((item) => item.dictKey == value)?.dictValue;
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
        margin-bottom: 16rpx;
    }
    .detail-title {
        padding: 20rpx 30rpx 4rpx;
    }

    .base-wrapper {
        padding: 20rpx 26rpx 0px;
        box-sizing: border-box;
        .baseinfo {
            padding: 20rpx;
            box-sizing: border-box;
            border-radius: 20rpx;
            background-color: #fff;
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
    margin-top: 20rpx;
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
    .line {
        color: #efefef;
    }
    .reject {
        color: #4b9eff;
        width: 288rpx;
        height: 80rpx;
        line-height: 80rpx;
        background: rgba(247, 132, 49, 0.1);
        border: 2rpx solid #f784;
        color: #f78431;
        margin-right: 20rpx;
        border-radius: 8rpx;
    }
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
</style>
