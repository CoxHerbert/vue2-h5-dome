<template>
  <div class="page-content">
    <navigation-search></navigation-search>
    <div class="swiper-container" ref="swiperContainer">
      <div class="swiper-wrapper">
        <img class="swiper-slide" src="@/assets/home/banner.jpg" alt="" />
      </div>
    </div>
    <div class="announcement">
      <div class="title">最新公告</div>
      <div class="desc-container" ref="descContainer">
        <div class="swiper-wrapper">
          <span class="swiper-slide">亚洲和平精英对抗联赛，即将开始</span>
          <span class="swiper-slide">亚洲和平精英对抗联赛，即将开始</span>
        </div>
      </div>
    </div>
    <div class="tip">
      <img class="tip-icon" src="@/assets/apply/tip-icon.png" alt="" />
      <div class="tip-container" ref="tipContainer">
        <div class="swiper-wrapper">
          <span class="swiper-slide"
            >提示：授权状态有延迟，请一分钟后刷新一次！</span
          >
          <span class="swiper-slide"
            >提示：授权状态有延迟，请一分钟后刷新一次！</span
          >
        </div>
      </div>
    </div>
    <ul class="game-list">
      <li
        class="game-item"
        :style="{ backgroundImage: `url(${game.img})` }"
        v-for="(game, index) in gameList"
        :key="index"
      >
        <div
          class="game-num"
          :style="{ color: game.stateColor, background: game.numColor }"
        >
          {{ game.num }}
        </div>
        <div class="detail">
          <!-- <div class="game-name">{{ game.name }}</div> -->
          <div class="game-id">{{ game.id }}</div>
          <div
            class="game-state"
            :style="{ background: game.stateColor }"
            @click="open(game.code)"
          >
            {{ game.state }}
          </div>
        </div>
      </li>
    </ul>
    <message :type="message.type" :show="message.show" @close="close"></message>
  </div>
</template>

<script>
import message from "@/components/message";
import navigationSearch from "@/components/home/navigation-search";
import Swiper from "@/utils/swiper/idangerous.swiper.min.js";
import item_1 from "./../assets/home/item-1.png";
import item_2 from "@/assets/home/item-2.png";
import item_3 from "@/assets/home/item-3.png";
import item_4 from "@/assets/home/item-4.png";
export default {
  data() {
    return {
      activeIndex: 0,
      gameList: [
        {
          num: "A9",
          name: "和平精英",
          id: "83550075",
          state: "获取授权码",
          numColor: "#F4CFC5",
          stateColor: "#EE8263",
          img: item_2,
          code: "1",
        },
        {
          num: "A14",
          name: "王者荣耀",
          id: "83550075",
          state: "授权成功",
          numColor: "#F6D9B5",
          stateColor: "#F2A33A",
          img: item_4,
          code: "2",
        },
      ],
      message: {
        type: "1",
        show: false,
      },
      arr: [11, 22, 33],
      measItemIdList: {},
      mySwiper: null,
      myDesc: null,
      myTip: null,
    };
  },
  components: {
    navigationSearch,
    message,
  },
  mounted() {
    this.mySwiper = new Swiper(this.$refs.swiperContainer, {
      loop: true,
      autoplay: 3000,
    });
    this.myDesc = new Swiper(this.$refs.descContainer, {
      loop: true,
      autoplay: 3000,
    });
    this.myTip = new Swiper(this.$refs.tipContainer, {
      loop: true,
      autoplay: 3000,
    });
  },
  beforeDestroy() {
    this.mySwiper.destroy(false);
    this.myDesc.destroy(false);
    this.myTip.destroy(false);
  },
  methods: {
    open(state) {
      this.message = {
        show: true,
        type: state,
      };
    },
    close() {
      this.message = {
        show: false,
        type: "",
      };
    },
  },
};
</script>

<style lang="less" scoped>
.swiper-container {
  margin: 20px;
  border-radius: 18px;
  overflow: hidden;
  .swiper-wrapper,
  .swiper-slide {
    height: 150px !important;
  }
}
.announcement {
  padding: 10px 0;
  margin: 0 20px;
  display: flex;
  align-items: center;

  border-bottom: 1px solid #d8d8d8;
  .title {
    padding-right: 9px;
    font-size: 14px;
    font-weight: 600;
    color: #687af7;
    border-right: 1px solid #d8d8d8;
  }
  .desc {
    &-container {
      margin-left: 9px;
      color: rgb(182, 182, 180);
      font-size: 14px;
      font-weight: 400;
      width: calc(100% - 80px);
      height: 21px;
      overflow: hidden;
      &-wrapper {
        height: 21px;
      }
    }
  }
}
.tip {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 31px;
  line-height: 31px;
  margin: 20px;
  background: rgba(255, 97, 52, 0.1);
  border-radius: 7px;

  &-icon {
    margin-right: 5px;
  }
  &-container {
    margin-left: 9px;
    font-size: 12px;
    font-weight: 400;
    color: #ff6134;
    width: calc(100%);
    height: 31px;
    overflow: hidden;
    .swiper-slide {
      height: 31px;
    }
  }
}
.game-list {
  margin: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .game-item {
    position: relative;
    height: 126px;
    border-radius: 18px;
    flex: 0 0 48%;
    box-sizing: border-box;
    overflow: hidden;
    background-image: url("./../assets/home/item-1.png");
    background-size: 100% 100%;
    background-position: 0 100%;
    &:nth-child(n + 3) {
      margin-top: 10px;
    }
    .game-num {
      border-radius: 0 0 18px;
      position: absolute;
      top: 0;
      left: 0;
      width: 64px;
      height: 24px;
      background: #f4cfc5;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
    }
    .detail {
      display: flex;
      flex-direction: column;
      margin-top: 40px;
      margin-left: 20px;
      .game-name {
        font-size: 18px;
        font-weight: 600;
        color: #3d3d3d;
      }
      .game-id {
        font-size: 18px;
        font-weight: 600;
        color: #3d3d3d;
      }
      .game-state {
        margin-top: 15px;
        width: 80px;
        height: 24px;
        line-height: 24px;
        color: #ffffff;
        font-size: 14px;
        text-align: center;
        border-radius: 4px 4px 4px 4px;
      }
    }
  }
}
</style>
