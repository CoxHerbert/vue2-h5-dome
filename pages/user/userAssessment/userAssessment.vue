<template>
    <view class="container">
        <!-- 主内容区 -->
        <scroll-view class="main" scroll-y="true">
            <!-- 基础信息卡片 -->
            <view class="u-card">
                <view class="u-card__body">
                    <view class="u-flex u-justify-between u-items-start">
                        <view>
                            <text class="u-text--heading">{{ currentItem.assessmentPeriod }}</text>
                            <text class="u-text--subheading">{{ currentItem.department }}</text>
                        </view>
                        <view class="u-tag u-tag--primary u-tag--light">
                            {{ currentItem.recordStatus }}
                        </view>
                    </view>

                    <view class="u-grid u-grid--bordered u-mt-4">
                        <view class="u-grid__item">
                            <view class="u-grid__content">
                                <text class="u-text--label">考核人</text>
                                <text class="u-text--value">{{ currentItem.assessor }}</text>
                            </view>
                        </view>
                        <view class="u-grid__item">
                            <view class="u-grid__content">
                                <text class="u-text--label">总分</text>
                                <text class="u-text--value">{{ currentItem.fullMarks }}</text>
                            </view>
                        </view>
						<view class="u-grid__item">
						    <view class="u-grid__content">
						        <text class="u-text--label">被考核人</text>
						        <text class="u-text--value" style="font-size: 15px;">{{ currentItem.employeeName }}</text>
						    </view>
						</view>
                        <view class="u-grid__item">
                            <view class="u-grid__content">
                                <text class="u-text--label">得分</text>
                                <text class="u-text--value u-text--primary">{{ currentItem.totalScore }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- <view class="u-note u-note--info u-mt-4">
                        <text class="u-note__text"> </text>
                    </view> -->
                </view>
            </view>

            <!-- 考核项列表 -->
            <view class="u-card u-mt-30">
                <!-- <view class="u-card__header">
          <text class="u-card__header__title">考核项详情</text>
        </view> -->

                <view class="u-card__body">
                    <view class="u-list u-list--bordered">
                        <view
                            class="u-list__item"
                            v-for="(item, index) in currentItem.recordDetails"
                            :key="index"
                            @click="showItemDetail(item)"
                        >
                            <view class="u-list__item__content">
                                <view class="u-list__item__left">
                                    <view
                                        class="u-badge"
                                        :style="{
                                            backgroundColor: item.score == item.weightScore ? '#00B42A' : '#FF7D00',
                                        }"
                                    ></view>
                                    <view class="u-list__item__title-container" style="width: 100%">
                                        <view
                                            class=""
                                            style="display: flex; justify-content: space-between; align-items: center"
                                        >
                                            <text class="u-list__item__title">{{ item.assessmentDimension }}</text>
                                            <view class="u-list__item__right">
                                                <text class="u-text--primary u-font-medium">{{
                                                    item.score ? item.score : 0
                                                }}</text>
                                                <text class="u-text--disabled u-mx-1">/</text>
                                                <text class="u-text--disabled">{{ item.weightScore }}</text>
                                                <view class="u-icon u-icon--arrow-right">
                                                    <text class="iconfont icon-right"></text>
                                                </view>
                                            </view>
                                        </view>

                                        <text class="u-list__item__desc" v-html="item.description"></text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 异议反馈区 -->
            <view class="u-card u-mt-30">
                <view class="u-card__header">
                    <text style="font-size: 17px; margin-right: 15px">是否有异议：</text>
                    <u-radio-group v-model="radioValue">
                        <u-radio v-for="(item, index) in list" :key="index" :name="item.name">
                            {{ item.name }}
                        </u-radio>
                    </u-radio-group>
                    <!-- <text class="u-card__header__title">异议说明</text> -->
                </view>
                <view class="u-card__body" v-if="radioValue == '有异议'">
                    <view class="u-form">
                        <view class="u-form__item">
                            <view class="u-form__tips u-mb-2"> 如有异议请在此说明 </view>
                            <textarea
                                class="u-input u-input--textarea"
                                v-model="feedbackContent"
                                placeholder="请输入异议说明内容..."
                                :disabled="isSubmitting"
                            ></textarea>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <view class="" style="height: 60px"> </view>
        <button
            class="u-button u-button--primary u-button--block u-mt-5 field-Btn"
            :loading="isSubmitting"
            @click="submitModel"
        >
            确认提交
        </button>
        <!-- 提示框 -->
        <uni-popup
            type="toast"
            :show="showToast"
            :message="toastMessage"
            :duration="2000"
            @close="showToast = false"
        ></uni-popup>
    </view>
