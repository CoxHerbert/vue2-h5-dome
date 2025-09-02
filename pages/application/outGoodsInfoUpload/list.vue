<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="出货资料"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="search-container">
            <u-search
                v-model="queryParams.code"
                placeholder="请输入出库单据编号"
                shape="square"
                :show-action="false"
                :input-style="{
                    borderRadius: 0,
                }"
                @search="doAction('search')"
            ></u-search>
            <u-button type="success" @click="doAction('search')"> <u-icon name="search" size="28" />查询</u-button>
            <u-button type="primary" @click="doAction('scanCode')"> <u-icon name="scan" size="28" />扫码</u-button>
        </view>
        <u-tabs
            :list="tabList"
            :current="current"
            bg-color="transparent"
            active-color="#F78431"
            inactive-color="#333333"
            @change="handleTabClick"
        ></u-tabs>
        <view class="page-body">
            <template v-if="currentList.length">
                <view
                    v-for="(item, index) in currentList"
                    :key="index"
                    class="card-wrap"
                    @click="doAction('jump', item)"
                >
                    <view class="index"> #{{ index + 1 }}</view>
                    <dc-field class="field" v-for="(col, index) in columns" :label="col.label" :key="index">
                        {{ item[col.prop] }}
                    </dc-field>
                </view>
            </template>

            <wf-empty v-else text="暂无数据"></wf-empty>
        </view>
        <dc-scan-code ref="scanCodeRef" v-if="show" />
    </view>
</template>
<script>
import Api from '@/api/index';
import pageList from '@/mixins/page-list';
import options from './list';

export default {
    mixins: [pageList],
    name: 'OutGoodsInfoUpload',
    data() {
        return {
            show: false,
            columns: options().columns,
            queryParams: {
                code: null,
            },
            list: [],
            current: 0,
            tabList: [
                { name: '未处理', isProcess: false },
                { name: '已处理', isProcess: true },
            ],
        };
    },
    computed: {
        currentList() {
            return this.list.filter((item) => item.isProcess === this.tabList[this.current].isProcess);
        },
    },
    onShow() {
        if (this.queryParams.code) this.getData();
    },
    methods: {
        // 获取明细
        getData() {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            Api.scm.ship
                .getOptDetail(this.queryParams)
                .then((res) => {
                    if (res.code === 200) {
                        this.list = res.data.dcScmShipItemList;
                    }
                    uni.hideLoading();
                })
                .catch((err) => {
                    console.log(err);
                    uni.hideLoading();
                });
        },
        doAction(action, row) {
            if (action === 'jump') {
                uni.navigateTo({ url: `/pages/application/outGoodsInfoUpload/submit?id=${row.id}` });
            } else if (action === 'search') {
                this.getData();
            } else if (action === 'scanCode') {
                this.show = true;
                this.$nextTick(() => {
                    this.$refs.scanCodeRef
                        .open()
                        .then((val) => {
                            if (!val) return;
                            this.queryParams.code = val;
                            this.getData();
                            this.show = false;
                        })
                        .catch((err) => {
                            this.show = false;
                        });
                });
            } else if (action === 'submit') {
                this.submit();
            }
        },
        handleTabClick(index, request = true) {
            this.current = index;
            if (request) this.getList(true);
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
    .search-container {
        display: flex;
        align-items: center;
        ::v-deep.u-content {
            border-radius: 0 !important;
        }
        .u-btn {
            height: 64rpx;
            border-radius: 0;
        }
    }
    .page-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;

        .card-wrap {
            padding: 20rpx;
            border-radius: 16rpx;
            background: #fff;
            margin: 24rpx;
            box-shadow: #ccc 5rpx 2rpx 8rpx 8rpx;
            .index {
                font-weight: 600;
                font-size: 32rpx;
            }
            .field {
                display: flex;
                align-items: center;
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
}
</style>
