<template>
  <div class="sop-doc">
    <van-nav-bar
      class="sop-doc__nav"
      fixed
      left-arrow
      :border="false"
      :title="docTitle"
      @click-left="handleBack"
    />

    <div class="sop-doc__body">
      <van-loading v-if="isLoading" type="spinner" class="sop-doc__loading" size="32" />
      <van-empty
        v-else-if="!contentHtml && !isLoading"
        class="sop-doc__empty"
        description="未查询到相关文档数据"
      />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else class="sop-doc__content" v-html="contentHtml"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { SOP_DOCS } from '@/constants';

const IMAGE_PREFIX = 'https://wiki.eastwinbip.com';
const MARKDOWN_IT_CDN = 'https://cdn.jsdelivr.net/npm/markdown-it@13/dist/markdown-it.min.js';

const route = useRoute();
const router = useRouter();

const markdownRenderer = ref();
const isLoading = ref(false);
const contentHtml = ref('');

const docKey = computed(() => route.query.docKey || route.params.docKey || '');

const docConfig = computed(() => {
  if (!docKey.value) return undefined;

  const value = SOP_DOCS[docKey.value];
  if (!value) return undefined;
  if (typeof value === 'number') {
    return { id: value, title: docKey.value };
  }
  return value;
});

const docTitle = computed(() => docConfig.value?.title || '东创知识库');

onMounted(async () => {
  await ensureMarkdownIt();
});

watch(
  () => docKey.value,
  key => {
    if (!key) return;
    if (!docConfig.value) {
      showToast('未配置对应的文档 ID');
    }
  },
  { immediate: true },
);

watch(
  () => docConfig.value?.id,
  async id => {
    if (!id) {
      contentHtml.value = '';
      return;
    }
    await ensureMarkdownIt();
    await fetchDocContent(id);
  },
  { immediate: true },
);

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace('/home');
  }
}

async function ensureMarkdownIt() {
  if (markdownRenderer.value || typeof window === 'undefined') return;

  if (!window.markdownit) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = MARKDOWN_IT_CDN;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Markdown 资源加载失败'));
      document.head.appendChild(script);
    }).catch(error => {
      showToast(error.message || 'Markdown 加载失败');
    });
  }

  if (window.markdownit) {
    markdownRenderer.value = window.markdownit({
      html: true,
      linkify: true,
      typographer: true,
    });
  }
}

async function fetchDocContent(id) {
  isLoading.value = true;
  contentHtml.value = '';
  try {
    const response = await fetch(`${IMAGE_PREFIX}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query ($id: Int!) {
          pages {
            single(id: $id) {
              id
              title
              path
              content
            }
          }
        }`,
        variables: { id },
      }),
    });

    if (!response.ok) {
      throw new Error('文档加载失败');
    }

    const result = await response.json();
    if (result.errors?.length) {
      throw new Error(result.errors[0]?.message || '文档加载失败');
    }

    const doc = result.data?.pages?.single;
    if (!doc?.content) {
      contentHtml.value = '';
      showToast('未查询到相关文档数据');
      return;
    }

    const html =
      markdownRenderer.value?.render(doc.content) ??
      doc.content;
    contentHtml.value = addPrefixToImgSrc(html, IMAGE_PREFIX);
  } catch (error) {
    showToast(error?.message || '文档加载失败');
  } finally {
    isLoading.value = false;
  }
}

function addPrefixToImgSrc(html, prefix) {
  return html.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/gi, (match, before, src, after) => {
    if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) {
      return match;
    }
    return `<img${before}src="${prefix}${src}"${after}>`;
  });
}

</script>

<style scoped lang="scss">
.sop-doc {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: 46px;

  &__nav {
    background-color: #000;

    :deep(.van-nav-bar__title) {
      color: #fff;
    }

    :deep(.van-icon) {
      color: #fff;
    }
  }

  &__body {
    padding: 16px;
    box-sizing: border-box;
  }

  &__loading {
    margin: 64px auto;
    display: block;
  }

  &__empty {
    padding-top: 64px;
  }

  &__content {
    max-width: 1200px;
    margin: 0 auto;

    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 16px auto;
    }
  }
}
</style>
