<template>
  <div class="workflow-mine-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="我的事务"
      left-arrow
      safe-area-inset-top
      :z-index="10"
      @click-left="handleBack"
    />

    <!-- 下拉刷新区域 -->
    <van-pull-refresh v-model="refreshing" class="workflow-mine-refresh" @refresh="onRefresh">
      <!-- 搜索 + Tabs 吸顶 -->
      <van-sticky :z-index="9">
        <div class="head-item">
          <div class="search-item">
            <van-search
              v-model="searchValue"
              class="workflow-search"
              placeholder="请输入流程名称"
              shape="square"
              :show-action="false"
              background="transparent"
              @search="handleSearch"
              @clear="handleSearch"
            />
          </div>
          <van-tabs
            v-model:active="current"
            :border="false"
            background="transparent"
            @change="handleTabChange"
          >
            <van-tab v-for="(tab, index) in tabList" :key="tab.name" :name="index">
              <template #title>
                <span class="tab-title">{{ formatTabTitle(tab, index) }}</span>
              </template>
            </van-tab>
          </van-tabs>
        </div>
      </van-sticky>

      <!-- 列表内容 -->
      <div v-if="list.length > 0" class="main">
        <wkf-card :list="list" :show-btn="showBtn" :type="current" @refresh="getList(true)" />

        <div class="loadmore">
          <van-loading v-if="loadStatus === 'loading'" size="24px">加载中...</van-loading>
          <div v-else-if="loadStatus === 'nomore'" class="loadmore-text">没有更多了</div>
          <van-button v-else type="primary" size="small" plain @click="getList()">
            加载更多
          </van-button>
        </div>
      </div>

      <!-- 空状态 -->
      <wf-empty v-else text="暂无数据" />
    </van-pull-refresh>

    <!-- 回到顶部：右下角 -->
    <van-back-top target="body" :right="24" :bottom="80" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { todoList, doneList, myDoneList, sendList } from '../../api/process.js';
import wkfCard from '../../components/wf-card/index.vue';

export default defineComponent({
  name: 'WorkflowMinePage',
  components: { wkfCard },
  data() {
    return {
      background: { backgroundColor: 'transparent' },
      searchValue: '',
      current: 0,
      tabList: [
        { name: '我的待办', method: 'todoList', count: 0 },
        { name: '我的请求', method: 'sendList' },
        { name: '我的已办', method: 'myDoneList' },
        { name: '办结事宜', method: 'doneList' },
      ],
      showBtn: false,
      loadStatus: 'loadmore',
      page: {
        current: 1,
        size: 5,
      },
      list: [],
      scrollTop: 0,
      loading: false,

      // 下拉刷新
      refreshing: false,
    };
  },
  watch: {
    '$route.query.current'(value) {
      if (typeof value === 'undefined') return;
      const index = Number(value);
      if (!Number.isNaN(index) && index !== this.current) {
        this.current = index;
        this.getList(true);
      }
    },
  },
  created() {
    this.applyRoute(this.$route.query);
  },
  mounted() {
    this.getList(true);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    todoList,
    sendList,
    myDoneList,
    doneList,

    // 顶部返回
    handleBack() {
      this.$router.back();
    },

    applyRoute(query = {}) {
      if (query.current !== undefined) {
        const index = Number(query.current);
        if (!Number.isNaN(index)) {
          this.current = index;
        }
      }
    },
    formatTabTitle(tab, index) {
      if (index === 0 && tab.count) {
        return `${tab.name}(${tab.count})`;
      }
      return tab.name;
    },
    handleSearch() {
      this.getList(true);
    },
    handleTabChange({ name }) {
      const index = Number(name);
      this.handleTabClick(Number.isNaN(index) ? 0 : index);
    },

    // 下拉刷新
    async onRefresh() {
      try {
        await this.getList(true);
      } finally {
        this.refreshing = false;
      }
    },

    async getList(clear = false) {
      if (this.loading) return;
      if (clear) {
        this.page.current = 1;
        this.list = [];
      }
      const handlerName = this.tabList[this.current]?.method;
      if (!handlerName || typeof this[handlerName] !== 'function') {
        return;
      }
      this.loading = true;
      this.loadStatus = 'loading';
      const { current, size } = this.page;
      try {
        const res = await this[handlerName]({
          processDefinitionName: this.searchValue,
          current,
          size,
        });
        const { records = [], total = 0 } = res.data || {};
        if (this.current === 0) {
          this.tabList[0].count = total;
          this.showBtn = true;
        } else {
          this.showBtn = false;
        }
        this.list = clear ? records : this.list.concat(records);
        this.page.current += 1;
        this.loadStatus = records.length < size ? 'nomore' : 'loadmore';
      } catch (error) {
        console.error('[workflow] 获取任务列表失败', error);
        this.loadStatus = 'loadmore';
      } finally {
        this.loading = false;
      }
    },
    handleTabClick(index, request = true) {
      if (this.current === index && request) {
        this.getList(true);
        return;
      }
      this.current = index;
      this.updateRoute(index);
      if (request) {
        this.getList(true);
      }
    },
    updateRoute(index) {
      const query = { ...this.$route.query, current: String(index) };
      this.$router.replace({ name: 'WorkflowMine', query });
    },
    handleScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.scrollTop = scrollTop;

      const { innerHeight } = window;
      const { scrollHeight } = document.documentElement;

      if (this.loadStatus !== 'loadmore' || this.loading) return;
      if (scrollTop + innerHeight >= scrollHeight - 30) {
        this.getList();
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.workflow-mine-container {
  min-height: 100vh;
  background: #f6f6f6;
  box-sizing: border-box;
}

/* 让下拉刷新区域至少铺满屏幕 */
.workflow-mine-refresh {
  min-height: calc(100vh - 46px);
}

/* 头部背景 + 搜索 + 标签 */
.head-item {
  width: 100%;
  box-sizing: border-box;
  background: url('@/views/plugin/workflow/static/images/mine/head_bg.png') no-repeat center bottom;
  background-size: 100% 100%;
}

/* 搜索区域 */
.search-item {
  padding: 0 15px;
}

/* 主体内容 */
.main {
  padding: 15px 15px 20px;
}

.tab-title {
  font-size: 14px;
}

/* 加载更多 */
.loadmore {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  gap: 12px;
}

.loadmore-text {
  color: #999999;
  font-size: 13px;
}

/* 搜索框样式（参考图片风格） */
.workflow-search {
  .van-search__content {
    background: transparent;
  }

  .van-field__control::placeholder {
    color: #5470c4;
  }
}
</style>

<style>
page {
  background: #f6f6f6;
}
</style>
