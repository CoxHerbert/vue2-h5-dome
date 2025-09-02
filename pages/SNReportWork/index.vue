<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="工时汇报"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <u-tabs :list="tabs" v-model="current" :current="current" @change="handleTabClick" height="70"></u-tabs>
            <view class="search-container">
                <u-search
                    v-model="snCode"
                    placeholder="请输入SN码查询"
                    shape="square"
                    :show-action="false"
                    :input-style="{
                        borderRadius: 0,
                    }"
                    @search="doAction('search')"
                ></u-search>
                <u-button type="success" @click="doAction('search')"> <u-icon name="search" size="28" />查询 </u-button>
                <u-button type="primary" @click="doAction('scanCode')"> <u-icon name="scan" size="28" /> </u-button>
            </view>
            <view class="page-body_scroll">
                <view class="card-list" v-if="current === 0">
                    <view class="card">
                        <view class="card-content">
                            <view class="group group-bold">
                                <view class="info-item">
                                    <view class="info-item-label">专案号：</view>
                                    <view class="info-item-value">{{ planInfo.mtono || '-' }}</view>
                                </view>
                                <view class="info-item">
                                    <view class="info-item-label">物料名称：</view>
                                    <view class="info-item-value">{{ planInfo.materialCode || '-' }}</view>
                                </view>
                                <view class="info-item">
                                    <view class="info-item-label">数量：</view>
                                    <view class="info-item-value">{{ planInfo.qty ? `x${planInfo.qty}` : '-' }}</view>
                                </view>
                            </view>
                        </view>
                    </view>
                    <u-table font-size="24">
                        <u-tr>
                            <u-th>阶段</u-th>
                            <u-th>负责人</u-th>
                            <u-th>结束时间</u-th>
                            <u-th>完成状态</u-th>
                            <u-th>进度</u-th>
                        </u-tr>
                        <u-tr v-for="(item, index) in planInfo.milestones" :key="index">
                            <u-td>{{ item.nodeName || '-' }}</u-td>
                            <u-td>{{ item.personInCharheName || '-' }}</u-td>
                            <u-td>{{ item.endTime || '-' }}</u-td>
                            <u-td
                                :style="{
                                    color: colorEnmu[item.progress],
                                }"
                                >{{ item.progress || '-' }}</u-td
                            >
                            <u-td>
                                <view @click="doAction('jump', item.billNumber)" v-if="item.nodeName === '齐料'">
                                    {{ item.percent ? `${item.percent}%` : '-' }}
                                    <u-icon name="arrow-right-double" color="#2979ff" size="24"></u-icon>
                                </view>
                                <view v-else>{{ item.percent ? `${item.percent}%` : '-' }}</view>
                            </u-td>
                        </u-tr>
                    </u-table>
                </view>
                <view class="card-list" v-if="current === 1">
                    <view class="card" v-for="(item, index) in list" :key="index">
                        <view class="card-head">
                            <view class="card-head-left"> 工艺：{{ item.produceRouteName }} </view>
                            <view class="card-head-right">
                                标记完工：
                                <u-switch v-model="item.isComplete" size="30" />
                            </view>
                        </view>
                        <view class="card-content">
                            <view class="group" v-for="material in item.children" :key="material.id">
                                <view class="group-name">
                                    {{ material.materialName }}
                                </view>
                                <view class="info-item">
                                    <view class="info-item-label">计划单号：</view>
                                    <view class="info-item-value">{{ material.billNumber }}</view>
                                </view>
                                <view class="info-item">
                                    <view class="info-item-label">工时统计：</view>
                                    <view class="info-item-value"
                                        >{{ secondToHour(material.reportWorkingHours) }}/{{
                                            secondToHour(material.processTime)
                                        }}时</view
                                    >
                                </view>
                                <view class="info-item">
                                    <view class="info-item-label">数量工时：</view>
                                    <view class="info-item-value"
                                        >{{ material.reportNumber }}/{{ material.number }}个</view
                                    >
                                </view>
                                <view class="edit">
                                    <view class="info-item">
                                        <view class="info-item-label">工时：</view>
                                        <view class="info-item-value"
                                            ><u-number-box v-model="material.reportHour" :positive-integer="false"
                                        /></view>
                                    </view>
                                    <view class="info-item">
                                        <view class="info-item-label">数量：</view>
                                        <view class="info-item-value"
                                            ><u-number-box
                                                v-model="material.reportQty"
                                                :max="material.number - material.reportNumber"
                                                :disabled="material.reportNumber >= material.number"
                                        /></view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="no-data" v-if="Array.isArray(list) && list.length === 0"> 暂无数据 </view>
                </view>
            </view>
            <view class="page-body_footer">
                <u-button type="success" @click="doAction('submit')" v-if="current === 1">
                    <u-icon name="checkmark" size="28" />提交
                </u-button>
            </view>
        </view>
        <dc-scan-code ref="scanCodeRef" @confirm="handleScanCode" v-if="show" />
    </view>
</template>
<script>
import Api from '@/api/index';
import { secondToHour, hourToSecond, needHideTitleBar } from '@/utils/utils';