</template>

<script>
import Api from '@/api';
export default {
    data() {
        return {
            // 考核项数据

            // 反馈相关
            feedbackContent: '',
            isSubmitting: false,
            showToast: false,
            toastMessage: '',

            // 折叠面板
            // isDataExpanded: false,
            radioValue: '无异议',
            list: [
                {
                    name: '无异议',
                    disabled: false,
                },
                {
                    name: '有异议',
                    disabled: false,
                },
            ],
            currentItem: {},

            // 详情弹窗
            showDetailPopup: false,
            // currentItem: {},
            assessmentId: null,
        };
    },
    onLoad(options) {
        // 新增：接收URL参数
        this.assessmentId = options.id;
        // console.log(this.assessmentId);
    },
    onShow() {
        this.init();
    },
    methods: {
        //初始化
        init() {
            Api.wms.warehouse
                .employeeAssessmentRecordDetail({
                    id: this.assessmentId,
                })
                .then((res) => {
                    if (res.code === 200) {
                        this.currentItem = res.data;
                    }
                });
        },

        submitModel() {
            if (this.radioValue !== '无异议') {
                if (!this.feedbackContent.trim()) {
                    uni.showToast({
                        title: '请输入异议说明',
                        icon: 'none',
                    });
                    return;
                }
            }
            uni.showModal({
                title: '提示',
                content: '确认提交吗？',
                success: (res) => {
                    if (res.confirm) {
                        // 用户点击了确定
                        this.submitFeedback();
                    }
                },
            });
        },
        // 提交异议
        submitFeedback() {
            this.isSubmitting = true;
            let { recordDetails, ...restItem } = this.currentItem;
            Api.wms.warehouse
                .employeeAssessmentRecordSubmit({
                    ...restItem,
                    comments: this.feedbackContent,
                })
                .then((res) => {
                    if (res.code === 200) {
                        uni.showToast({
                            title: '提交成功',
                            icon: 'success',
                        });
                        this.feedbackContent = '';
                        setTimeout(() => {
                            uni.reLaunch({
                                url: '/', // 跳转到首页
                            });
                        }, 2000);
                    }
                    this.isSubmitting = false;
                });
        },

        // 显示提示消息
        showToastMessage(message) {
            this.toastMessage = message;
            this.showToast = true;
        },

        // 显示考核项详情
        showItemDetail(item) {
            this.currentItem = item;
            this.showDetailPopup = true;
        },
    },
};
</script>

<style lang="scss" scoped>
// uView风格色彩系统
$u-primary: #165dff;
$u-success: #00b42a;
$u-warning: #ff7d00;
$u-error: #f53f3f;
$u-text-primary: #303133;
$u-text-secondary: #606266;
$u-text-placeholder: #909399;
$u-border-color: #e5e6eb;
$u-bg-color: #f2f3f5;
$u-white: #ffffff;
$u-gray-100: #f7f8fa;
$u-gray-200: #f2f3f5;

// 间距系统
$u-gap-xs: 8rpx;
$u-gap-sm: 16rpx;
$u-gap-md: 24rpx;
$u-gap-lg: 32rpx;
$u-gap-xl: 40rpx;

// 字体系统
$u-font-size-xs: 24rpx;
$u-font-size-sm: 28rpx;
$u-font-size-md: 32rpx;
$u-font-size-lg: 36rpx;
$u-font-size-xl: 40rpx;

