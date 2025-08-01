import { needHideTitleBar } from '@/utils/utils';

export default {
    data() {
        return {
            showTitleBar: null,
        };
    },
    created() {
        this.showTitleBar = !needHideTitleBar();
    },
    methods: {
        generateFormRules(groups, form) {
            const rules = {};
            groups.forEach((column) => {
                if (column.renderType === 'form') {
                    // 主表单字段
                    column.items.forEach((item) => {
                        if (item.required) {
                            rules[item.prop] = [
                                {
                                    required: true,
                                    message: item.label + '不能为空',
                                    trigger: ['blur', 'change', 'input'],
                                },
                            ];
                        }
                    });
                } else if (column.renderType === 'table') {
                    // 子表单字段数组（支持多行）
                    form[column.prop].forEach((_, index) => {
                        column.items.forEach((item) => {
                            if (item.required) {
                                const key = `${column.prop}[${index}].${item.prop}`;
                                rules[key] = [
                                    {
                                        required: true,
                                        message: item.label + '不能为空',
                                        trigger: ['blur', 'change', 'input'],
                                    },
                                ];
                            }
                        });
                    });
                }
            });
            return rules;
        },
    },
};
