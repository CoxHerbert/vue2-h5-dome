<template>
    <view class="content-wrap">
        <dc-pagination v-bind="options" @update="updateData">
            <template #default="{ item }">
                <view @click="handleSearch(item)">
                    <view class="card-head">
                        <view class="head-title">
                            {{ item.outStockCode || '-' }}
                        </view>
                        <dc-dict-key :options="dicts.DC_WMS_OUT_TYPE_WMS" :value="item.outStockType" />
                    </view>
                    <view class="card-content">
                        <dc-field label="申请人">
                            <dc-view objectName="user" :value="item.applicantId"></dc-view>
                        </dc-field>
                        <dc-field label="处理人">
                            <dc-view objectName="user" :value="item.processingPersonnel"></dc-view>
                        </dc-field>
                        <dc-field label="登记时间">{{ item.createTime || '-' }}</dc-field>
                        <u-icon class="arrow-right" name="arrow-right" color="#2979ff" size="28"></u-icon>
                    </view>
                </view>
            </template>
        </dc-pagination>
    </view>
</template>
<script>
import Api from '@/api/index';
import useCache from '@/components/dc/utils/cache.js';

export default {
    name: 'List',
    data() {
        return {
            dicts: {},
            options: {
                request: Api.wms.wmsOutStock.list,
                pageSize: 10,
                params: {
                    // applicantId: this.$store.getters.userInfo.id,
                    outStockStatus: 'DC_WMS_OUT_STATUS_MPC',
                },
            },
        };
    },
    async created() {
        this.dicts = await useCache([{ key: 'DC_WMS_OUT_TYPE_WMS' }]);
    },
    methods: {
        handleSearch(order) {
            this.$emit('search', order);
        },
        updateData(list) {
            console.log('list', list);
        },
    },
};
</script>
<style lang="scss" scoped>
.content-wrap {
    overflow: auto;

    .card-head {
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .head-title {
            font-weight: bold;
            font-size: 32rpx;
        }
    }
    .card-content {
        position: relative;
        padding: 0 20rpx 20rpx 20rpx;
        .arrow-right {
            position: absolute;
            margin-top: -16rpx;
            right: 20rpx;
            top: 50%;
        }
    }
}
</style>
