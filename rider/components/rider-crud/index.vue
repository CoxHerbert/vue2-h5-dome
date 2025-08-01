<template>
    <view>
        <!-- head -->
        <view class="head-area" :style="{ height: `${headHeight}rpx` }">
            <u-navbar
                :is-fixed="false"
                :border-bottom="false"
                :is-back="!hideTitleBar"
                :custom-back="navBack"
                :title="isWeixin ? '' : option.navTitle"
                :back-icon-name="option.navBackIcon || 'arrow-leftward'"
                back-icon-color="#fff"
                back-icon-size="35"
                :background="{ background: 'transparent' }"
                title-color="#fff"
            >
                <view class="nav-title" v-if="isWeixin">{{ option.navTitle }}</view>
                <view class="nav-right" slot="right" v-if="option.manageBtn" @click="manageSwitch = !manageSwitch">
                    {{ manageSwitch ? '完成' : '管理' }}
                </view>
            </u-navbar>
            <view class="search-item" v-if="option.searchShow">
                <u-search
                    placeholder="搜索内容"
                    v-model="searchValue"
                    @search="onSearch(searchValue)"
                    @clear="onSearch(searchValue)"
                    shape="square"
                    bg-color="#8EAAFF"
                    placeholder-color="#5470C4"
                    color="#fff"
                    search-icon-color="#ffffffE5"
                    :clearabled="true"
                    :show-action="false"
                ></u-search>
            </view>
        </view>
        <!-- head seat -->
        <view :style="{ height: `${headHeight}rpx` }"></view>
        <!-- list -->
        <block v-if="data && data.length > 0">
            <view class="" v-for="(item, index) in data" :key="index">
                <crud-item
                    :ref="`crud-item${index}`"
                    :list="data"
                    :node="item"
                    :option="option"
                    :nodeIndex="index"
                    :checkList="checkList"
                    :checkShow="manageSwitch"
                    :random-num="randomNum"
                ></crud-item>
            </view>
            <view style="padding: 20rpx 0"><slot name="loadmore"></slot></view>
        </block>
        <!-- foot -->
        <block v-if="manageSwitch">
            <view :style="[{ height: isFullSucreen ? '168rpx' : '100rpx' }]"></view>
            <view class="foot flex" v-if="manageSwitch" :class="[isFullSucreen ? 'foot-ipx' : '']">
                <checkbox-group @change="onCheckedAll">
                    <label class="well-check flex flex-c">
                        <checkbox
                            color="#fff"
                            style="transform: scale(0.7)"
                            value="allSelect"
                            :checked="checkedAll"
                            class="curdCheck"
                        ></checkbox>
                        <text class="checkAll">全选 ({{ checkList.length }})</text>
                    </label>
                </checkbox-group>
                <view class=""><view class="foot-del-btn" @click="onRemove">删除</view></view>
            </view>
        </block>
        <!-- form -->
        <u-popup
            v-model="createShow"
            safe-area-inset-bottom
            border-radius="14"
            mode="bottom"
            closeable
            @close="onCreateClose"
            :mask-close-able="false"
        >
            <view class="popup-head"><u-section :title="action" :right="false" line-color="#f78431"></u-section></view>
            <scroll-view scroll-y="true" style="height: 68vh">
                <view class="form">
                    <block v-if="formType == 'uviewForm'">
                        <u-form :model="value" ref="uForm" :label-width="option.labelWidth || 160"
                            ><slot name="form"></slot
                        ></u-form>
                    </block>
                    <block v-else><slot name="form"></slot></block>
                </view>
            </scroll-view>
            <view class="form-btn">
                <u-button
                    v-if="action != '查看'"
                    @click="onSubmit"
                    :loading="disabled"
                    shape="circle"
                    ripple
                    :custom-style="{
                        width: '100%',
                        background: 'linear-gradient(90deg, #69b0ff, #f78431)',
                        color: '#fff',
                    }"
                >
                    保存
                </u-button>
            </view>
        </u-popup>
        <!-- addBtn -->
        <movable-area class="movable-area">
            <movable-view class="movable-view" :x="moveX" :y="moveY" direction="all">
                <image src="@/static/images/crud/create.png" @click="onCreateOpen"></image>
            </movable-view>
        </movable-area>
        <!-- empty -->
        <slot name="empty">
            <block v-if="data.length == 0">
                <u-empty
                    text="工作再忙，也要记得喝水～"
                    margin-top="200"
                    :src="require('@/static/images/crud/empty.png')"
                ></u-empty>
            </block>
        </slot>
    </view>
