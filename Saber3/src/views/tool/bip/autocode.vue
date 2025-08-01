<template>
  <div class="app-container">
    <el-form
      ref="submitFormRef"
      :model="formData"
      :rules="rules"
      label-width="120"
      v-loading="loading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="作者" prop="author">
            <el-input v-model="formData.author" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模块名" prop="groupName">
            <el-input v-model="formData.groupName" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型id" prop="modelId">
            <el-select v-model="formData.modelId" placeholder="请选择" filterable clearable>
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.modelTable"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="包名" prop="packageName">
            <el-input v-model="formData.packageName" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务路径" prop="serverPath">
            <el-input v-model="formData.serverPath" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实体类服务" prop="entityServerPath">
            <el-input v-model="formData.entityServerPath" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实体类包名" prop="entityPackageName">
            <el-input v-model="formData.entityPackageName" placeholder="请输入" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="center">
      <el-button type="primary" @click="submitForm" v-loading="loading">保存</el-button>
    </div>
  </div>
</template>

<script setup name="AutoCode">
import { onMounted, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  options: [],
  formData: {
    author: null,
    groupName: null,
    modelId: null,
    packageName: null,
    serverPath: null,
    entityServerPath: null,
    entityPackageName: null,
  },
  rules: {
    author: [
      {
        required: true,
        message: '请输入作者',
        trigger: 'blur',
      },
    ],
    groupName: [
      {
        required: true,
        message: '请输入模块名',
        trigger: 'blur',
      },
    ],
    modelId: [
      {
        required: true,
        message: '请选择模型id',
        trigger: 'blur',
      },
    ],
    packageName: [
      {
        required: true,
        message: '请输入包名',
        trigger: 'blur',
      },
    ],
    serverPath: [
      {
        required: true,
        message: '请输入服务路径',
        trigger: 'blur',
      },
    ],
    entityServerPath: [
      {
        required: true,
        message: '请输入实体类服务路径',
        trigger: 'blur',
      },
    ],
    entityPackageName: [
      {
        required: true,
        message: '请输入实体类包名',
        trigger: 'blur',
      },
    ],
  },
});

const { loading, options, formData, rules } = toRefs(pageData);

onMounted(() => {
  getOptions();
});

const getOptions = async () => {
  const res = await Api.configManage.model.list({
    current: 1,
    size: 9999,
  });
  const { code, data } = res.data;
  if (code === 200) {
    options.value = data.records;
  }
};

const submitForm = () => {
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      loading.value = true;
      const res = await Api.configManage.code.submit(formData.value);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        formData.value = {
          ...formData.value,
          modelId: null,
        };
      }
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.app-container {
  .center {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