.field-Btn {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
}
.container {
    background-color: $u-bg-color;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC',
        'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

// 导航栏样式
.u-nav-bar {
    height: 100rpx;
    background-color: $u-white;
    border-bottom: 1px solid $u-border-color;
    position: relative;
    z-index: 10;

    &__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 $u-gap-lg;
    }

    &__left,
    &__right {
        width: 80rpx;
        height: 100%;
        display: flex;
        align-items: center;
    }

    &__left {
        justify-content: flex-start;
    }

    &__right {
        justify-content: flex-end;
    }

    &__title {
        font-size: $u-font-size-lg;
        color: $u-text-primary;
        font-weight: 500;
        flex: 1;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

// 图标样式
.u-icon {
    font-size: $u-font-size-lg;
    color: $u-text-secondary;

    &--back {
        color: $u-text-secondary;
    }

    &--share {
        color: $u-primary;
    }

    &--arrow-right {
        font-size: $u-font-size-md;
        color: $u-text-placeholder;
        margin-left: $u-gap-xs;
    }

    &--arrow {
        transition: transform 0.3s ease;
        font-size: $u-font-size-md;

        &__active {
            transform: rotate(180deg);
        }
    }
}

// 主内容区
.main {
    padding: $u-gap-lg;
    box-sizing: border-box;
    min-height: calc(100vh - 100rpx);
}

// 卡片组件样式
.u-card {
    background-color: $u-white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    &__body {
        padding: $u-gap-xl;
    }

    &__header {
        padding: $u-gap-xl;
        padding-bottom: $u-gap-md;
        border-bottom: 1px solid $u-border-color;

        &__title {
            font-size: $u-font-size-lg;
            color: $u-text-primary;
            font-weight: 500;
        }
    }
}

// 间距工具类
.u-mt-30 {
    margin-top: 30rpx !important;
}

.u-mt-4 {
    margin-top: $u-gap-md !important;
}

.u-mt-5 {
    margin-top: $u-gap-lg !important;
}

.u-mx-1 {
    margin-left: $u-gap-xs !important;
    margin-right: $u-gap-xs !important;
}

.u-mb-2 {
    margin-bottom: $u-gap-sm !important;
}

// 布局工具类
.u-flex {
    display: flex !important;
}

.u-justify-between {
    justify-content: space-between !important;
}

.u-items-start {
    align-items: flex-start !important;
}

.u-items-center {
    align-items: center !important;
}

.u-flex-column {
    flex-direction: column !important;
}

// 文本样式
.u-text--heading {
    font-size: $u-font-size-xl;
    color: $u-text-primary;
    font-weight: bold;
}

.u-text--subheading {
    font-size: $u-font-size-sm;
    color: $u-text-secondary;
    margin-top: $u-gap-xs;
    display: block;
}

.u-text--label {
    font-size: $u-font-size-xs;
    color: $u-text-placeholder;
    display: block;
}

.u-text--value {
    font-size: $u-font-size-md;
    color: $u-text-primary;
    margin-top: $u-gap-xs;
    display: block;
}

.u-text--primary {
    color: $u-primary !important;
}

.u-text--disabled {
    color: $u-text-placeholder !important;
}

.u-font-medium {
    font-weight: 500 !important;
}

// 标签样式
.u-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6rpx 16rpx;
    border-radius: 999rpx;
    font-size: $u-font-size-xs;
    font-weight: 500;

    &--primary {
        color: $u-primary;
    }

    &--light {
        background-color: rgba(22, 93, 255, 0.1);
    }
}

// 网格布局
.u-grid {
    display: flex;
    width: 100%;

    &--bordered {
        border: 1px solid $u-border-color;
        border-radius: 8rpx;
        overflow: hidden;
    }

    &__item {
        flex: 1;
        border-right: 1px solid $u-border-color;

        &:last-child {
            border-right: none;
        }
    }

    &__content {
        padding: $u-gap-md;
    }
}

// 提示文本
.u-note {
    padding: $u-gap-sm $u-gap-md;
    border-radius: 8rpx;
    font-size: $u-font-size-xs;

    &--info {
        background-color: $u-gray-200;
        color: $u-text-secondary;
    }

    &__text {
        display: block;
        line-height: 1.5;
    }
}

// 列表样式
.u-list {
    &--bordered {
        border-top: 1px solid $u-border-color;
    }

    &__item {
        border-bottom: 1px solid $u-border-color;

        &:last-child {
            border-bottom: none;
        }
    }

    &__item__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $u-gap-md 0;
    }

    &__item__left {
        display: flex;
        align-items: center;
        flex: 1;
    }

    &__item__title-container {
        margin-left: $u-gap-md;
    }

    &__item__title {
        font-size: $u-font-size-md;
        color: $u-text-primary;
        display: block;
    }

    &__item__desc {
        font-size: $u-font-size-sm;
        color: $u-text-secondary;
        margin-top: $u-gap-xs;
        display: block;
        line-height: 1.4;
    }

    &__item__right {
        display: flex;
        align-items: center;
    }
}

