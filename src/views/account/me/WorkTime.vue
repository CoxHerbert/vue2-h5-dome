<template>
  <div class="me-work-time">
    <dc-nav-bar
      class="me-work-time__nav"
      :title="t('me.workTime.title')"
      left-arrow
      fixed
      :border="false"
      safe-area-inset-top
      placeholder
      @click-left="handleBack"
    />
    <div class="me-work-time__top-bg"></div>

    <main class="me-work-time__body">
      <!-- 日期卡片：月视图 / 周视图（收起） -->
      <section class="card card--date">
        <div class="card__title">{{ t('me.workTime.dateLabel') }}</div>

        <div class="card__content">
          <!-- 日历头部 -->
          <div class="dc-cal__header">
            <van-icon name="arrow-left" class="dc-cal__arrow" @click="goPrevMonth" />
            <div class="dc-cal__title">
              <span class="dc-cal__month">{{ currentMonthLabel }}</span>
              <button class="dc-cal__year" type="button" @click="showYearPicker = true">
                {{ currentYearLabel }}
                <van-icon name="arrow-down" />
              </button>
            </div>
            <van-icon name="arrow" class="dc-cal__arrow" @click="goNextMonth" />
          </div>

          <!-- 星期标题 -->
          <div class="dc-cal__week">
            <div v-for="w in weekNames" :key="w" class="dc-cal__week-item">{{ w }}</div>
          </div>

          <!-- 日期网格：展开=整月；收起=仅选中的那一行 -->
          <div class="dc-cal__grid" :class="{ 'is-collapsed': isCollapsed }">
            <div v-for="(week, wIdx) in displayWeeks" :key="wIdx" class="dc-cal__row">
              <div
                v-for="cell in week"
                :key="cell.date"
                class="dc-cal__cell"
                :class="{
                  'is-out': !cell.inMonth,
                  'is-today': cell.date === today,
                  'is-selected': cell.date === selectedDate,
                }"
                @click="onCellClick(cell)"
              >
                <div v-if="cell.date === today" class="dc-cal__dot"></div>
                <span class="dc-cal__text">{{ cell.day }}</span>
              </div>
            </div>

            <!-- 收起态的小滑块装饰（示意） -->
            <div v-if="isCollapsed" class="dc-cal__bar"></div>
          </div>

          <!-- 展开/收起开关 -->
          <div class="dc-cal__toggle" @click="isCollapsed = !isCollapsed">
            <span>{{ isCollapsed ? t('common.expand') : t('common.collapse') }}</span>
            <van-icon :name="isCollapsed ? 'arrow-down' : 'arrow-up'" />
          </div>
        </div>
      </section>

      <!-- 打卡明细 -->
      <section class="card sign-detail">
        <div class="card__title">{{ t('me.workTime.punchDetailTitle') }}</div>
        <div class="card__content">
          <div class="field">
            <div class="field__label">{{ t('me.workTime.punchTimeLabel') }}</div>
            <div class="field__value">{{ punchTime }}</div>
          </div>
        </div>
      </section>

      <!-- 分组数据 -->
      <section v-for="group in groups" :key="group.key" class="card">
        <div class="card__title">{{ group.label }}</div>
        <div class="card__content card__content--grid">
          <div v-for="col in group.columns" :key="col.prop" class="field">
            <div class="field__label">{{ col.label }}</div>
            <div class="field__value" :class="{ 'field__value--zero': isZeroValue(col.prop) }">
              {{ formatValue(col.prop) }}
            </div>
          </div>
        </div>
      </section>
    </main>

    <transition name="fade">
      <div v-if="loading" class="me-work-time__loading">
        <van-loading size="28px" />
      </div>
    </transition>

    <!-- 年份选择器 -->
    <van-popup v-model:show="showYearPicker" round position="bottom" :safe-area-inset-bottom="true">
      <van-picker
        :columns="yearColumns"
        :default-index="yearDefaultIndex"
        :visible-option-num="5"
        :cancel-button-text="t('common.cancel')"
        :confirm-button-text="t('common.confirm')"
        @confirm="onYearConfirm"
        @cancel="showYearPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import Api from '@/api/index';
import { showToast } from 'vant';

