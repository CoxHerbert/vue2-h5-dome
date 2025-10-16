<template>
  <div class="me-work-time">
    <van-nav-bar
      class="me-work-time__nav"
      :title="t('me.workTime.title')"
      left-arrow
      fixed
      :border="false"
      safe-area-inset-top
      @click-left="handleBack"
    />
    <div class="me-work-time__top-bg"></div>
    <main class="me-work-time__body">
      <section class="card card--date">
        <div class="card__title">{{ t('me.workTime.dateLabel') }}</div>
        <div class="card__content">
          <input
            class="date-input"
            type="date"
            :max="today"
            :value="selectedDate"
            @change="onDateChange"
          />
        </div>
      </section>

      <section class="card sign-detail">
        <div class="card__title">{{ t('me.workTime.punchDetailTitle') }}</div>
        <div class="card__content">
          <div class="field">
            <div class="field__label">{{ t('me.workTime.punchTimeLabel') }}</div>
            <div class="field__value">{{ punchTime }}</div>
          </div>
        </div>
      </section>

      <section
        v-for="group in groups"
        :key="group.key"
        class="card"
      >
        <div class="card__title">{{ group.label }}</div>
        <div class="card__content card__content--grid">
          <div
            v-for="col in group.columns"
            :key="col.prop"
            class="field"
          >
            <div class="field__label">{{ col.label }}</div>
            <div
              class="field__value"
              :class="{ 'field__value--zero': isZeroValue(col.prop) }"
            >
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { showToast } from 'vant';
import Api from '@/api/index';

const router = useRouter();
const { t } = useI18n();

const today = dayjs().format('YYYY-MM-DD');
const selectedDate = ref(today);
const pageInfo = ref({});
const loading = ref(false);

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
      { label: t('me.workTime.fields.correctionNormalOverHours'), prop: 'correctionNormalOverHours' },
      { label: t('me.workTime.fields.correctionWeekendOverHours'), prop: 'correctionWeekendOverHours' },
      { label: t('me.workTime.fields.correctionHolidayOverHours'), prop: 'correctionHolidayOverHours' },
    ],
  },
]);

const punchTime = computed(() => pageInfo.value?.punchCardData || t('me.workTime.emptyValue'));

function handleBack() {
  router.back();
}

function formatValue(prop) {
  const raw = pageInfo.value?.[prop];
  if (raw === undefined || raw === null || raw === '') return '0';
  if (typeof raw === 'number') return raw.toLocaleString();
  const num = Number(raw);
  if (!Number.isNaN(num)) {
    return num.toLocaleString();
  }
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
    const { code, data, msg } = res || {};
    if (code === 200) {
      pageInfo.value = data || {};
    } else {
      pageInfo.value = {};
      if (msg) {
        showToast({ type: 'fail', message: msg });
      } else {
        showToast({ type: 'fail', message: t('me.workTime.loadFail') });
      }
    }
  } catch (error) {
    pageInfo.value = {};
    showToast({ type: 'fail', message: error?.message || t('me.workTime.loadFail') });
  } finally {
    loading.value = false;
  }
}

function onDateChange(event) {
  const value = event.target?.value;
  if (!value || value === selectedDate.value) return;
  selectedDate.value = value;
  fetchDetail();
}

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.me-work-time {
  min-height: 100vh;
  background: linear-gradient(180deg, #3060ed 0%, rgba(48, 96, 237, 0) 200px), #f7f8fa;
  padding: 56px 0 24px;
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
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(35, 44, 80, 0.08);
  overflow: hidden;

  &__title {
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }

  &__content {
    padding: 0 16px 16px;
  }

  &__content--grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 8%;
  }
}

.card--date {
  .card__content {
    display: flex;
    align-items: center;
  }
}

.date-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
}

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
    color: #333333;

    &--zero {
      color: #848488;
    }
  }
}

.sign-detail {
  .field {
    flex: 1 1 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
