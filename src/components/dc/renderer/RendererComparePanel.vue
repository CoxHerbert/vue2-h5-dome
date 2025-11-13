<template>
  <wf-form
    v-model="formValue"
    :option="option"
    @submit="handleSubmit"
  >
    <template #menu>
      <slot name="menu" />
    </template>
    <slot />
  </wf-form>
</template>

<script>
import { defineComponent } from 'vue';
import WfForm from '@/components/wf-ui/components/wf-form/wf-form.vue';

export default defineComponent({
  name: 'RendererComparePanel',
  components: { WfForm },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    option: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      formValue: { ...this.modelValue },
    };
  },
  watch: {
    modelValue: {
      deep: true,
      handler(value) {
        this.formValue = { ...(value || {}) };
      },
    },
    formValue: {
      deep: true,
      handler(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    handleSubmit(form, done) {
      this.$emit('submit', form, done);
    },
  },
});
</script>