const router = useRouter();
const { t, tm } = useI18n();

const today = dayjs().format('YYYY-MM-DD');
const selectedDate = ref(today); // 当前选中日期（字符串）
const visibleMonth = ref(dayjs(today).startOf('month')); // 当前视图所在月份
const isCollapsed = ref(false); // 默认先展示整月，可点击收起
const showYearPicker = ref(false);

const pageInfo = ref({});
const loading = ref(false);

const defaultWeekNames = ['一', '二', '三', '四', '五', '六', '日'];

const weekNames = computed(() => {
  const names = typeof tm === 'function' ? tm('me.workTime.weekNames') : null;
  if (Array.isArray(names) && names.length === 7) {
    return names;
  }
  return defaultWeekNames;
});

function getTranslationWithFallback(key, params, fallback) {
  const translated = t(key, params);
  if (translated && translated !== key) {
    return translated;
  }
  return fallback;
}

function formatMonthLabel(monthValue) {
  return getTranslationWithFallback('me.workTime.monthLabel', { month: monthValue }, `${monthValue}月`);
}

function formatYearLabel(yearValue) {
  return getTranslationWithFallback('me.workTime.yearLabel', { year: yearValue }, `${yearValue}年`);
}

function formatYearOption(yearValue) {
  const fallback = formatYearLabel(yearValue);
  return getTranslationWithFallback('me.workTime.yearOption', { year: yearValue }, fallback);
}

const currentMonthLabel = computed(() => formatMonthLabel(visibleMonth.value.format('M')));

const currentYearLabel = computed(() => formatYearLabel(visibleMonth.value.format('YYYY')));

// 年份列（以当前年为中心，向前后各 10 年）
const yearColumns = computed(() => {
  const current = dayjs().year();
  const list = [];
  for (let y = current - 10; y <= current + 10; y++) {
    list.push({ text: formatYearOption(y), value: y });
  }
  return list;
});
const yearDefaultIndex = computed(() => {
  const y = visibleMonth.value.year();
  const idx = yearColumns.value.findIndex((i) => i.value === y);
  return idx >= 0 ? idx : 10;
});

const groups = computed(() => [
  {
    key: 'attendance',
    label: t('me.workTime.groups.attendance'),
    columns: [
      { label: t('me.workTime.fields.normalHours'), prop: 'normalHours' },
      { label: t('me.workTime.fields.travelNormalHours'), prop: 'travelNormalHours' },
      { label: t('me.workTime.fields.paidLeaveHours'), prop: 'paidLeaveHours' },
      { label: t('me.workTime.fields.unpaidLeaveHours'), prop: 'unpaidLeaveHours' },
      { label: t('me.workTime.fields.restHours'), prop: 'restHours' },
      { label: t('me.workTime.fields.holidayHours'), prop: 'holidayHours' },
      { label: t('me.workTime.fields.paidStopHours'), prop: 'paidStopHours' },
      { label: t('me.workTime.fields.unpaidStopHours'), prop: 'unpaidStopHours' },
    ],
  },
  {
    key: 'overtime',
    label: t('me.workTime.groups.overtime'),
    columns: [
      { label: t('me.workTime.fields.cardOverHours'), prop: 'cardOverHours' },
      { label: t('me.workTime.fields.applyOverHours'), prop: 'applyOverHours' },
      { label: t('me.workTime.fields.normalOverHours'), prop: 'normalOverHours' },
      { label: t('me.workTime.fields.travelOverHours'), prop: 'travelOverHours' },
      { label: t('me.workTime.fields.restOverHours'), prop: 'restOverHours' },
      { label: t('me.workTime.fields.holidayOverHours'), prop: 'holidayOverHours' },
      { label: t('me.workTime.fields.overToLeaveHours'), prop: 'overToLeaveHours' },
      { label: t('me.workTime.fields.leaveSettlementHours'), prop: 'leaveSettlementHours' },
    ],
  },
  {
    key: 'abnormal',
    label: t('me.workTime.groups.abnormal'),
    columns: [
      { label: t('me.workTime.fields.lateMinutes'), prop: 'lateMinutes' },
      { label: t('me.workTime.fields.lateCount'), prop: 'lateCount' },
      { label: t('me.workTime.fields.leaveEarlyMinutes'), prop: 'leaveEarlyMinutes' },
      { label: t('me.workTime.fields.leaveEarlyCount'), prop: 'leaveEarlyCount' },
      { label: t('me.workTime.fields.absenteeismHours'), prop: 'absenteeismHours' },
    ],
  },
  {
    key: 'correction',
    label: t('me.workTime.groups.correction'),
    columns: [
      { label: t('me.workTime.fields.correctionNormalHours'), prop: 'correctionNormalHours' },
      {
        label: t('me.workTime.fields.correctionNormalOverHours'),
        prop: 'correctionNormalOverHours',
      },
      {
        label: t('me.workTime.fields.correctionWeekendOverHours'),
        prop: 'correctionWeekendOverHours',
      },
      {
        label: t('me.workTime.fields.correctionHolidayOverHours'),
        prop: 'correctionHolidayOverHours',
      },
    ],
  },
]);

