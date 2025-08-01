<template>
    <view class="cnt">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="新增入库单"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        >
        </u-navbar>
        <view class="base-wrapper mtop20">
            <view class="title" style="padding-top: 10px">基本信息</view>
            <view class="baseinfo">
                <u-form labelPosition="left" :model="form" ref="uForm">
                    <view class="form-wrapper">
                        <view @click.stop="handleSelect('warehouseRef')">
                            <u-form-item label="仓库" prop="warehouseName" required :label-width="labelWidth || 160">
                                <view slot="right" class="input-right">
                                    <view
                                        class="label"
                                        :style="{ color: form.warehouseName ? 'rgb(51 51 51)' : '#c8c9cc' }"
                                        >{{ form.warehouseName ? form.warehouseName : '请选择仓库' }}</view
                                    >
                                    <u-icon name="search"></u-icon>
                                </view>
                            </u-form-item>
                        </view>
                        <u-form-item label="入库类型" :label-width="labelWidth || 160">
                            <u-input
                                readonly
                                v-model="form.inTypeName"
                                inputAlign="right"
                                :disabled="true"
                                placeholder="请选择仓库"
                            />
                        </u-form-item>
                        <view @click.stop="handleSelect('inStocknumberRef')">
                            <u-form-item
                                label="来源单号"
                                required
                                prop="inStockNumber"
                                :label-width="labelWidth || 160"
                            >
                                <view slot="right" class="input-right">
                                    <view
                                        class="label"
                                        :style="{ color: form.inStockNumber ? 'rgb(51 51 51)' : '#c8c9cc' }"
                                        >{{ form.inStockNumber ? form.inStockNumber : '请选择仓库' }}</view
                                    >
                                    <u-icon name="search"></u-icon>
                                </view>
                            </u-form-item>
                        </view>
                        <u-form-item label="申请人" prop="applicantId" :label-width="labelWidth || 160">
                            <view slot="right" style="color: #333; font-size: 28rpx">
                                <dc-view :value="form.applicantId" objectName="user" />
                            </view>
                        </u-form-item>

                        <u-form-item label="处理人" prop="processingPersonnel" :label-width="labelWidth || 160">
                            <view slot="right" style="color: #333; font-size: 28rpx">
                                <dc-view :value="form.processingPersonnel" objectName="user" />
                            </view>
                        </u-form-item>
                    </view>
                </u-form>
            </view>
        </view>
        <view class="title detail-title">入库明细</view>
        <view class="base-wrapper">
            <view class="baseinfo">
                <view class="cell">
                    <text class="label">物料编号</text>
                    <text class="value"> {{ detail.productCode }}</text>
                </view>
                <view class="cell">
                    <text class="label">物料名称</text>
                    <text class="value">
                        {{ detail.productName }}
                    </text>
                </view>
                <view class="cell">
                    <text class="label">规格型号</text>
                    <text class="value">{{ detail.productSpec }}</text>
                </view>
                <view class="cell">
                    <text class="label">数量</text>
                    <text class="value">
                        {{ detail.productQty }}
                    </text>
                </view>
                <view class="cell">
                    <text class="label">单位</text>
                    <text class="value">{{ detail.productUnit }}</text>
                </view>
                <view class="cell">
                    <text class="label">仓位编号</text>
                    <text class="value">{{ detail.locationId }}</text>
                </view>
                <view class="edite-btn" v-if="form.warehouseId && detail" @click.stop="handleSelect('locationIdRef')"
                    >仓位选择</view
                >
            </view>
        </view>

        <view class="foot">
            <view class="pass" @click.stop="add()">保存</view>
        </view>
        <!-- 仓库选择 -->
        <selectDialog
            :config="cacheData.warehouse"
            :params="{ siteWarehouse: true }"
            @onConfirm="(e) => selectonConfirm(e, 'warehouse')"
            ref="warehouseRef"
        />

        <!-- 来源单号选择 -->
        <InStocknumberDialog
            :config="cacheData.inStockNumber"
            @onConfirm="(e) => selectonConfirm(e, 'inStockNumber')"
            ref="inStocknumberRef"
        />

        <!-- 仓位选择 -->
        <selectDialog
            :key="form.warehouseId"
            :config="cacheData.locationId"
            :params="{ warehouseId: form.warehouseId }"
            @onConfirm="(e) => selectonConfirm(e, 'locationId')"
            ref="locationIdRef"
        />
    </view>
