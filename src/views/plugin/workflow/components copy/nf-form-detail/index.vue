<template>
  <div class="nf-form-detail">
    <!-- 待办状态下直接使用nf-form -->
    <!-- <nf-form
      v-if="editable"
      ref="form"
      v-model="formValue"
      :option="option"
      :upload-preview="uploadPreview"
      :style="style"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </nf-form> -->

    <!-- 已办状态下使用详情展示 -->
    <nf-form
      ref="form"
      v-model="formValue"
      :option="computedOption"
      :upload-preview="uploadPreview"
      :style="style"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

      <!-- 添加 wf-select-dialog 组件的支持 -->
      <template v-for="column in selectDialogColumns" :key="column.prop" #[column.prop]="scope">
        <div class="select-dialog-wrapper">
          <!-- <div v-if="formValue[column.prop]" class="selected-items"> -->
          <template
            v-if="
              column?.component === 'wf-select-single' || column?.component === 'wf-select-dialog'
            "
          >
            <!-- {{ column.params?.query }} -->
            <!-- {{ column.params }} -->
            <dc-view
              v-if="
                !editable &&
                !['deliveredItem', 'CompleteMtoNo', 'Material', 'WireBomList'].includes(
                  column.params?.objectName
                )
              "
              color="#f26c0c"
              v-model="formValue[column.prop]"
              :objectName="column.params?.objectName"
              :query="column.params?.query"
            />
            <wf-select-dialog
              v-else-if="
                editable &&
                !['deliveredItem', 'CompleteMtoNo', 'Material', 'WireBomList'].includes(
                  column.params?.objectName
                )
              "
              :clearable="false"
              v-model="formValue[column.prop]"
              :disabled="column.disabled"
              :objectName="column.params?.objectName"
              :query="column.params?.query"
              @change="val => handleSelectChange(column.prop, val)"
            />
            <wf-select-singleV2
              v-else
              :clearable="false"
              :disabled="column.disabled"
              v-model="formValue[column.prop]"
              :objectName="column.params?.objectName"
              :query="column.params?.query"
              @change="val => handleSelectChange(column.prop, val)"
            />
          </template>
          <template v-else>
            {{ formValue[column.prop] }}
          </template>
        </div>
        <!-- <div v-else class="empty-text">暂无选择数据</div> -->
        <!-- </div> -->
      </template>
    </nf-form>
  </div>
</template>

<script>
import { ElTag } from 'element-plus';

