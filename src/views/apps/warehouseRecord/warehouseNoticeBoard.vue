<template>
  <div class="page warehouse-notice-board">
    <dc-pagination
      ref="listRef"
      v-model:keyword="keyword"
      search-placeholder="请输入关键字"
      :page-size="8"
      :offset="200"
      :fetcher="fetcher"
      :get-nav-el="resolveNavEl"
      :tabs-visible="false"
      @add="handleAdd"
    >
      <template #nav>
        <van-nav-bar ref="navRef" title="装配工具借用" fixed left-arrow @click-left="goBack" />
      </template>

      <template #item="{ item }">
        <div class="card">
          <div class="card__header">
            <div class="title">{{ item.name || '未命名' }}</div>
          </div>
          <div class="card__footer">
            <van-button size="small" type="primary" plain @click.stop="handleEdit(item)"
              >编辑</van-button
            >
            <van-button size="small" type="danger" plain @click.stop="handleDelete(item)"
              >删除</van-button
            >
          </div>
        </div>
      </template>

      <template #empty>
        <van-empty description="暂无记录">
          <van-button type="primary" round size="small" @click="handleAdd">新增记录</van-button>
        </van-empty>
      </template>
    </dc-pagination>

    <van-popup v-model:show="open" position="bottom" round class="notice-popup">
      <div class="notice-popup__header">{{ title }}</div>
      <van-form @submit="submitForm">
        <van-cell-group inset>
          <van-field v-model="formData.name" label="示例" placeholder="示例" />
        </van-cell-group>
        <div class="notice-popup__footer">
          <van-button type="primary" block native-type="submit">提交</van-button>
          <van-button block class="notice-popup__cancel" @click="closePopup">取消</van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { useRouter } from 'vue-router';
import Api from '@/api/index';
import { goBackOrHome } from '@/utils/navigation';

const router = useRouter();

const navRef = ref(null);
const listRef = ref(null);
const keyword = ref('');
const open = ref(false);
const title = ref('');
const formData = reactive({
  id: null,
  name: '',
});

const resolveNavEl = () => {
  const target = navRef.value;
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if (target.$el instanceof HTMLElement) return target.$el;
  if (target.$?.subTree?.el instanceof HTMLElement) return target.$?.subTree?.el;
  return null;
};

async function fetcher({ pageNo, pageSize, keyword }) {
  const params = {
    current: pageNo,
    size: pageSize,
  };
  const trimmedKeyword = (keyword ?? '').toString().trim();
  if (trimmedKeyword) params.ex = trimmedKeyword;
  const res = await Api.list(params);
  const { code, data, msg } = res?.data || {};
  if (code !== 200 || !data) throw new Error(msg || '加载失败');
  return data;
}

const handleAdd = () => {
  title.value = '新增';
  formData.id = null;
  formData.name = '';
  open.value = true;
};

const handleEdit = (row) => {
  title.value = '编辑';
  formData.id = row?.id ?? null;
  formData.name = row?.name ?? '';
  open.value = true;
};

const closePopup = () => {
  open.value = false;
  title.value = '';
  formData.id = null;
  formData.name = '';
};

const submitForm = async () => {
  const payload = { ...formData };
  const res = await Api.submit(payload);
  const { code } = res?.data || {};
  if (code === 200) {
    showToast({ type: 'success', message: '保存成功' });
    closePopup();
    listRef.value?.resetAndLoad?.();
  }
};

const handleDelete = async (row) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定删除“${row.name || row.id}”吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
    await Api.remove({ ids: row.id });
    showToast({ type: 'success', message: '操作成功' });
    listRef.value?.resetAndLoad?.();
  } catch (error) {
    if (error && error !== 'cancel') {
      showToast({ type: 'fail', message: '删除失败' });
    }
  }
};

const goBack = () => {
  goBackOrHome(router);
};
</script>

<style lang="scss" scoped>
.warehouse-notice-board {
  min-height: 100vh;
  background: #f7f8fa;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card__header .title {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.card__footer {
  display: flex;
  gap: 8px;
}

.notice-popup {
  padding-bottom: 16px;

  &__header {
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  &__footer {
    padding: 12px 16px 0;
    display: grid;
    gap: 8px;
  }

  &__cancel {
    margin-bottom: 12px;
  }
}
</style>
