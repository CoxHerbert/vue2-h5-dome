<template>
	<view class="container">
		<view class="safe-area-inset-bottom">
			<rider-curd
				v-model="form"
				:option="option"
				:data="list"
				:rules="rules"
				:readonly.sync="readonly"
				@search="onSearch"
				@action-click="onActionClick"
				@submit="onSubmit"
				@del="onRemove"
				ref="crud"
			>
				<view slot="form">
					<u-form-item label="通知标题" prop="title" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.title" :disabled="readonly" placeholder="通知标题" />
					</u-form-item>
					<u-form-item label="通知类型" prop="category" :label-width="option.labelWidth || 160" required>
						<u-input
							v-model="formLabel.category"
							:disabled="readonly"
							placeholder="通知类型"
							type="select"
							@click="
								() => {
									if (!readonly) categoryShow = true
								}
							"
						/>
					</u-form-item>
					<u-form-item label="通知日期" prop="releaseTime" :label-width="option.labelWidth || 160" required>
						<u-input
							v-model="form.releaseTime"
							:disabled="readonly"
							placeholder="通知日期"
							type="select"
							@click="
								() => {
									if (!readonly) timeShow = true
								}
							"
						/>
					</u-form-item>
					<u-form-item label="通知内容" :label-width="option.labelWidth || 160" :border-bottom="false">
						<template #right v-if="!readonly">
							<u-button
								@click="onRichEdit(form.content)"
								ripple
								:custom-style="{ background: '#FFF6E9', color: '#FAA646' }"
								size="mini"
							>
								去编辑
							</u-button>
						</template>
					</u-form-item>
					<mp-html :content="form.content"></mp-html>
				</view>
				<template #loadmore>
					<u-loadmore :status="loadStatus" @loadmore="getList()" />
				</template>
			</rider-curd>
		</view>
		<!-- 通知类型 -->
		<u-select
			v-model="categoryShow"
			:list="categoryList"
			value-name="dictKey"
			label-name="dictValue"
			@confirm="e => onConfirm(e, 'category')"
			safe-area-inset-bottom
		></u-select>
		<!-- 通知日期 -->
		<u-picker
			mode="time"
			v-model="timeShow"
			:params="timeParams"
			start-year="2000"
			end-year="2050"
			@confirm="e => onConfirm(e, 'releaseTime')"
			safe-area-inset-bottom
		></u-picker>
	</view>
</template>

