<template>
  <div class="navigation-container">
    <div class="search-container">
      <img src="@/assets/home/search-icon.png" alt="" class="search-icon" />
      <input type="text" placeholder="搜索商品关键词" class="search-ipt" />
    </div>
  </div>
</template>

<script>
export default {
  name: "navigation-search",
  props: {
    backIsShow: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    title() {
      return this.$route.meta.title;
    },
  },
};
</script>

<style lang="less" scoped>
.navigation-container {
  padding: 0 20px;
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
  width: 100%;
  border-bottom: 1px solid #ccc;
  .search-container {
    padding: 0 16px;
    display: flex;
    align-items: center;
    width: 218px;
    height: 30px;
    background: rgba(255, 255, 255, 0.52);
    border-radius: 125px;
    border: 2px solid #fff;
    .search-icon {
      width: 19px;
      height: 19px;
    }
    .search-ipt {
      flex: 1;
      border: none;
      &:focus-visible {
        outline: none;
      }
    }
  }
}
</style>
