<template>
    <view class="container" :class="`lang-${lang}`">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            :title="$LT('title')"
            :background="{ background: '#F7E9DF' }"
            title-color="#333333"
        >
        </u-navbar>
        <dcLang :showTitleBar="showTitleBar" />
        <view class="userInfo-wrapper">
            <view class="top">
                <view class="left">{{$LT('personalInfo')}}</view>
            </view>
            <view class="btm">
                <view class="basic">
                    <view class="basic-left">
                        <image
                            v-if="laborRegister.avatarId"
                            :src="laborRegister.avatarId"
                            class="avatar-image"
                            mode="aspectFill"
                        ></image>
                        <image v-else src="@/static/images/mravator.png" class="avatar-image" mode="aspectFill"></image>
                        <span>{{ laborRegister.name }}</span>
                    </view>
                    <view class="basic-right">
                        <view class="info"
                            >{{$LT('contactNumber')}}<span>{{ laborRegister.mobile }}</span></view
                        >
                        <view class="info"
                            >{{$LT('IDNumber')}}<span>{{ laborRegister.cardNo }}</span></view
                        >
                    </view>
                </view>
                <view class="basic-btm">
                    <view class="bbtm-item">
                        <view class="label">{{$LT('jobObjective')}}</view>
                        <view class="value">{{ laborRegister.positionDict }}</view>
                    </view>
                    <view class="bbtm-item">
                        <view class="label">{{$LT('workingSeniority')}}</view>
                        <view class="value">{{ laborRegister.workYear }}</view>
                    </view>
                    <view class="bbtm-item">
                        <view class="label">{{$LT('isAccommodationAvailable')}}</view>
                        <view class="value">{{ laborRegister.isAccommodation }}</view>
                    </view>
                 
                </view>
                <view class="view-row">
                    <view class="right" @click="goUrl('/pages/home/selflogin?type=look')">{{$LT('viewDetail')}}</view>
                </view>
            </view>
        </view>

        <view class="steps-wrapper">
            <!-- 拒绝状态 -->
            <view
                class="refuse-wrapper"
                v-if="
                    laborRegister.applyStatus == '初试不通过' ||
                    laborRegister.applyStatus == '初试已取消' ||
                    laborRegister.applyStatus == '已离职'
                "
            >
                <image src="@/static/images/refuse.png" />
                <view class="right">
                    <view class="title">{{ laborRegister.applyStatus }}</view>
                    <view class="subtitle" v-if="laborRegister.applyStatus == '初试不通过'">{{
                        laborRegister.preliminaryDescription
                    }}</view>
                </view>
            </view>
            <!-- 其它状态 -->
            <m-steps
                v-else
                v-for="(item, index) in stepListWidthLang"
                :stepList="stepList"
                :item="item"
                :activity="laborRegister.applyStatus"
                :index="index"
            >
            </m-steps>
        </view>

        <view class="btn-bottom" v-if="laborRegister.applyStatus == '待初试'">
            <u-button
                :loading="loading"
                :hairline="false"
                @click="cancelChage('初试已取消')"
                :customStyle="{ color: '#848488', marginTop: '10rpx', width: '48%' }"
                >{{$LT('cancel')}}</u-button
            >
            <u-button
                :loading="loading"
                hairline="false"
                @click="goUrl('/pages/home/selflogin?type=edit')"
                :customStyle="{ backgroundColor: '#F78431', color: '#fff', marginTop: '10rpx', width: '48%' }"
                >{{$LT('changeInfo')}}</u-button
            >
        </view>

        <view class="btn-bottom" v-if="laborRegister.applyStatus == '复试已通过'">
            <u-button
                :loading="loading"
                hairline="false"
                @click="cancelChage('拒绝入职')"
                :customStyle="{ color: '#848488', marginTop: '10rpx', width: '48%' }"
                >{{$LT('refuseToJoin')}}</u-button
            >
            <u-button
                :loading="loading"
                hairline="false"
                @click="cancelChage('确认入职')"
                :customStyle="{ backgroundColor: '#F78431', color: '#fff', marginTop: '10rpx', width: '48%' }"
                >{{$LT('confirmToJoin')}}</u-button
            >
        </view>

        <view class="btn-bottom" v-if="laborRegister.applyStatus == '已入职'">
            <u-button
                :loading="loading"
                hairline="false"
                @click="resignApplyFor"
                :customStyle="{ backgroundColor: '#F78431', color: '#fff', marginTop: '10rpx', width: '100%' }"
                >{{$LT('resignationApplication')}}</u-button
            >
        </view>

        <view
            class="btn-bottom"
            v-if="
                laborRegister.applyStatus == '初试已取消' ||
                laborRegister.applyStatus == '初试不通过' ||
                laborRegister.applyStatus == '复试不通过' ||
                laborRegister.applyStatus == '拒绝入职' ||
                laborRegister.applyStatus == '已离职'
            "
        >
            <u-button
                :loading="loading"
                hairline="false"
                @click="goUrl('/pages/home/selflogin?type=reApply')"
                :customStyle="{ backgroundColor: '#F78431', color: '#fff', marginTop: '10rpx', width: '100%' }"
                >再次申请</u-button
            >
        </view>
    </view>
