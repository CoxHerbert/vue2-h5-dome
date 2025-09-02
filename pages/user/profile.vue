<template>
    <view class="mine-page">
        <!-- Top Gradient Header -->
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            :is-back="false"
            title="我的"
            :background="{ background: '#3060ED' }"
            title-color="#fff"
        >
        </u-navbar>
        <view class="top-bg"></view>
        <u-calendar />

        <!-- Profile Card -->
        <view class="profile-card">
            <view class="bg-index bg-index-2"></view>
            <view class="bg-index bg-index-1"></view>
            <view class="profile-top">
                <view class="userinfo-wrap">
                    <view class="userinfo-wrap-left">
                        <view class="avatar-adn-userinfo">
                            <image
                                class="avatar"
                                :src="userinfo.avatar || '/static/images/logo1.png'"
                                mode="aspectFill"
                            ></image>
                            <view class="col">
                                <text class="name">{{ pageInfo.nickName }}</text>
                                <text class="uid">{{ pageInfo.userName }}</text>
                            </view>
                        </view>
                        <view class="tags">
                            <text class="tag" v-for="(t, i) in (pageInfo.roleName || '').split(',')" :key="i">{{
                                t
                            }}</text>
                        </view>
                    </view>
                    <view class="points">
                        <text class="points-label">我的积分</text>
                        <text class="points-val">{{ pageInfo.points || 0 }}</text>
                    </view>
                </view>
            </view>

            <view class="stats">
                <view class="stat">
                    <text class="stat-label">本月请假天数</text>
                    <text class="stat-num">{{ pageInfo.leaveDateCount || 0 }}</text>
                </view>
                <view class="stat">
                    <text class="stat-label">本月出差天数</text>
                    <text class="stat-num">{{ pageInfo.travelDateCount || 0 }}</text>
                </view>
                <view class="stat">
                    <text class="stat-label">本月加班（h）</text>
                    <text class="stat-num">{{ pageInfo.overDateCount || 0 }}</text>
                </view>
            </view>

            <view class="join-strip"> 加入东创{{ pageInfo.joinDateCount || 0 }}天 </view>
        </view>

        <!-- Today Punch Card -->
        <view class="card punch-card">
            <view class="card-title-row">
                <text class="card-title">今日打卡</text>
            </view>

            <view class="timeline">
                <!-- first item -->
                <view class="tl-item" v-for="(time, i) in pageInfo.punchCardDetail" :key="i">
                    <view class="tl-left">
                        <view class="dot done"></view>
                        <view class="line" v-if="i !== pageInfo.punchCardDetail.length - 1"></view>
                    </view>
                    <view class="tl-content">
                        <view class="tl-title">
                            <text>打卡时间</text>
                            <!-- <text class="warn"> 迟到{{ punch.morning.lateMinutes }}分钟</text> -->
                        </view>
                        <text class="tl-time">{{ time }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- My Functions -->
        <view class="card func-card">
            <view class="card-title-row">
                <text class="card-title">我的功能</text>
            </view>
            <view class="func-grid">
                <view class="func-item" v-for="(item, i) in funcItems" :key="i" @tap="go(item)">
                    <image v-if="i === 0" class="func-icon" src="@/static/images/home/work-time.png" />
                    <image v-if="i === 1" class="func-icon" src="@/static/images/home/card.png" />
                    <text class="func-text">{{ item.label }}</text>
                </view>
            </view>
        </view>

        <!-- Settings List -->
        <view class="card list-card">
            <view class="cell" @tap="doAction(row.action)" v-for="(row, i) in actions" :key="i">
                <text class="cell-text">{{ row.label }}</text>
                <text v-if="row.extra" class="cell-extra">{{ row.extra }}</text>
                <text class="arrow">›</text>
            </view>
        </view>
    </view>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
    data() {
        return {
            showTitleBar: true,
            pageInfo: {},
            funcItems: [
                {
                    label: '工时查询',
                    icon: '@/static/images/home/work-time.png',
                    path: '/pages/user/workTime',
                },
                {
                    label: '打卡记录',
                    icon: './../../static/images/home/cord.png',
                },
            ],
            actions: [
                {
                    label: '修改密码',
                    action: 'reset-password',
                },
                {
                    label: '帮助与反馈',
                    action: 'reset-password',
                },
                {
                    label: '关于',
                    action: 'about',
                    extra: `版本1.0.0`,
                },
                {
                    label: '设置',
                    action: 'set',
                },
                {
                    label: '退出登录',
                    action: 'logout',
                },
            ],
        };
    },
    computed: {
        userinfo() {
            return this.$store.getters.userInfo;
        },
    },
    mounted() {
        this.getUserInfo();
    },
    methods: {
        ...mapMutations(['LOGOUT']),
        getUserInfo() {
            this.$u.api.system.user.getUserInfo().then((res) => {
                const { code } = res;
                if (code === 200) {
                    this.pageInfo = res.data;
                }
            });
        },
        doAction(action) {
            if (action === 'logout') {
                uni.showModal({
                    title: '提示',
                    content: '确认是否要退出登录？',
                    confirmText: '确认',
                    cancelText: '取消',
                    success: (res) => {
                        if (res.confirm) {
                            this.LOGOUT();
                        }
                    },
                });
            } else {
                uni.showToast({ title: '暂未开放' });
            }
        },
        go({ label, path }) {
            if (label === '工时查询') {
                uni.navigateTo({
                    url: path,
                });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
$primary: #3d7cff;
$bg: #f6f7fb;
$text: #1f2b3d;
$muted: #8c9aaf;
$shadow: 0 12rpx 36rpx rgba(25, 81, 230, 0.08);

.mine-page {
    margin: auto;
    min-height: 100vh;
    background: $bg;
    padding-bottom: 120rpx; // 给假 Tabbar 预留
    max-width: 750px;
}
.top-bg {
    position: absolute;
    width: 100%;
    height: 320rpx;
    background: linear-gradient(180deg, #3060ed 0%, rgba(48, 96, 237, 0.3) 64%, rgba(48, 96, 237, 0) 100%);
}
/* ===== Card base ===== */
.card {
    margin: 24rpx 24rpx 24rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: $shadow;
    padding: 24rpx;
    & + .card {
        margin-top: 16rpx;
    }
}

/* ===== Profile ===== */
.profile-card {
    margin: 24rpx 24rpx 24rpx;
    margin-top: 80rpx;
    position: relative;
    padding-bottom: 0;
    background: #fff;
    background-size: calc(100% - 24rpx);
    z-index: 1;
    border-radius: 24rpx;
    box-shadow: $shadow;

    .bg-index {
        position: absolute;
        top: 0;
        left: 0;
        width: 702rpx;
        height: 334rpx;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 12px 12px 12px 12px;
        &-1 {
            z-index: -1;
            transform: rotate(-4deg);
        }
        &-2 {
            z-index: -2;
            transform: rotate(-8deg);
        }
    }
    .profile-top {
        padding: 32rpx 40rpx 0 34rpx;

        display: flex;
        width: 100%;
        .userinfo-wrap {
            display: flex;
            // align-items: center;
            width: 100%;
            &-left {
                flex: 1;
                .avatar-adn-userinfo {
                    display: flex;
                    align-items: center;
                }
                .avatar {
                    width: 96rpx;
                    height: 96rpx;
                    border-radius: 20rpx;
                    border: 1px solid #dadbe0;
                }
                .col {
                    margin-left: 16rpx;
                }
                .name {
                    font-size: 30rpx;
                    font-weight: 700;
                    color: $text;
                }
                .uid {
                    display: block;
                    margin-top: 6rpx;
                    font-size: 22rpx;
                    color: $muted;
                }
            }
        }
        .tags {
            margin-top: 12rpx;
            display: flex;
            flex-wrap: wrap;
            gap: 4rpx;
            .tag {
                font-size: 22rpx;
                color: #3060ed;
                background: #baccff;
                padding: 6rpx 12rpx;
            }
        }
        .points {
            width: 132rpx;
            height: 132rpx;
            border-radius: 16rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #3060ed;
            border-radius: 24rpx;
            .points-label {
                font-size: 22rpx;
                font-weight: 400;
                font-size: 12px;
                color: #ffffff;
                line-height: 12px;
                text-align: center;
                font-style: normal;
            }
            .points-val {
                margin-top: 24rpx;
                font-size: 32rpx;
                font-weight: bold;
                font-size: 20px;
                color: #ffffff;
                line-height: 14px;
                text-align: center;
                font-style: normal;
            }
        }
    }
    .stats {
        display: flex;
        align-items: stretch;
        .stat {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: 20rpx 8rpx 24rpx;
            text-align: center;
            .stat-num {
                font-size: 48rpx;
                font-weight: 700;
                color: $text;
            }
            .stat-label {
                margin-top: 6rpx;
                font-size: 28rpx;
                color: $muted;
            }
        }
    }

    .join-strip {
        width: 100%;
        height: 60rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 24rpx;
        font-weight: 600;
        padding-left: 40rpx;

        /* 路径与铺法 */
        background-image: url('/static/images/home/底部.png'); /* 推荐用 /static 绝对路径 */
        background-repeat: no-repeat;
        background-position: center; /* 居中 */
        background-size: cover; /* 充满并保持比例（可能裁切） */
    }
}

/* ===== Punch Card ===== */
.punch-card {
    .card-title-row {
        margin-bottom: 10rpx;
        .card-title {
            font-size: 28rpx;
            font-weight: 600;
            color: $text;
        }
    }

    .timeline {
        padding: 8rpx 0 8rpx 6rpx;
    }
    .tl-item {
        display: flex;
        flex-direction: row;
    }
    .tl-left {
        width: 40rpx;
        align-items: center;
        display: flex;
        flex-direction: column;
        .dot {
            width: 20rpx;
            height: 20rpx;
            border-radius: 50%;
            margin-top: 8rpx;
            background: #1d65f3;
            &.done {
                border: 4rpx solid #b4cdff;
            }
        }
        .line {
            flex: 1;
            width: 2rpx;
            margin-top: 6rpx;
            border: 1px dashed #bbbbbb;
            &.invisible {
                background: transparent;
            }
        }
    }
    .tl-content {
        flex: 1;
        padding-left: 6rpx;
        .tl-title {
            font-size: 26rpx;
            color: $text;
            .warn {
                margin-left: 16rpx;
                color: #ff6a00;
            }
        }
        .tl-time {
            margin-top: 6rpx;
            font-size: 22rpx;
            color: $muted;
        }
        .muted {
            color: #c5ccda;
        }
    }
}

/* ===== Functions Grid ===== */
.func-card {
    .card-title-row {
        margin-bottom: 10rpx;
        .card-title {
            font-size: 28rpx;
            font-weight: 600;
            color: $text;
        }
    }
    .func-grid {
        margin-top: 8rpx;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 8rpx;
    }
    .func-item {
        height: 144rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .func-icon {
            width: 64rpx;
            height: 64rpx;
            border-radius: 16rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8rpx;
        }
        .func-text {
            font-size: 24rpx;
            color: #353638;
        }
    }
}

/* ===== List Cells ===== */
.list-card {
    padding: 0;
    .cell {
        height: 96rpx;
        padding: 0 32rpx;
        display: flex;
        align-items: center;
        border-bottom: 1rpx solid #f0f2f7;
        position: relative;
        .cell-text {
            font-size: 28rpx;
            color: $text;
        }
        .cell-extra {
            position: absolute;
            right: 64rpx;
            font-size: 22rpx;
            color: $muted;
        }
        .arrow {
            margin-left: auto;
            font-size: 40rpx;
            color: #c5ccda;
            line-height: 1;
            transform: translateY(-2rpx);
        }
        &:last-child {
            border-bottom: 0;
        }
    }
}

/* ===== Fake Tabbar (preview only) ===== */
.fake-tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100rpx;
    background: #fff;
    border-top: 1rpx solid #eef0f5;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    text-align: center;
    .tab-item {
        color: #8893a6;
        .tab-icon {
            font-size: 36rpx;
            line-height: 1;
        }
        .tab-text {
            display: block;
            font-size: 22rpx;
            margin-top: 6rpx;
        }
        &.active {
            color: $primary;
        }
    }
}
</style>
