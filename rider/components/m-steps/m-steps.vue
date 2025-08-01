<template>
    <view class="steps">
        <view class="tail" :class="{ 'active-tail': activeNode, fstail: item.title === '待复试' }"></view>
        <view
            class="node"
            :class="{
                'active-node': activeNode || activity == stepList[stepList.length - 1].title || activity == item.title,
                fsnode: item.title === '待复试',
            }"
        ></view>
        <view
            class="wrapper"
            :class="{
                'active-wrapper': activity === item.title,
                passactive:
                    item.title == '复试已通过' ||
                    item.title == '初试已通过' ||
                    item.title === '已入职' ||
                    item.title === '确认入职',
                fushiactive: item.title == '待复试' && findIndex == index,
            }"
        >
            <image v-if="item.title == '待初试'" src="@/static/images/stepactive.png" />
            <image
                v-else-if="
                    item.title == '复试已通过' ||
                    item.title === '初试已通过' ||
                    item.title === '已入职' ||
                    item.title === '确认入职'
                "
                src="@/static/images/pass.png"
            />
            <image
                v-else-if="item.title == '复试不通过' || item.title == '拒绝入职'"
                src="@/static/images/refuse.png"
            />
            <image v-else-if="item.title == '待复试'" src="@/static/images/stepactive.png" />
            <image v-else src="@/static/images/setep.png" />

            <view class="right">
                <view class="title" :class="{ refusetitle: item.title == '复试不通过' || item.title == '拒绝入职' }">{{
                    item.title
                }}</view>
                <view class="subtitle">{{ item.subtitle }}</view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'm-steps',
    data() {
        return {
            findIndex: '',
        };
    },
    props: {
        stepList: {
            type: Array,
            default() {
                return [];
            },
        },
        item: {
            type: Object,
        },
        activity: {
            type: String,
            default: '待初试',
        },
        index: {
            type: Number,
            default: 0,
        },
    },

    computed: {
        activeNode: function () {
            let findIndex = this.stepList.findIndex((item) => {
                return item.title == this.activity;
            });
            this.findIndex = findIndex;
            return this.index < findIndex;
        },
    },
};
</script>

<style lang="scss" scoped>
.steps {
    position: relative;
    padding-bottom: 40rpx;
    text-align: left;

    &:last-child {
        .tail {
            display: none;
        }
    }
    .fsnode {
        top: 32% !important;
    }
    .fstail {
        top: 43% !important;
    }

    .passactive {
        background-color: #e2f3ef !important;
        .title {
            color: #23c69f !important;
        }
    }

    .fushiactive {
        background-color: #e2e9f7 !important;
    }

    .refusetitle {
        color: #e12137 !important;
    }

    .active-wrapper {
        background: #e2e9f7;
        .title {
            color: #1d65f3;
        }
    }

    .active-tail {
        border-left: 2px solid #f78431 !important;
    }

    .active-node {
        border: 4rpx solid #f78431 !important;
    }

    .tail {
        position: absolute;
        left: 8rpx;
        top: 44%;
        height: 165rpx;
        border-left: 4rpx solid #e4e7ed;
    }

    .node {
        left: 0rpx;
        top: 33%;
        width: 20rpx;
        height: 20rpx;
        position: absolute;
        border: 4rpx solid #bbbbbb;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .wrapper {
        position: relative;
        margin-left: 40rpx;
        height: 144rpx;
        top: -6rpx;
        display: flex;
        align-items: center;
        background: #ffffff;
        border-radius: 16rpx 16rpx 16rpx 16rpx;
        padding: 36rpx 24rpx;
        box-sizing: border-box;
        display: flex;
        image {
            width: 80rpx;
            height: 80rpx;
            margin-right: 24rpx;
        }
        .right {
            flex: 1;
            .title {
                font-size: 32rpx;
                color: #333333;
                margin-bottom: 12rpx;
                font-weight: bold;
            }
            .subtitle {
                font-size: 24rpx;
                color: #848488;
            }
        }
    }
}
</style>
