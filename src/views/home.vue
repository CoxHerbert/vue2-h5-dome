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
    <ul class="tabs-list">
      <li
        class="tab-item"
        :class="{ active: index === activeIndex }"
        v-for="(tab, index) in tabList"
        :key="index"
      >
        {{ tab.text }}
      </li>
    </ul>
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
          <div class="game-state" :style="{ background: game.stateColor }">
            {{ game.state }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
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
      tabList: [
        {
          text: "全部",
          id: "",
        },
        {
          text: "上架1",
          id: "",
        },
        {
          text: "上架2",
          id: "",
        },
        {
          text: "上架3",
          id: "",
        },
        {
          text: "上架4",
          id: "",
        },
        {
          text: "上架5",
          id: "",
        },
        {
          text: "上架6",
          id: "",
        },
      ],
      gameList: [
        {
          num: "A18",
          name: "王者荣耀",
          id: "83550075",
          state: "上架",
          numColor: "#CED7FC",
          stateColor: "#687AF7",
          img: item_3,
        },
        {
          num: "A30",
          name: "和平精英",
          id: "83550075",
          state: "下架",
          numColor: "#E4CFF1",
          stateColor: "#985EF6",
          img: item_1,
        },
        {
          num: "A9",
          name: "和平精英",
          id: "83550075",
          state: "待授权",
          numColor: "#F4CFC5",
          stateColor: "#EE8263",
          img: item_2,
        },
        {
          num: "A14",
          name: "王者荣耀",
          id: "83550075",
          state: "进行中",
          numColor: "#F6D9B5",
          stateColor: "#F2A33A",
          img: item_4,
        },
      ],
      mySwiper: null,
      myDesc: null,
    };
  },
  components: {
    navigationSearch,
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
  },
  beforeDestroy() {
    this.mySwiper.destroy(false);
    this.myDesc.destroy(false);
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.swiper-container {
  margin: 20px;
  border-radius: 18px;
  overflow: hidden;
  .swiper-wrapper,
  .swiper-slide {
    height: 100% !important;
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
.tabs-list {
  display: flex;
  margin: 20px;
  margin-right: 0;
  overflow-x: auto;
  .tab-item {
    margin-right: 10px;
    flex: 0 0 auto;
    padding: 0 20px;
    height: 30px;
    line-height: 30px;
    background: #eaeaea;
    border-radius: 6px 6px 6px 6px;
    &.active {
      color: #ffffff;
      background: #687af7;
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
      margin-top: 40px;
      margin-left: 20px;
      .game-id {
        font-size: 18px;
        font-weight: 600;
        color: #3d3d3d;
      }
      .game-state {
        margin-top: 15px;
        width: 54px;
        height: 24px;
        line-height: 24px;
        color: #ffffff;
        font-size: 14px;
        text-align: center;
        background: #687af7;
        border-radius: 4px 4px 4px 4px;
      }
    }
  }
}
</style>
