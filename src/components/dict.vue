<template>
  <component :is="tag" v-if="ready" class="dict-echo">
    <template v-if="asTags">
      <span v-for="(it, i) in items" :key="i" class="dict-chip" :class="it.cls">{{ it.text }}</span>
    </template>
    <template v-else>
      {{ items.map((it) => it.text).join('，') }}
    </template>
  </component>
  <component :is="tag" v-else class="dict-echo loading" />
</template>

<script setup>
import { inject, ref, watch, onMounted, computed } from 'vue';

const props = defineProps({
  code: { type: String, required: true },
  value: { type: [String, Number, Array], default: '' }, // 支持 'a,b,c' / []
  sep: { type: String, default: ',' }, // 字符串分隔符
  join: { type: String, default: ' / ' }, // 路径连接符
  showPath: { type: Boolean, default: false }, // 是否显示“父/子/孙”路径
  tag: { type: String, default: 'span' }, // 外层容器标签
  asTags: { type: Boolean, default: false }, // 以“标签”形式展示多个值
  max: { type: Number, default: Infinity }, // 最多展示个数
});

const dict = inject('dict');
const tree = ref([]);
const mapByValue = ref(new Map());
const mapById = ref(new Map());
const ready = ref(false);

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val == null || val === '') return [];
  return String(val)
    .split(props.sep)
    .map((s) => s.trim())
    .filter(Boolean);
};

const indexTree = (list) => {
  const byV = new Map();
  const byI = new Map();
  const walk = (n) => {
    byV.set(String(n.value), n);
    if (n.id != null) byI.set(String(n.id), n);
    (n.children || []).forEach(walk);
  };
  list.forEach(walk);
  mapByValue.value = byV;
  mapById.value = byI;
};

const load = async () => {
  ready.value = false;
  const t = await dict.getTree(props.code);
  tree.value = t;
  indexTree(t);
  ready.value = true;
};

onMounted(load);
watch(() => props.code, load);

const items = computed(() => {
  const vals = toArray(props.value);
  const out = [];
  for (const v of vals) {
    const n = mapByValue.value.get(String(v));
    if (!n) {
      out.push({ text: String(v), cls: '' });
      continue;
    }
    if (props.showPath) {
      const labels = [];
      let cur = n;
      const seen = new Set();
      while (cur && !seen.has(cur)) {
        labels.unshift(cur.label ?? '');
        const pid = cur.parentId ?? cur.raw?.parentId;
        cur = pid != null ? mapById.value.get(String(pid)) : null;
      }
      out.push({ text: labels.join(props.join), cls: n.listClass || n.class || '' });
    } else {
      out.push({ text: n.label ?? '', cls: n.listClass || n.class || '' });
    }
  }
  return out.slice(0, props.max);
});
</script>

<style scoped>
.dict-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  margin-right: 6px;
  margin-bottom: 4px;
  white-space: nowrap;
}
.dict-echo.loading {
  opacity: 0.6;
}
</style>
