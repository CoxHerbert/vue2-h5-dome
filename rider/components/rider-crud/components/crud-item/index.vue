<template>
    <view class="">
        <rider-swipe-action :actions="option.actions" @click="onActionClick($event, nodeIndex, list)">
            <template v-slot:content>
                <view class="crud flex flex-c">
                    <view class="crud-checkbox">
                        <checkbox-group @change="(e) => onChecked(e, node.id)" v-if="checkShow">
                            <label>
                                <checkbox
                                    style="transform: scale(0.7)"
                                    :value="node.id"
                                    :checked="checkList.includes(node.id)"
                                    class="curdCheck"
                                ></checkbox>
                            </label>
                        </checkbox-group>
                    </view>
                    <view class="flex-one" @click.stop="onActionClick({ index: -1 }, nodeIndex, list)">
                        <view v-for="(col, i) in option.column" :key="i" class="crud-row flex">
                            <view class="crud-row-label">{{ col.label }}：</view>
                            <view class="crud-row-value">{{ node[col.prop] }}</view>
                        </view>
                    </view>
                </view>
                <block v-if="node.hasChildren || (node.children && node.children.length > 0)">
                    <view class="crud-child" @click="onToggle(node, nodeIndex)">
                        {{ !collapsed ? '查看下级' : '收起' }}
                        <u-icon :name="`arrow-${!collapsed ? 'down' : 'up'}`"></u-icon>
                    </view>
                </block>
            </template>
        </rider-swipe-action>
        <!-- 下级 -->
        <template v-if="node.hasChildren || (node.children && node.children.length > 0)">
            <!-- 	<block v-if="collapsed">
				<view class="" v-for="(item, index) in node.children" :key="index">
					<crud-item :ref="`crud-itemc${index}`" :node="item" :list="node.children" :option="option" :checkShow="checkShow" :nodeIndex="index" :checkList="checkList"></crud-item>
				</view>
			</block> -->
            <u-popup v-model="collapsed" mode="bottom" closeable :mask-close-able="false" :z-index="zIndex">
                <view class="form-head"
                    ><u-section title="查看下级" :right="false" line-color="#f78431"></u-section
                ></view>
                <scroll-view scroll-y="true" style="height: 75vh; background: #f5f5f5">
                    <crud-item
                        v-for="(item, index) in node.children"
                        :key="index"
                        :ref="`crud-item${index}`"
                        :node="item"
                        :list="node.children"
                        :option="option"
                        :checkShow="checkShow"
                        :nodeIndex="index"
                        :checkList="checkList"
                        :random-num="randomNum"
                        :z-index="zIndex + 1"
                    ></crud-item>
                </scroll-view>
            </u-popup>
        </template>
    </view>
</template>

<script>
import riderSwipeAction from '../swipe-action/index';
// #ifdef MP
import crudItem from '@/components/rider-crud/components/crud-item/index';
// #endif
export default {
    name: 'crud-item',
    components: {
        riderSwipeAction,
        // #ifndef MP
        crudItem: () => import('@/components/rider-crud/components/crud-item/index'),
        // #endif
        // #ifdef MP
        crudItem,
        // #endif
    },
    props: {
        // 节点数据
        node: {
            type: Object,
            default: {},
        },
        list: Array,
        // 节点角标
        nodeIndex: {
            type: Number,
            default: 0,
        },
        // 配置
        option: {
            type: Object,
            default: {
                column: [],
                manageSwitch: true,
            },
        },
        checkList: Array,
        checkShow: {
            type: Boolean,
            default: false,
        },
        randomNum: Number,
        zIndex: {
            type: Number,
            default: 10075,
        },
    },
    data() {
        return {
            collapsed: false,
        };
    },
    methods: {
        setLazyLoad(func) {
            this.option.lazyLoad = func;
        },
        onActionClick({ index }, i, list) {
            uni.$emit(`action${this.randomNum}`, { index }, i, list);
        },
        onChecked(e, id) {
            uni.$emit(`checked${this.randomNum}`, e, id);
        },
        onToggle(item, index) {
            if (item.hasChildren && this.collapsed == false) {
                if (!item.children || item.children.length == 0) {
                    // #ifdef MP
                    uni.showToast({
                        title: '小程序暂不支持懒加载查看下级',
                        icon: 'none',
                    });
                    return;
                    // #endif
                    if (typeof this.option.lazyLoad == 'function') {
                        const cb = (list) => {
                            this.$set(item, 'children', list);
                            this.collapsed = true;
                        };
                        this.option.lazyLoad(item, index, cb);
                    }
                } else this.collapsed = true;
                setTimeout(() => {
                    if (this.node.children)
                        this.node.children.forEach((l, i) => {
                            this.$refs[`crud-item${i}`][0].setLazyLoad(this.option.lazyLoad);
                        });
                }, 100);
            } else {
                this.collapsed = !this.collapsed;
            }
        },
        hide() {
            this.collapsed = false;
        },
    },
};
</script>

<style scoped lang="scss">
.flex {
    display: flex;
    justify-content: space-between;
}

.flex-c {
    align-items: center;
}

.flex-one {
    flex: 1;
}

.form-head {
    padding: 36rpx 30rpx;
    border-bottom: 2rpx dashed #efefef;
}

.crud {
    background: #fff;
    padding: 26rpx;
    border-radius: 8rpx;

    .crud-row + .crud-row {
        margin-top: 14rpx;
    }

    &-child {
        color: #f78431;
        font-size: 30rpx;
        text-align: center;
        padding: 20rpx 0;
        border-top: 2rpx dashed #f5f5f5;
    }

    &-row {
        &-label {
            color: #999;
            font-size: 28rpx;
            margin-right: 6rpx;
        }

        &-value {
            flex: 1;
            color: #565656;
            font-size: 28rpx;
            word-break: break-all;
            word-wrap: break-word;
            white-space: pre-wrap;
        }
    }
}
</style>