<script>
import riderCurd from '@/components/rider-crud/index'
import mpHtml from '@/components/rider-crud/components/mp-html/mp-html'
import { getList, add, update, remove } from '@/api/notice.js'
import { dictionary } from '@/api/system/dict.js'
import { logo } from '../../common/setting'
import { getDicLabel } from '@/components/rider-crud/util/tool.js'
export default {
	components: { riderCurd, mpHtml },
	data() {
		return {
			loadStatus: 'loadmore', // 列表加载状态
			checkedSwitch: false, // 默认打开管理
			form: { content: '' }, // 表单
			formLabel: {}, // 表单label
			list: [], // 列表数据
			params: {
				// 分页
				current: 1,
				size: 10
			},
			readonly: false, // 查看时控制表单只读
			option: {
				// 组件选项
				navTitle: '通知公告', //标题
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '通知标题',
						prop: 'title'
					},
					{
						label: '通知类型',
						prop: 'categoryName'
					},
					{
						label: '通知日期',
						prop: 'releaseTime'
					}
				],
				actions: [
					// 左滑操作按钮
					{
						name: '编辑', // 操作名称
						icon: 'edit-pen', //操作图标，有图标文字不显示
						color: '#333', // 字体颜色
						fontsize: 30, //字体大小，单位rpx
						width: 40, // 宽度，单位px
						background: '#fff' // 菜单按钮背景色
					},
					{
						name: '删除',
						icon: 'trash',
						color: '#333',
						fontsize: 30,
						width: 40,
						background: '#fff'
					}
				]
			},
			rules: {
				// 表单校验规则
				title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
				category: [{ required: true, message: '请选择通知类型', trigger: 'change', type: 'number' }],
				releaseTime: [{ required: true, message: '请选择通知日期', trigger: 'change' }]
			},
			timeShow: false,
			timeParams: {
				year: true,
				month: true,
				day: true,
				hour: true,
				minute: true,
				second: true
			},
			categoryShow: false,
			categoryList: [] //类型
		}
	},
	onShow() {
		let that = this
		uni.$on('richBack', function(data) {
			that.$set(that.form, 'content', data)
		})
	},
	onReady() {
		this.getList(true)
		this.getCategoryList()
	},
	onPullDownRefresh() {
		this.getList(true)
	},
	onReachBottom() {
		if (this.loadStatus == 'nomore') return
		this.getList()
	},
	methods: {
		// 获取列表
		getList(override = false) {
			if (override) {
				this.params.current = 1
			}
			const { size } = this.params
			getList(this.params)
				.then(res => {
					const { records, current } = res.data
					if (records.length < size) this.loadStatus = 'nomore'
					else this.loadStatus = 'loadmore'
					if (override) {
						this.list = records
					} else {
						this.list = this.list.concat(records)
					}
					this.params.current++

					uni.stopPullDownRefresh()
				})
				.catch(err => {
					uni.stopPullDownRefresh()
				})
		},
		// 通知类型
		getCategoryList() {
			dictionary({ code: 'notice' }).then(res => {
				this.categoryList = res.data
			})
		},
		// 类型回调
		onConfirm(e, type) {
			if (type == 'category') {
				this.formLabel[type] = e[0].label
				this.form.category = Number(e[0].value)
			} else {
				this.$set(this.form, 'releaseTime', e.year + '-' + e.month + '-' + e.day + ' ' + e.hour + ':' + e.minute + ':' + e.second)
			}
		},
		// 编辑富文本
		onRichEdit(e) {
			uni.navigateTo({
				url: `/pages/rich/index?data=${e}`
			})
		},

		// 搜索 (自行配置搜索内容)
		onSearch(val) {
			this.params = {
				current: 1,
				size: 10,
				title: val
			}
			this.getList(true)
		},
		// 左滑按钮点击
		onActionClick({ index, data, action, done }) {
			const { name } = action
			switch (name) {
				case '新增':
					this.formLabel = {}
					this.form = { content: '' }
					done()
					break
				case '删除':
					this.onRemove(data.id)
					break
				case '查看':
					this.readonly = true
				case '编辑':
					this.formLabel.category = getDicLabel(data.category, this.categoryList)
					done()
					break
			}
		},
		// 删除
		onRemove(id) {
			uni.showModal({
				title: '确定要删除吗？',
				success: action => {
					if (action.confirm) {
						remove(id).then(() => {
							uni.showToast({
								title: '删除成功',
								icon: 'none'
							})
							setTimeout(() => {
								this.$refs['crud'].allCheckHide(false)
							}, 100)
							// #ifdef APP
							this.getList(true)
							// #endif
							// #ifndef APP
							uni.startPullDownRefresh({})
							// #endif
						})
					}
				}
			})
		},
		// 表单提交
		onSubmit(form, action, unloading, done) {
			if (action == '新增') {
				add(form)
					.then(res => {
						uni.showToast({
							title: '新增成功',
							icon: 'none'
						})
						this.formLabel = {}
						done()
						uni.startPullDownRefresh({})
					})
					.catch(() => {
						unloading()
					})
			} else if (action == '编辑') {
				update(form)
					.then(res => {
						uni.showToast({
							title: '编辑成功',
							icon: 'none'
						})
						this.formLabel = {}
						done()
						uni.startPullDownRefresh({})
					})
					.catch(() => {
						unloading()
					})
			}
		}
	}
}
</script>
<style>
page {
	background: #f6f6f6;
}
</style>
