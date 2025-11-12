import { initVal } from '../util/dataformat.js';
import { DIC_SPLIT } from '../util/variable.js';

function bindEvent(instance, name, event) {
    if (typeof instance[name] === 'function') {
        instance[name]({ value: instance.modelValue, column: instance.column, index: instance.dynamicIndex });
    }
    instance.$emit(name, instance.modelValue, event);
}

export default {
    methods: {
        initVal() {
            this.stringMode = typeof this.modelValue === 'string';
            this.text = initVal(this.modelValue, this.column);
        },
        handleFocus(event) {
            bindEvent(this, 'focus', event);
        },
        handleBlur(event) {
            bindEvent(this, 'blur', event);
        },
        handleClick(event) {
            bindEvent(this, 'click', event);
        },
        handleChange(value) {
            let result = value;
            const flag = this.isString || this.isNumber || this.stringMode || this.listType === 'picture-img';
            if (flag && Array.isArray(value)) {
                result = value.join(this.separator || DIC_SPLIT);
            }
            if (typeof this.change === 'function' && this.column.cell !== true) {
                this.change({ value: result, column: this.column, index: this.dynamicIndex });
            }
            this.$emit('update:modelValue', result);
            this.$emit('change', result);
        },
    },
};
