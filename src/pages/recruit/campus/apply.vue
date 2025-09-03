<!-- src/pages/recruit/campus/apply.vue -->
<script setup>
import { ref } from 'vue';
import { showToast } from 'vant';
import RecruitForm from '@/components/RecruitForm.vue';
import { areaList } from '@vant/area-data';

/** ====== mock: 远程院校搜索（示例） ====== */
async function fetchColleges(q) {
  const all = [
    { id: 'zju', name: '浙江大学' },
    { id: 'scut', name: '华南理工大学' },
    { id: 'jxu', name: '嘉兴学院' },
    { id: 'hfut', name: '合肥工业大学' },
  ];
  if (!q) return all;
  await new Promise((r) => setTimeout(r, 200)); // 模拟网络延迟
  return all.filter((i) => i.name.includes(q));
}

/** ====== mock: picker 列表（岗位类型） ====== */
const jobTypes = [
  { label: '软件工程师', value: 'SWE' },
  { label: '算法工程师', value: 'ML' },
  { label: '测试工程师', value: 'QA' },
];

/** ====== schema：只用 fields；可选全局 layout/labelWidth ====== */
const schema = {
  layout: 'vertical', // 全局上下布局；需要横排的字段可在字段级用 layout:'horizontal' 覆盖
  labelWidth: 100, // 仅对 horizontal 生效
  fields: [
    { name: 'fullName', label: '姓名', type: 'input', required: true },
    {
      name: 'gender',
      label: '性别',
      type: 'radio',
      required: true,
      options: [
        { label: '男', value: 'M' },
        { label: '女', value: 'F' },
      ],
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'input',
      required: true,
      validate: { pattern: /^1[3-9]\d{9}$/, message: '请输入正确手机号' },
      disabled: { when: 'fullName', equals: '' }, // 姓名为空时禁用
    },
    { name: 'idCard', label: '身份证', type: 'input', placeholder: '只读示例' },

    // 仅男生显示
    {
      name: 'military',
      label: '是否服兵役',
      type: 'radio',
      visibleWhen: { when: 'gender', equals: 'M' },
      options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ],
    },

    // picker（岗位类型）
    {
      name: 'jobType',
      label: '应聘岗位',
      type: 'picker',
      required: true,
      columns: jobTypes,
      placeholder: '请选择岗位',
    },

    // date（可到岗日期）
    {
      name: 'availableDate',
      label: '可到岗日期',
      type: 'date',
      required: true,
      dateType: 'date',
      minDate: new Date(),
    },

    // 地区选择
    { name: 'currentArea', label: '当前地区', type: 'area', required: true, areaList },

    // searchPicker（远程搜索学校）；把 label 写入额外字段 collegeName
    {
      name: 'collegeId',
      label: '毕业院校',
      type: 'searchPicker',
      required: true,
      search: {
        fetch: fetchColleges,
        labelKey: 'name',
        valueKey: 'id',
        attachLabelField: 'collegeName',
        debounce: 200,
        autoload: true,
      },
      displayFormatter: (v, m) => m.collegeName || '',
    },

    // 复选 + 选中后补充输入（extra）
    {
      name: 'applyChannels',
      label: '应聘渠道',
      type: 'checkbox',
      required: true,
      options: [
        { label: '校园招聘会', value: 'campus' },
        { label: '网络招聘', value: 'online' },
        {
          label: '同学推荐',
          value: 'classmate',
          extra: {
            key: 'classmateRefName',
            label: '推荐人姓名',
            required: true,
            pattern: /^.{2,20}$/,
            message: '2-20 字',
          },
        },
        {
          label: '其他',
          value: 'other',
          extra: {
            key: 'otherDetail',
            label: '说明',
            placeholder: '请填写渠道说明',
            required: true,
          },
        },
      ],
    },

    // 简历上传
    {
      name: 'resume',
      label: '简历上传',
      type: 'uploader',
      required: true,
      upload: { maxCount: 1, accept: '.pdf,.doc,.docx', maxSize: 10 * 1024 * 1024 },
      placeholder: '支持 .pdf/.doc/.docx，≤10MB',
    },

    // 自我介绍：演示字段级横向 + 自定义 label 宽度
    {
      name: 'selfIntro',
      label: '自我介绍',
      type: 'textarea',
      rows: 4,
      maxlength: 400,
      labelWidth: 80,
    },
  ],
  // 可选：提交前映射（示例）
  mapSubmit(model) {
    const file = model.resume?.[0];
    return {
      ...model,
      resume: file ? { name: file.name, size: file.size } : null,
    };
  },
};

/** ====== v-model：表单数据 ====== */
const form = ref({
  fullName: '',
  gender: '',
  phone: '',
  idCard: '310xxxxxxxxxxxxx',
  jobType: '',
  availableDate: '',
  currentArea: '',
  collegeId: '',
  collegeName: '',
  applyChannels: [],
  classmateRefName: '',
  otherDetail: '',
  resume: [],
  selfIntro: '',
});

/** ====== 组件事件 ====== */
function handleSubmit(payload) {
  console.log('✅ 校验通过，提交的数据：', payload);
  showToast('提交成功');
}
function handleClear() {
  // 这里的 form 已被组件重置；如需额外处理可写在此
  showToast('已清空表单');
}
function handleCancel() {
  showToast('已取消');
  // 可按需求返回上一页：history.back()
}
</script>

<template>
  <RecruitForm
    v-model="form"
    :schema="schema"
    submit-text="提交"
    clear-text="清空"
    cancel-text="取消"
    :show-cancel="true"
    :show-clear="true"
    :compact="true"
    :fixed-actions="true"
    @submit="handleSubmit"
    @clear="handleClear"
    @cancel="handleCancel"
  />
</template>

<style scoped>
/* 可选：页面级额外样式 */
</style>
