<template>
  <div class="page-content">
    <navigation></navigation>
    <div class="content">
      <div class="user-info">
        <img src="" alt="" class="avatar" />
        <div class="right">
          <span class="id">ID：637319744</span>
          <span class="vip">
            <img
              src="./../assets/mine/vip-icon.png"
              width="18"
              height="18"
              alt=""
            />
            会员用户</span
          >
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
            <div
              class="item"
              v-for="(state, index) in orderStatus"
              :key="index"
            >
              <img :src="state.img" width="32" alt="" class="item-icon" />
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
            <li
              class="other-item"
              v-for="(other, index) in otherList"
              :key="index"
            >
              <span class="item-name">
                <img class="item-icon" :src="other.img" alt="" />
                {{ other.text }}
              </span>
              <img
                src="./../assets/mine/arrow-right.png"
                alt=""
                class="arrow"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import allIcon from "./../assets/mine/all-icon.png";
import jiesuanIcon from "./../assets/mine/jiesuan-icon.png";
import daijiesuanIcon from "./../assets/mine/daijiesuan-icon.png";
import shibaiIcon from "./../assets/mine/shibai-icon.png";
import yueIcon from "./../assets/mine/yue-icon.png";
import tixianIcon from "./../assets/mine/tixian-icon.png";
import kefuIcon from "./../assets/mine/kefu-icon.png";
import navigation from "@/components/home/navigation";
export default {
  components: { navigation },
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
          text: "全部",
          img: allIcon,
        },
        {
          text: "已结算",
          img: jiesuanIcon,
        },
        {
          text: "待结算",
          img: daijiesuanIcon,
        },
        {
          text: "失败",
          img: shibaiIcon,
        },
      ],
      otherList: [
        {
          text: "余额提现",
          img: yueIcon,
          path: "",
        },
        {
          text: "提现记录",
          img: tixianIcon,
          path: "",
        },
        {
          text: "联系客服",
          img: kefuIcon,
          path: "",
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
.page-content {
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
    background: linear-gradient(290deg, #6cade6 0%, #3874db 0%, #6cade6 100%);
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
    border-radius: 30px 30px 0 0;
    margin: 0 5px;
    margin-top: -50px;
    background: url("./../assets/mine/more-bkg.png");
    background-size: 100% 100%;
    backdrop-filter: blur(22px);

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
        height: 56px;
        .item {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          align-items: center;
          &-name {
            margin-top: 5px;
          }
        }
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
          font-weight: 400;
          color: #333333;
          .item-icon {
            margin-right: 12px;
            width: 24px;
            height: 24px;
          }
        }
        .arrow {
          margin-right: 10px;
          height: 20px;
        }
      }
    }
  }
}
</style>
