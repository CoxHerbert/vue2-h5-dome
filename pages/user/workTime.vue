<template>
    <view class="mine-page">
        <!-- Top Gradient Header -->
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            :is-back="true"
            title="工时查询"
            :background="{ background: '#3060ED' }"
            title-color="#fff"
        >
        </u-navbar>
        <uni-calendar class="uni-calendar--hook" :showMonth="false" @change="change" size="mini" />
        <view class="card sign-detail">
            <view class="card-title"> 打卡明细 </view>
            <view class="card-content">
                <view class="field">
                    <view class="label">打卡时间：{{ pageInfo.punchCardData }}</view>
                </view>
            </view>
        </view>
        <view class="cards">
            <view class="card" v-for="(group, i) in groups" :key="i">
                <view class="card-title">
                    {{ group.label }}
                </view>
                <view class="card-content">
                    <view class="field" v-for="(col, i) in group.columns" :key="i">
                        <view class="label">{{ col.label }}</view>
                        <view
                            class="value"
                            :class="[[0, '0', undefined, null].includes(col.prop) ? 'value-zero' : '']"
                            >{{ pageInfo[col.prop] || 0 }}</view
                        >
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import Api from '@/api/index';
import { dateFormat } from '@/utils/date.js';

export default {
    data() {
        return {
            showTitleBar: true,
            info: {
                lunar: true,
                range: true,
                insert: false,
                selected: [],
            },
            groups: [
                {
                    label: '出勤数据',
                    toggleShow: true,
                    columns: [
                        { label: '正常时数', prop: 'normalHours' },
                        { label: '出差正常时数', prop: 'travelNormalHours' },
                        { label: '有薪请假时数', prop: 'paidLeaveHours' },
                        { label: '无薪请假时数', prop: 'unpaidLeaveHours' },
                        { label: '休息日休息时数', prop: 'restHours' },
                        { label: '节假日休息时数', prop: 'holidayHours' },
                        { label: '有薪停工时数', prop: 'paidStopHours' },
                        { label: '无薪停工时数', prop: 'unpaidStopHours' },
                    ],
                },
                {
                    label: '加班数据',
                    toggleShow: true,
                    columns: [
                        { label: '刷卡加班时数', prop: 'cardOverHours' },
                        { label: '加班申请时数', prop: 'applyOverHours' },
                        { label: '平日加班时数', prop: 'normalOverHours' },
                        { label: '出差加班时数', prop: 'travelOverHours' },
                        { label: '休息日加班时数', prop: 'restOverHours' },
                        { label: '节假日加班时数', prop: 'holidayOverHours' },
                        { label: '加班转补休时数', prop: 'overToLeaveHours' },
                        { label: '假期结算时数', prop: 'leaveSettlementHours' },
                    ],
                },
                {
                    label: '异常数据',
                    toggleShow: true,
                    columns: [
                        { label: '迟到分钟', prop: 'lateMinutes' },
                        { label: '迟到次数', prop: 'lateCount' },
                        { label: '早退分钟', prop: 'leaveEarlyMinutes' },
                        { label: '早退次数', prop: 'leaveEarlyCount' },
                        { label: '旷工时数', prop: 'absenteeismHours' },
                    ],
                },
                {
                    label: '修正考勤数据',
                    toggleShow: true,
                    columns: [
                        { label: '修正正班时数', prop: 'correctionNormalHours' },
                        { label: '修正平时加班时数', prop: 'correctionNormalOverHours' },
                        { label: '修正周末加班时数', prop: 'correctionWeekendOverHours' },
                        { label: '修正节假日加班时数', prop: 'correctionHolidayOverHours' },
                    ],
                },
            ],
            pageInfo: {},
            date: null,
        };
    },
    mounted() {
        this.date = dateFormat(new Date(), 'yyyy-MM-dd');
        this.getDetail();
    },
    methods: {
        getDetail() {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            Api.system.user
                .getUserDailyAttendanceInfo({
                    attendanceDate: this.date,
                })
                .then((res) => {
                    const { code, data } = res;
                    if (code === 200) {
                        this.pageInfo = data || {};
                    } else {
                        this.pageInfo = {};
                    }
                    console.log(this.pageInfo);
                    uni.hideLoading();
                })
                .catch((err) => {
                    uni.hideLoading();
                });
        },
        change(e) {
            if (this.date !== e.fulldate) {
                this.date = e.fulldate;
                this.getDetail();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.mine-page {
    margin: auto;
    min-height: 100vh;
    padding-bottom: 24rpx; // 给假 Tabbar 预留
    max-width: 750px;
}
.cards {
    margin-top: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.sign-detail {
    margin-top: 24rpx;
    .card-content {
        margin-top: 10rpx;
        padding-bottom: 24rpx;

        .field {
            width: 100%;
            .label {
                font-weight: 400;
                color: #333333;
                text-align: left;
                font-style: normal;
                text-transform: none;
            }
        }
    }
}
.card {
    width: 100%;
    background: #ffffff;
    &-title {
        padding: 0 32rpx;
        height: 40px;
        line-height: 40px;
        font-weight: bold;
        font-size: 14px;
        color: #333333;
        text-align: left;
        font-style: normal;
        text-transform: none;
    }
    &-content {
        padding: 0 32rpx;
        padding-bottom: 24rpx;
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;

        .field {
            width: 45%;
            .label {
                font-weight: 400;
                font-size: 14px;
                color: #848488;
                text-align: left;
                font-style: normal;
                text-transform: none;
            }
            .value {
                margin: 16rpx 0;
                font-weight: 500;
                font-size: 14px;
                color: #333333;
                text-align: left;
                font-style: normal;
                text-transform: none;
                &-zero {
                    height: 14px;
                    font-weight: 500;
                    font-size: 14px;
                    color: #848488;
                    line-height: 14px;
                    text-align: left;
                    font-style: normal;
                    text-transform: none;
                }
            }
        }
    }
}
</style>
