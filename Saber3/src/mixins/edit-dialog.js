import search from './search';
import dict from './dict';
export default {
  mixins: [search, dict],
  data() {
    return {};
  },
  methods: {
    /** 获取列规则 **/
    getColumnRules(col) {
      if (col.required) {
        const prefixTextMaps = {
          input: '请输入',
          number: '请输入',
          dict: '请选择',
          'remote-select': '请选择',
          'wf-select-dialog': '请选择',
          'wf-select-single': '请选择',
          'select-price': '请选择',
          date: '请选择',
          // 根据情况自由扩展
        };
        return [
          {
            required: true,
            message: `${prefixTextMaps[col.type]}${col.label}`,
            trigger: ['blur', 'input', 'change'],
          },
        ];
      }
      return undefined;
    },
    /** 获取占位符 **/
    getPlaceholder(col) {
      if (col.is === 'el-input') {
        return `请输入${col.label}`;
      } else if (col.type === 'remote-select') {
        return `请选择${col.label}`;
      } else if (col.type === 'select-price') {
        return `请选择${col.label}`;
      } else {
        return `${col.label}`;
      }
    },
    /** 获取table的规则 **/
    getTableRule(columns) {
      let that = this;
      return [
        {
          required: true,
          validator(_, value, callback) {
            if (value.length === 0) {
              callback(new Error('明细信息不能为空'));
            } else {
              let findCol = null;
              const findIndex = that.detailData[that.detailKey].findIndex(row => {
                findCol = columns.find(col => {
                  return col.required && [null, undefined, ''].includes(row[col.prop]);
                });
                return !!findCol;
              });
              if (findIndex > -1) {
                callback(new Error(`第${findIndex + 1}行${findCol.label}不能为空`));
              } else {
                callback();
              }
            }
          },
          trigger: 'change',
        },
      ];
    },
    /** 处理行点击 **/
    handleRowClick(row) {
      if (this.pageMode !== 'look') {
        const index = this.detailData[this.detailKey].findIndex(item => item === row);
        console.log('------', index);
        this.editIndex = index;
      } else {
        this.doAction('row-click', { row });
      }
      return;
    },
    /** 处理点击行 **/
    handleClickCeil(index, prop) {
      if (this.pageMode !== 'look') {
        this.editIndex = index;
      }
    },
    /** 处理table checkbox 选中的变化 **/
    handleSelectionChange(val) {
      this.selectionRows = val;
    },
    /** 获取 label 的code 是否必填符号 **/
    getLabelCode(col) {
      const result = col.required ? `<span class="label-suffix">*</span>${col.label}` : col.label;
      return result;
    },
  },
};