const punchTime = computed(() => pageInfo.value?.punchCardData || t('me.workTime.emptyValue'));

/** ===== 日历计算（周起始：周一） ===== */
function buildMonthWeeks(baseMonth /* dayjs startOf('month') */) {
  const first = baseMonth.startOf('month');
  const last = baseMonth.endOf('month');
  const monthStr = first.format('YYYY-MM');

  // day()：0=周日...6=周六；转为周一为一周起点的偏移
  const mondayOffset = (first.day() + 6) % 7; // 周一=0，周日=6
  const daysInMonth = last.date();

  const cells = [];
  // 前导占位
  for (let i = 0; i < mondayOffset; i++) {
    const d = first.subtract(mondayOffset - i, 'day');
    cells.push({
      date: d.format('YYYY-MM-DD'),
      day: d.date(),
      inMonth: false,
    });
  }
  // 当月
  for (let i = 1; i <= daysInMonth; i++) {
    const d = dayjs(`${monthStr}-${String(i).padStart(2, '0')}`);
    cells.push({
      date: d.format('YYYY-MM-DD'),
      day: i,
      inMonth: true,
    });
  }
  // 补齐到 7 的倍数
  const remain = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remain; i++) {
    const d = last.add(i, 'day');
    cells.push({
      date: d.format('YYYY-MM-DD'),
      day: d.date(),
      inMonth: false,
    });
  }

  // 分周
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const allWeeks = computed(() => buildMonthWeeks(visibleMonth.value));

const activeWeekIndex = computed(() => {
  const idx = allWeeks.value.flat().findIndex((c) => c.date === selectedDate.value);
  return idx >= 0 ? Math.floor(idx / 7) : 0;
});

const displayWeeks = computed(() => {
  return isCollapsed.value
    ? [allWeeks.value[activeWeekIndex.value] || allWeeks.value[0]]
    : allWeeks.value;
});

/** ===== 交互 ===== */
function onCellClick(cell) {
  // 允许点击「非本月」单元直接跳转月份
  if (!cell.inMonth) {
    visibleMonth.value = dayjs(cell.date).startOf('month');
  }
  selectedDate.value = cell.date;
  fetchDetail();
  // 收起状态下，切换行
  if (isCollapsed.value) {
    // activeWeekIndex 是计算属性，selectedDate 变化后会自动更新
  }
}
function goPrevMonth() {
  visibleMonth.value = visibleMonth.value.subtract(1, 'month');
}
function goNextMonth() {
  visibleMonth.value = visibleMonth.value.add(1, 'month');
}
function onYearConfirm({ selectedOptions }) {
  const y = selectedOptions?.[0]?.value;
  if (typeof y === 'number') {
    const newMonth = visibleMonth.value.year(y);
    // 修正日期越界（如 31 号 -> 小月）
    const d = dayjs(selectedDate.value);
    if (d.year() !== y) {
      const safeDay = Math.min(d.date(), newMonth.endOf('month').date());
      const nextSelected = newMonth.date(safeDay).format('YYYY-MM-DD');
      selectedDate.value = nextSelected;
      fetchDetail();
    }
    visibleMonth.value = newMonth.startOf('month');
  }
  showYearPicker.value = false;
}

