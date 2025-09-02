<template>
    <view class="page-body-content">
        <view class="search-container">
            <u-search
                v-model="searchValue"
                placeholder="请输入出库单据编号"
                shape="square"
                :show-action="false"
                :input-style="{
                    borderRadius: 0,
                }"
                @search="doAction('search')"
            ></u-search>
            <u-button type="success" @click="doAction('search')"> <u-icon name="search" size="28" />查询 </u-button>
        </view>
        <div class="footer">
            <u-button type="primary" @click="doAction('scanCode')">
                <u-icon name="scan" size="28" />扫描出库单据编号
            </u-button>
        </div>

        <dc-scan-code ref="scanCodeRef" @confirm="handleScanCode" v-if="show" />
    </view>
</template>
<script>
export default {
    name: 'Search',
    data() {
        return {
            show: false,
            searchValue: null,
        };
    },
    methods: {
        doAction(action) {
            switch (action) {
                case 'search':
                    if (!this.searchValue) return;
                    this.$emit('search', this.searchValue);
                    break;
                case 'scanCode':
                    this.show = true;
                    this.$nextTick(() => {
                        this.$refs.scanCodeRef
                            .open()
                            .then((val) => {
                                if (!val) return;
                                this.searchValue = val;
                                this.handleSearch();
                                this.show = false;
                            })
                            .catch((err) => {
                                this.show = false;
                            });
                    });
                    break;
            }
        },
        // 处理扫码返回结果
        handleScanCode(searchValue) {
            if (!searchValue) return;
            this.searchValue = searchValue;
            this.$emit('search', searchValue);
        },
    },
};
</script>
<style lang="scss" scoped>
.page-body-content {
    .u-btn {
        height: 64rpx;
        border-radius: 0;
    }
    .search-container {
        display: flex;
        align-items: center;
        ::v-deep.u-content {
            border-radius: 0 !important;
        }
    }
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80rpx;
        .u-btn {
            height: 100%;
        }
    }
}
</style>
