<template>
  <div class="wf-checkbox" @click="handleClick">
    <van-checkbox-group v-model="checkedValues" :disabled="disabled">
      <van-checkbox v-for="(item, index) in normalizedOptions" :key="index" :name="item[valueKey]">
        {{ item[labelKey] }}
      </van-checkbox>
    </van-checkbox-group>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Checkbox, CheckboxGroup } from 'vant';
import Props from '../../mixins/props.js';

export default defineComponent({
  name: 'WfCheckbox',
  components: {
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
  },
  mixins: [Props],
  data() {
    return {
      checkedValues: [],
    };
  },
  computed: {
    normalizedOptions() {
      return this.deepClone(this.dic || []);
    },
  },
  watch: {
    dic: {
      handler(val) {
        console.log('wf-checkbox dic changed:', val);
        if (!this.validateNull(val)) {
          this.syncFromText();
        }
      },
      deep: true,
    },
    text: {
      immediate: true,
      handler(val) {
        console.log('wf-checkbox text changed:', val);
        this.syncFromText();
      },
    },
    checkedValues(val) {
      if (this.isArray || Array.isArray(this.text)) {
        this.text = [...val];
      } else {
        this.text = val.join(',');
      }
    },
  },
  methods: {
    syncFromText() {
      if (this.validateNull(this.text)) {
        this.checkedValues = [];
        return;
      }
      if (Array.isArray(this.text)) {
        this.checkedValues = this.text.filter((item) => item !== '');
        return;
      }
      const values = (this.text + '').split(',');
      this.checkedValues = values.filter((item) => item !== '');
    },
  },
});
</script>

<style lang="scss" scoped>
.wf-checkbox {
  width: 100%;
}
</style>
