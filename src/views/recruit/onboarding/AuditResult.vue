<template>
  <div class="recruit-onboarding-audit">
    <van-nav-bar
      :title="t('recruit.onboarding.auditResult.title')"
      left-arrow
      fixed
      @click-left="handleBack"
    />

    <div class="recruit-onboarding-audit__body">
      <section v-if="detail" class="card">
        <header class="card__header">
          <h2 class="card__title">{{ t('recruit.onboarding.auditResult.sections.personalInfo') }}</h2>
          <van-button size="small" type="primary" plain @click="goSelfForm('look')">
            {{ t('recruit.onboarding.auditResult.actions.viewDetail') }}
          </van-button>
        </header>

        <div class="profile">
          <van-image
            v-if="detail.avatarId"
            :src="detail.avatarId"
            class="profile__avatar"
            fit="cover"
            round
          />
          <div v-else class="profile__avatar profile__avatar--placeholder">{{ initials(detail.name) }}</div>
          <div class="profile__info">
            <div class="profile__name">{{ detail.name || '-' }}</div>
            <div class="profile__meta">
              <span>{{ t('recruit.onboarding.auditResult.fields.mobile') }}：</span>{{ detail.mobile || '-' }}
            </div>
            <div class="profile__meta">
              <span>{{ t('recruit.onboarding.auditResult.fields.cardNo') }}：</span>{{ detail.cardNo || '-' }}
            </div>
          </div>
        </div>

        <van-cell-group inset>
          <van-cell :title="t('recruit.onboarding.auditResult.fields.position')" :value="detail.positionDict || '-'" />
          <van-cell :title="t('recruit.onboarding.auditResult.fields.workYear')" :value="detail.workYear || '-'" />
          <van-cell :title="t('recruit.onboarding.auditResult.fields.isAccommodation')" :value="translateStatus(detail.isAccommodation)" />
        </van-cell-group>
      </section>

      <section v-if="detail" class="card">
        <header class="card__header">
          <h2 class="card__title">{{ t('recruit.onboarding.auditResult.sections.progress') }}</h2>
          <van-tag type="primary" plain>{{ translateStatus(detail.applyStatus) }}</van-tag>
        </header>

        <div v-if="isRefuseStatus" class="status-block status-block--negative">
          <van-icon name="close" />
          <div class="status-block__content">
            <div class="status-block__title">{{ translateStatus(detail.applyStatus) }}</div>
            <p v-if="detail.applyStatus === '初试不通过' && detail.preliminaryDescription">
              {{ detail.preliminaryDescription }}
            </p>
            <p v-else-if="detail.applyStatus === '复试不通过' && detail.finalConclusion">
              {{ detail.finalConclusion }}
            </p>
            <p v-else>
              {{ refusalHint(detail.applyStatus) }}
            </p>
          </div>
        </div>
        <template v-else>
          <van-steps :active="activeStep" direction="vertical" class="status-steps">
            <van-step v-for="step in stepItems" :key="step.status">
              <div class="step__title">{{ step.title }}</div>
              <div v-if="step.description" class="step__desc">{{ step.description }}</div>
            </van-step>
          </van-steps>
        </template>
      </section>

      <section v-if="detail" class="card">
        <div class="actions">
          <template v-if="detail.applyStatus === '待初试' || !detail.applyStatus">
            <van-button block round plain type="primary" @click="confirmStatus('初试已取消')">
              {{ t('recruit.onboarding.auditResult.actions.cancelInitial') }}
            </van-button>
            <van-button block round type="primary" @click="goSelfForm('edit')">
              {{ t('recruit.onboarding.auditResult.actions.changeInfo') }}
            </van-button>
          </template>
          <template v-else-if="detail.applyStatus === '复试已通过'">
            <van-button block round plain type="primary" @click="confirmStatus('拒绝入职')">
              {{ t('recruit.onboarding.auditResult.actions.refuse') }}
            </van-button>
            <van-button block round type="primary" @click="confirmStatus('确认入职')">
              {{ t('recruit.onboarding.auditResult.actions.confirm') }}
            </van-button>
          </template>
          <template v-else-if="detail.applyStatus === '已入职'">
            <van-button block round type="primary" @click="handleResign">
              {{ t('recruit.onboarding.auditResult.actions.resign') }}
            </van-button>
          </template>
          <template v-else-if="canReApply">
            <van-button block round type="primary" @click="goSelfForm('reApply')">
              {{ t('recruit.onboarding.auditResult.actions.reapply') }}
            </van-button>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { showToast, showConfirmDialog } from 'vant';
