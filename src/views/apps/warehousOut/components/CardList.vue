<template>
    <view>
        <u-card
            v-for="(item, index) in list"
            :key="index"
            :border="false"
            :show-head="false"
            :head-border-bottom="false"
            margin="30rpx 20rpx 20rpx"
        >
            <!-- 新增删除图标 -->

            <view slot="body">
                <view class="status-row">
                    <text class="sleft">料品名称: {{ item.productName }}</text>
                </view>
                <view class="delete-icon" @click.stop="handleDelete(index)">
                    <u-icon name="close" color="#ff4d4f" size="36rpx"></u-icon>
                </view>
                
				<view class="cardCont">
					<view class="">
						<view class="cell">
						    <text class="label">料品编码: </text>
						    <text class="value"> {{ item.productCode }}</text>
						</view>
						<view class="cell">
						    <text class="label">产品数量:</text>
						    <u-number-box
						        v-model.number="item.productQty"
						        @change="valChange"
						        :min="0"
						        :max="item.maxValue"
						    ></u-number-box>
						</view>
					</view>
					<view class="">
						<view class="cell">
						    <text class="label">专案号:</text>
						    <text class="value">{{ item.mtoNo }}</text>
						</view>
						<view class="cell">
						    <text class="label">单位:</text>
						    <text class="value">{{ item.productUnit }}</text>
						</view>
					</view>
					
				</view>
				<view class="cell" style="margin-top: 7px;">
				     <text class="label">库位ID</text>
				     <text class="value">{{ item.locationId }}</text>
				 </view>
                

               
                
                
              

                <u-line class="u-line" direction="col"></u-line>
            </view>
        </u-card>
    </view>
</template>

<script>
import useCache from '@/components/dc/utils/cache.js';
import { userList } from '@/api/application';
export default {
    name: 'wf-card',
    props: {
        list: {
            type: Array,
        },
        showBtn: {
            default: false,
        },
        type: Number,
    },
    data() {
        return {
            show: false,
            form: {},
            task: {},
            pass: false,
            useCacheData: {},
        };
    },
    // computed: {
    //     listCalculationResult() {
    //         return this.list.map((item) => {
    //             const newItem = { ...item };
    //             this.$set(newItem, 'maxValue', Number(item.productQty));
    //             return newItem;
    //         });
    //     },
    // },
    watch: {
        list: {
            handler(newList) {
                // Convert productQty from string to number
                newList.forEach((item) => {
                    if (typeof item.productQty === 'string') {
                        item.productQty = Number(item.productQty);
                        this.$set(item, 'maxValue', item.productQty);
                        // item.productQty = Number(item.productQty);
                    }
                });
            },
            immediate: true,
            deep: true,
        },
    },
    async created() {
        const data = await useCache([{ key: 'DC_WMS_IN_TYPE' }, { key: 'DC_WMS_IN_STATUS' }]);
        this.useCacheData = data;
    },
    mounted() {
        // this.list.forEach((item) => {
        //     this.set(item, 'maxValue', item.productQty);
        // });
    },
    methods: {
        calculateMaxValue(item) {
            console.log(item);
            // 这里可以添加复杂的计算逻辑
            // 当前示例：使用productQty作为最大值，确保为数字类型
            return Number(item.maxValue);
        },
        // 新增删除方法
        handleDelete(index) {
            // 显示确认弹窗
            uni.showModal({
                title: '提示',
                content: '确定要删除这条记录吗？',
                confirmText: '删除',
                confirmColor: '#ff4d4f',
                success: (res) => {
                    if (res.confirm) {
                        // 复制原数组并删除对应项（避免直接修改props）
                        // 直接在原数组中删除对应项
                        this.list.splice(index, 1);
                        // 通知父组件数据已更新
                        this.$emit('update:list', this.list);
                        // 显示删除成功提示
                        uni.showToast({
                            title: '删除成功',
                            icon: 'none',
                            duration: 1500,
                        });
                    }
                },
            });
        },

        getUserList(id) {
            let that = this;
            userList([id + '']).then((res) => {
                that.detail.processingPersonnel = res.data[0]?.realName || '';
            });
        },
        review(value, list) {
            return list && list.find((item) => item.dictKey == value)?.dictValue;
        },

        goURL(id) {
            uni.navigateTo({
                url: `/pages/application/warehousingentry/detail?id=${id}`,
            });
        },

        // 补充数量变更方法（如果需要）
        valChange(value, index) {
            this.$emit('quantityChange', { index, value });
        },
    },
};
</script>

<style lang="scss" scoped>
.name {
    font-weight: 600;
    font-size: 30rpx;
}
.cardCont{
	display: flex;
	justify-content: space-between;
}

// 新增删除图标样式
.delete-icon {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    z-index: 10;
    padding: 10rpx;
    // 添加点击反馈
    &:active {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 50%;
    }
}

.head {
    margin-bottom: 24rpx;
    .title {
        font-size: 28rpx;
        color: #222;
        font-weight: 600;
        margin: 0 10rpx;
    }
    .avatar {
        width: 66rpx;
        height: 66rpx;
        border-radius: 50%;
    }
    .status-icon {
        width: 74rpx;
        color: #fff;
        &-delay {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            padding-right: 8rpx;
            background-size: 100% 100%;
        }
        &-normal {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            padding-right: 8rpx;
            background-size: 100% 100%;
        }
    }
}

.status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f7eee8;
    margin-bottom: 24rpx;
    font-weight: bold;
    .sleft {
        font-size: 30rpx;
        color: #333333;
    }
    .ysh {
        color: #23c69f !important;
    }
    .dsh {
        color: #1d65f3 !important;
    }
}

.cell + .cell {
    margin-top: 15rpx;
}

.cell {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    .label {
        color: #666666;
        // width: 150rpx;
    }
    .value {
        color: #333333;
        margin-left: 10rpx;
    }
}

.foot {
    font-size: 28rpx;
    display: flex;
    justify-content: space-evenly;
}
</style>
