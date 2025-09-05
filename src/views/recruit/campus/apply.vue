<!-- src/views/recruit/campus/apply.vue -->
<template>
  <img class="banner" src="/images/recruit/campus/apply/banner.svg" alt="banner" />
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
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { showToast } from 'vant';
import Api from '@/api/index';

/** ====== schema：只用 fields；可选全局 layout/labelWidth ====== */
const schema = {
  layout: 'vertical',
  labelWidth: 100,
  fields: [
    {
      type: 'input',
      name: 'name',
      label: '您的姓名',
      required: true,
      placeholder: '请输入姓名',
    },
    {
      type: 'radio',
      name: 'sex',
      label: '您的性别',
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    {
      type: 'input',
      name: 'phone',
      label: '请输入您的手机号',
      required: true,
      placeholder: '请输入手机号',
      inputType: 'tel',
      validate: {
        pattern: '^1\\d{10}$',
        message: '手机号格式不正确',
      },
    },
    {
      type: 'input',
      name: 'graduateSchool',
      label: '请填写您的毕业院校',
      required: true,
      placeholder: '请输入毕业院校',
    },
    {
      type: 'input',
      name: 'professionalName',
      label: '请填写您的专业',
      required: true,
      placeholder: '请输入专业',
    },
    {
      type: 'checkbox',
      name: 'applyChannel',
      label: '应聘渠道（单选）',
      required: true,
      max: 1,
      options: [
        { label: '校园招聘会', value: 'campus_fair' },
        { label: '网络招聘', value: 'online' },
        {
          label: '同学推荐（推荐人姓名）',
          value: 'classmate_ref',
          extra: {
            key: 'referrerName',
            placeholder: '姓名',
            required: true,
          },
        },
        {
          label: '同事推荐（推荐人姓名）',
          value: 'colleague_ref',
          extra: {
            key: 'referrerName',
            placeholder: '姓名',
            required: true,
          },
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'joinPostIds',
      label: '意向岗位（多选）',
      required: true,
      max: 3,
      desc: '最多选择3项',
      options: [
        { label: '机械工程师', value: 'mech' },
        { label: '电器工程师', value: 'elec_hw' },
        { label: '软件工程师', value: 'soft' },
        { label: '电子工程师', value: 'elec' },
        { label: 'PM（项目）', value: 'pm' },
      ],
    },
    {
      type: 'checkbox',
      name: 'desiredLocation',
      label: '意向工作地点（多选）',
      required: true,
      options: [
        { label: '东莞市寮步镇', value: 'dongguan_liaobu' },
        { label: '浙江省嘉善县', value: 'jiashan' },
      ],
    },
    {
      type: 'uploader',
      name: 'resumeUrl',
      label: '简历上传',
      required: true,
      placeholder: '文件命名方式：“学校+专业+应聘岗位+姓名”',
      upload: {
        maxCount: 1,
        accept: '.pdf,.doc,.docx',
        maxSize: 5242880,
      },
    },
  ],
};

/** ====== v-model：表单数据 ====== */
const form = ref({
  name: '王芝林',
  sex: 'male',
  phone: '15824223890',
  graduateSchool: '麻省理工学院',
  professionalName: '金融学',
  applyChannel: '',
  joinPostIds: '',
  desiredLocation: '',
  resumeUrl: [
    {
      file: {},
      status: '',
      message: '',
      objectUrl: 'blob:http://localhost:5174/0c5ac8d4-e6e8-48f6-8a2d-51e037676925',
    },
  ],
  referrerName: '王芝林',
});

/** ====== 组件事件 ====== */
function handleSubmit(payload) {
  Api.recruit.campus.apply
    .postTalentUser(payload)
    .then((res) => {
      const { code, data } = res.data;
      if (code === 200) {
      }
    })
    .catch((err) => {});
}
function handleClear() {
  // 这里的 form 已被组件重置；如需额外处理可写在此
  showToast('已清空表单');
}
function handleCancel() {
  showToast('已取消');
  // 可按需求返回上一页：history.back()
}
function handleChange(evt) {
  console.log(evt);
}
</script>

<style scoped>
/* 可选：页面级额外样式 */
.banner {
  width: 100%;
}
</style>
