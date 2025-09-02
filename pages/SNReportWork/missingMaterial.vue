<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="缺料明细"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <u-table font-size="24" class="table">
                <u-tr>
                    <u-th width="10%">序号</u-th>
                    <u-th width="25%">物料编码</u-th>
                    <u-th>物料名称</u-th>
                    <u-th>库存/需求</u-th>
                    <u-th>预计交货日</u-th>
                </u-tr>
                <u-tr v-for="(item, index) in dataList" :key="index">
                    <u-td width="10%">{{ index + 1 }}</u-td>
                    <u-td width="25%">{{ item.materialCode || '-' }}</u-td>
                    <u-td>{{ item.materialName || '-' }}</u-td>
                    <u-td>{{ item.completeQty }}/{{ item.qty }}</u-td>
                    <u-td>{{ item.deliveryDate || '-' }}</u-td>
                </u-tr>
            </u-table>
        </view>
    </view>
</template>
<script>
import Api from '@/api/index';
import { needHideTitleBar } from '@/utils/utils';

export default {
    name: 'MissingMaterial',
    data() {
        return { billNumber: null, dataList: [] };
    },
    created() {
        this.showTitleBar = !needHideTitleBar();
    },
    onLoad({ billNumber }) {
        this.billNumber = billNumber;
        this.getData();
    },
    methods: {
        getData() {
            Api.mps.workSchedule
                .getMaterialInfo({ billNumber: this.billNumber })
                .then((res) => {
                    const { code, data } = res;
                    if (code === 200) {
                        this.dataList = data;
                    }
                })
                .catch((error) => {});
        },
    },
};
</script>
<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    .page-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        .table {
            position: relative;
            height: 100%;
            overflow: auto;
        }
        .u-td {
            height: unset;
        }
    }
}
</style>
