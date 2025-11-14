<template>
  <div class="workflow-form-detail">
    <van-skeleton v-if="waiting" :row="6" animate />
    <div v-else class="detail">
      <section class="detail-head card flex-between flex-c">
        <div class="detail-avatar" aria-hidden="true">{{ avatarText }}</div>
        <div class="flex-one c">
          <div class="leave bold txt-cut1">{{ process.processDefinitionName }}</div>
          <div class="name">{{ process.startUsername }}</div>
        </div>
        <van-tag v-if="process.status === 'todo'" type="success" size="small">审核中</van-tag>
        <van-tag v-else-if="process.status === 'delay'" type="danger" size="small">已超时</van-tag>
        <template v-else-if="process.status === 'done'">
          <van-tag v-if="process.processIsFinished === 'unfinished'" type="success" size="small"
            >审核中</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'finished'" type="success" size="small"
            >已结束</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'terminate'" type="danger" size="small"
            >已终止</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'withdraw'" type="danger" size="small"
            >已撤销</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'recall'" type="danger" size="small"
            >已撤回</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'reject'" type="danger" size="small"
            >已驳回</van-tag
          >
          <van-tag v-else-if="process.processIsFinished === 'deleted'" type="danger" size="small"
            >已删除</van-tag
          >
        </template>
      </section>
      <section class="card detail-tabs" aria-label="流程详情切换">
        <van-tabs v-model:active="current" :border="false">
          <van-tab v-for="(tab, index) in tabList" :key="tab.name" :title="tab.name" :name="index" />
        </van-tabs>
      </section>
      <div class="content">
        <div v-show="current === 0" class="detail-card card">
          <section
            v-if="
              summaryOption &&
              ((summaryOption.column && summaryOption.column.length > 0) ||
                (summaryOption.group && summaryOption.group.length > 0))
            "
            class="detail-section"
          >
            <renderer-compare-panel
              v-if="enableRendererCompare"
              v-model="form"
              :option="summaryOption"
            />
            <wf-form v-else ref="summaryForm" v-model="form" :option="summaryOption" />
          </section>
          <section
            v-if="
              option &&
              ((option.column && option.column.length > 0) ||
                (option.group && option.group.length > 0))
            "
            class="detail-section"
          >
            <renderer-compare-panel v-if="enableRendererCompare" v-model="form" :option="option" />
            <wf-form v-else ref="form" v-model="form" :option="option" />
          </section>
          <section v-if="process.status === 'todo'" class="detail-section">
            <wkf-exam-form
              ref="examineForm"
              v-model:comment="comment"
              :process="process"
              @user-select="handleUserSelect"
            />
          </section>
        </div>
        <section v-show="current === 1" class="flow-wrapper card">
          <wkf-flow :flow="flow" />
        </section>
        <section v-if="current === 2" class="card bpmn-wrapper">
          <WfBpmn :bpmn-option="h5bpmn" />
        </section>
      </div>
      <wkf-user-select
        ref="user-select"
        :check-type="checkType"
        :default-checked="defaultChecked"
        @on-confirm="handleUserSelectConfirm"
      />
      <wkf-button
        :loading="submitLoading"
        :button-list="buttonList"
        :process="process"
        :comment="comment"
        @draft="handleDraft({ taskId: process.taskId, variables: form })"
        @examine="handleExamine"
        @user-select="handleUserSelect"
        @rollback="handleRollbackTask"
        @terminate="handleTerminateProcess"
        @withdraw="handleWithdrawTask"
      />
      <van-dialog
        v-model:show="saveDraftShow"
        show-cancel-button
        message="保存至草稿箱并关闭？"
        @confirm="handleDraftSubmit(process.taskId)"
      />
      <van-dialog
        v-model:show="recoverDraftShow"
        show-cancel-button
        message="是否恢复之前保存的草稿？"
        @confirm="handleRevocerDraftSubmit"
        @cancel="form = tempVariables"
      />
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
import { showToast } from 'vant';
import { Base64 } from '@/utils/base64.js';
import RendererComparePanel from '@/components/dc/renderer/RendererComparePanel.vue';
import { isRendererTestEnvironment } from '@/utils/env';
import WkfFlow from '../../components/wf-flow/index.vue';
import WfBpmn from '../../components/wf-bpmn/index.vue';
import WkfUserSelect from '../../components/wf-user-select/index.vue';
import WkfButton from '../../components/wf-button/index.vue';
import WkfExamForm from '../../components/wf-exam-form/index.vue';
import exForm from '../../mixins/ex-form';
import draft from '../../mixins/draft';
import { useAuthStore } from '@/store/auth.js';

