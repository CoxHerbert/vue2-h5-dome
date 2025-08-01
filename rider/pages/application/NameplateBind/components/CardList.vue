<template>
	<view>
		<u-card :border="false" :show-head="false" :head-border-bottom="false" margin="30rpx 20rpx 20rpx">
			<!-- 新增删除图标 -->

			<view slot="body">
				<view class="status-logo">
					<img src="../../../../static/logoic.png" style="width: 10%;margin-right: 5px;" alt="" />
					<text class="sleft">Name: {{ list.materialName }}</text>
				</view>
				<view class="status-row">
					<view class="">
						<view class="cell">
							<text class="label">P.Code: </text>
							<text class="value"> {{ list.materialNum }}</text>
						</view>
						<view class="cell">
							<text class="label">SN:</text>
							<text class="value">{{ list.code }}</text>
						</view>
						<view class="cell">
							<text class="label">铭牌:</text>
							<text class="value" style="color: green;"
								v-if="list.bindCustomerNameplate">{{ list.bindCustomerNameplate }}</text>
							<text class="value" style="color: #e58;" v-else>当前铭牌不存在</text>
						</view>
						<view class="cell">
							<text class="label">专案号</text>
							<text class="value">{{ list.mtoNo }}</text>
						</view>
					</view>
					<view class="">
						<uqrcode ref="uqrcode" canvas-id="qrcode" :value="list.code" size='100' :options="options"></uqrcode>
					</view>
				</view>


				<u-line class="u-line" direction="col"></u-line>
			</view>
		</u-card>
	</view>
</template>

<script>
	import useCache from '@/components/dc/utils/cache.js';
	import {
		userList
	} from '@/api/application';
	// import UQRCode from 'uqrcodejs';
	export default {
		name: 'wf-card',
		props: {
			list: {
				type: Object,
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
				options: {
					margin: 10,
					
				}
			};
		},


		async created() {
			// const data = await useCache([{ key: 'DC_WMS_IN_TYPE' }, { key: 'DC_WMS_IN_STATUS' }]);
			// this.useCacheData = data;
		},
		mounted() {

		},
		methods: {

		},
	};
</script>

<style lang="scss" scoped>
	.status-logo{
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding-bottom: 32rpx;
		border-bottom: 1rpx solid #f7eee8;
		margin-bottom: 24rpx;
		font-weight: bold;
		
		.sleft {
			font-size: 30rpx;
			color: #333333;
		}
	}
	.name {
		font-weight: 600;
		font-size: 30rpx;
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
		padding-bottom: 32rpx;
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

	.cell+.cell {
		margin-top: 24rpx;
	}

	.cell {
		display: flex;
		align-items: center;
		font-size: 28rpx;

		.label {
			color: #666666;
			width: 150rpx;
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