<template>
  <div class="tabber-warp">
    <div class="warp">
      <div
        class="itemWarp flex_mid"
        v-for="(item, index) in tabbarDes"
        :key="index"
        @click="getVal(item)"
      >
        <img
          :src="item.page === $route.path ? item.activeImg : item.normalImg"
          alt=""
        />
        <span :class="['font', { color: item.page === $route.path }]">
          {{ item.txt }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import home from "@/assets/tabber/home.png";
import home_a from "@/assets/tabber/home-a.png";
import apply from "@/assets/tabber/apply.png";
import apply_a from "@/assets/tabber/apply-a.png";
import mine from "@/assets/tabber/mine.png";
import mine_a from "@/assets/tabber/mine-a.png";

export default {
  data() {
    return {
      selected: "home",
      tabbarDes: [
        {
          txt: "首页",
          page: "/home",
          normalImg: home,
          activeImg: home_a,
        },
        {
          txt: "待授权",
          page: "/apply",
          normalImg: apply,
          activeImg: apply_a,
        },
        {
          txt: "个人中心",
          page: "/mine",
          normalImg: mine,
          activeImg: mine_a,
        },
      ],
    };
  },
  methods: {
    getVal(res) {
      this.selected = res.page;
      this.$router.push(res.page);
    },
  },
};
</script>
<style lang="less">
.warp {
  width: 100%;
  border-top: 1px solid #eee;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: #0c0c0c;

  .itemWarp {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    .font {
      margin-top: 5px;
      font-size: 12px;
      color: rgb(182, 182, 180);
      &.color {
        color: #6076ff;
      }
    }
  }
}
.warp img {
  width: 20px;
  height: 20px;
}
.tabber-warp img {
  margin-top: 12px;
}
.tabber-warp {
  width: 100%;
  height: 80px;
  background: #fff;
  box-shadow: 0px -1px 5px -1px rgba(50, 50, 93, 0.25);
}
</style>
