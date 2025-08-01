<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="线材质检"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <dc-pagination v-bind="paginationProps">
                <template #default="{ item, index }">
                    <view class="index"> #{{ index + 1 }}</view>
                    <view class="field">
                        <dc-field v-for="(col, j) in columns" :label="col.label" :key="j">
                            {{ item[col.prop] || '-' }}
                        </dc-field>
                    </view>
                </template>
            </dc-pagination>
        </view>
        <dc-drag-button @click="doAction('add')">+</dc-drag-button>
    </view>
</template>
<script>
import Api from '@/api/index';
import page from '@/mixins/page';
import list from './list';

export default {
    mixins: [page],
    name: 'SNReportWork',
    data() {
        return {
            columns: list().columns,
            paginationProps: {
                request: Api.mps.wireQc.list,
                pageSize: 5,
            },
            dataList: [],
        };
    },
    onLoad() {
        this.getData();
    },
    methods: {
        // 获取专案详情
        getData() {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            Api.mps.wireQc
                .list()
                .then((res) => {
                    if (res.code === 200) {
                        this.dataList = res.data.records;
                    }
                    uni.hideLoading();
                })
                .catch((err) => {
                    console.log(err);
                    uni.hideLoading();
                });
        },
        doAction(action) {
            if (action === 'add') {
                uni.navigateTo({ url: '/pages/application/wireMaterialInspection/submit' });
            }
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
        overflow: auto;
        .index {
            font-weight: 600;
            font-size: 32rpx;
        }
        .field {
            &-label {
                color: #322d2d;
                white-space: nowrap;
            }
            &-value {
                color: #000;
            }
        }
    }
}
</style>