export default defineComponent({
  name: 'WorkflowFormDetailPage',
  components: { WkfFlow, WkfUserSelect, WkfButton, WkfExamForm, WfBpmn, RendererComparePanel },
  mixins: [exForm, draft],
  data() {
    return {
      process: null,
      form: {},
      option: {},
      vars: [],
      submitLoading: false,
      current: 0,
      tabList: [{ name: '申请信息' }, { name: '流转信息' }, { name: '流转图' }],
      summaryOption: {},
      tempVariables: {},
      h5bpmn: {},
    };
  },
  computed: {
    enableRendererCompare() {
      return isRendererTestEnvironment();
    },
    avatarText() {
      const username = this.process?.startUsername || '';
      if (!username) return '';
      return username.substring(0, 1);
    },
  },
  watch: {
    '$route.query.p'(value) {
      this.resolveRouteParams({ p: value });
    },
  },
  created() {
    this.resolveRouteParams(this.$route.query);
  },
  methods: {
    resolveRouteParams(query = {}) {
      const { p } = query;
      if (!p) return;
      try {
        const param = JSON.parse(Base64.decode(p));
        const { taskId, processInsId } = param;
        if (taskId && processInsId) {
          this.getDetail(taskId, processInsId);
        }
      } catch (error) {
        console.error('[workflow] 无法解析流程明细参数', error);
      }
    },
    // 获取任务详情
    getDetail(taskId, processInsId) {
      const authStore = useAuthStore();
      this.h5bpmn = {
        taskId: taskId,
        processInsId: processInsId,
        token: authStore.token,
      };
      this.getTaskDetail(taskId, processInsId).then((res) => {
        const { process, form, flow } = res;
        this.process = process;
        const { variables, status } = process;

        if (status == 'todo') {
          // 查询是否有草稿箱
          this.initDraft({ taskId })
            .then((data) => {
              this.tempVariables = { ...variables };
              this.recoverDraftShow = true;
            })
            .catch(() => {
              this.form = variables;
            });
        } else {
          this.form = variables;
        }

        let { allForm, allAppForm, taskForm, formList } = form;
        console.log(allAppForm);
        if (formList && formList.length > 0) {
          const options = {
            menuBtn: false,
            detail: true,
            labelPosition: 'top',
            // labelWidth: 240,
            group: [],
          };
          formList.forEach((f) => {
            const { content, appContent, taskName, taskKey } = f;
            let resolved;

            try {
              resolved = this.handleResolveOption(eval('(' + content + ')'), taskForm, 'done');
            } catch (error) {
              try {
                resolved = this.handleResolveOption(JSON.parse(appContent), taskForm, 'done');
              } catch (parseError) {
                console.error('[workflow] 无法解析流程表单分组配置', error, parseError);
                return;
              }
            }

            const { option } = resolved;
            options.group.push({
              label: taskName || taskKey,
              column: option.column,
              collapse: allForm ? false : true,
            });
          });
          this.summaryOption = options;
        }
        if (allForm) {
          let resolved;

          try {
            resolved = this.handleResolveOption(eval('(' + allForm + ')'), taskForm, status);
          } catch (error) {
            try {
              console.log();
              resolved = this.handleResolveOption(JSON.parse(allAppForm), taskForm, status);
            } catch (parseError) {
              console.error('[workflow] 无法解析流程表单配置', error, parseError);
              this.waiting = false;
              return;
            }
          }

          const { option, vars } = resolved;
          option.menuBtn = false;
          for (let key in variables) {
            if (this.validateNull(variables[key])) delete variables[key];
          }
          // 如果是可行性评估
          if (process.processDefinitionKey === 'feasibilityAsessment') {
            option.column?.forEach((_, index) => {
              if (_.component === 'wf-feasibility') {
                option.column[index].columns = Array.isArray(
                  process.variables.feaEvaluationConclusion
                )
                  ? process.variables.feaEvaluationConclusion
                  : JSON.parse(process.variables.feaEvaluationConclusion);
              }
            });
          }
          this.option = {
            ...option,
            labelPosition: 'top',
            // labelWidth: 200,
          };
          this.vars = vars;
        }
        if (!this.option.column) this.option.column = [];
        if (process.variables && process.variables.serialNumber) {
          this.option.column.unshift({
            label: '流水号',
            prop: 'serialNumber',
            span: 24,
            detail: true,
          });
        }
        this.waiting = false;
      });
    },
    handleResolveOption(option, taskForm, status) {
      const { column, group } = option;
      let vars = [];
      if (status != 'todo') {
        // 已办，删除字段默认值
        option.detail = true;
        console.log(column.length);
        if (column && column.length > 0) {
          // 处理column
          column.forEach((col) => this.handleResolveEvent(col));
        }

        if (group && group.length > 0) {
          // 处理group
          group.forEach((gro) => {
            if (gro.column && gro.column.length > 0) {
              gro.column.forEach((col) => this.handleResolveEvent(col));
            }
          });
        }
      } else {
        const columnFilter = this.filterAvueColumn(column, taskForm);
        const columnArr = columnFilter.column;
        vars = columnFilter.vars || [];

        const groupArr = [];
        if (group && group.length > 0) {
          // 处理group
          group.forEach((gro) => {
            const groupFilter = this.filterAvueColumn(gro.column, taskForm);
            gro.column = groupFilter.column;
            vars = vars.concat(groupFilter.vars);
            if (gro.column.length > 0) groupArr.push(gro);
          });
        }

        option.column = columnArr;
        option.group = groupArr;
      }
      return { option, vars };
    },
    handleResolveEvent(col) {
      const _this = this;
      delete col.value;
      // #ifndef MP
      let event = ['change', 'blur', 'click', 'focus'];
      event.forEach((e) => {
        if (col[e]) col[e] = eval((col[e] + '').replace(/this/g, '_this'));
      });
      if (col.event)
        Object.keys(col.event).forEach(
          (key) => (col.event[key] = eval((col.event[key] + '').replace(/this/g, '_this')))
        );
      // #endif
      if (col.type == 'dynamic') col.children.column.forEach((cc) => _this.handleResolveEvent(cc));
    },
    // 审核
    handleExamine(pass) {
      this.submitLoading = true;
      const { form, summaryForm } = this.$refs;
      if (form) {
        this.$refs.form.validate((valid, done) => {
          if (valid) {
            const variables = {};
            this.vars.forEach((v) => {
              if (!this.validateNull(this.form[v])) {
                variables[v] = this.form[v];
                if (this.form[`$${v}`]) variables[`$${v}`] = this.form[`$${v}`];
              }
            });

            // 可行性评估提交处理
            if (this.process.processDefinitionKey === 'feasibilityAsessment') {
              variables.feaEvaluationConclusion = JSON.stringify(this.form.feaEvaluationConclusion);
            }

            this.handleCompleteTask(pass, variables)
              .then(() => {
                showToast({ message: '处理成功', type: 'success' });
                setTimeout(() => {
                  this.handleNavigateTo({
                    name: 'WorkflowMine',
                    query: { current: '0' },
                    replace: true,
                  });
                  done();
                }, 1000);
              })
              .catch(() => {
                if (typeof done == 'function') done();
                this.submitLoading = false;
              });
          } else {
            done();
            this.submitLoading = false;
          }
        });
      } else if (summaryForm) {
        this.handleCompleteTask(pass, {})
          .then(() => {
            showToast({ message: '处理成功', type: 'success' });
            setTimeout(() => {
              this.handleNavigateTo({
                name: 'WorkflowMine',
                query: { current: '0' },
                replace: true,
              });
            }, 1000);
          })
          .catch(() => {
            this.submitLoading = false;
          });
      } else showToast({ message: '找不到需要提交的表单', type: 'fail' });
    },
  },
});
</script>
<style lang="scss" scoped>
page {
  background: #f6f6f6;
}