</template>
<script>
import mSteps from '@/components/m-steps/m-steps.vue';
import { getlabelByValue, needHideTitleBar } from '@/utils/utils';
import dcLang from '@/components/dc/dc-lang/index.vue';
import getLangLabel from '../../i18n';
export default {
    components: {
        mSteps,
        dcLang
    },

    // 待初试   ---用户创建
    // 初试已取消  ------ 初试已取消
    // 初试不通过
    // 待复试   -------- 初试结束，通过
    // 复试不通过 ------ 复试结束，不通过
    // 复试已通过  -----  复试结束，通过
    // 拒绝入职
    // 已入职 ----- 复试通过，入职
    data() {
        return {
            showTitleBar: false,
            cancelDesc: {
                拒绝入职: '如若拒绝，则取消入职机会',
                初试已取消: '如若取消，则取消入职机会',
                再次申请: '',
            },
            userInfo: uni.getStorageSync('loginInfo'),
            laborRegister: {
                applyStatus: '',
                avatarId: null,
            },
            loading: false,
            form: {
                avatar: '',
            },

            // 待初试显示
            stepinit: [
                {
                    title: '待初试',
                    title_i18n: 'WaitingForPreliminaryInterview',
                    subtitle: this.laborRegister?.preliminaryDescription,
                },
                {
                    title: '复试',
                    title_i18n: 'theSecondInterview',
                    subtitle: this.laborRegister?.finalDescription,
                },
                {
                    title: '入职',
                    title_i18n: 'entry',
                    subtitle: '初试通过后进行线下复试',
                },
            ],
            // 其它状态显示
            wrapRecordList: [
                {
                    title: '待初试',
                    title_i18n: 'WaitingForPreliminaryInterview',
                    subtitle: '请您耐心等待初试审核结果',
                },
                {
                    title: '初试已通过',
                    title_i18n: 'TheInitialTestHasBeenPassed',
                    subtitle: this.laborRegister?.preliminaryDescription,
                },
                {
                    title: '待复试',
                    title_i18n: 'WaitingForTheSecondInterview',
                    subtitle: '请您耐心等待复试结果',
                },
            ],
        };
    },
   computed: {
        lang() {
            return this.$store.state.loginInfo.lang
        },
        stepListWidthLang() {
            return this.stepList.map(item => {
                return {
                    ...item,
                    title: this.$LT(item.title_i18n) // !== '-'?   this.$LT(item.title_i18n) : item.title
                }
            });
        },
        stepList: function () {
            let list = JSON.parse(JSON.stringify(this.wrapRecordList));
            if (this.laborRegister.applyStatus === '待初试' || !this.laborRegister.applyStatus) {
                list = this.stepinit;
            } else if (this.laborRegister.applyStatus === '待复试') {
                list.splice(0, 1);
                list.push({
                    title: '入职',
                    title_i18n: 'entry',
                    subtitle: '初试通过后进行线下复试',
                });
            } else if (this.laborRegister.applyStatus === '复试已通过') {
                list.splice(0, 1);
                list.splice(1, 1);
                list.push(
                    {
                        title: '复试已通过',
                        title_i18n: 'TheInterviewHasBeenPassed',
                        subtitle: this.laborRegister?.finalDescription,
                    },
                    {
                        title: '待入职',
                        title_i18n: 'waitingForEntry',
                        subtitle: '',
                    }
                );
            } else if (this.laborRegister.applyStatus === '确认入职' || this.laborRegister.applyStatus === '已入职') {
                list = [];
                list.push(
                    {
                        title: '初试已通过',
                        title_i18n: 'TheInitialTestHasBeenPassed',
                        subtitle: this.laborRegister?.preliminaryDescription,
                    },
                    {
                        title: '复试已通过',
                        title_i18n: 'TheInterviewHasBeenPassed',
                        subtitle: this.laborRegister?.finalConclusion,
                    },
                    {
                        title: this.laborRegister.applyStatus,
                        title_i18n: 'entry',
                        subtitle: '',
                    }
                );
            } else if (this.laborRegister.applyStatus === '复试不通过') {
                list.push({
                    title: '复试不通过',
                    title_i18n: 'failedTheSecondInterview',
                    subtitle: this.laborRegister?.finalConclusion,
                });
            } else if (this.laborRegister.applyStatus === '拒绝入职') {
                let array = [
                    {
                        title: '复试已通过',
                        title_i18n: 'TheInterviewHasBeenPassed',
                        subtitle: this.laborRegister?.finalConclusion,
                    },
                    {
                        title: '拒绝入职',
                        title_i18n: 'refuseToJoin',
                        subtitle: '您已拒绝入职，如果需要重新进行申请，请 点击“再次申请”按钮',
                    },
                ];
                list = [...list, ...array];
                console.log(list);
            }
            return list;
        },
    },

    created() {
        console.log(this.userInfo);
        this.getlaborRegisterDetail();
        this.showTitleBar = !needHideTitleBar();
    },
    //申请状态(待初试|取消初试|初试不通过|待复试|拒绝入职|复试不通过| 已通过)
    methods: {
        $LT(key){
            return getLangLabel('auditResult', key, this.lang);
        },
        // 离职申请
        resignApplyFor() {
            let { origin } = window.location;
            // 本地或者生成
            let url =
                origin.indexOf('h5') >= 0
                    ? `/pages/plugin/workflow/pages/form/start?p=eyJwcm9jZXNzSWQiOiJsYWJvcl9sZWF2aW5nOjI1OmQ5NWQwMjk0LTA0NjMtMTFmMC04MjBkLTY2MjU1NTM4ODQ4MyJ9`
                    : `/pages/plugin/workflow/pages/form/start?p=eyJwcm9jZXNzSWQiOiJsYWJvcl9sZWF2aW5nOjI5OjM4MmQ5MzM5LTAzZGEtMTFmMC04YTE1LTAwZmY2NDg4NDg0NyJ9`;

            uni.navigateTo({
                url: url,
            });
        },
        goUrl(url) {
            uni.navigateTo({
                url: url,
            });
        },
        // 获取用户的登记信息
        getlaborRegisterDetail() {
            uni.showLoading({
                title: '加载中...',
                mask: true, // 是否显示透明蒙层，防止触摸穿透
            });
            this.$u.api
                .laborRegisterDetail({
                    createUser: this.userInfo.user_id,
                })
                .then(async (res) => {
                    uni.hideLoading();
                    if (res.code == 200 && res.data) {
                        this.laborRegister = res.data;
                        let positionDict = await getlabelByValue('DC_LABOR_POSITION', res.data.jobGradeDictCode);
                        this.$set(this.laborRegister, 'positionDict', positionDict);
                        //this.$set(this.laborRegister, 'applyStatus', '已入职');
                    } else {
                        uni.reLaunch({
                            url: '/pages/home/selflogin',
                        });
                    }
                });
        },
        // 取消初试
        cancelChage(type) {
            let that = this;
            uni.showModal({
                title: `是否${type}`,
                content: this.cancelDesc[type],
                confirmColor: '#fff',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定');
                        that.chageStatus(type == '再次申请' ? '待初试' : type);
                    } else if (res.cancel) {
                        console.log('用户点击取消');
                    }
                },
            });
        },

        chageStatus(applyStatus) {
            this.laborRegister.applyStatus = applyStatus;
            this.loading = true;
            this.$u.api
                .updatelaborRegister(this.laborRegister)
                .then((res) => {
                    if (res.code == 200) {
                        // uni.showToast({
                        //     title: '提交成功',
                        //     icon: 'none',
                        // });
                        setTimeout(() => {
                            this.getlaborRegisterDetail();
                        }, 1000);
                    }
                    this.loading = false;
                })
                .catch((e) => {
                    this.loading = false;
                });
        },
    },
};
</script>
<style lang="scss" scoped>
.container {
    text-align: center;
    overflow: hidden;
    color: #000;
    padding: 24rpx 24rpx 220rpx;
    box-sizing: border-box;
    ::v-deep.lang-box {
        top: 13px;
        color: #FFF;
        border-color: #FFF;
        .icon-bottom {
            border-right-color: #FFF;
            border-bottom-color: #FFF;
        }
    }
    .steps-wrapper {
        margin-top: 40rpx;
        &:last-child {
            .tail {
                top: 32%;
            }
        }
    }

    .refuse-wrapper {
        position: relative;
        min-height: 144rpx;
        top: -6rpx;
        display: flex;
        align-items: center;
        background: #ffffff;
        border-radius: 16rpx 16rpx 16rpx 16rpx;
        padding: 36rpx 24rpx;
        box-sizing: border-box;
        display: flex;
        image {
            width: 80rpx;
            height: 80rpx;
            margin-right: 24rpx;
        }
        .right {
            flex: 1;
            text-align: left;
            .title {
                font-size: 32rpx;
                color: #e12137;
                margin-bottom: 12rpx;
                font-weight: bold;
            }
            .subtitle {
                font-size: 24rpx;
                color: #848488;
            }
        }
    }

    .view-row {
        width: 100%;
        padding: 16px;
        .right {
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #f78431;
            padding: 8px 16px;
            color: #f78431;
        }
    }

    .userInfo-wrapper {
        background: #f78431;
        border-radius: 8px 8px 8px 8px;
        padding: 8rpx;
        box-sizing: border-box;

        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            padding: 0px 8rpx;
            box-sizing: border-box;
            font-size: 24rpx;
            height: 80rpx;
            line-height: 80rpx;

            .left {
                font-size: 32rpx;
            }
        }

        .btm {
            background: #fff;
            border-radius: 8px 8px 8px 8px;
            padding: 24rpx 24rpx 40rpx;
            box-sizing: border-box;

            .basic {
                display: flex;
                align-items: center;
                // height: 96rpx;
                // line-height: 96rpx;
                justify-content: space-between;

                .basic-left {
                    min-width: 200rpx;
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;

                    image {
                        width: 96rpx;
                        height: 96rpx;
                        border-radius: 16rpx 16rpx 16rpx 16rpx;
                    }

                    span {
                        margin-top: 8px;
                        font-weight: 500;
                        font-size: 32rpx;
                        color: #333333;
                        margin-left: 16rpx;
                    }
                }

                .basic-right {
                    display: flex;
                    align-items: baseline;
                    flex-direction: column;
                    font-size: 24rpx;
                    min-width: 53%;

                    .info {
                        font-size: 24rpx;
                        line-height: 24rpx;
                        display: flex;
                        align-items: center;

                        &:first-child {
                            margin-bottom: 24rpx;
                        }

                        span {
                            font-size: 28rpx;
                            font-weight: 500;
                            margin-left: 8rpx;
                        }
                    }
                }
            }

            .basic-btm {
                display: flex;
                justify-content: space-around;
                margin-top: 48rpx;

                .bbtm-item {
                    .label {
                        font-size: 24rpx;
                        line-height: 28rpx;
                        color: #666666;
                        margin-bottom: 24rpx;
                    }

                    .value {
                        font-weight: 500;
                        font-size: 32rpx;
                        color: #333333;
                    }
                }
            }
        }
    }

    .btn-bottom {
        width: 100%;
        background-color: #fff;
        position: fixed;
        bottom: 0px;
        z-index: 9;
        left: 0px;
        padding: 24rpx;
        padding-bottom: calc(constant(safe-area-inset-bottom) + 30rpx); /* 兼容 iOS < 11.2 */
        padding-bottom: calc(env(safe-area-inset-bottom) + 30rpx); /* 兼容 iOS >= 11.2 */
        box-sizing: border-box;
        border-top: 1px solid #fff;
        display: flex;
        align-items: center;
    }
}
</style>
