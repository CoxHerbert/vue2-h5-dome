<template>
  <div class="home-container">
    <div class="head-item">
      <div class="title">工作台</div>
      <div class="tips">
        {{ total > 0 ? `目前有${total}个待办事宜` : '目前没有待办事宜, 可以放松一下啦' }}
      </div>
    </div>
    <div class="grid-item">
      <div v-for="(item, index) in girdList" :key="index" class="item" @click="handleJump(item)">
        <img :src="`${wfImage}/home/icon_${item.type}.png`" class="icon" alt="" />
        <div class="name">{{ item.name }}</div>
      </div>
    </div>

    <div v-if="list.length > 0" class="card-item">
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
      <wkf-card v-if="list.length > 0" :list="list" show-btn @refresh="refreshTodo" />
    </div>
    <wf-empty v-else text="工作再忙，也要记得喝水" />

    <img
      class="creat"
      src="https://oss.nutflow.vip/rider/public/create.png"
      alt="发起流程"
      @click.stop="handleJump(girdList[1])"
    />
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
    };
  },
  computed: {
    ...mapState(useWorkflowStore, {
      list: (store) => store.todoItems,
      total: (store) => store.todoTotal,
    }),
  },
  mounted() {
    this.refreshTodo();
  },
  methods: {
    ...mapActions(useWorkflowStore, ['fetchTodoList']),
    async refreshTodo() {
      try {
        await this.fetchTodoList({ current: 1, size: 5 });
      } catch (error) {
        console.error('[workflow] 获取待办失败', error);
      }
    },
    handleJump(item) {
      if (!item || !item.location) {
        return;
      }
      const { location } = item;
      const { replace = false, ...locationConfig } = location;
      const navigation = replace ? this.$router.replace : this.$router.push;
      navigation.call(this.$router, locationConfig);
    },
  },
});
</script>
<style>
page {
  background: #f6f6f6;
}
</style>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f6f6f6;
  box-sizing: border-box;
  padding-bottom: 90px; // 给右下角 + 按钮留空间
}

/* 顶部渐变头部 */
.head-item {
  position: relative;
  padding: 28px 18px 72px;
  background: url('https://oss.nutflow.vip/rider/home/head_bg.png') no-repeat;
  background-size: 100% 100%;
  color: #ffffff;

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
    background: rgba(255, 255, 255, 0.2); // 接近截图里的蓝色胶囊
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
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.grid-item .item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
}

.grid-item .icon {
  width: 44px;
  height: 44px;
  margin-bottom: 8px;
}

.grid-item .name {
  font-size: 14px;
  color: #333333;
  font-weight: 600;
}

/* “我的待办”卡片 */
.card-item {
  margin: 16px 16px 0;
  padding: 12px 16px 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.card-item .title {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0; // 顶部那条分割线
}

/* 去掉之前左侧那条竖线，更贴近截图 */
.card-item .line {
  display: none;
}

.card-item .section-cell {
  flex: 1;
  padding: 0;
  background: transparent;
  font-size: 14px;
  color: #333333;

  :deep(.van-cell__title) {
    font-size: 18px;
    font-weight: 600; // “我的待办”加粗
  }

  .van-cell__value,
  .van-cell__label {
    display: none;
  }
}

/* 右下角发起流程按钮 */
.creat {
  position: fixed;
  right: 20px;
  bottom: 30px;
  width: 54px;
  height: 54px;
  z-index: 20;
}
</style>
