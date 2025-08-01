<template>
    <view class="container">
        <!--   <u-navbar
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="自助出库"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        >
            <view slot="right">
                <view class="add-btn" @click="doAction('scanCode')"> <u-icon size="34" name="scan"></u-icon>扫码</view>
               
            </view>
        </u-navbar> -->
        <dc-drag-button @click="doAction('scanCode')" :bottom="400">
            <u-icon size="34" name="scan"></u-icon
        ></dc-drag-button>
        <view class="contWarp">
            <view class="base-wrapper1">
                <!-- <view class="title" style="padding-top: 10px">基本信息</view> -->
                <view class="baseinfo">
                    <u-form labelPosition="left" :model="form" ref="uForm">
                        <view class="form-wrapper">
                            <view @click.stop="handleSelect('warehouseRef')">
                                <u-form-item label="仓库" prop="warehouseName" required :label-width="160">
                                    <view slot="right" class="input-right">
                                        <view
                                            class="label"
                                            :style="{ color: form.warehouseName ? 'rgb(51 51 51)' : '#c8c9cc' }"
                                        >
                                            {{ form.warehouseName ? form.warehouseName : '请选择仓库' }}
                                        </view>
                                        <u-icon name="search"></u-icon>
                                    </view>
                                </u-form-item>
                            </view>
                            <view @click.stop="handleSelect('selectOutRef')">
                                <u-form-item label="出库类型" required :label-width="160">
                                    <!-- <u-input readonly v-model="form.inTypeName" inputAlign="right" :disabled="true"
									placeholder="请选择仓库" /> -->
                                    <view slot="right" class="input-right">
                                        <view
                                            class="label"
                                            :style="{ color: form.inTypeName ? 'rgb(51 51 51)' : '#c8c9cc' }"
                                        >
                                            {{ form.inTypeName ? form.inTypeName : '请选择仓库' }}
                                        </view>
                                        <u-icon name="search"></u-icon>
                                    </view>
                                </u-form-item>
                            </view>
                            <view @click.stop="handleSelect('inStocknumberRef')">
                                <u-form-item label="来源单号" :label-width="160">
                                    <u-input
                                        readonly
                                        v-model="barcode.mtoNo"
                                        height="0"
                                        inputAlign="right"
                                        placeholder="自动填充 不需要手写"
                                        :disabled="true"
                                    />
                                </u-form-item>
                            </view>
                        </view>
                    </u-form>
                </view>
            </view>
            <view v-if="productList.length > 0">
                <CardList :list="productList"></CardList>
            </view>

            <wf-empty v-else text="暂无数据"></wf-empty>
        </view>
        <view class="foot">
            <view class="pass" @click.stop="sumbitData()">提交</view>
        </view>
        <u-select
            v-model="showSelect"
            :list="useCacheData.DC_WMS_OUT_TYPE_WMS"
            value-name="dictKey"
            label-name="dictValue"
            @confirm="confirm"
        ></u-select>

        <!-- 仓位选择 -->
        <selectDialog
            :key="form.warehouseId"
            :config="cacheData.warehouseOut"
            :params="{ warehouseId: form.warehouseId }"
            @onConfirm="(e) => selectonConfirm(e, 'warehouse')"
            ref="warehouseRef"
        />

        <dc-scan-code ref="scanCodeRef" @confirm="handleScanCode" v-if="show" />
        <!-- 右侧弹框 -->
        <RightPopupSelect
            :visible="showPopup"
            :list-data="propproductList"
            title="请选择"
            :showFooter="false"
            @close="showPopup = false"
            @select="handleSelectproduct"
        >
            <!-- 自定义列表项内容（可选） -->
            <template #default="{ item }">
                <view class="custom-item">
                    <text class="city-name">{{ item.name }}</text>
                    <text class="city-code">库位ID：{{ item.locationId }}</text>
                    <text class="city-code">料品名称：{{ item.productName }}</text>
                    <text class="city-code">产品数量：{{ item.productQty }}</text>
                    <text class="city-code">料品编码：{{ item.productCode }}</text>
                </view>
            </template>
        </RightPopupSelect>
    </view>
</template>

