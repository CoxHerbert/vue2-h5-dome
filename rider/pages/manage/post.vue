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
				<template #form>
					<u-form-item label="岗位类型" prop="category" :label-width="option.labelWidth || 160" required>
						<u-input
							v-model="formLabel.category"
							placeholder="角色名称"
							type="select"
							@click="
								() => {
									if (!readonly) categoryShow = true
								}
							"
						/>
					</u-form-item>
					<u-form-item label="岗位编号" prop="postCode" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.postCode" :disabled="readonly" placeholder="岗位编号" />
					</u-form-item>
					<u-form-item label="岗位名称" prop="postName" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.postName" :disabled="readonly" placeholder="岗位名称" />
					</u-form-item>
					<u-form-item label="岗位排序" prop="sort" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.sort" :disabled="readonly" type="number" placeholder="岗位排序" />
					</u-form-item>
					<u-form-item label="岗位描述" prop="remark" :label-width="option.labelWidth || 160">
						<u-input
							v-model="form.remark"
							:disabled="readonly"
							type="textarea"
							:maxlength="-1"
							:height="35"
							placeholder="岗位描述"
						/>
					</u-form-item>
				</template>
				<template #loadmore>
					<u-loadmore :status="loadStatus" @loadmore="getList()" />
				</template>
			</rider-curd>
		</view>
		<u-select
			v-model="categoryShow"
			:list="categoryList"
			value-name="dictKey"
			label-name="dictValue"
			@confirm="onConfirm"
			safe-area-inset-bottom
		></u-select>
	</view>
</template>

<script>
import riderCurd from '@/components/rider-crud/index'
import { getList, add, update, remove } from '@/api/system/post.js'
import { tenantSelect } from '@/api/system/tenant.js'
import { dictionary } from '@/api/system/dict.js'
import { getDicLabel } from '@/components/rider-crud/util/tool.js'
export default {
	components: { riderCurd },
	data() {
		return {
			checkedSwitch: false,
			form: {},
			formLabel: {},
			list: [],
			params: {
				current: 1,
				size: 10
			},
			readonly: false, // 查看时控制表单只读
			loadStatus: 'loadmore', // 列表加载状态
			option: {
				navTitle: '岗位管理', //标题
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '岗位名称',
						prop: 'postName'
					},
					{
						label: '岗位编号',
						prop: 'postCode'
					},
					{
						label: '所属租户',
						prop: 'tenantName'
					},
					{
						label: '岗位类型',
						prop: 'categoryName'
					},
					{
						label: '岗位排序',
						prop: 'sort'
					},
					{
						label: '岗位描述',
						prop: 'remark'
					}
				],
				actions: [
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
				category: [{ required: true, message: '请选择岗位类型', trigger: 'change', type: 'number' }],
				postCode: [{ required: true, message: '请输入岗位编号', trigger: 'blur' }],
				postName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
				sort: [{ required: true, message: '请输入岗位排序', trigger: 'blur', type: 'number' }]
			},
			categoryShow: false,
			categoryList: [],
			category: '',
			tenantList: []
		}
	},

	onReady() {
		this.getTenant().then(() => {
			this.getList(true)
		})
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

					if (this.list && this.list.length > 0) {
						this.list.map(e => {
							e.tenantName = getDicLabel(e.tenantId, this.tenantList, { label: 'tenantName', value: 'tenantId' })
						})
					}
					this.params.current++
					uni.stopPullDownRefresh()
				})
				.catch(err => {
					uni.stopPullDownRefresh()
				})
		},
		// 获取类型
		getCategoryList() {
			dictionary({ code: 'post_category' }).then(res => {
				this.categoryList = res.data
			})
		},
		// 租户类型
		getTenant() {
			return new Promise(resolve => {
				tenantSelect().then(res => {
					this.tenantList = res.data
					resolve()
				})
			})
		},
		// 类型回调
		onConfirm(e) {
			this.$set(this.form, 'category', Number(e[0].value))
			this.$set(this.formLabel, 'category', e[0].label)
		},
		// 搜索 (自行配置搜索内容)
		onSearch(val) {
			this.params = {
				current: 1,
				size: 10,
				postName: val
			}
			this.getList(true)
		},
		// 左滑按钮点击
		onActionClick({ index, data, action, done }) {
			const { name } = action
			console.log(name, index)
			switch (name) {
				case '新增':
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
<style lang="scss" scoped>
.nav-right {
	color: #fff;
	font-size: 28rpx;
	font-weight: normal;
	padding-right: 24rpx;
}
</style>
