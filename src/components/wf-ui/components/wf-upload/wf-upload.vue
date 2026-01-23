<template>
  <div class="wf-upload">
    <van-uploader
      v-model="fileList"
      :max-count="limit"
      :max-size="fileSize * 1024 * 1024"
      :disabled="disabled"
      :after-read="handleAfterRead"
      :before-delete="handleBeforeDelete"
      :upload-text="column.buttonText || '点击上传'"
      :multiple="column.multiple !== false"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Uploader } from 'vant';
import { DIC_HTTP_PROPS } from '../../util/variable.js';
import { deepClone } from '../../util/index.js';
import Api from '@/api';
import Props from '../../mixins/props.js';

export default defineComponent({
  name: 'WfUpload',
  components: {
    [Uploader.name]: Uploader,
  },
  mixins: [Props],
  data() {
    return {
      fileList: [],
    };
  },
  computed: {
    action() {
      return this.column.action;
    },
    limit() {
      return this.column.limit || Number.MAX_VALUE;
    },
    fileSize() {
      return this.column.fileSize || Number.MAX_VALUE;
    },
    header() {
      return this.column.header || {};
    },
    formData() {
      return this.column.data || {};
    },
    propsHttp() {
      return { ...DIC_HTTP_PROPS, ...this.column.propsHttp };
    },
    fileName() {
      return this.propsHttp.fileName || 'file';
    },
  },
  watch: {
    text: {
      immediate: true,
      handler() {
        this.initValue();
      },
    },
    fileList: {
      deep: true,
      handler() {
        this.syncText();
      },
    },
  },
  methods: {
    initValue() {
      const value = deepClone(this.text);
      if (this.validateNull(value)) {
        this.fileList = [];
        return;
      }
      const normalized = [];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'object') {
            normalized.push({
              url: item[this.valueKey],
              name: item[this.labelKey],
              status: 'done',
            });
          } else if (typeof item === 'string') {
            normalized.push({ url: item, status: 'done' });
          }
        });
      } else if (typeof value === 'string') {
        value.split(',').forEach((url) => {
          if (url) {
            normalized.push({ url, status: 'done' });
          }
        });
      }
      this.fileList = normalized;
    },
    handleAfterRead(files) {
      const queue = Array.isArray(files) ? files : [files];
      queue.forEach((item) => {
        const target = this.fileList[this.fileList.length - 1];
        if (!target) return;
        target.status = 'uploading';
        target.message = '上传中';
        if (!target.file) {
          target.file = item.file || item;
        }
        if (!target.name) {
          target.name = item.file?.name || item.name || '文件';
        }
        this.uploadSingle(target);
      });
    },
    async uploadSingle(target) {
      try {
        const formData = new FormData();
        Object.entries(this.formData || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
        formData.append(this.fileName, target.file, target.file?.name || 'file');
        const payload = await Api.common.upload.postFile(formData, {}, this.action);
        const url = payload?.data?.data?.link || target.url;
        const name = payload?.data?.data?.originalName || target.name || url;
        const index = this.fileList.findIndex((item) => item === target);
        if (index !== -1) {
          this.fileList[index] = {
            ...target,
            url,
            name,
            status: 'done',
            message: '',
          };
        }
      } catch (error) {
        const index = this.fileList.findIndex((item) => item === target);
        if (index !== -1) {
          this.fileList[index] = {
            ...target,
            status: 'failed',
            message: error.message || '上传失败',
          };
        }
      }
    },
    handleBeforeDelete(file, detail) {
      if (this.disabled) {
        return false;
      }
      this.fileList.splice(detail.index, 1);
      return false;
    },
    syncText() {
      const completed = this.fileList.filter((item) => item.status === 'done');
      let arr;
      if (this.validateNull(this.propsHttp.name) || this.stringMode) {
        arr = completed.map((f) => f.url);
      } else {
        arr = completed.map((f) => ({ [this.labelKey]: f.name, [this.valueKey]: f.url }));
      }
      const current = Array.isArray(this.text) ? JSON.stringify(this.text) : this.text;
      const next = Array.isArray(arr) ? JSON.stringify(arr) : arr;
      if (current === next) {
        return;
      }
      this.text = arr;
    },
  },
});
</script>

<style lang="scss" scoped>
.wf-upload {
  width: 100%;
}
</style>
