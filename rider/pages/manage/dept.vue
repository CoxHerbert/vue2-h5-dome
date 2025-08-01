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
				@child="onChildren"
				@action-click="onActionClick"
				@submit="onSubmit"
				@del="onRemove"
				ref="crud"
			>
				<template #form>
					<u-form-item label="机构名称" prop="deptName" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.deptName" :disabled="readonly" placeholder="机构名称" />
					</u-form-item>
					<u-form-item label="机构全称" prop="fullName" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.fullName" :disabled="readonly" placeholder="机构全称" />
					</u-form-item>
					<u-form-item label="上级机构" prop="parentId" :label-width="option.labelWidth || 160" required>
						<u-input
							v-if="!isAddChild"
							v-model="formLabel.parentName"
							placeholder="机构全称"
							type="select"
							@click="
								() => {
									if (!readonly) $refs.treePicker._show()
								}
							"
						/>
						<u-input v-else v-model="formLabel.parentName" placeholder="机构全称" disabled />
					</u-form-item>
					<u-form-item label="机构类型" prop="deptCategory" :label-width="option.labelWidth || 160" required>
						<u-input
							v-model="formLabel.category"
							placeholder="机构类型"
							type="select"
							@click="
								() => {
									if (!readonly) categoryShow = true
								}
							"
						/>
					</u-form-item>
					<u-form-item label="排序" prop="sort" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.sort" :disabled="readonly" type="number" placeholder="排序" />
					</u-form-item>
					<u-form-item label="描述" :label-width="option.labelWidth || 160" prop="remark">
						<u-input v-model="form.remark" :disabled="readonly" type="textarea" :maxlength="-1" :height="35" placeholder="描述" />
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
		<!-- 上级机构tree -->
		<rider-tree
			ref="treePicker"
			:range="deptTreeList"
			idKey="id"
			nameKey="title"
			:multiple="false"
			:cascade="false"
			:foldAll="false"
			confirmColor="#4E7FF9"
			cancelColor="#757575"
			title="上级机构"
			titleColor="#757575"
			@cancel="$refs.treePicker._hide()"
			@confirm="onTreeConfirm"
		></rider-tree>
	</view>
</template>

<script>
import riderCurd from '@/components/rider-crud/index'
import riderTree from '@/components/rider-crud/components/tree-picker'
import { getList, add, update, remove, deptTree } from '@/api/system/dept.js'
import { tenantSelect } from '@/api/system/tenant.js'
import { dictionary } from '@/api/system/dict.js'
import { getDicLabel } from '@/components/rider-crud/util/tool.js'
export default {
	components: { riderCurd, riderTree },
	data() {
		return {
			checkedSwitch: false,
			form: {},
			formLabel: {},
			list: [],
			params: {
				current: 1,
				size: 10,
				parentId: 0
			},
			loadStatus: 'loadmore', // 列表加载状态
			readonly: false, // 查看时控制表单只读
			option: {
				navTitle: '部门管理1', //标题
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '机构名称',
						prop: 'deptName'
					},
					{
						label: '所属租户',
						prop: 'tenantName'
					},
					{
						label: '机构全称',
						prop: 'fullName'
					},
					{
						label: '机构类型',
						prop: 'deptCategoryName'
					},
					{
						label: '排序',
						prop: 'sort'
					},
					{
						label: '描述',
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
					},
					{
						name: '新增子项',
						icon: 'plus',
						color: '#333',
						fontsize: 30,
						width: 40,
						background: '#fff'
					}
				]
			},
			rules: {
				deptCategory: [{ required: true, message: '请选择机构类型', trigger: 'change', type: 'number' }],
				deptName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
				fullName: [{ required: true, message: '请输入机构全称', trigger: 'blur' }],
				sort: [{ required: true, message: '请输入排序', trigger: 'blur', type: 'number' }]
			},
			categoryShow: false,
			categoryList: [],
			tenantList: [],
			deptTreeList: [],
			isAddChild: false
		}
	},

	onReady() {
		this.getList(true)
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
					const records = res.data
					if (records.length < size) this.loadStatus = 'nomore'
					else this.loadStatus = 'loadmore'
					if (override) this.list = records
					else this.list = this.list.concat(records)
					if (this.list && this.list.length > 0) {
						this.list.map(e => {
							e.tenantName = getDicLabel(e.tenantId, this.tenantList, { label: 'tenantName', value: 'tenantId' })
							e.children = []
						})
						this.$refs.crud.setLazyLoad((item, index, cb) => {
							getList({ parentId: item.id }).then(res => {
								res.data.map(e => {
									e.tenantName = getDicLabel(e.tenantId, this.tenantList, { label: 'tenantName', value: 'tenantId' })
								})
								cb(res.data)
							})
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
			dictionary({ code: 'org_category' }).then(res => {
				this.categoryList = res.data
			})
		},

		// 租户类型
		getTenant() {
			return new Promise(resolve => {
				deptTree().then(res => {
					this.deptTreeList = res.data
				})
				tenantSelect().then(res => {
					this.tenantList = res.data
					resolve()
				})
			})
		},
		// 类型回调
		onConfirm(e) {
			this.$set(this.formLabel, 'category', e[0].label)
			this.$set(this.form, 'deptCategory', Number(e[0].value))
		},
		//上级机构选择回调
		onTreeConfirm(e) {
			this.$set(this.form, 'parentId', e[0].id)
			this.$set(this.formLabel, 'parentName', e[0].name)
		},
		// 搜索 (自行配置搜索内容)
		onSearch(val) {
			this.params = {
				current: 1,
				size: 10,
				deptName: val
			}
			this.getList(true)
		},
		// 左滑按钮点击
		onActionClick({ index, data, action, done }) {
			const { name } = action
			switch (name) {
				case '新增':
					this.form = {}
					this.formLabel = {}
					this.isAddChild = false
					done()
					break
				case '删除':
					this.onRemove(data.id)
					break
				case '查看':
					this.readonly = true
				case '编辑':
					this.isAddChild = false
					this.formLabel = {
						category: getDicLabel(data.deptCategory, this.categoryList),
						parentName: getDicLabel(data.parentId, this.deptTreeList, { label: 'title', value: 'id' })
					}
					done()
					break
				case '新增子项':
					this.isAddChild = true
					this.form = {}
					this.formLabel = {
						parentName: getDicLabel(data.id, this.deptTreeList, { label: 'title', value: 'id' })
					}
					this.$set(this.form, 'parentId', data.id)
					done()
					break
			}
			if (['删除', '编辑', '新增子项'].includes(name)) this.$refs['crud'].hideChildren()
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
			if (action == '新增' || action == '新增子项') {
				add(form)
					.then(res => {
						uni.showToast({
							title: '新增成功',
							icon: 'none'
						})
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
