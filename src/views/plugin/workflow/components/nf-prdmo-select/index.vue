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

      <!-- 列表（关键：滚动容器是 list-body） -->
      <div ref="scrollerRef" class="list-body">
        <!-- 单选 -->
        <van-radio-group v-if="checkType === 'radio'" v-model="form.radio">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            :scroller="scroller"
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
                    <div class="motno">{{ row.motno || '-' }}</div>
                    <div class="code">{{ row.materialCode || '-' }}</div>
                  </div>

                  <div class="row-card__name">
                    {{ row.materialName || '-' }}
                  </div>

                  <div class="row-card__meta">
                    <div class="tag">规格</div>
                    <div class="val">{{ row.specification || '-' }}</div>

                    <div class="dot"></div>

                    <div class="tag">数量</div>
                    <div class="val">{{ row.qty ?? '-' }}</div>
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
            :scroller="scroller"
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
                    <div class="motno">{{ row.motno || '-' }}</div>
                    <div class="code">{{ row.materialCode || '-' }}</div>
                  </div>

                  <div class="row-card__name">
                    {{ row.materialName || '-' }}
                  </div>

                  <div class="row-card__meta">
                    <div class="tag">规格</div>
                    <div class="val">{{ row.specification || '-' }}</div>

                    <div class="dot"></div>

                    <div class="tag">数量</div>
                    <div class="val">{{ row.qty ?? '-' }}</div>
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

    // 接口地址
    voUrl: {
      type: String,
      default: () => '/blade-erp/v-prd-mo-material/list',
    },

    // 自定义字段/映射（保留）
    customOption: Object,

    // radio / checkbox
    checkType: {
      type: String,
      default: () => 'radio',
    },

    fuseorgid: {
      type: String,
      default: () => '',
    },

    // 对齐你原组件：外部会传 default-checked
    defaultChecked: [String, Number, Object],
  },
  emits: ['onConfirm'],

  data() {
    return {
      visible: false,

      loading: false,
      finished: false,

      // ✅ van-list 监听的滚动容器（修复上拉无效的关键）
      scroller: null,

      // 数据
      data: [],

      // 分页（与原 page 语义保持一致）
      page: {
        current: 1,
        pageSize: 10,
        total: 0,
      },

      // 查询
      query: {
        searchType: 'motno',
        keyword: '',
      },

      // 搜索类型选项
      searchTypeOptions: [
        { text: '计划跟踪号', value: 'motno' },
        { text: '物料编码', value: 'materialCode' },
        { text: '物料名称', value: 'materialName' },
      ],

      // 单选表单
      form: {
        radio: '',
      },

      // 多选 ids
      checkedIds: [],

      // 选中项（返回给外部）
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
        // 切换模式时清空选择，避免状态串
        this.selectionClear();
        if (val === 'radio') this.form.radio = '';
        else this.checkedIds = [];
      },
      immediate: true,
    },

    // 弹窗打开后才回显 & 绑定滚动容器
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          // ✅ 关键：让 van-list 监听 list-body 的滚动，而不是 window
          this.scroller = this.$refs.scrollerRef || null;
          this.resetAndLoad();
        });
      }
    },
  },

  methods: {
    // 关闭（点击取消/左上角）
    handleClose() {
      this.visible = false;
    },

    // popup 关闭动画结束
    handleClosed() {
      // 这里你可以按需清理
      // this.selectionClear()
    },

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
      this.query.searchType = 'motno';
      this.query.keyword = '';
      this.resetAndLoad();
    },

    resetAndLoad() {
      this.page.current = 1;
      this.data = [];
      this.finished = false;
      this.loading = false; // ✅ 防止上一次 loading 卡住导致不触发 load
      this.onLoadNext(true);
    },

    // 上拉加载（或者首次加载）
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

        // ✅ 追加数据
        this.data = this.data.concat(records);

        // ✅ finished 判定更稳：无数据 或 达到 total
        if (!records.length || this.data.length >= total) {
          this.finished = true;
        } else {
          this.page.current += 1;
        }

        // 首次加载后做默认回显
        if (isFirst) {
          await this.changeDefaultChecked();
        }
      } catch (e) {
        showToast('加载失败');
        console.error(e);
        // ❌ 不要把 finished=true，否则永远不会再触发 load
      } finally {
        this.loading = false;
      }
    },

    selectionClear() {
      this.selectionList = [];
      this.form.radio = '';
      this.checkedIds = [];
    },

    // 行点击（保持你原逻辑：radio 直接替换 selectionList；checkbox toggle）
    rowClick(row) {
      if (this.checkType === 'radio') {
        this.selectionList = [row];
        this.form.radio = row.id;
      } else {
        const id = row.id;
        const idx = this.checkedIds.findIndex((x) => String(x) === String(id));
        if (idx >= 0) this.checkedIds.splice(idx, 1);
        else this.checkedIds.push(id);

        // 用 checkedIds 映射 selectionList（包含跨页：保留已选）
        const map = new Map(this.selectionList.map((x) => [String(x.id), x]));
        if (idx >= 0) map.delete(String(id));
        else map.set(String(id), row);

        this.selectionList = Array.from(map.values());
      }
    },

    // 默认选中回显（对齐你原来的 defaultChecked 逻辑）
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
              // ignore
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
            // ignore
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
  background: #f7f8fa;
}

/* 搜索区：卡片化 */
.search-wrap {
  padding-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
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

/* 表头：弱提示条 */
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

/* ✅ 滚动容器：van-list 现在监听这里 */
.list-body {
  flex: 1;
  height: calc(85vh - 44px - 60px - 40px - 74px);
  overflow: auto;
  padding: 10px 12px 12px;
  padding-bottom: calc(12px + 74px);
  -webkit-overflow-scrolling: touch;
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

.motno {
  font-size: 13px;
  font-weight: 700;
  color: #2f3542;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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

.row-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  line-height: 20px;
  word-break: break-word;
  margin-bottom: 8px;
}

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

/* 底部操作栏 */
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

.bottom-actions :deep(.van-button) {
  border-radius: 12px;
}
</style>