// 徽章样式
.u-badge {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
}

// 表单样式
.u-form {
    &__tips {
        font-size: $u-font-size-sm;
        color: $u-text-secondary;
    }

    &__item {
        margin-bottom: $u-gap-lg;
    }
}

// 输入框样式
.u-input {
    width: 100%;
    padding: $u-gap-md;
    border: 1px solid $u-border-color;
    border-radius: 8rpx;
    font-size: $u-font-size-md;
    color: $u-text-primary;
    box-sizing: border-box;

    &::placeholder {
        color: $u-text-placeholder;
    }

    &--textarea {
        min-height: 200rpx;
        line-height: 1.5;
        resize: none;
    }

    &:disabled {
        background-color: $u-gray-100;
        color: $u-text-placeholder;
    }
}

// 按钮样式
.u-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 $u-gap-lg;
    font-size: $u-font-size-md;
    font-weight: 500;
    border-radius: 8rpx;
    height: 88rpx;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &--primary {
        background-color: $u-primary;
        color: $u-white;
        border: none;
    }

    &--block {
        width: 100% !important;
    }

    &:active {
        opacity: 0.9;
    }

    &[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

// 折叠面板
.u-collapse {
    &__item {
        border-bottom: 1px solid $u-border-color;

        &:last-child {
            border-bottom: none;
        }
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $u-gap-md 0;
        cursor: pointer;
    }

    &__title {
        font-size: $u-font-size-md;
        color: $u-text-primary;
        font-weight: 500;
    }

    &__content {
        padding: $u-gap-md 0;
        transition: all 0.3s ease;
    }
}

// 单元格
.u-cell-group {
    &--bordered {
        background-color: $u-white;
    }
}

.u-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $u-gap-md 0;
    border-bottom: 1px solid $u-border-color;

    &:last-child {
        border-bottom: none;
    }

    &__title {
        font-size: $u-font-size-md;
        color: $u-text-secondary;
    }

    &__value {
        font-size: $u-font-size-md;
        color: $u-text-primary;
        text-align: right;
    }
}

// 页脚样式
.u-footer {
    background-color: $u-white;
    padding: $u-gap-lg 0;
    margin-top: $u-gap-xl;
    border-top: 1px solid $u-border-color;
    text-align: center;

    &__text {
        font-size: $u-font-size-xs;
        color: $u-text-placeholder;
        display: block;
        line-height: 1.5;
    }

    &__text--small {
        margin-top: $u-gap-xs;
        font-size: $u-font-size-xs - 4rpx;
    }
}

// 详情弹窗
.detail-popup {
    width: 600rpx;
    background-color: $u-white;
    border-radius: 20rpx;
    overflow: hidden;

    &__header {
        padding: $u-gap-lg;
        border-bottom: 1px solid $u-border-color;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__title {
            font-size: $u-font-size-lg;
            color: $u-text-primary;
            font-weight: 500;
        }

        .icon-close {
            font-size: $u-font-size-lg;
            color: $u-text-placeholder;
        }
    }

    &__body {
        padding: $u-gap-xl;
    }

    .detail-item {
        display: flex;
        margin-bottom: $u-gap-md;

        &:last-child {
            margin-bottom: 0;
        }

        .detail-label {
            font-size: $u-font-size-sm;
            color: $u-text-secondary;
            width: 180rpx;
            flex-shrink: 0;
        }

        .detail-value {
            font-size: $u-font-size-sm;
            color: $u-text-primary;
            flex: 1;
            line-height: 1.5;
        }
    }
}
</style>
