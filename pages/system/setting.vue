<template>
	<view class="container">
		<u-navbar v-if="showTitleBar" :is-fixed="false" :border-bottom="false" :is-back="true" back-icon-name="arrow-leftward"
			back-icon-size="35" :background="{ background: '#fff' }" title="设置" title-color="#000">
		</u-navbar>
		<view class="u-demo">
			<view class="u-demo-wrap">
				<view class="u-demo-title">很快到来</view>
			</view>
		</view>
	</view>
</template>

<script>
import { needHideTitleBar } from '@/utils/utils'
	export default {
		data() {
			return {
				data: {
					showTitleBar: true,
				}
			};
		},
		created() {
			this.showTitleBar = !needHideTitleBar();
		}
	}
</script>
