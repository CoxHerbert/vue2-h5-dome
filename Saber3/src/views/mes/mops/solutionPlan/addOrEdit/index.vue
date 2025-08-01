<template>
  <basic-container class="page-container">
    <div class="content-warp page-prod-plan-edit" :class="pageRenderSize">
      <div v-loading="loading" class="drawer-container">
        <div v-if="detailData" class="content-box">
          <!-- <el-scrollbar ref="scrollbarRef" style="height: calc(100vh - 210px)"> -->
          <div class="form-box">
            <el-form
              ref="formRef"
              class="form-main"
              :model="detailData"
              label-suffix=":"
              :disabled="allDisabled"
              :label-width="'120px'"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
                :key="i"
              >
                <div :key="i" class="group-header">
                  {{ group.name }}
                  <el-icon
                    v-if="group.showToggleExpand"
                    @click="toggleExpand(group.prop, !expand[group.prop])"
                    class="toggle-expand-icon"
                    ><CaretRight v-if="!expand[group.prop]" /> <CaretBottom v-else
                  /></el-icon>
                </div>
                <template v-if="group.renderType === 'form'">
                  <template v-for="col in group.items">
                    <el-form-item
                      v-if="
                        !col.showFunc ||
                        (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                      "
                      class="form-item-operation-detail"
                      :class="`form-item-${col.prop}`"
                      :label="col.label"
                      :prop="col.prop"
                      :rules="getColumnRules(col)"
                      :key="col.prop"
                    >
                      <dc-widget
                        v-model="detailData[col.prop]"
                        :data="{
                          ...col,
                          props: {
                            ...col.props,
                          },
                        }"
                        :dictMaps="dictMaps"
                        @change="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
                      >
                      </dc-widget>
                    </el-form-item>
                  </template>
                </template>
                <template v-if="group.renderType === 'table'">
                  <div class="group-toolbar">
                    <el-button
                      icon="plus"
                      type="primary"
                      size="small"
                      @click="doAction('add-process', {})"
                      >新增行</el-button
                    >
                    <el-button type="primary" size="small" @click="doAction('his-process', {})"
                      >历史工艺</el-button
                    >
                    <div class="tag-list">
                      <el-tag
                        v-for="(process, index) in detailData.processDetail"
                        type="primary"
                        :key="index"
                        @click="doAction('add-process', process)"
                      >
                        <el-icon><Plus /></el-icon>
                        {{ process.technologyName }}
                      </el-tag>
                    </div>
                    <!-- <el-button @click="addRow">新增行</el-button>
                      <el-button @click="copyRow">复制行</el-button> -->
                  </div>
                  <el-form-item
                    class="form-item-table"
                    :prop="group.prop"
                    :label-width="0"
                    :rules="getTableRule(group.items)"
                  >
                    <div ref="dragableTableRef">
                      <el-table
                        :data="detailData[group.prop] || []"
                        @row-click="handleRowClick"
                        @selection-change="handleSelectionChange"
                        row-key="uuid"
                        border
                      >
                        <template v-for="(col, i) in group.items">
                          <el-table-column
                            v-if="
                              col.type === 'selection' &&
                              (!col.showFunc ||
                                (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
                            "
                            type="selection"
                            :fixed="col.fixed"
                            :width="col.width"
                            :min-width="col.minWidth"
                            :key="i"
                            :selectable="col.selectable"
                          >
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'index'"
                            :key="'index' + i"
                            :prop="col.prop"
                            label="序号"
                            fixed="left"
                            align="center"
                            :min-width="col?.minWidth || '80px'"
                            :width="col?.width"
                          >
                            <template #default="scoped">{{ scoped.$index + 1 }}</template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'actions'"
                            :key="'option' + i"
                            :fixed="col.fixed"
                            :label="col.label"
                            :width="col.width ? col.width : 180"
                            :align="col.align ? col.align : 'center'"
                          >
                            <template #default="scoped">
                              <el-button
                                v-for="(btn, j) in col.children"
                                :key="j"
                                link
                                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                                type="primary"
                                @click="doAction(btn.action, scoped)"
                                >{{ btn.label }}</el-button
                              >
                            </template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="
                              !col.showFunc ||
                              (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                            "
                            :key="`other-${i}`"
                            :fixed="col.fixed"
                            :width="col.width"
                            align="left"
                            :min-width="col.minWidth"
                            :prop="col.prop"
                            show-overflow-tooltip
                          >
                            <template #header><span v-html="getLabelCode(col)"> </span></template>
                            <template #default="scoped">
                              <template v-if="editIndex === scoped.$index">
                                <dc-widget
                                  v-model="scoped.row[col.prop]"
                                  :data="{
                                    ...col,
                                    props: {
                                      ...col.props,
                                      disabled: handleTableItemDisabled(col, scoped),
                                    },
                                  }"
                                  :dictMaps="dictMaps"
                                  @change="
                                    val => {
                                      handleTableItemChange(val, scoped, col);
                                    }
                                  "
                                >
                                </dc-widget>
                              </template>
                              <span
                                v-else
                                @click="handleClickCeil(scoped.$index, col.prop)"
                                class="ceil-value"
                              >
                                <dc-field-view
                                  :value="
                                    col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]
                                  "
                                  :data="col"
                                  :dictMaps="dictMaps"
                                />
                              </span>
                            </template>
                          </el-table-column>
                        </template>
                      </el-table>
                    </div>
                  </el-form-item>
                </template>
              </div>
              <bomData :data="detailData" />
            </el-form>
          </div>
        </div>
        <div class="footer">
          <el-button @click="doAction('cancel')">取消</el-button>
          <el-button type="primary" @click="doAction('submit')" :disabled="allDisabled"
            >提交</el-button
          >
          <el-button
            v-if="!detailData?.isUploadBom"
            type="primary"
            @click="doAction('submitERP')"
            :disabled="allDisabled"
            >提交ERP</el-button
          >
        </div>
      </div>
    </div>
    <iframe
      class="drawing-wrap"
      :src="`https://www.eastwinbip.com/drawing/${detailData.materialNumber}`"
      title="物料图纸"
      frameBorder="no"
      border="0"
      marginWidth="0"
      marginHeight="0"
      scrolling="no"
      allowTransparency="yes"
    ></iframe>
    <hisProcessDrawer ref="hisProcessDrawerRef" @confirm="handleHisProcessConFirm" />
  </basic-container>
</template>
<script>
import detailPage from '@/mixins/detail-page';
import detailConfig from './utils';
import BigNumber from 'bignumber.js';
import hisProcessDrawer from './../../cnps/hisProcessDrawer.vue';
import bomData from './../../cnps/bomData.vue';
import Sortable from 'sortablejs';
import func from '@/utils/func';

export default {
  components: { bomData, hisProcessDrawer },
  mixins: [detailPage],
  name: 'solution-plan-add-or-edit',
  data() {
    return {
      detailKey: 'createdProcessDetail',
      columns: [],
      apiFns: {
        getDetail: 'getModifDetail',
        postPlan: 'postModifyMoPlan',
      },
    };
  },
  computed: {
    allDisabled() {
      if (this.pageMode === 'add' || this.pageMode === 'edit') {
        return false;
      }
      return true;
    },
  },
  beforeMount() {
    const { id, type } = this.$route.query;
    this.show(id);
    this.columns = detailConfig(type).columns;
  },
  mounted() {
    this.$nextTick(() => {
      if (this.allDisabled) return true;
      // 1. 从 $refs 数组里拿到真正的 DOM 容器
      const wrapper = Array.isArray(this.$refs.dragableTableRef)
        ? this.$refs.dragableTableRef[0]
        : this.$refs.dragableTableRef;

      if (!wrapper) {
        console.warn('没拿到 wrapper');
        return;
      }

      // 2. 用正确的 class 找到 <tbody>
      const tbody = wrapper.querySelector('.el-table__body-wrapper tbody');
      if (!tbody) {
        console.warn('没找到 el-table__body-wrapper tbody');
        return;
      }

      // 3. 初始化 Sortable
      Sortable.create(tbody, {
        draggable: 'tr',
        animation: 150,
        onEnd: evt => {
          const list = this.detailData[this.detailKey];
          list.splice(evt.newIndex, 0, list.splice(evt.oldIndex, 1)[0]);
          list.forEach((item, idx) => (item.technologyOrder = idx + 1));
        },
      });
    });
  },
  methods: {
    /** 页面操作 **/
    doAction(action, scope) {
      if (action === 'row-click') {
        this.rowClick(scope);
      } else if (action === 'row-delete') {
        this.detailData[this.detailKey].splice(scope.$index, 1);
        this.detailData[this.detailKey].forEach((item, index) => {
          item.technologyOrder = index + 1;
        });
      } else if (action === 'submit') {
        this.handleSubmit().then(res => {
          this.$message.success('保存成功');
          const { id } = this.$route.query;
          this.show(id);
        });
      } else if (action === 'cancel') {
        this.$router.go(-1);
      } else if (action === 'add-process') {
        const technologyOrder = this.detailData[this.detailKey].length + 1;
        this.detailData[this.detailKey].push({
          ...scope,
          technologyOrder,
          uuid: func.generateUUID(),
        });
      } else if (action === 'his-process') {
        this.$refs.hisProcessDrawerRef.openDialog(this.detailData.materialNumber);
      } else if (action === 'submitERP') {
        this.handleSubmitErp();
      }
    },
    handleHisProcessConFirm(data) {
      this.detailData[this.detailKey] = [...this.detailData[this.detailKey], ...data];
      this.detailData[this.detailKey].forEach((item, index) => {
        item.uuid = func.generateUUID();
        item.technologyOrder = index + 1;
      });
    },
    /** 行点击 **/
    rowClick({ row }) {},
    /** 加载详情 **/
    show(id) {
      if (!id) {
        this.detailData = {
          [this.detailKey]: [],
        };
        return;
      }
      if (id) {
        this.loading = true;
        /** 生产主计划生成工序 **/
        this.api.mes.mops
          [this.apiFns.getDetail]({
            entryId: this.detailId,
          })
          .then(res => {
            let { code, data } = res.data;
            if (code === 200) {
              if (Array.isArray(data.processDetail)) {
                data.processDetail.forEach(item => {
                  item.uuid = func.generateUUID();
                  item.singleWorkingHour = this.convertTime({
                    value: item.singleWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.prepareWorkingHour = this.convertTime({
                    value: item.prepareWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.allWorkingHour = this.convertTime({
                    value: item.allWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                });
              }
              if (Array.isArray(data?.[this.detailKey])) {
                data[this.detailKey].forEach(item => {
                  item.uuid = func.generateUUID();
                  item.singleWorkingHour = this.convertTime({
                    value: item.singleWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.prepareWorkingHour = this.convertTime({
                    value: item.prepareWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                  item.allWorkingHour = this.convertTime({
                    value: item.allWorkingHour,
                    from: 's',
                    to: 'm',
                  });
                });
              } else {
                data[this.detailKey] = [];
              }
              if (Array.isArray(data.rawMaterialBom)) {
                data.rawMaterialBom.forEach(item => {
                  item.uuid = func.generateUUID();
                });
              } else {
                data.rawMaterialBom = [];
              }
              this.detailData = data;
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    /** 处理表单项变化 */
    handleFormItemChange(val, scoped, col) {},
    /** 处理表格项变化 */
    handleTableItemChange(val, scoped, col) {
      if (col.prop === 'singleWorkingHour' || col.prop === 'prepareWorkingHour') {
        scoped.row.allWorkingHour = new BigNumber(scoped.row.singleWorkingHour || 0)
          .multipliedBy(this.detailData.number || 0)
          .plus(scoped.row.prepareWorkingHour || 0)
          .toNumber(); // 如果需要保持 number 类型
      }
    },
    /** 处理行点击 **/
    handleRowClick(row) {
      if (this.pageMode !== 'look') {
        const index = this.detailData[this.detailKey].findIndex(item => item === row);
        this.editIndex = index;
      } else {
        this.doAction('row-click', { row });
      }
      return;
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
              const findIndex = that.detailData[that.detailKey]
                .filter(item => item.isSelected)
                .findIndex(row => {
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
    /** 处理table某一项的是否可编辑 **/
    handleTableItemDisabled(col, scope) {
      if (col.prop === 'technologyOrder') {
        return true;
      } else if (col.prop === 'technologyName') {
        return !!scope.row?.id;
      }
    },
    handleSubmit() {
      return new Promise((reslove, reject) => {
        this.$refs.formRef
          .validate(valid => {
            if (valid) {
              this.loading = true;
              const formData = {
                ...this.detailData,
                processDetail: this.detailData.processDetail.map(item => {
                  return {
                    ...item,
                    singleWorkingHour: this.convertTime({
                      value: item.singleWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    prepareWorkingHour: this.convertTime({
                      value: item.prepareWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    allWorkingHour: this.convertTime({
                      value: item.allWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                  };
                }),
                [this.detailKey]: this.detailData[this.detailKey].map(item => {
                  return {
                    ...item,
                    singleWorkingHour: this.convertTime({
                      value: item.singleWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    prepareWorkingHour: this.convertTime({
                      value: item.prepareWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                    allWorkingHour: this.convertTime({
                      value: item.allWorkingHour,
                      from: 'm',
                      to: 's',
                    }),
                  };
                }),
              };
              this.api.mes.mops
                [this.apiFns.postPlan](formData)
                .then(res => {
                  const { code, data } = res.data;
                  if (code === 200) {
                    reslove();
                  } else {
                    reject();
                  }
                  this.loading = false;
                })
                .catch(err => {
                  this.loading = false;
                  reject();
                });
            }
          })
          .catch(err => {
            this.loading = false;
            reject();
          });
      });
    },
    // 处理提交至ERP
    handleSubmitErp() {
      this.$confirm('是否将当前BOM提交至云星空?(注意:提交后物料BOM不可进行任何操作!)')
        .then(() => {
          this.handleSubmit().then(() => {
            this.loading = true;
            this.api.mes.mops
              .pushErpBom({ id: this.detailData.id })
              .then(res => {
                const { code, data } = res.data;
                if (code === 200) {
                  const { id } = this.$route.query;
                  this.show(id);
                }
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
              });
          });
        })
        .catch(err => {});
    },
  },
};
</script>
<style lang="scss">
.page-container {
  .basic-container__card {
    .el-card__body {
      display: flex;
      align-items: center;
      flex-direction: row;
      .page-process-outsourcing-right {
        .param-group {
          display: none;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.drawing-wrap {
  width: 49%;
  height: 100%;
}
.page-prod-plan-edit {
  margin-right: 1%;
  width: 50%;
  .group-toolbar {
    display: flex;
    // justify-content: space-between;
    padding: 4px 0 10px;
  }
  .tag-list {
    margin-left: 10px;
    display: flex;
    flex-wrap: wrap;
    // overflow-x: auto;
    // overflow-y: hidden;
    // -webkit-overflow-scrolling: touch;
    gap: 5px;
  }
  .ceil-value {
    word-break: break-all;
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .form-item-attachmentId {
    width: 100% !important;
  }
  .form-item-table {
    height: calc(100% - 80px);
    overflow: hidden;
    position: relative;
    &.is-error {
      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper) {
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
      }

      .is-null {
        :deep(.el-input__wrapper),
        :deep(.el-select__wrapper) {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
        &.is-not-required {
          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper) {
            box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
          }
        }
      }
    }
  }
  .step-new {
    display: block;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 10px;
  }
  &.render-small {
    .form-basic-group {
      .form-item-operation-detail {
        width: 100%;
        margin-right: 0 !important;
      }
    }
  }
  &.render-middle {
    .form-basic-group {
      .form-item-operation-detail {
        width: 49%;
        &:nth-child(2n + 1) {
          margin-right: 2%;
        }
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-operation-detail {
        width: 32%;
        &:nth-child(3n) {
          margin-right: 1%;
        }
        &:nth-child(3n + 1) {
          margin-right: 1%;
        }
        &:nth-child(3n + 2) {
          margin-right: 1%;
        }
      }
    }
  }

  :deep(.form-item-table) {
    .el-form-item__content {
      width: 100%;
      z-index: 1;
      margin-left: 0 !important;
      max-height: unset;
      .el-form-item__error {
        position: unset;
      }
    }
    .el-input-number .el-input__inner {
      text-align: left;
    }
  }
}
.page-process-outsourcing-right {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: auto;
  flex: 1;
  height: 100%;
  .table-container {
    flex: 1;
    overflow: hidden;
  }
}
:deep(.label-suffix) {
  color: #f56c6c;
}
.drawer-container {
  display: flex;
  flex-flow: column nowrap;
  min-height: calc(100vh - 200px);
  box-sizing: border-box;

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  .step-box {
    padding: 0 60px 20px;
    height: 48px;
    box-sizing: border-box;
  }

  .content-box {
    min-height: calc(100vh - 200px);
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    overflow: auto;
  }

  .footer {
    padding-top: 8px;
    border-top: 1px solid #eaeaeb;
    padding-left: 20px;
    height: 34px;
  }

  .form-box {
    padding: 0 20px 0 0;
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
  }
  .form-main {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    flex: 1;
  }

  .group-box {
    transform-origin: 0 0;
    transition: all ease-in 0.3s;
    &:last-child {
      flex: 1;
      min-height: 300px;
    }
    &.hide-expand {
      height: 40px;
      overflow: hidden !important;
    }
  }

  .group-header {
    font-weight: bold;
    box-sizing: border-box;
    padding-left: 4px;
    border-left: 3px solid #f78431;
    line-height: 16px;
    font-size: 16px;
    margin: 10px 0;
  }

  .form-item-operation-detail {
    width: 49%;
    display: inline-flex;
    margin-bottom: 16px;
    &:nth-child(2n + 1) {
      margin-right: 2%;
    }

    .detail-column-value {
      width: 100%;
      display: block;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
      line-height: 20px;
      padding-top: 6px;
    }
  }

  .toggle-expand-icon {
    cursor: pointer;
  }
}
</style>