</template>

<script>
import crudItem from './components/crud-item/index';
import { checkModel } from './util/tool.js';
import validate from './util/validate.js';
import { needHideTitleBar } from '@/utils/utils'
export default {
    name: 'rider-crud',
    components: { crudItem },
    props: {
        value: {}, // 表单
        data: Array, // 列表
        // 配置
        option: {
            type: Object,
            default: {
                column: [],
            },
        },
        // 表单类型
        formType: {
            type: String,
            default: 'uviewForm',
        },
        // 返回事件
        navBack: {
            type: Function,
            default: null,
        },
        rules: {}, // 校验规则
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            hideTitleBar: false,
            isFullSucreen: checkModel(),
            moveX: 320, //添加按钮坐标
            moveY: 580,
            checkedAll: false, //全选
            checkList: [], //选中值
            createShow: false, //form弹窗
            disabled: false, // 操作按钮
            action: '新增',
            searchValue: '',
            isWeixin: false,
            manageSwitch: false,
            headHeight: 0,
            randomNum: Math.round(Math.random() * 99999), // 随机数，防止uni.on重复调用
        };
    },
    watch: {
        manageSwitch: {
            handler(newVal, oldVal) {
                this.checkList = [];
                this.checkedAll = false;
            },
            deep: true,
            immediate: true,
        },
        'option.searchShow': {
            handler(newVal, oldVal) {
                const that = this;
                this.headHeight = newVal ? 192 : 98;
                // #ifndef H5
                uni.getSystemInfo({
                    success: function (res) {
                        const statusBarHeight = Number(res.statusBarHeight) + Number(res.platform == 'ios' ? 44 : 48);
                        that.headHeight = newVal ? statusBarHeight + 192 : statusBarHeight + 98;
                    },
                });
                // #endif
            },
            deep: true,
            immediate: true,
        },
    },
    // 通信事件
    created() {
        let that = this;
        this.hideTitleBar = !needHideTitleBar();
        uni.$on(`action${this.randomNum}`, ({ index }, i, list) => {
            that.onActionClick({ index }, i, list);
        });
        uni.$on(`checked${this.randomNum}`, (e, id) => {
            that.onChecked(e, id);
        });

        // #ifdef MP-WEIXIN
        this.isWeixin = true;
        //  #endif
        // #ifndef MP-WEIXIN
        this.isWeixin = false;
        // #endif
    },

    methods: {
        setLazyLoad(func) {
            this.option.lazyLoad = func;
            setTimeout(() => {
                this.data.forEach((d, i) => {
                    this.$refs[`crud-item${i}`][0].setLazyLoad(func);
                });
            }, 100);
        },

        // 选择
        onChecked(e, id) {
            const i = e.detail.value[0];
            if (i) this.checkList.push(i);
            else
                this.checkList.splice(
                    this.checkList.findIndex((e) => e === id),
                    1
                );
            this.checkedAll = this.checkList.length === this.data.length;
        },
        // 全选
        onCheckedAll() {
            if (!this.checkedAll) {
                this.checkedAll = true;
                this.checkList = [];
                this.data.map((e) => {
                    this.checkList.push(e.id);
                });
            } else {
                this.checkedAll = false;
                this.checkList = [];
            }
        },
        // 元素点击
        onClick(item, index) {
            const action = { name: '查看' };
            const data = JSON.parse(JSON.stringify(item));
            this.$emit('input', data);
            this.$emit('action-click', { index, data, actionIndex: -1, action, done: this.show });
            this.action = action.name;
        },
        // 底部删除
        onRemove() {
            if (this.checkList.length === 0) {
                uni.showToast({
                    title: '请选择至少一条数据',
                    icon: 'none',
                    duration: 2000,
                });
                return;
            }
            this.$emit('del', this.checkList.join(','));
        },
        // 打开弹窗
        onCreateOpen() {
            this.action = '新增';
            this.$emit('action-click', { action: { name: this.action }, done: this.show });
        },
        // 关闭弹窗
        onCreateClose() {
            this.hide();
        },
        // 添加保存
        onSubmit() {
            this.disabled = true;
            const data = JSON.parse(JSON.stringify(this.value));
            if (this.formType == 'uviewForm') {
                // #ifdef MP
                validate(this.value, this.rules)
                    .then(() => {
                        this.$emit('submit', data, this.action, this.unloading, this.hide);
                    })
                    .catch(() => {
                        this.unloading();
                    });
                // #endif
                // #ifndef MP
                this.$refs.uForm.validate((valid) => {
                    if (valid) {
                        this.$emit('submit', data, this.action, this.unloading, this.hide);
                    } else {
                        this.unloading();
                    }
                });
                // #endif
            } else {
                validate(this.value, this.rules)
                    .then(() => {
                        debugger;
                        this.$emit('submit', data, this.action, this.unloading, this.hide);
                    })
                    .catch(() => {
                        this.unloading();
                    });
            }
        },
        // 左滑按钮点击
        onActionClick({ index }, i, list) {
            let action;
            if (index == -1) action = { name: '查看' };
            else action = this.option.actions[index];
            const data = JSON.parse(JSON.stringify(list[i]));
            if (['新增', '编辑', '查看'].includes(action.name)) this.$emit('input', data);
            this.$emit('action-click', { index: i, data, actionIndex: index, action, done: this.show });
            // this.action = action.name
            this.$set(this, 'action', action.name);
        },

        //全选删除后回调
        allCheckHide(val) {
            if (this.checkedAll) this.manageSwitch = val;
            this.checkList = [];
        },

        // 搜索
        onSearch(val) {
            this.$emit('search', val);
        },
        show() {
            this.createShow = true;
            setTimeout(() => {
                if (this.rules && this.$refs['uForm'] && typeof this.$refs['uForm'].setRules == 'function') {
                    this.$refs['uForm'].setRules(this.rules);
                }
            }, 100);
        },
        hide() {
            this.createShow = false;
            this.disabled = false;
            this.$emit('input', {});
            this.$emit('update:readonly', false);
        },
        unloading() {
            this.disabled = false;
        },
        hideChildren() {
            this.data.forEach((d, i) => {
                this.$refs[`crud-item${i}`][0].hide();
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flex-one {
    flex: 1;
}

.head-area {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    width: 100%;
    background: url('/static/images/head_bg.png') no-repeat center bottom;
    background-size: 100% 100%;

    .nav-right {
        color: #fff;
        font-size: 30rpx;
        font-weight: normal;
        padding-right: 30rpx;
    }

    .nav-title {
        color: #fff;
        font-size: 32rpx;
        font-weight: normal;
    }

    .search-item {
        padding: 0 30rpx;
    }
}

.head-h {
    height: 200rpx;
}

/* 底部 */
/* 适配 */
.foot-ipx {
    bottom: 68rpx !important;
}

.foot-ipx::after {
    content: ' ';
    position: fixed;
    bottom: 0 !important;
    left: 0;
    right: 0;
    height: 68rpx !important;
    width: 100%;
    background: #fff;
}

.foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    width: 100%;
    padding: 0 26rpx;
    height: 100rpx;
    background: #fff;
    border-top: 2px solid #eee;

    &-del-btn {
        width: 160rpx;
        height: 64rpx;
        line-height: 64rpx;
        font-size: 26rpx;
        // color: #fff;
        text-align: center;
        border-radius: 34px;
        // background: linear-gradient(180deg, #f78431, #69b0ff);
        color: #f56c6c;
        background: #fef0f0;
    }
}

.form {
    padding: 0 30rpx 20rpx;
}

.popup-head {
    padding: 36rpx 30rpx;
    border-bottom: 2rpx dashed #efefef;
}

.form-btn {
    margin: 30rpx;
    min-height: 80rpx;
}

.movable-area {
    height: 100vh;
    width: 100%;
    top: 0;
    position: fixed;
    pointer-events: none;

    .movable-view {
        width: 96rpx;
        height: 96rpx;
        pointer-events: auto;

        image {
            width: 96rpx;
            height: 96rpx;
        }
    }
}
</style>
