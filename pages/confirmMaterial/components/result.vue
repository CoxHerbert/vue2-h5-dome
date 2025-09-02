<template>
    <view class="page-body-content">
        <view class="header">
            <u-checkbox v-model="checkedAll">全选</u-checkbox>
            <view class="header-right">
                <dc-tabs v-model="active" :tabs="tabs" />
                <u-button class="scan-qrcode" type="primary" @click="scanCode"
                    ><u-icon name="scan"></u-icon>扫码确认</u-button
                >
            </view>
        </view>
        <div class="content-wrap">
            <view class="card" v-for="(item, index) in pageData.list" :key="index" @click.stop="handleSelect(item)">
                <u-checkbox class="checkbox" v-model="item.checked" :name="item.productName" @click.native.stop>
                </u-checkbox>
                <image
                    v-if="item.checked"
                    class="icon"
                    src="./../../../static/images/confirmMaterial/confirmMaterial.png"
                />
                <view class="card-head">
                    <view class="head-title">
                        {{ item.productName || '-' }}
                    </view>
                </view>
                <view class="card-content">
                    <dc-field label="物料编码">
                        {{ item.productCode || '-' }}
                    </dc-field>
                    <dc-field label="所属专案">
                        {{ item.mtoNo || '-' }}
                    </dc-field>
                    <dc-field label="仓位">
                        {{ item.locationName || '-' }}
                    </dc-field>
                    <dc-field label="需求数量"> {{ item.productQty || '-' }} {{ item.productUnit || '-' }} </dc-field>
                </view>
            </view>
        </div>
        <view class="footer">
            <view class="statistics"> 已完成：{{ pageData.selected || 0 }} / {{ pageData.total || 0 }} </view>
            <view class="submit" @click="confirm"> 提交领取 </view>
        </view>
        <u-modal
            :title="title"
            v-model="show"
            confirm-text="提交"
            :show-cancel-button="true"
            @confirm="submit"
            @cancel="cancel"
        >
            <view class="slot-content">
                <view v-for="(item, index) in pageData.unselected" :key="index"
                    >{{ item.productName }}/{{ item.productCode }}</view
                >
            </view>
        </u-modal>
        <dc-scan-code ref="scanCodeRef" @confirm="confirmScanCode" v-if="showScanCode" />
    </view>
</template>
<script>
import Api from '@/api/index';

export default {
    name: 'List',
    data() {
        return {
            showScanCode: false,
            info: {
                detailList: [],
            },
            checkedAll: false,
            active: 'all',
            tabs: [
                {
                    label: '全部',
                    value: 'all',
                },
                {
                    label: '已选',
                    value: 'selected',
                },
                {
                    label: '未选',
                    value: 'unselected',
                },
            ],
            show: false,
            title: '',
        };
    },
    watch: {
        'info.detailList': {
            handler(newList) {
                // 检查是否所有项都被选中
                const allSelected = newList.length > 0 && newList.every((item) => item.checked);
                this.checkedAll = allSelected;
            },
            deep: true, // 启用深度监听
        },
        checkedAll(newVal) {
            // 更新 detailList 中每一项的 selected 状态
            this.info.detailList.forEach((item) => {
                item.checked = newVal;
            });
        },
    },
    computed: {
        pageData() {
            let result = {
                list: this.info.detailList,
                selected: 0,
                total: this.info?.detailList.length || 0,
            };
            if (Array.isArray(this.info.detailList)) {
                const selected = this.info.detailList.filter((item) => item?.checked);
                const unselected = this.info.detailList.filter((item) => !item?.checked);
                result.selected = selected.length;
                result.unselected = unselected;
                switch (this.active) {
                    case 'selected':
                        result.list = selected;
                        break;
                    case 'unselected':
                        result.list = unselected;
                        break;
                }
            }
            return result;
        },
    },
    methods: {
        getData(code) {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            this.info = {
                detailList: [],
            };
            Api.wms.wmsOutStock
                .detailByCode({ code })
                .then((res) => {
                    const { data, code } = res;
                    if (code === 200) {
                        data.detailList = data.detailList.map((item) => {
                            item.checked = false;
                            return item;
                        });
                        this.info = data;
                    }
                    uni.hideLoading();
                })
                .catch(() => {
                    uni.hideLoading();
                });
        },
        scanCode() {
            this.showScanCode = true;
            this.$nextTick(() => {
                this.$refs.scanCodeRef
                    .open()
                    .then((code) => {
                        if (!code) return;
                        this.info.detailList.forEach((item) => {
                            if (item.productCode === code) {
                                item.checked = true;
                            }
                        });
                        this.showScanCode = false;
                    })
                    .catch((err) => {
                        this.showScanCode = false;
                    });
            });
        },
        handleSelect(selectItem) {
            let findItem = this.info.detailList.find((item) => item.id === selectItem.id);
            findItem.checked = !findItem.checked;
        },
        confirm() {
            this.title =
                this.pageData.unselected.length > 0
                    ? '任有未确认领取的物料，请确认是否提交？'
                    : '已全部确认领取，请确认是否提交？';
            this.show = true;
        },
        cancel() {
            this.title = '';
            this.show = false;
        },
        submit() {
            uni.showLoading({
                title: '提交中...',
                mask: true,
            });
            const form = {
                ...this.info,
                detailList: this.info.detailList.filter((item) => item.checked),
            };
            console.log(this.info.detailList.filter((item) => item.checked));
            Api.wms.wmsOutStock
                .audit(form)
                .then((res) => {
                    const { code, msg } = res;
                    if (code === 200) {
                        this.info = {
                            detailList: [],
                        };
                        uni.showToast({
                            title: msg,
                            icon: 'success',
                        });
                    }
                    uni.hideLoading();
                })
                .catch(() => {
                    uni.hideLoading();
                });
        },
        // 处理扫码返回结果
        confirmScanCode(code) {
            if (!code) return;
            this.info.detailList.forEach((item) => {
                if (item.productCode === code) {
                    item.checked = true;
                }
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.page-body-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 20rpx 0 20rpx;
        &-right {
            display: flex;
            align-items: center;
            .scan-qrcode {
                margin-left: 10rpx;
                height: 64rpx;
            }
        }
    }
    .content-wrap {
        display: flex;
        flex-direction: column;
        gap: 20rpx;
        margin: 20rpx;
        flex: 1;
        overflow: auto;
    }
    .card {
        margin-left: 60rpx;
        position: relative;
        border-radius: 12rpx;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background: #fff;
        .checkbox {
            position: absolute;
            top: 50%;
            left: -50rpx;
            margin-top: -10px;
        }
        .icon {
            position: absolute;
            top: 20rpx;
            right: 20rpx;
            width: 128rpx;
            height: 128rpx;
        }
        &-head {
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .head-title {
                font-size: 32rpx;
                font-weight: bold;
            }
        }
        &-content {
            position: relative;
            padding: 0 20rpx 20rpx 20rpx;
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                &.bold {
                    font-weight: bold;
                }
            }
        }
    }
    .footer {
        height: 80rpx;
        display: flex;
        .statistics {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            overflow: hidden;
            background: #fff;
            font-weight: bold;
        }
        .submit {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            overflow: hidden;
            background-color: #f26c0c;
            color: #fff;
        }
    }
    .slot-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: red;
        padding: 20rpx 0;
    }
}
</style>
