<template>
	<view class="container">
		<dc-drag-button @click="doAction('scanCode')" :bottom="400">
			<u-icon size="34" name="scan"></u-icon></dc-drag-button>
		<view class="contWarp">
			<view v-if="Object.keys(productList).length !== 0">
				<CardList :list="productList"></CardList>
			</view>

			<wf-empty v-else text="暂无数据"></wf-empty>
		</view>
		<view class="foot">
			<!-- <view class="pass" @click.stop="sumbitData()">提交</view> -->
			<u-button size="default"  class="pass" type="primary" :disabled="disable" v-if="!btnState" @click.stop="sumbitData()">绑定</u-button>
			<u-button size="default"  class="pass" type="primary" v-else @click.stop="sumbitData()">解绑</u-button>
		</view>

		<dc-scan-code ref="scanCodeRef" @confirm="handleScanCode" v-if="show" />
		<!-- 右侧弹框 -->
	</view>
</template>

<script>
	import useCache from '@/components/dc/utils/cache.js';
	import cacheData from '@/components/dc/constant/cacheData';
	import CardList from './components/CardList.vue';

	import Api from '@/api';
	export default {
		components: {
			CardList,
		},
		data() {
			return {
				show: false,
				productList: {},
				snCode: '',
				disable:true,
				step: 0,
				cacheData: cacheData,
				useCacheData: {},
				btnState:false
			};
		},
		async created() {},

		methods: {
			indeCode() {
				Api.qms.sn.SnRecordCode(this.snCode).then((res) => {
					console.log(res)
					const {
						code,
						data
					} = res;
					this.stepFunc(data)
				});
			},


			stepFunc(data) {
				if (this.step == 0) {
					if (data === null || data === undefined ) {
						uni.showToast({
							title: '请先扫SN码',
							icon: 'success',
							duration: 2000,
							mask: true,
						});
					} else if (data.code && data.bindCustomerNameplate) {
						this.productList = data
						this.btnState = true
					} else if (data.code) {
						this.step = 1
						this.productList = data
						this.btnState = false
					}
				} else {
					this.productList.bindCustomerNameplate = this.snCode
					this.btnState=false
					this.disable = false
					
				}
			},
			scanCode() {
				this.show = true;
				this.$nextTick(() => {
					this.$refs.scanCodeRef
						.open()
						.then((val) => {
							if (!val) return;
							console.log(val)
							this.snCode = val;
							this.indeCode();
							this.show = false;
						})
						.catch((err) => {
							this.show = false;
						});
				});
			},
			handleScanCode(snCode) {
				if (!snCode) return;
				this.snCode = snCode;
				this.indeCode();
			},

			doAction(type) {
				if (type == 'scanCode') {
					this.scanCode();
				}
			},
			sumbitSureData() {
				// console.log(this.productList)
				// return
				uni.showLoading({
				    title: '提交中...',
				    mask: true,
				});
				if(this.btnState){
					this.productList.bindCustomerNameplate = null
				}else{
					this.productList.bindCustomerNameplate =  this.productList.bindCustomerNameplate.replace(/\n/g, '')
				}
				// console.log(this.productList)
				// return
				Api.qms.sn.SnRecordsubmit(this.productList).then((res) => {
					const {
						code,
						data
					} = res;
					if (code == 200) {
						// this.disable=true
						// this.step = 0
						// this.productList ={}
						// uni.hideLoading();
						uni.showToast({
							title: '操作成功',
							icon: 'success', // 可选 'success'、'loading'、'none'
							duration: 2000, // 提示持续时间，单位毫秒
							mask: true, // 是否显示透明蒙层，防止触摸穿透
						});
						this.btnState=false
						this.disable=true
						this.step = 0
						this.productList ={}
						uni.hideLoading();
					}
				});
			},
			sumbitData() {
				
				uni.showModal({
					title: '提示',
					content: '确认要执行此操作吗？',
					confirmText: '确认',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确认');
							this.sumbitSureData();
							// 执行确认后的逻辑
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					},
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	page {
		background: #f6f6f6;
	}

	.container {
		padding-top: 20rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #d2dff7 0%, rgba(255, 255, 255, 0) 100%) !important;

		::v-deep.u-content {
			border-radius: 24rpx !important;
			height: 72rpx !important;
		}

		.add-btn {
			font-size: 30rpx;
			color: #666666;
			margin-right: 24rpx;
			display: flex;
			align-items: center;
		}
	}

	.base-wrapper1 {

		// padding: 0rpx 26rpx;
		// box-sizing: border-box;
		.baseinfo {
			padding: 0rpx 24rpx;
			box-sizing: border-box;
			// border-radius: 20rpx;
			background-color: #fff;
			position: relative;

			.edite-btn {
				color: #fff;
				font-weight: 500;
				font-size: 28rpx;
				padding: 0px 26rpx;
				height: 48rpx;
				line-height: 48rpx;
				background: #f78431;
				border-radius: 24rpx 24rpx 24rpx 24rpx;
				text-align: center;
				position: absolute;
				bottom: 22rpx;
				right: 18rpx;
			}
		}
	}

	.base-wrapper {
		padding: 0rpx 26rpx;
		box-sizing: border-box;

		.baseinfo {
			padding: 32rpx 24rpx;
			box-sizing: border-box;
			border-radius: 20rpx;
			background-color: #fff;
			position: relative;

			.edite-btn {
				color: #fff;
				font-weight: 500;
				font-size: 28rpx;
				padding: 0px 26rpx;
				height: 48rpx;
				line-height: 48rpx;
				background: #f78431;
				border-radius: 24rpx 24rpx 24rpx 24rpx;
				text-align: center;
				position: absolute;
				bottom: 22rpx;
				right: 18rpx;
			}
		}
	}

	.input-right {
		display: flex;
		align-items: center;

		.label {
			margin-right: 10rpx;
			font-size: 28rpx;
		}
	}

	.foot {
		font-size: 34rpx;
		display: flex;
		justify-content: space-evenly;
		position: fixed;
		bottom: 0px;
		width: 100%;
		text-align: center;
		align-items: center;
		background-color: #fff;
		padding: 24rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);

		.pass {
			border-radius: 8rpx;
			color: #f40;
			flex: 1;
			width: 288rpx;
			height: 80rpx;
			line-height: 80rpx;
			background: #007aff;
			color: #fff;
		}
	}
</style>