<script>
import useCache from '@/components/dc/utils/cache.js';
import cacheData from '@/components/dc/constant/cacheData';
import selectDialog from '../warehousingentry/com/selectDialog.vue';
import CardList from './components/CardList.vue';
import RightPopupSelect from './components/RightPopupSelect.vue';
import Api from '@/api';
export default {
    components: {
        selectDialog,
        CardList,
        RightPopupSelect,
    },
    data() {
        return {
            productList: [],
            showTitleBar: false,
            showPopup: false,
            show: false,
            showSelect: false,
            snCode: '',
            cacheData: cacheData,
            useCacheData: {},
            form: {
                inTypeName: '', //显示
                outStockType: '', //显示
                warehouseId: null,
                warehouseName: null,
                applicantId: null,
            },
            barcode: {
                warehouseId: null,
                locationId: null,
                productName: null,
                productCode: null,
                mtoNo: null,
            },
            useCacheData: {},
            propproductList: [],
            outtypewms: [],
        };
    },
    async created() {
        // 等待数据加载完成
        const data = await useCache([
            {
                key: 'DC_WMS_OUT_TYPE_WMS',
            },
        ]);
        this.useCacheData = data;
    },
    onShow() {
        // this.handleSearch();
    },
    methods: {
        indeCode() {
            Api.wms.warehouse.codetogetdetails(this.barcode).then((res) => {
                const { code, data } = res;
                if (code == 200) {
                    console.log(data);
                    if (data.length == 1) {
                        this.productList.push(...data);
                    } else {
                        this.showPopup = true;
                        this.propproductList = data;
                    }
                    // (this.productList = data),
                    // 原始数组会被修改，因为直接操作了数组元素的属性
                    // this.productList.forEach((item) => {
                    //     item.maxValue = item.productQty;
                    // });
                    // console.log(this.productList);
                }
            });
        },
        handleSelectproduct({ item }) {
            console.log(item);

            // 判断 productList 数组中是否存在与 item 相同 locationId 的元素
            const isDuplicate = this.productList.some((product) => product.locationId === item.locationId);
            if (!isDuplicate) {
                this.productList.push(item);
            } else {
                uni.showToast({
                    title: '当前仓位已存在',
                    icon: 'error',
                    duration: 2000,
                    mask: true,
                });
            }
            this.showPopup = false;
        },
        confirm(e) {
            console.log(e);
            this.form.inTypeName = e[0].label;
            this.form.outStockType = e[0].value;
        },
        // 打开仓库
        handleSelect(refname) {
            console.log(refname);
            if (refname == 'warehouseRef') {
                this.$refs.warehouseRef.visible = true;
            } else if (refname == 'selectOutRef') {
                this.showSelect = true;
            }
        },
        // 弹框选择
        selectonConfirm(e, name) {
            console.log(e);
            if (name == 'warehouse') {
                this.barcode.warehouseId = e.id;
                this.form.warehouseName = e.warehouseName;
                this.form.warehouseId = e.id;
                this.form.processingPersonnel = e.warehouseSupervisor;
                console.log(this.form);
                // this.indeCode();
            }
            this.$forceUpdate();
        },
        scanCode() {
            this.show = true;
            this.$nextTick(() => {
                this.$refs.scanCodeRef
                    .open()
                    .then((val) => {
                        if (!val) return;
                        this.snCode = val;
                        this.handleSearch();
                        this.show = false;
                    })
                    .catch((err) => {
                        this.show = false;
                    });
            });
        },
        handleScanCode(snCode) {
            if (!snCode) return;
            this.snCode = snCode;
            this.handleSearch();
        },
        handleSearch() {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            Api.wms.warehouse
                .analyzebarcode({
                    barcode: this.snCode || '-1709897146',
                    barcodeType: 'wire-rod',
                })
                .then((res) => {
                    uni.hideLoading();
                    const { code, data } = res;
                    if (code === 200) {
                        this.barcode.productName = data.productName;
                        this.barcode.locationId = data.locationId;
                        this.barcode.productCode = data.productCode;
                        if (!this.barcode.mtoNo) {
                            this.barcode.mtoNo = data.mtoNo;
                            this.indeCode();
                        } else if (data.mtoNo == this.barcode.mtoNo) {
                            this.barcode.mtoNo = data.mtoNo;
                            this.indeCode();
                        } else {
                            uni.showModal({
                                title: '提示',
                                content: '当前专案已改变,是否清空当前选中物料并领出新专案物料？',
                                confirmText: '确认',
                                cancelText: '取消',
                                success: (res) => {
                                    if (res.confirm) {
                                        console.log('用户点击确认');
                                        this.barcode.mtoNo = data.mtoNo;
                                        this.propproductList = [];
                                        this.productList = [];
                                        this.indeCode();
                                        // 执行确认后的逻辑
                                    } else if (res.cancel) {
                                        console.log('用户点击取消');
                                    }
                                },
                            });
                        }

                        // this.indeCode();
                    }
                })
                .catch(() => {
                    uni.hideLoading();
                });
        },
        doAction(type) {
            if (!this.form.warehouseName) {
                uni.showToast({
                    title: '请选择仓库',
                    icon: 'error', // 可选 'success'、'loading'、'none'
                    duration: 2000, // 提示持续时间，单位毫秒
                    mask: true, // 是否显示透明蒙层，防止触摸穿透
                });
                return;
            }
            if (type == 'scanCode') {
                this.scanCode();
            }
        },
        sumbitSureData() {
            // console.log(this.productList)
            // return
            // return
            let params = {
                mtono: this.barcode.mtoNo,
                warehouseId: this.form.warehouseId,
                outStockType: this.form.outStockType,
                detailList: this.productList,
            };
            Api.wms.warehouse.autooutstock(params).then((res) => {
                const { code, data } = res;
                if (code == 200) {
                    this.propproductList = [];
                    this.productList = [];
                    uni.showToast({
                        title: '操作成功',
                        icon: 'success', // 可选 'success'、'loading'、'none'
                        duration: 2000, // 提示持续时间，单位毫秒
                        mask: true, // 是否显示透明蒙层，防止触摸穿透
                    });
                }
            });
        },
        sumbitData() {
            if (!this.form.warehouseName) {
                uni.showToast({
                    title: '请选择仓库',
                    icon: 'error', // 可选 'success'、'loading'、'none'
                    duration: 2000, // 提示持续时间，单位毫秒
                    mask: true, // 是否显示透明蒙层，防止触摸穿透
                });
                return;
            }
            if (!this.form.inTypeName) {
                uni.showToast({
                    title: '请选择出库类型',
                    icon: 'error', // 可选 'success'、'loading'、'none'
                    duration: 2000, // 提示持续时间，单位毫秒
                    mask: true, // 是否显示透明蒙层，防止触摸穿透
                });
                return;
            }
            if (!this.productList.length > 0) {
                uni.showToast({
                    title: '没有列表要提交',
                    icon: 'error', // 可选 'success'、'loading'、'none'
                    duration: 2000, // 提示持续时间，单位毫秒
                    mask: true, // 是否显示透明蒙层，防止触摸穿透
                });
                return;
            }
            uni.showModal({
                title: '提示',
                content: '确认要执行此操作吗？',
                confirmText: '确认',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        console.log('用户点击确认');
                        this.sumbitSureData();
                        // 执行确认后的逻辑
                    } else if (res.cancel) {
                        console.log('用户点击取消');
                    }
                },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
page {
    background: #f6f6f6;
}

.container {
    padding-top: 20rpx;
    box-sizing: border-box;
    background: linear-gradient(180deg, #d2dff7 0%, rgba(255, 255, 255, 0) 100%) !important;

    ::v-deep.u-content {
        border-radius: 24rpx !important;
        height: 72rpx !important;
    }

    ::v-deep.u-form-item {
        display: flex;
        flex-direction: row;
        padding: 10px 0;
        font-size: 13px;
        color: #303133;
        box-sizing: border-box;
        line-height: 0px;
        flex-direction: column;
    }

    .add-btn {
        font-size: 30rpx;
        color: #666666;
        margin-right: 24rpx;
        display: flex;
        align-items: center;
    }
}

.base-wrapper1 {
    // padding: 0rpx 26rpx;
    // box-sizing: border-box;
    .baseinfo {
        padding: 0rpx 24rpx;
        box-sizing: border-box;
        // border-radius: 20rpx;
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

.input-right {
    display: flex;
    align-items: center;

    .label {
        margin-right: 10rpx;
        font-size: 28rpx;
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
        background: #007aff;
        color: #fff;
    }
}
</style>