export default {
  name: 'nf-form-detail',
  components: {
    ElTag,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    option: {
      type: Object,
      default: () => ({}),
    },
    editable: {
      type: Boolean,
      default: true,
    },
    isTodo: {
      type: Boolean,
      default: false, // 默认为已办状态
    },
    uploadPreview: {
      type: Function,
      default: () => {},
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {};
  },
  computed: {
    formValue: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    // 获取所有 wf-select-dialog 类型的列
    selectDialogColumns() {
      const columns = [];

      // 只在已办状态下处理
      //   if (!this.editable) {
      if (this.option.column && this.option.column.length > 0) {
        this.option.column.forEach(col => {
          if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
            columns.push(col);
          }
        });
      }

      if (this.option.group && this.option.group.length > 0) {
        this.option.group.forEach(group => {
          if (group.column && group.column.length > 0) {
            group.column.forEach(col => {
              if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
                columns.push(col);
              }
            });
          }
        });
      }
      //   }

      return columns;
    },
    computedOption() {
      // 使用展开运算符创建新对象，不使用深拷贝
      const option = {
        ...this.option,
        column: [...(this.option.column || [])],
        group: [...(this.option.group || [])],
      };

      // 只在已办状态下设置表单为只读
      if (!this.editable) {
        option.detail = true;
        option.disabled = true;
        option.readonly = true;
        option.menuBtn = false;

        // 处理列的编辑状态
        if (option.column && option.column.length > 0) {
          option.column = option.column.map(col => {
            const newCol = { ...col };
            newCol.detail = true;
            newCol.disabled = true;
            newCol.readonly = true;

            // 处理 wf-select-dialog 类型的列
            if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
              // 将组件类型修改为一个不存在的值，防止nf-form渲染这些字段
              newCol.component = 'custom-slot-only';
              newCol.disabled = true; // 已办状态下禁用选择
              newCol.detail = true; // 显示为详情模式
            }
            return newCol;
          });
        }

        // 处理分组的编辑状态
        if (option.group && option.group.length > 0) {
          option.group = option.group.map(group => {
            const newGroup = { ...group, disabled: true, column: [...(group.column || [])] };
            if (group.column && group.column.length > 0) {
              newGroup.column = newGroup.column.map(col => {
                const newCol = { ...col };
                newCol.detail = true;
                newCol.disabled = true;
                newCol.readonly = true;

                // 处理 wf-select-dialog 类型的列
                if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
                  // 将组件类型修改为一个不存在的值，防止nf-form渲染这些字段
                  newCol.component = 'custom-slot-only';
                  newCol.disabled = true; // 已办状态下禁用选择
                  newCol.detail = true; // 显示为详情模式
                }
                return newCol;
              });
            }
            return newGroup;
          });
        }
      } else {
        // 在编辑状态下，也需要处理 wf-select-dialog 类型的列，防止重复渲染
        // console.log(option.column);
        if (option.column && option.column.length > 0) {
          option.column = option.column.map(col => {
            const newCol = { ...col };

            // 处理 wf-select-dialog 类型的列
            if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
              // 将组件类型修改为一个不存在的值，防止nf-form渲染这些字段
              newCol.component = 'custom-slot-only';
            }
            return newCol;
          });
        }

        // 处理分组的编辑状态
        if (option.group && option.group.length > 0) {
          option.group = option.group.map(group => {
            const newGroup = { ...group, column: [...(group.column || [])] };
            if (group.column && group.column.length > 0) {
              newGroup.column = newGroup.column.map(col => {
                const newCol = { ...col };

                // 处理 wf-select-dialog 类型的列
                if (col.component === 'wf-select-dialog' || col.component === 'wf-select-single') {
                  // 将组件类型修改为一个不存在的值，防止nf-form渲染这些字段
                  newCol.component = 'custom-slot-only';
                }
                return newCol;
              });
            }
            return newGroup;
          });
        }
      }

      return option;
    },
  },
  methods: {
    // 处理选择组件的数据变化
    handleSelectChange(prop, value) {
      console.log('prop', prop);
      console.log('value', value);

      // 获取唯一标识，优先使用 masterKey，然后是 rowKey，最后是 id
      const column = this.selectDialogColumns.find(col => col.prop === prop);
      const keyField = column?.masterKey || column?.rowKey || 'id';
      const uniqueId = value?.[keyField];

      // 更新表单数据
      this.formValue[prop] = uniqueId;

      // 触发change事件，向上传递数据变化
      this.$emit('change', {
        prop,
        value,
        formValue: this.formValue,
      });

      // 如果列配置中有change函数，也调用它
      if (column && typeof column.change === 'function') {
        column.change({
          value,
          column,
          formValue: this.formValue,
        });
      }
    },

    // 暴露表单校验方法
    validate(callback) {
      return this.$refs.form.validate(callback);
    },
    // 暴露表单重置方法
    reset() {
      return this.$refs.form.reset();
    },
    // 暴露表单提交方法
    submit() {
      return this.$refs.form.submit();
    },

    // 处理移除标签
    handleRemoveTag(prop) {
      if (!this.editable) return; // 已办状态下不允许移除

      // 从表单数据中移除
      this.formValue[prop] = null;

      // 触发change事件，向上传递数据变化
      this.$emit('change', {
        prop,
        value: null,
        formValue: this.formValue,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.nf-form-detail {
  width: 100%;
}

.select-dialog-wrapper {
  width: 100%;
  padding: 8px 0;

  .selected-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .empty-text {
    color: #999;
    font-size: 14px;
  }
}
// ::v-deep(.el-tag .el-tag__close) {
//   display: none;
// }
</style>
