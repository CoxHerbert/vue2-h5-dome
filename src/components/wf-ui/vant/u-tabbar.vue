<template>
  <van-tabbar
    v-model:active="activeIndex"
    :fixed="fixed"
    :placeholder="placeholder"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    @change="handleChange"
  >
    <van-tabbar-item
      v-for="(item, index) in list"
      :key="index"
      :badge="item.badge"
      :dot="item.isDot"
      :icon="item.customIcon ? undefined : item.icon"
      :name="item.name || index"
      :class="{ 'u-tabbar-item--mid': item.midButton }"
    >
      <template #icon="{ active }">
        <img
          v-if="!item.customIcon"
          :src="active ? item.selectedIconPath || item.iconPath : item.iconPath"
          class="u-tabbar-item__icon"
          alt=""
        />
        <slot v-else :name="item.slot" />
      </template>
      <span>{{ item.text }}</span>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script>
import { Tabbar, TabbarItem } from 'vant';

export default {
  name: 'u-tabbar',
  components: { VanTabbar: Tabbar, VanTabbarItem: TabbarItem },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [Number, String],
      default: 0,
    },
    activeColor: {
      type: String,
      default: '#1989fa',
    },
    inactiveColor: {
      type: String,
      default: '#646566',
    },
    fixed: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: Boolean,
      default: false,
    },
    safeAreaInsetBottom: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      activeIndex: this.modelValue,
    };
  },
  watch: {
    modelValue(val) {
      this.activeIndex = val;
    },
  },
  methods: {
    handleChange(index) {
      this.activeIndex = index;
      this.$emit('update:modelValue', index);
      this.$emit('change', index);
    },
  },
};
</script>

<style scoped>
.u-tabbar-item__icon {
  width: 44rpx;
  height: 44rpx;
}
.u-tabbar-item--mid {
  transform: translateY(-16rpx);
}
</style>
