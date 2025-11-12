<template>
  <div class="u-toast" />
</template>

<script>
import { Toast } from 'vant';

export default {
  name: 'u-toast',
  methods: {
    show(options = {}) {
      if (typeof options === 'string') {
        Toast(options);
      } else {
        const { title, type } = options;
        Toast({ message: title, type: type || 'text' });
      }
    },
    clear() {
      Toast.clear();
    },
  },
};
</script>