import Api from '@/api';
import { useUserStore } from '@/store/user';
import { useDictStore } from '@/store/dict';
import { goBackOrHome } from '@/utils/navigation';

const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const dictStore = useDictStore();

const handleBack = () => {
  goBackOrHome(router);
};

const detail = ref(null);
const positionOptions = ref([]);
const companyOptions = ref([]);

const refusalStatuses = new Set(['初试已取消', '初试不通过', '复试不通过', '拒绝入职', '已离职']);

const statusKeyMap = {
  待初试: 'waitingPreliminary',
  初试已通过: 'initialPassed',
  待复试: 'waitingSecond',
  复试已通过: 'interviewPassed',
  待入职: 'waitingEntry',
  确认入职: 'confirmEntry',
  已入职: 'entryFinished',
  复试不通过: 'secondFailed',
  初试不通过: 'initialFailed',
  初试已取消: 'initialCanceled',
  拒绝入职: 'refuseEntry',
  已离职: 'leftCompany',
  复试: 'secondInterview',
  入职: 'entry',
};

const ensureUserInfo = async () => {
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo();
    } catch (err) {
      console.error('Failed to fetch user info', err);
    }
  }
  return userStore.userInfo;
};

const extractList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const loadCompanies = async () => {
  try {
    const res = await Api.recruit.onboarding.getLaborCompanyList({ current: 1, size: 500 });
    const payload = res?.data?.data || res?.data || {};
    companyOptions.value = extractList(payload).map((item) => ({
      value: item?.id || item?.value,
      label: item?.name || item?.label || item?.dictValue,
    }));
  } catch (err) {
    console.error('Failed to load companies', err);
  }
};

const loadPositions = async () => {
  try {
    const list = await dictStore.get('DC_LABOR_POSITION');
    positionOptions.value = (list || []).map((item) => ({ value: item.value, label: item.label }));
  } catch (err) {
    console.error('Failed to load positions', err);
  }
};

const translateStatus = (status) => {
  const key = statusKeyMap[status];
  if (!key) return status || '-';
  return t(`recruit.onboarding.auditResult.statusMap.${key}`, status);
};

const refusalHint = (status) => {
  const key = statusKeyMap[status];
  if (!key) return '';
  return t(`recruit.onboarding.auditResult.refusalHint.${key}`, '');
};

const loadDetail = async () => {
  const userInfo = await ensureUserInfo();
  const createUser = userInfo?.userId || userInfo?.id;
  if (!createUser) return;
  try {
    const res = await Api.recruit.onboarding.getLaborRegisterDetail({ createUser });
    const payload = res?.data?.data || res?.data || null;
    if (payload) {
      const company = companyOptions.value.find((item) => String(item.value) === String(payload.companyId));
      const position = positionOptions.value.find((item) => String(item.value) === String(payload.jobGradeDictCode));
      detail.value = {
        ...payload,
        companyDict: payload.companyDict || company?.label || '',
        positionDict: payload.positionDict || position?.label || '',
      };
    }
  } catch (err) {
    console.error('Failed to load labor register detail', err);
  }
};