</template>
<script>
import useCache from '@/components/dc/utils/cache.js';
import { detailByInStockNumber, inventoryAdd } from '@/api/application';
import selectDialog from './com/selectDialog.vue';
import InStocknumberDialog from './com/inStocknumberDialog.vue';
import cacheData from '@/components/dc/constant/cacheData';
import { needHideTitleBar } from '@/utils/utils';
export default {
    name: 'wf-card',
    components: {
        selectDialog,
        InStocknumberDialog,
    },
    data() {
        return {
            showTitleBar: true,
            cacheData: cacheData,
            labelWidth: 160,
            show: true,
            useCacheData: {},
            detail: {},
            loginInfo: this.$store.getters.loginInfo || uni.getStorageSync('loginInfo') || {},
            form: {
                inTypeName: '现场入库', //显示
                inType: 'DC_WMS_IN_TYPE_ON_SITE_STORAGE',
                warehouseId: null,
                warehouseName: null,
                applicantId: null,
            },
        };
    },

    async created() {
        this.showTitleBar = !needHideTitleBar();
        const data = await useCache([{ key: 'DC_WMS_IN_TYPE' }, { key: 'DC_WMS_IN_STATUS' }]);
        this.useCacheData = data;
        this.form.applicantId = this.loginInfo.user_id;
    },
    methods: {
        // 打开仓库
        handleSelect(refname) {
            console.log(refname);
            if (refname == 'inStocknumberRef') {
                this.$refs.inStocknumberRef.visible = true;
            } else if (refname == 'warehouseRef') {
                this.$refs.warehouseRef.visible = true;
            } else if (refname == 'locationIdRef') {
                this.$refs.locationIdRef.visible = true;
            }
        },

        // 弹框选择
        selectonConfirm(e, name) {
            console.log(e);
            if (name == 'warehouse') {
                this.form.warehouseId = e.id;
                this.form.warehouseName = e.warehouseName;
                this.form.processingPersonnel = e.warehouseSupervisor;
            } else if (name == 'inStockNumber') {
                this.$set(this.form, 'inStockNumber', e.FBILLNO);
                this.getDetail(e.FBILLNO);
            } else if (name == 'locationId') {
                console.log(e);
                this.$set(this.detail, 'locationId', e.id);
            }
            this.$forceUpdate();
        },

        //  保存
        add() {
            let that = this;
            if (!this.form.warehouseId) {
                uni.showToast({
                    title: '请选择仓库',
                    icon: 'none',
                });
                return;
            }
            if (!this.form.inStockNumber) {
                uni.showToast({
                    title: '请选择来源单号',
                    icon: 'none',
                });
                return;
            }
            uni.showModal({
                title: '提示',
                content: '确认入库保存吗',
                confirmColor: '#fff',
                success: function (res) {
                    if (res.confirm) {
                        that.detail.warehouseId = that.form.warehouseId;
                        let data = {
                            ...that.form,
                            detailList: [that.detail],
                        };
                        inventoryAdd(data)
                            .then((res) => {
                                uni.showToast({
                                    title: '入库成功',
                                    icon: 'none',
                                });
                                setTimeout(() => {
                                    uni.navigateBack({
                                        delta: 1, // 返回的页面数，默认为1
                                        success: () => {
                                            // 通过路由参数传递刷新标志
                                            uni.$emit('refreshData', true);
                                        },
                                    });
                                }, 1000);
                            })
                            .catch((error) => {
                                uni.showToast({
                                    title: '系统异常',
                                    icon: 'error',
                                });
                            });
                    }
                },
            });
        },

        // 获取详情
        getDetail(sourceId) {
            detailByInStockNumber({
                type: 'DC_WMS_IN_TYPE_ON_SITE_STORAGE',
                sourceId: sourceId,
            }).then((res) => {
                this.detail = res.data[0] || {};
            });
        },
        review(value, list) {
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
        line-height: 30rpx;
        margin-bottom: 32rpx;
    }
    .dicview {
    }
    .u-form {
        margin-top: -40rpx;
    }
    .detail-title {
        padding: 40rpx 30rpx 0rpx;
    }
    .mtop20 {
        margin-top: 20rpx;
    }

    .base-wrapper {
        padding: 0rpx 26rpx;
        box-sizing: border-box;
        .baseinfo {
            padding: 32rpx 24rpx;
            box-sizing: border-box;
            border-radius: 20rpx;
            background-color: #fff;
            position: relative;
            .edite-btn {
                color: #fff;
                font-weight: 500;
                font-size: 28rpx;
                padding: 0px 26rpx;
                height: 48rpx;
                line-height: 48rpx;
                background: #f78431;
                border-radius: 24rpx 24rpx 24rpx 24rpx;
                text-align: center;
                position: absolute;
                bottom: 22rpx;
                right: 18rpx;
            }
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
    margin-top: 24rpx;
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

.input-right {
    display: flex;
    align-items: center;
    .label {
        margin-right: 10rpx;
        font-size: 28rpx;
    }
}
</style>