// 如果切换月份后，选中日期不在该月，默认把选中移动到该月的「同日或末日」
watch(visibleMonth, (m) => {
  const d = dayjs(selectedDate.value);
  if (!d.isSame(m, 'month')) {
    const safeDay = Math.min(d.date(), m.endOf('month').date());
    selectedDate.value = m.date(safeDay).format('YYYY-MM-DD');
    fetchDetail();
  }
});

/** ===== 原有数据逻辑 ===== */
function handleBack() {
  router.back();
}
function formatValue(prop) {
  const raw = pageInfo.value?.[prop];
  if (raw === undefined || raw === null || raw === '') return '0';
  if (typeof raw === 'number') return raw.toLocaleString();
  const num = Number(raw);
  if (!Number.isNaN(num)) return num.toLocaleString();
  return raw;
}
function isZeroValue(prop) {
  const raw = pageInfo.value?.[prop];
  if (raw === undefined || raw === null || raw === '' || raw === '0') return true;
  const num = Number(raw);
  return !Number.isNaN(num) ? Number(num.toFixed(6)) === 0 : false;
}

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await Api.user.getUserDailyAttendanceInfo({ attendanceDate: selectedDate.value });
    const { code, data, msg } = res.data || {};
    if (code === 200) {
      pageInfo.value = data || {};
    } else {
      pageInfo.value = {};
      showToast({ type: 'fail', message: msg || t('me.workTime.loadFail') });
    }
  } catch (error) {
    pageInfo.value = {};
    showToast({ type: 'fail', message: error?.message || t('me.workTime.loadFail') });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.me-work-time {
  min-height: 100vh;
  background: linear-gradient(180deg, #3060ed 0%, rgba(48, 96, 237, 0) 200px), #f7f8fa;
  padding: 0 0 24px;
  padding-bottom: calc(96px + constant(safe-area-inset-bottom));
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
  position: relative;

  &__nav {
    background: transparent;
  }
  &__top-bg {
    height: 160px;
    background: #3060ed;
  }

  &__body {
    margin-top: -120px;
    padding: 0 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__loading {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(35, 44, 80, 0.08);
  overflow: hidden;

  &__title {
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  &__content {
    padding: 0 16px 12px;
  }
  &__content--grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 8%;
  }
}

/* ===== 日历样式 ===== */
.dc-cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  margin-bottom: 8px;
  user-select: none;
}
.dc-cal__arrow {
  font-size: 18px;
  color: #333;
  padding: 6px;
  border-radius: 8px;
  &:active {
    background: #f2f3f5;
  }
}
.dc-cal__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.dc-cal__month {
  font-size: 18px;
  color: #333;
}
.dc-cal__year {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  font-size: 14px;
  color: #848488;
}

.dc-cal__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 6px 0;
  color: #848488;
  font-size: 12px;
}
.dc-cal__week-item {
  text-align: center;
}

.dc-cal__grid {
  position: relative;
  display: grid;
  grid-auto-rows: 44px; /* 每一行高度 */
  gap: 6px;
  margin-top: 4px;

  &.is-collapsed {
    grid-auto-rows: 44px;
  }
}
.dc-cal__row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.dc-cal__cell {
  position: relative;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 15px;
  background: #fff;

  &.is-out {
    color: #c5c8ce;
  }
  &.is-today .dc-cal__text {
    font-weight: 700;
  }
  &.is-selected {
    background: rgba(48, 96, 237, 0.08);
    box-shadow: inset 0 0 0 2px #3060ed;
    color: #3060ed;
    .dc-cal__text {
      font-weight: 700;
    }
  }
}
.dc-cal__dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3060ed;
}
.dc-cal__text {
  line-height: 1;
}

.dc-cal__bar {
  width: 54px;
  height: 4px;
  background: #333;
  border-radius: 999px;
  opacity: 0.3;
  margin: 6px auto 0;
}

.dc-cal__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0 2px;
  color: #848488;
  font-size: 13px;
}

/* 其它字段 */
.field {
  flex: 1 1 46%;
  min-width: 140px;
  &__label {
    font-size: 14px;
    color: #848488;
  }
  &__value {
    margin-top: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    &--zero {
      color: #848488;
    }
  }
}
.sign-detail .field {
  flex: 1 1 100%;
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
