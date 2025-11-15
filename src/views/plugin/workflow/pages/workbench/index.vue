<template>
  <div class="home-container">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="home-scroll">
        <div class="head-item">
          <div class="title">工作台</div>
          <div class="tips">
            {{ total > 0 ? `目前有${total}个待办事宜` : '目前没有待办事宜, 可以放松一下啦' }}
          </div>
        </div>
        <div class="grid-item">
          <div
            v-for="(item, index) in girdList"
            :key="index"
            class="item"
            @click="handleJump(item)"
          >
            <img :src="`${wfImage}/home/icon_${item.type}.png`" class="icon" alt="" />
            <div class="name">{{ item.name }}</div>
          </div>
        </div>

        <div class="card-item">
          <div class="title">
            <div class="line"></div>
            <van-cell
              class="section-cell"
              title="我的待办"
              is-link
              :border="false"
              @click="handleJump(girdList[0])"
            />
          </div>
        </div>

        <van-list
          v-if="list.length > 0"
          v-model:loading="loading"
          v-model:error="error"
          class="card-list"
          :finished="finished"
          finished-text="没有更多了"
          error-text="请求失败，点击重新加载"
          @load="onLoad"
        >
          <wkf-card :list="list" show-btn @refresh="refreshTodo" />
        </van-list>
        <wf-empty v-else text="工作再忙，也要记得喝水" />
      </div>
    </van-pull-refresh>

    <van-floating-bubble
      axis="xy"
      magnetic="x"
      :gap="{ x: 16, y: 88 }"
      class="create-bubble"
      @click.stop="handleJump(girdList[1])"
    >
      <van-icon name="plus" />
    </van-floating-bubble>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useWorkflowStore } from '@/store/workflow.js';
import wkfCard from '../../components/wf-card/index.vue';

export default defineComponent({
  name: 'WorkflowWorkbenchPage',
  components: { wkfCard },
  data() {
    return {
      wfImage: this.wfImage || 'https://oss.nutflow.vip/rider',
      girdList: [
        {
          name: '我的待办',
          type: 'db',
          location: { name: 'WorkflowMine', query: { current: '0' } },
        },
        {
          name: '我的请求',
          type: 'qq',
          location: { name: 'WorkflowMine', query: { current: '1' } },
        },
        {
          name: '我的已办',
          type: 'yb',
          location: { name: 'WorkflowMine', query: { current: '2' } },
        },
        {
          name: '办结事宜',
          type: 'bj',
          location: { name: 'WorkflowMine', query: { current: '3' } },
        },
      ],
      page: 1,
      pageSize: 5,
      loading: false,
      finished: false,
      refreshing: false,
      error: false,
    };
  },
  computed: {
    ...mapState(useWorkflowStore, {
      list: (store) => store.todoItems,
      total: (store) => store.todoTotal,
    }),
  },
  mounted() {
    this.onRefresh();
  },
  methods: {
    ...mapActions(useWorkflowStore, ['fetchTodoList']),
    async onRefresh() {
      this.refreshing = true;
      this.loading = false;
      this.finished = false;
      this.error = false;
      this.page = 1;
      try {
        await this.fetchPage(1);
      } catch (error) {
        console.error('[workflow] 下拉刷新待办失败', error);
        this.error = true;
      } finally {
        this.refreshing = false;
        this.loading = false;
      }
    },
    async onLoad() {
      if (this.loading || this.finished) return;
      this.loading = true;
      this.error = false;
      try {
        await this.fetchPage(this.page);
      } catch (error) {
        console.error('[workflow] 加载更多待办失败', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchPage(page) {
      const { total = 0 } = await this.fetchTodoList({
        current: page,
        size: this.pageSize,
        append: page > 1,
      });
      this.page = page + 1;
      this.finished = this.list.length >= total;
    },
    refreshTodo() {
      return this.onRefresh();
    },
    handleJump(item) {
      if (!item || !item.location) return;
      const { location } = item;
      const { replace = false, ...locationConfig } = location;
      const navigation = replace ? this.$router.replace : this.$router.push;
      navigation.call(this.$router, locationConfig);
    },
  },
});
</script>

<!-- 全局：页面背景（用 SCSS 也可以） -->
<style lang="scss">
page {
  background: #f6f6f6;
}
</style>

<!-- 局部：使用 SCSS + 嵌套 -->
<style lang="scss" scoped>
$bg-page: #f6f6f6;
$color-text-main: #333;
$card-radius: 16px;

.home-container {
  min-height: 100vh;
  background: $bg-page;
  box-sizing: border-box;
  padding-bottom: 90px; // 给右下角 + 按钮留空间

  .home-scroll {
    min-height: 100%;
  }

  /* 顶部渐变头部 */
  .head-item {
    position: relative;
    padding: 28px 18px 72px;
    background: url('https://oss.nutflow.vip/rider/home/head_bg.png') no-repeat;
    background-size: 100% 100%;
    color: #fff;

    .title {
      font-size: 22px;
      font-weight: 600;
      line-height: 1.2;
    }

    .tips {
      margin-top: 14px;
      display: inline-block;
      padding: 4px 16px;
      font-size: 12px;
      line-height: 1.6;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      white-space: nowrap;
    }
  }

  /* 顶部 4 个入口卡片 */
  .grid-item {
    position: relative;
    margin: -32px 16px 0; // 往上顶一点，压在头部渐变上
    padding: 16px 8px 10px;
    display: flex;
    justify-content: space-between;
    background: #fff;
    border-radius: $card-radius;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

    .item {
      flex: 1;
      text-align: center;
      padding: 8px 0;
    }

    .icon {
      width: 44px;
      height: 44px;
      margin-bottom: 8px;
    }

    .name {
      font-size: 14px;
      color: $color-text-main;
      font-weight: 600;
    }
  }

  .card-list {
    margin: 0 16px;
  }

  /* “我的待办”卡片 */
  .card-item {
    margin: 16px 16px 0;
    padding: 12px 16px 0;
    background: #fff;
    border-radius: $card-radius $card-radius 0 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);

    .title {
      display: flex;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }

    .line {
      display: none; // 去掉左边竖线
    }

    .section-cell {
      flex: 1;
      padding: 0;
      background: transparent;
      font-size: 14px;
      color: $color-text-main;

      :deep(.van-cell__title) {
        font-size: 18px;
        font-weight: 600; // “我的待办”加粗
      }

      :deep(.van-cell__value),
      :deep(.van-cell__label) {
        display: none;
      }
    }
  }

  /* 右下角发起流程按钮 */
  .create-bubble {
    width: 54px;
    height: 54px;
    z-index: 20;
  }
}
</style>