export default {
    name: 'SNReportWork',
    data() {
        return {
            show: false,
            showTitleBar: null,
            tabs: [
                {
                    name: '专案详情',
                },
                {
                    name: '填报工时',
                },
            ],
            snCode: null,
            current: 0,
            list: [],
            planInfo: {},
            secondToHour,
            hourToSecond,
            colorEnmu: {
                延期: '#e12137',
                完成: 'green',
                进行中: '#1d65f3',
            },
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
        // 选择框改变
        async getPlan() {
            try {
                uni.showLoading({
                    title: '加载中...',
                    mask: true,
                });
                const res = await Api.mps.plan.getPlanId({ sn: this.snCode });
                await this.getPlanDetail(res.data);
                uni.hideLoading();
            } catch (error) {
                uni.showToast({
                    title: error,
                    icon: 'error',
                });
                console.error(error);
            } finally {
                uni.hideLoading();
            }
        },
        // 获取专案详情
        async getPlanDetail(planId) {
            try {
                const res = await Api.mps.plan.getPlanDetail({ id: planId });
                const res2 = await Api.mps.wksr.planDetail({ planId });
                // const { code, data } = res;
                if (res.code === 200) {
                    this.planInfo = res.data;
                    console.log(res.data);
                    this.planInfo = res.data;
                }
                if (res2.code == 200) {
                    const { data } = res2;
                    data.forEach((item) => {
                        const findProduceRoute = this.list.find(
                            (produceRoute) => produceRoute.produceRouteId === item.produceRouteId
                        );
                        if (!findProduceRoute) {
                            this.list.push({
                                produceRouteName: item.produceRouteName,
                                produceRouteId: item.produceRouteId,
                                isComplete: item.isComplete,
                                children: [item],
                            });
                        } else {
                            findProduceRoute.children.push(item);
                        }
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: error,
                    icon: 'error',
                });
                console.error(error);
            } finally {
            }
        },
        // 提交
        async submit() {
            try {
                if (!this.snCode)
                    return uni.showToast({
                        title: '请扫描SN码查询',
                        icon: 'error',
                    });
                if (!this.list.length === 0)
                    return uni.showToast({
                        title: '无可提交数据',
                        icon: 'error',
                    });
                uni.showLoading({
                    title: '提交中...',
                    mask: true,
                });
                const data = [];
                this.list.forEach((item) => {
                    item.children.forEach((child) => {
                        data.push({
                            ...child,
                            isComplete: item.isComplete,
                            reportHour: this.hourToSecond(child.reportHour, 3),
                        });
                    });
                });
                const res = await Api.mps.wksr.reporSavetSubmit(data);
                const { code } = res;
                if (code == 200) {
                    this.snCode = null;
                    this.list = [];
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success',
                    });
                }
                uni.hideLoading();
            } catch (error) {
                uni.showToast({
                    title: error,
                    icon: 'error',
                });
                console.error(error);
            } finally {
                uni.hideLoading();
            }
        },
        // 处理扫码返回结果
        handleScanCode(snCode) {
            if (!snCode) return;
            this.snCode = snCode;
            this.handleSearch();
        },
        // 搜索
        handleSearch() {
            if (!this.snCode)
                return uni.showToast({
                    title: '请输入需要查询的SN码',
                    icon: 'error',
                });
            this.current = 0;
            this.list = [];
            this.planInfo = {};
            this.getPlan();
        },
        doAction(action, billNumber) {
            switch (action) {
                case 'search':
                    this.handleSearch();
                    break;
                case 'scanCode':
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
                    break;
                case 'submit':
                    this.submit();
                    break;
                case 'jump':
                    uni.navigateTo({
                        url: `/pages/SNReportWork/missingMaterial?billNumber=${billNumber}`,
                    });
                    break;

                default:
                    break;
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
        .u-td {
            height: unset;
        }
        &_scroll {
            flex: 1;
            overflow: auto;
            .card {
                padding: 20rpx;
                margin: 16rpx;
                background-color: #fff;
                box-shadow: 0 0 16rpx rgba(0, 0, 0, 0.3);
                &-head {
                    padding-bottom: 10rpx;
                    margin-bottom: 10rpx;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                    font-size: 28rpx;
                    border-bottom: 1rpx solid #ccc;
                    &-left,
                    &-right {
                        display: flex;
                        align-items: center;
                    }
                }
                &-content {
                    .group {
                        // padding: 0 16rpx;
                        display: flex;
                        flex-wrap: wrap;
                        font-size: 24rpx;
                        box-shadow: #ccc 5rpx;
                        &-name {
                            font-size: 28rpx;
                            font-weight: 600;
                        }
                        .info-item {
                            display: flex;
                            align-items: center;
                            width: 100%;
                            &-label {
                                text-align: right;
                                width: 120rpx;
                                font-weight: 600;
                            }
                            &-value {
                                flex: 1;
                                overflow: hidden;
                            }
                        }
                        &-bold {
                            font-size: 26rpx;
                            .info-item {
                                display: flex;
                                align-items: flex-start;
                                width: 100%;
                                &-label {
                                    text-align: right;
                                    width: 140rpx;
                                    font-weight: 600;
                                }
                            }
                        }
                        &-milestones {
                            .info-item {
                                width: 30%;
                                &:last-child {
                                    width: 40%;
                                }
                                &-label {
                                    width: auto;
                                }
                            }
                        }
                        .edit {
                            padding: 20rpx 0;
                            display: flex;
                            border-bottom: 1rpx dashed #ccc;
                        }
                    }
                }
            }
            .no-data {
                padding: 50rpx 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28rpx;
            }
        }

        &_footer {
            padding-top: 2rpx;
            display: flex;
            font-size: 0;
            .u-btn {
                flex: 1;
                border-radius: 0;
            }
        }
    }
}
</style>
