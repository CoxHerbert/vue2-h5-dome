<template>
	<view class="container">
		<u-navbar :is-fixed="false" :border-bottom="false" :is-back="false" back-icon-name="arrow-leftward" title="登录"
			:background="{ background: '#D2DFF7' }" title-color="#000000">
		</u-navbar>

		<view class="content">
			<view class="top">
				<view class="logoWarp">
					<image src="/static/images/logo1.png" class="logo" mode="widthFix"></image>
					<view class="">
						同心合力 助力生产
					</view>
				</view>
				<view class="inputLogin">

					<u-form  ref="uForm" >
						<view class="inputSty" >
							<u-form-item prop="username" left-icon='account'>
								<u-input v-model="username" @blur="handleInputCheck"  placeholder="请输入账号" />
							</u-form-item>
						</view>
						<view class="inputSty" >
						<u-form-item prop="password" left-icon="lock">
							<u-input v-model="password" type="password" @blur="handleInputCheck" placeholder="请输入密码"/>
						</u-form-item>
						</view>
					</u-form>

				</view>
				<!-- <view class="cell">
					<view class="name">账号</view>
					<view class="input-box">
						<input type="text" v-model="username" placeholder="请输入账号" class="ipt" placeholder-class="hold"
							@blur="handleInputCheck" />
					</view>
				</view>
				<view class="cell">
					<view class="name">密码</view>
					<view class="input-box">
						<input type="password" v-model="password" placeholder="请输入密码" class="ipt"
							placeholder-class="hold" @blur="handleInputCheck" />
					</view>
				</view> -->
				<!-- <view class="agree">
					登录即代表同意
					<text class="a">《用户协议》</text>
					和
					<text class="a">《隐私政策》</text>
				</view> -->
				<button class="submit" @click="submit" :disabled="disabled">登录</button>
				<!-- <view class="tip">未注册用户验证后将自动注册并登录</view> -->
				<!-- <navigator url="/pages/login/login-phone" hover-class="none" class="change">手机登录 ></navigator> -->
			</view>
		</view>
		<!--  -->
	</view>
</template>

<script>
	import {
		sm2
	} from 'sm-crypto';
	import {
		publicKey
	} from '@/common/setting';
	import {
		mapMutations
	} from 'vuex';
	import store from '@/store/';
	export default {
		onLoad(option) {
			const {
				redirect
			} = option;
			if (redirect) this.redirect = redirect;
		},
		data() {
			return {
				tenantId: '000000',
				username: '',
				password: '',
				disabled: false,
				redirect: '',
				// form: {
				// 	name: '',
				// 	intro: ''
				// },
			
			};
		},
		methods: {
			...mapMutations(['LOGIN_USERINFO', 'LOGIN_TOKEN', 'LOGIN_INFO']),
			submit() {
				this.$u.api
					.token(this.tenantId, this.username, sm2.doEncrypt(this.password, publicKey, 0))
					.then((data) => {
						store.dispatch('getUserInfo');
						this.LOGIN_INFO(data);
						this.LOGIN_TOKEN(data.access_token);
						if (data.user_id == 'null') {
							uni.reLaunch({
								url: '/pages/home/selflogin',
							});
						} else {
							let switchTab = [
								'pages/home/home',
								'pages/plugin/workflow/pages/workbench/index',
								'pages/user/profile',
							];
							if (this.redirect) {
								if (switchTab.includes(this.redirect)) {
									uni.switchTab({
										url: this.redirect,
									});
								} else {
									uni.redirectTo({
										url: this.redirect,
									});
								}
							} else {
								uni.switchTab({
									url: '/pages/home/home',
								});
							}
						}
					})
					.catch((err) => {
						console.log(err);
						this.$u.func.showToast({
							title: '用户名或密码错误'
						});
					});
			},
			handleInputCheck() {
				this.disabled = false;
			},
		},
	};
</script>
<style>
	.inputLogin .u-form-item{
		padding: 5px 0 !important;
	}
</style>
<style lang="scss">
	.inputLogin {
		margin: 50px 45px 0;
	}
	.inputSty{
		background: #fff;margin-bottom: 15px;padding: 0 10px;border-radius: 10px;
	}

	.container {
		min-height: 100vh;
		overflow: hidden;
	}

	.content {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;

		height: 60vh;
		width: 100%;

		.top {
			width: 100%;
		}

		.logoWarp {
			display: flex;
			flex-direction: column;
			align-items: center;
			font-weight: bold;
			font-style: oblique;
			font-size: 24px;
			font-family: Source Han Sans CN;

		}

		.logo {
			display: block;
			width: 70px;
			height: auto;
			margin: 0 auto 14px;

		}

		.cell {
			width: 100%;
			padding: 0 85rpx;
			box-sizing: border-box;
			margin-top: 36rpx;

			.name {
				font-size: 22rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				color: #3e4a59;
				line-height: 30rpx;
				opacity: 0.72;
			}

			.input-box {
				padding: 30rpx 0;
				border-bottom: 2rpx solid #f6f6f6;
				display: flex;
				align-items: center;

				.code {
					font-size: 22rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #0d0d0d;
					line-height: 30rpx;

					text {
						// color: #14b9c8;
						color: #f78431;
					}
				}

				.ipt {
					flex: 1;
					// height: 24rpx;
					font-size: 24rpx;
				}

				.hold {
					font-size: 26rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #3e4a59;
					line-height: 30px;
					opacity: 0.45;
				}
			}
		}

		.agree {
			margin: 27rpx 95rpx 0;
			font-size: 22rpx;
			font-family: Adobe Heiti Std;
			font-weight: normal;
			color: #cacaca;
			line-height: 34rpx;

			.a {
				color: #000000;
			}
		}

		.submit {
			margin:  30px 45px 0;;
			border: none;
			// width: 100%;
			height: 86rpx;
			line-height: 86rpx;
			box-sizing: border-box;
			border-radius: 15rpx;
			background-color: #1D65F3;
			color: #ffffff;

			&::after {
				content: none;
			}

			&::before {
				content: none;
			}

			&[disabled='true'] {
				background: #e4e4e4;
				font-size: 36rpx;
				font-family: Source Han Sans CN;
				font-weight: 500;
				color: #ffffff;
			}
		}

		.tip {
			margin-top: 30rpx;
			text-align: center;
			font-size: 22rpx;
			font-family: Adobe Heiti Std;
			font-weight: normal;
			color: #cacaca;
			line-height: 34rpx;
		}

		.change {
			margin-top: 20rpx;
			text-align: center;
			font-size: 22rpx;
			font-family: Adobe Heiti Std;
			font-weight: normal;
			// color: #14b9c8;
			color: #f78431;
			line-height: 34rpx;
		}
	}
</style>