const stepItems = computed(() => {
  const data = detail.value || {};
  const status = data.applyStatus || '待初试';
  const initSteps = [
    { status: '待初试', description: data.preliminaryDescription },
    { status: '复试', description: data.finalDescription },
    { status: '入职', descriptionKey: 'entryDefault' },
  ];
  const regularSteps = [
    { status: '待初试', descriptionKey: 'waitingPreliminary' },
    { status: '初试已通过', description: data.preliminaryDescription },
    { status: '待复试', descriptionKey: 'waitingSecond' },
  ];
  let steps = [...regularSteps];

  if (!data.applyStatus || status === '待初试') {
    steps = initSteps;
  } else if (status === '待复试') {
    steps = regularSteps.slice(1);
    steps.push({ status: '入职', descriptionKey: 'entryDefault' });
  } else if (status === '复试已通过') {
    steps = regularSteps.slice(1);
    steps.splice(1, 1);
    steps.push(
      { status: '复试已通过', description: data.finalDescription },
      { status: '待入职', descriptionKey: 'waitingEntry' }
    );
  } else if (status === '确认入职' || status === '已入职') {
    steps = [
      { status: '初试已通过', description: data.preliminaryDescription },
      { status: '复试已通过', description: data.finalConclusion || data.finalDescription },
      { status, descriptionKey: 'entryConfirmed' },
    ];
  } else if (status === '复试不通过') {
    steps = [...regularSteps, { status: '复试不通过', description: data.finalConclusion }];
  } else if (status === '拒绝入职') {
    steps = [...regularSteps, { status: '复试已通过', description: data.finalConclusion }, { status: '拒绝入职', descriptionKey: 'refuseEntry' }];
  }

  return steps.map((item) => ({
    status: item.status,
    title: translateStatus(item.status),
    description: item.description || (item.descriptionKey ? t(`recruit.onboarding.auditResult.stepDesc.${item.descriptionKey}`) : ''),
  }));
});

const activeStep = computed(() => {
  const items = stepItems.value;
  const status = detail.value?.applyStatus;
  if (!status) return 0;
  const index = items.findIndex((item) => item.status === status);
  return index >= 0 ? index : items.length - 1;
});

const isRefuseStatus = computed(() => refusalStatuses.has(detail.value?.applyStatus));
const canReApply = computed(() => refusalStatuses.has(detail.value?.applyStatus));

const goSelfForm = (mode) => {
  router.push({ name: 'recruit-onboarding-self', query: { mode } });
};

const initials = (name) => {
  if (!name) return '--';
  return String(name).trim().slice(0, 1).toUpperCase();
};

const confirmStatus = async (nextStatus) => {
  if (!detail.value) return;
  try {
    await showConfirmDialog({
      title: t('recruit.onboarding.auditResult.dialog.title'),
      message: t(`recruit.onboarding.auditResult.dialog.content.${statusKeyMap[nextStatus] || 'generic'}`),
    });
  } catch {
    return;
  }

  try {
    const payload = { ...detail.value, applyStatus: nextStatus };
    await Api.recruit.onboarding.updateLaborRegister(payload);
    showToast(t('recruit.onboarding.auditResult.messages.statusUpdated'));
    await loadDetail();
  } catch (err) {
    console.error('Failed to update status', err);
    showToast(err?.message || t('common.errors.system'));
  }
};

const handleResign = () => {
  const origin = window.location.origin || '';
  const url = origin.includes('h5')
    ? '/pages/plugin/workflow/pages/form/start?p=eyJwcm9jZXNzSWQiOiJsYWJvcl9sZWF2aW5nOjI1OmQ5NWQwMjk0LTA0NjMtMTFmMC04MjBkLTY2MjU1NTM4ODQ4MyJ9'
    : '/pages/plugin/workflow/pages/form/start?p=eyJwcm9jZXNzSWQiOiJsYWJvcl9sZWF2aW5nOjI5OjM4MmQ5MzM5LTAzZGEtMTFmMC04YTE1LTAwZmY2NDg4NDg0NyJ9';
  window.open(url, '_blank');
};

onMounted(async () => {
  await Promise.all([loadCompanies(), loadPositions()]);
  await loadDetail();
});
</script>

<style scoped lang="scss">
.recruit-onboarding-audit {
  padding-top: 46px;
  min-height: 100vh;
  background: #f5f7fa;

  &__body {
    padding: 16px 12px 32px;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.profile {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &__avatar {
    width: 56px;
    height: 56px;
    background: #fde68a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    color: #92400e;
    margin-right: 12px;
  }

  &__avatar--placeholder {
    border-radius: 50%;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  &__meta {
    font-size: 13px;
    color: #666;
    line-height: 20px;
  }
}

.status-block {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;

  &--negative {
    border: 1px solid #fecaca;
  }

  .van-icon {
    font-size: 24px;
    margin-right: 12px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  &__content {
    flex: 1;
  }

  &__content p {
    margin: 0;
    line-height: 20px;
  }
}

.status-steps {
  :deep(.van-step__title) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.van-step__circle-container) {
    width: 16px;
    height: 16px;
  }
}

.step__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step__desc {
  font-size: 12px;
  color: #666;
}

.actions {
  display: grid;
  gap: 12px;
}
</style>
