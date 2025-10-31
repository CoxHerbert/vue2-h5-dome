<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="确认领料"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <u-tabs :list="tabs" v-model="current" :current="current" @change="handleTabClick" height="70"></u-tabs>

            <search v-show="current === 0" @search="(e) => handleSearch('code', e)" />
            <list v-if="current === 1" @search="(e) => handleSearch('click', e)" />
            <result v-show="current === 2" ref="resultRef" />
        </view>
    </view>
</template>
<script>
import { needHideTitleBar } from '@/utils/utils';
import search from './components/search';
import list from './components/list';
import result from './components/result';

export default {
    name: 'ConfirmMaterial',
    data() {
        return {
            current: 0,
            tabs: [
                {
                    name: '查询条件',
                },
                {
                    name: '待确认单据',
                },
                {
                    name: '结果提示',
                },
            ],
        };
    },
    created() {
        this.showTitleBar = !needHideTitleBar();
    },
    methods: {
        // 点击tab
        handleTabClick(e) {
            this.current = e;
        },
        // 处理查询
        handleSearch(action, data) {
            switch (action) {
                case 'click':
                    this.current = 2;
                    this.$refs.resultRef.getData(data.outStockCode);
                    break;
                case 'code':
                    this.current = 2;
                    this.$refs.resultRef.getData(data);
                    break;
                default:
                    break;
            }
        },
    },
    components: {
        search,
        list,
        result,
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
