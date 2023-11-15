<template>
  <div class="message-mask" v-if="show">
    <div class="message" v-if="type === '1'">
      <div class="message-title">获取失败</div>
      <div class="message-content">等待 <span>60s</span> 后刷新从试</div>
      <div class="message-bottom">
        <div class="btn ref">刷新</div>
        <div class="btn" @click="$emit('close')">关闭</div>
      </div>
    </div>
    <div class="message" v-if="type === '2'">
      <div class="message-title">获取成功</div>
      <div class="message-content">
        <div class="text">
          <div class="title">授权码</div>
          <div class="code">us_1c97b03e76234d10a9431ac6f013a937</div>
        </div>
      </div>
      <div class="message-bottom">
        <div class="btn ref">复制</div>
        <div class="btn" @click="$emit('close')">关闭</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "message",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "",
    },
  },
  computed: {},
};
</script>

<style lang="less" scoped>
.message-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  .message {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: auto;
    margin-top: 200px;
    width: 247px;
    background: #fbfbfb;
    border-radius: 16px;
    &-title {
      font-size: 16px;
      font-weight: 600;
      color: #3d3d3d;
    }
    &-content {
      margin: 20px 0;
      font-size: 14px;
      font-weight: 400;
      color: #3d3d3d;
      span {
        color: #f2a33a;
      }
      .text {
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 221px;
        height: 83px;
        background: rgba(104, 122, 247, 0.1);
        border-radius: 5px 5px 5px 5px;
        .title {
          font-size: 14px;
          font-weight: 400;
          color: #3d3d3d;
        }
        .code {
          margin-top: 5px;
          width: 200px;
          font-size: 14px;
          font-weight: 400;
          color: #687af7;
          word-wrap: break-word;
          text-align: center;
        }
      }
    }
    &-bottom {
      display: flex;
      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 88px;
        height: 33px;
        background: rgba(104, 122, 247, 0.2);
        border-radius: 5px 5px 5px 5px;
        color: #3d3d3d;
        &.ref {
          background: rgb(104, 122, 247);
          color: #fbfbfb;
          margin-right: 9px;
        }
      }
    }
  }
}
</style>
