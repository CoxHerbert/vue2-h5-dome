<template>
  <div class="wf-card">
    <div v-for="(item, index) in list" :key="index" class="wf-card-item">
      <div class="wf-card-body" @click="dynamicRoute(item, 'detail')">
        <div class="head">
          <div class="head-left">
            <div class="status-icon">
              <div v-if="item.status === 'delay'" class="status-icon-delay">超时</div>
              <div v-else-if="item.status === 'todo'" class="status-icon-normal">正常</div>
              <template v-else-if="item.status === 'done' || !item.stautus">
                <div v-if="item.processIsFinished === 'unfinished'" class="status-icon-normal">
                  正常
                </div>
                <div v-else-if="item.processIsFinished === 'finished'" class="status-icon-normal">
                  结束
                </div>
                <div v-else-if="item.processIsFinished === 'terminate'" class="status-icon-delay">
                  终止
                </div>
                <div v-else-if="item.processIsFinished === 'withdraw'" class="status-icon-delay">
                  撤销
                </div>
                <div v-else-if="item.processIsFinished === 'recall'" class="status-icon-delay">
                  撤回
                </div>
                <div v-else-if="item.processIsFinished === 'reject'" class="status-icon-delay">
                  驳回
                </div>
                <div v-else-if="item.processIsFinished === 'deleted'" class="status-icon-delay">
                  删除
                </div>
              </template>
            </div>
            <span class="title">{{ item.processDefinitionName }}</span>
          </div>
          <img
            v-if="item.applyUser && item.applyUser.avatar"
            :src="item.applyUser.avatar"
            class="avatar"
            alt="头像"
          />
          <img
            v-else
            src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
            class="avatar"
            alt="头像"
          />
        </div>
        <div v-if="item.variables && item.variables.serialNumber" class="cell">
          <span class="label">流水号：</span>
          <span class="value">{{ item.variables.serialNumber }}</span>
        </div>
        <div class="cell">
          <span class="label">分类：</span>
          <span class="value">{{ item.categoryName }}</span>
        </div>
        <div v-if="type !== 2" class="cell">
          <span class="label">当前节点：</span>
          <span class="value">{{ item.taskName }}</span>
        </div>
        <div class="cell">
          <span class="label">申请人：</span>
          <span class="value">{{ item.startUsername }}</span>
        </div>
        <div v-if="type !== 2" class="cell">
          <span class="label">申请时间：</span>
          <span class="value">{{ item.createTime }}</span>
        </div>
        <template v-if="type === 2">
          <div class="cell">
            <span class="label">操作节点：</span>
            <span class="value">{{ item.taskName }}</span>
          </div>
          <div class="cell">
            <span class="label">发起时间：</span>
            <span class="value">{{ item.createTime }}</span>
          </div>
        </template>
        <van-divider class="card-divider" />
      </div>
      <div v-if="showBtn" class="foot">
        <span class="reject" @click.stop="handleExam(item, false)">拒绝</span>
        <span class="line">|</span>
        <span class="pass" @click.stop="handleExam(item, true)">同意</span>
      </div>
    </div>
    <van-dialog
      v-model:show="show"
      title="审批意见"
      show-cancel-button
      :before-close="handleDialogClose"
    >
      <wf-form v-if="show" ref="form" v-model="form" :option="option" />
    </van-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Toast } from 'vant';
import exForm from '../../mixins/ex-form';

export default defineComponent({
  name: 'WfCard',
  mixins: [exForm],
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    showBtn: {
      type: Boolean,
      default: false,
    },
    type: Number,
  },
  data() {
    return {
      show: false,
      form: {},
      option: {
        menuBtn: false,
        column: [
          {
            label: '',
            prop: 'comment',
            type: 'textarea',
            placeholder: '审批意见',
            height: '200',
            border: true,
          },
        ],
      },
      task: {},
      pass: false,
    };
  },
  methods: {
    handleExam(item, pass) {
      this.task = item;
      this.pass = pass;
      const comment = this.findObject(this.option.column, 'comment');
      if (!pass) {
        comment.rules = [{ required: true, message: '请输入审批意见' }];
        this.show = true;
      } else {
        comment.rules = [];
        this.dynamicRoute(item, 'detail');
      }
    },
    handleDialogClose(action) {
      if (action === 'confirm') {
        return new Promise((resolve) => {
          if (!this.$refs.form) {
            resolve(true);
            return;
          }
          this.$refs.form.validate((valid, done) => {
            if (valid) {
              const { comment } = this.form;
              this.handleCompleteTask(this.pass, {}, comment, this.task).then(() => {
                this.resetDialog();
                Toast.success('处理成功');
                this.$emit('refresh');
                if (done && typeof done === 'function') done();
                resolve(true);
              });
            } else {
              if (done && typeof done === 'function') done();
              resolve(false);
            }
          });
        });
      }
      this.resetDialog();
      return Promise.resolve(true);
    },
    resetDialog() {
      this.show = false;
      this.form = {};
      this.task = {};
      this.pass = false;
    },
  },
});
</script>

<style lang="scss" scoped>
// @import '../../static/styles/common';

.wf-card {
  padding: 0 30rpx 30rpx;
}

.wf-card-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
}

.wf-card-body {
  cursor: pointer;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.title {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  width: 66rpx;
  height: 66rpx;
  border-radius: 50%;
  object-fit: cover;
}

.status-icon {
  width: 74rpx;
  color: #fff;
}

.status-icon-delay,
.status-icon-normal {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  padding-right: 8rpx;
  background-size: 100% 100%;
}

.status-icon-delay {
  background-image: url('../../static/images/icon_delay.png');
}

.status-icon-normal {
  background-image: url('../../static/images/icon_normal.png');
}

.cell {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  margin-bottom: 18rpx;
}

.cell:last-of-type {
  margin-bottom: 0;
}

.label {
  color: #999;
}

.value {
  color: #565656;
}

.card-divider {
  margin-top: 24rpx;
}

.foot {
  font-size: 34rpx;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-weight: 600;
  padding-top: 20rpx;
}

.line {
  color: #efefef;
}

.pass {
  color: #4b9eff;
}

.reject {
  color: #222;
}
</style>
