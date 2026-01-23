<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ height: '85vh' }"
    @closed="handleClosed"
  >
    <div class="nf-prdmo-dialog">
      <!-- 顶部栏：只保留标题与返回 -->
      <van-nav-bar title="专案物料查询" left-text="返回" left-arrow @click-left="handleClose" />

      <!-- 搜索区 -->
      <div class="search-wrap">
        <div class="search-input-wrapper">
          <van-dropdown-menu class="search-type-dropdown">
            <van-dropdown-item v-model="query.searchType" :options="searchTypeOptions" />
          </van-dropdown-menu>
          <van-search
            v-model="query.keyword"
            placeholder="请输入搜索关键词"
            show-action
            class="search-input"
            @search="handleSearch"
            @cancel="handleReset"
          />
        </div>
      </div>

      <!-- 表头（可选） -->
      <div class="list-header">
        <div class="col col-radio"></div>
        <div class="col col-1">计划跟踪号</div>
        <div class="col col-2">物料编码</div>
        <div class="col col-3">物料名称</div>
      </div>

      <!-- 列表 -->
      <div class="list-body">
        <!-- 单选 -->
        <van-radio-group v-if="checkType === 'radio'" v-model="form.radio">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoadNext"
          >
            <div v-for="row in data" :key="row.id" class="row-card" @click="rowClick(row)">
              <div class="row-card__main">
                <div class="row-card__left" @click.stop>
                  <van-radio :name="row.id" />
                </div>

                <div class="row-card__content">
                  <div class="row-card__top">
                    <!-- <div class="fnumber">{{ row.fnumber || '-' }}</div> -->
                    <div class="code">{{ row.fnumber || '-' }}</div>
                  </div>

                  <div class="row-card__name">
                    {{ row.fname || '-' }}
                  </div>

                  <div class="row-card__meta">
                    <div class="tag">规格</div>
                    <div class="val">{{ row.fspecification || '-' }}</div>

                    <div class="dot"></div>

                    <div class="tag">分组名称</div>
                    <div class="val">{{ row.groupname || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </van-radio-group>

        <!-- 多选 -->
        <van-checkbox-group v-else v-model="checkedIds">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoadNext"
          >
            <div v-for="row in data" :key="row.id" class="row-card" @click="rowClick(row)">
              <div class="row-card__main">
                <div class="row-card__left" @click.stop>
                  <van-checkbox :name="row.id" />
                </div>

                <div class="row-card__content">
                  <div class="row-card__top">
                    <!-- <div class="fnumber">{{ row.fnumber || '-' }}</div> -->
                    <div class="code">{{ row.fnumber || '-' }}</div>
                  </div>

                  <div class="row-card__name">
                    {{ row.fname || '-' }}
                  </div>

                  <div class="row-card__meta">
                    <div class="tag">规格</div>
                    <div class="val">{{ row.specification || '-' }}</div>

                    <div class="dot"></div>

                    <div class="tag">分组名称</div>
                    <div class="val">{{ row.groupname || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </van-checkbox-group>
      </div>

      <!-- 底部操作栏：取消 / 确定 -->
      <div class="bottom-actions">
        <van-button block plain @click="handleClose">取消</van-button>
        <van-button block type="primary" @click="handleConfirm">确定</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { showToast } from 'vant';
import Api from '@/api';

export default {
  name: 'NfPrdmoSelectVant',
  props: {
    modelValue: [String, Number, Object],
    voUrl: { type: String, default: () => '/blade-pda/common/material-search' },
    customOption: Object,
    checkType: { type: String, default: () => 'radio' },
    fuseorgid: { type: String, default: () => '' },
    defaultChecked: [String, Number, Object],
  },
  emits: ['onConfirm', 'change', 'update:modelValue'],

  data() {
    return {
      visible: false,
      loading: false,
      finished: false,
      data: [],
      page: { current: 1, pageSize: 10, total: 0 },
      query: {
        searchType: 'fnumber',
        keyword: '',
      },

      searchTypeOptions: [
        // { text: '计划跟踪号', value: 'fnumber' },
        { text: '物料编码', value: 'fnumber' },
        { text: '物料名称', value: 'fname' },
      ],
      form: { radio: '' },
      checkedIds: [],
      selectionList: [],
    };
  },

  computed: {
    ids() {
      const ids = new Set();
      this.selectionList.forEach((ele) => ids.add(ele.id));
      return Array.from(ids).join(',');
    },
    names() {
      const names = new Set();
      this.selectionList.forEach((ele) => names.add(ele.realName));
      return Array.from(names).join(',');
    },
  },

  watch: {
    checkType: {
      handler(val) {
        this.selectionClear();
        if (val === 'radio') this.form.radio = '';
        else this.checkedIds = [];
      },
      immediate: true,
    },
    visible(val) {
      if (val) this.resetAndLoad();
    },
  },

  methods: {
    handleClose() {
      this.visible = false;
    },
    handleClosed() {},
    handleConfirm() {
      if (this.selectionList.length === 0) {
        showToast('请选择至少一条数据');
        return;
      }
      this.$emit('onConfirm', this.selectionList);
      this.handleClose();
    },
    handleSearch() {
      this.resetAndLoad();
    },
    handleReset() {
      this.query.searchType = 'fnumber';
      this.query.keyword = '';
      this.resetAndLoad();
    },
    resetAndLoad() {
      this.page.current = 1;
      this.data = [];
      this.finished = false;
      this.onLoadNext(true);
    },

    async onLoadNext(isFirst = false) {
      if (this.loading) return;
      if (this.finished && !isFirst) return;
      this.loading = true;

      const params = {
        current: this.page.current,
        size: this.page.pageSize,
        [this.query.searchType]: this.query.keyword || undefined,
        fuseorgid: this.fuseorgid || undefined,
      };

      try {
        const res = await this.$http.request({
          url: this.voUrl,
          method: 'get',
          params,
        });
        const total = res?.data?.total ?? 0;
        const records = res?.data?.records ?? [];

        this.page.total = total;
        this.data = this.data.concat(records);

        if (this.data.length >= total) this.finished = true;
        else this.page.current += 1;

        if (isFirst) await this.changeDefaultChecked();
      } catch (e) {
        showToast('加载失败');
        console.error(e);
        this.finished = true;
      } finally {
        this.loading = false;
      }
    },

    selectionClear() {
      this.selectionList = [];
      this.form.radio = '';
      this.checkedIds = [];
    },

    rowClick(row) {
      if (this.checkType === 'radio') {
        this.selectionList = [row];
        this.form.radio = row.id;
      } else {
        const id = row.id;
        const idx = this.checkedIds.findIndex((x) => String(x) === String(id));
        if (idx >= 0) this.checkedIds.splice(idx, 1);
        else this.checkedIds.push(id);

        const map = new Map(this.selectionList.map((x) => [String(x.id), x]));
        if (idx >= 0) map.delete(String(id));
        else map.set(String(id), row);
        this.selectionList = Array.from(map.values());
      }
    },

    async changeDefaultChecked() {
      const dc = this.defaultChecked;
      if (!dc) return;

      if (this.checkType === 'checkbox') {
        const checks = String(dc).split(',').filter(Boolean);
        if (!checks.length) return;

        this.checkedIds = Array.from(new Set([...this.checkedIds, ...checks]));

        for (const id of checks) {
          let row =
            this.data.find((d) => String(d.id) === String(id)) ||
            this.selectionList.find((d) => String(d.id) === String(id));

          if (!row) {
            try {
              const res = await Api.user.getMaterialDetail(id);
              if (res?.data?.data) row = res.data.data;
            } catch (e) {
              console.error(e);
            }
          }
          if (row) {
            const map = new Map(this.selectionList.map((x) => [String(x.id), x]));
            map.set(String(row.id), row);
            this.selectionList = Array.from(map.values());
          }
        }
      } else {
        const id = typeof dc === 'object' ? dc.id : dc;
        if (!id) return;

        let row = this.data.find((d) => String(d.id) === String(id));
        if (!row) {
          try {
            const res = await Api.user.getMaterialDetail(id);
            if (res?.data?.data) row = res.data.data;
          } catch (e) {
            console.error(e);
          }
        }

        if (row) {
          this.selectionList = [row];
          this.form.radio = row.id;
        } else {
          this.selectionList = [];
          this.form.radio = '';
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.nf-prdmo-dialog {
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa; /* 卡片背景 */
}

/* 搜索区：卡片化 */
.search-wrap {
  padding: 12px;
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-type-dropdown {
  flex-shrink: 0;
  width: 110px;
}

.search-input {
  flex: 1;
}

.search-input :deep(.van-search__content) {
  border-radius: 8px;
  background: #f7f8fa;
}

.search-actions {
  display: flex;
  gap: 10px;
  padding: 0 12px 10px;
}

/* 表头：弱化成提示条（可选，你也可以直接删掉表头） */
.list-header {
  display: grid;
  grid-template-columns: 44px 1fr 90px 1.2fr;
  gap: 8px;
  padding: 8px 12px;
  margin: 0 12px;
  font-size: 12px;
  color: #8a8f99;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(235, 237, 240, 0.8);
}

/* 列表区：留出底部按钮空间 */
.list-body {
  flex: 1;
  overflow: auto;
  padding: 10px 12px 12px;
  padding-bottom: calc(12px + 74px);
}

/* 卡片行 */
.row-card {
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px;
  margin-bottom: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(235, 237, 240, 0.9);
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease;
}

.row-card:active {
  transform: scale(0.99);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.045);
}

/* 卡片主结构 */
.row-card__main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.row-card__left {
  width: 34px;
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

/* 内容区 */
.row-card__content {
  flex: 1;
  min-width: 0;
}

.row-card__top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

/* 计划跟踪号：突出一点 */
.fnumber {
  font-size: 13px;
  font-weight: 700;
  color: #2f3542;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 物料编码：做成小胶囊 */
.code {
  font-size: 12px;
  color: #3a7afe;
  background: rgba(58, 122, 254, 0.08);
  border: 1px solid rgba(58, 122, 254, 0.18);
  padding: 2px 8px;
  border-radius: 999px;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 物料名称：主标题 */
.row-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  line-height: 20px;
  word-break: break-word;
  margin-bottom: 8px;
}

/* meta 信息：规格/数量 */
.row-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #667085;
}

.row-card__meta .tag {
  color: #8a8f99;
}

.row-card__meta .val {
  color: #2f3542;
  font-weight: 500;
}

.row-card__meta .dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(102, 112, 133, 0.4);
  margin: 0 4px;
}

/* 底部操作栏：更“工具条”一点 */
.bottom-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(235, 237, 240, 0.9);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* 让按钮更圆润一点（不强依赖主题） */
.bottom-actions :deep(.van-button) {
  border-radius: 12px;
}
</style>
