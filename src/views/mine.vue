<template>
    <div class="content">
        <div class="user-info">
            <img src="" alt="" class="avatar" />
            <div class="right">
                <span class="id">ID：637319744</span>
                <span class="vip">会员用户</span>
            </div>
        </div>
        <div class="account-statistics">
            <div class="list">
                <div class="item">
                    <div class="item-name">我的余额</div>
                    <div class="item-count">
                        {{ statistics.balance }}
                    </div>
                </div>
                <div class="item">
                    <div class="item-name">日订单量</div>
                    <div class="item-count">
                        {{ statistics.dailyOrder }}
                    </div>
                </div>
                <div class="item">
                    <div class="item-name">月订单量</div>
                    <div class="item-count">
                        {{ statistics.monthlyOrder }}
                    </div>
                </div>
            </div>
        </div>
        <div class="more">
            <div class="order-content">
                <div class="title">我的订单</div>
                <div class="order-status">
                    <div class="item" v-for="(state, index) in orderStatus" :key="index">
                        <img :src="state.img" alt="" class="item-icon" />
                        <div class="item-name">{{ state.text }}</div>
                    </div>
                </div>
                <div class="order-statistics">
                    <div class="item">
                        <div class="item-count">
                            {{ statistics.balance }}
                        </div>
                        <div class="item-name">今日收入</div>
                    </div>
                    <div class="item">
                        <div class="item-count">
                            {{ statistics.balance }}
                        </div>
                        <div class="item-name">待授权</div>
                    </div>
                    <div class="item">
                        <div class="item-count">
                            {{ statistics.balance }}
                        </div>
                        <div class="item-name">货架</div>
                    </div>
                </div>
            </div>
            <div class="other-content">
                <div class="title">其他</div>
                <ul class="other-list">
                    <li class="other-item" v-for="(other, index) in otherList" :key="index">
                        <span class="item-name">
                            <img class="item-icon" src="" alt="" />
                            {{ other.text }}
                        </span>
                        <img src="" alt="" class="arrow" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            statistics: {
                balance: 100,
                dailyOrder: 100,
                monthlyOrder: 1000,
            },
            orderStatistics: {
                dayIncome: 100,
                auth: 100,
                shelve: 1000,
            },
            orderStatus: [
                {
                    text: '全部',
                    img: '',
                },
                {
                    text: '已结算',
                    img: '',
                },
                {
                    text: '待结算',
                    img: '',
                },
                {
                    text: '失败',
                    img: '',
                },
            ],
            otherList: [
                {
                    text: '余额提现',
                    img: '',
                    path: '',
                },
                {
                    text: '提现记录',
                    img: '',
                    path: '',
                },
                {
                    text: '联系客服',
                    img: '',
                    path: '',
                },
            ],
        };
    },
    created() {},
    beforeDestroy() {},
    methods: {},
};
</script>

<style lang="less" scoped>
.content {
    height: calc(100% -140px);
    flex: 1;
    overflow: scroll;
    .user-info {
        display: flex;
        padding: 30px 0;
        margin: 0 20px;
        .avatar {
            width: 65px;
            height: 65px;
            box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.3);
            opacity: 1;
            border: 2px solid #fff;
            border-radius: 50%;
        }
        .right {
            margin-left: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            .id {
                font-size: 16px;
                font-weight: 700;
                color: #333333;
            }
            .vip {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 80px;
                height: 24px;
                background: #bcd1ea;
                border-radius: 6px 6px 6px 6px;
                font-size: 12px;
                font-weight: 400;
                color: #333333;
            }
        }
    }
    .account-statistics {
        margin: 0 20px;
        height: 130px;
        background: linear-gradient(90deg, #8390e6 0%, #4a58d4 100%);
        box-shadow: inset 0px 3px 7px 0px rgba(255, 255, 255, 0.3);
        border-radius: 18px 18px 18px 18px;
        .list {
            padding: 25px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            box-sizing: border-box;
            .item {
                display: flex;
                flex-direction: column;
                align-items: center;
                &-name {
                    font-size: 12px;
                    font-weight: 400;
                    color: #ffffff;
                }
                &-count {
                    margin-top: 9px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    line-height: 18px;
                    letter-spacing: 1px;
                    text-shadow: 0px 2px 8px rgba(0, 1, 8, 0.3);
                }
            }
        }
    }
    .more {
        margin-top: -50px;
        background: rgba(255, 255, 255, 0.63);
        box-shadow: inset 0px 1px 0px 0px #ffffff;
        .title {
            padding: 28px 0 22px 0;
            font-size: 16px;
            font-weight: 400;
            color: #333333;
        }
        .other-content,
        .order-content {
            margin: 0 16px;

            .order-status {
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0 30px;
                width: 100%;
                height: 74px;
            }
            .order-statistics {
                margin-top: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0 30px;
                width: 100%;
                height: 74px;
                background: #f1f3fa;
                border-radius: 14px 14px 14px 14px;
                .item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    &-count {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333333;
                    }
                    &-name {
                        margin-top: 5px;
                        font-weight: 400;
                        color: #333333;
                        line-height: 14px;
                    }
                }
            }
        }
        .other-list {
            .other-item {
                padding-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .item-name {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 400;
                    color: #333333;
                    .item-icon {
                        margin-right: 12px;
                        width: 24px;
                        height: 24px;
                    }
                }
                .arrow {
                    width: 20px;
                    height: 20px;
                }
            }
        }
    }
}
</style>
