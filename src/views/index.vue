<template>
  <div class="container">
    <transition name="fade">
      <router-view></router-view>
    </transition>
    <tabber></tabber>
  </div>
</template>

<script>
import tabber from "@/components/home/tabber";
export default {
  data() {
    return {
      dataList: [],
      date: null,
      timer: null,
    };
  },
  components: {
    tabber,
  },
  created() {},
  beforeDestroy() {},
  methods: {},
};
</script>

<style lang="less">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  .page-content {
    height: calc(100% - 80px);
    .content {
      height: calc(100% - 60px);
      overflow-y: scroll;
    }
  }
}
</style>