.workflow-form-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f6f6 0%, #f9fafb 100%);
  padding: 24rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.card {
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(31, 43, 74, 0.08);
  margin-bottom: 24rpx;
  padding: 30rpx;
}

.detail {
  .content {
    padding-bottom: 16rpx;
  }

  &-head {
    gap: 24rpx;

    .c {
      flex: 1;
      min-width: 0;

      .leave {
        color: #1f2b4a;
        font-size: 34rpx;
        line-height: 1.4;
      }

      .name {
        margin-top: 8rpx;
        color: #7a8499;
        font-size: 28rpx;
      }
    }
  }

  &-tabs {
    padding: 0;

    :deep(.van-tabs__wrap) {
      border-radius: 24rpx 24rpx 0 0;
    }

    :deep(.van-tab__text) {
      font-size: 28rpx;
    }

    :deep(.van-tabs__line) {
      width: 60rpx;
      height: 6rpx;
      border-radius: 999px;
    }
  }
}

.detail-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fab022 0%, #ffcd4e 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.detail-card {
  padding: 0;
  overflow: hidden;
}

.detail-section {
  padding: 30rpx 30rpx 10rpx;

  & + .detail-section {
    border-top: 1px solid #f2f3f5;
  }
}

.flow-wrapper {
  padding: 24rpx;
}

.bpmn-wrapper {
  padding: 0;

  :deep(canvas),
  :deep(svg) {
    border-radius: 0 0 24rpx 24rpx;
  }
}
</style>
