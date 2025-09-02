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
					<u-form-item label="角色名称" prop="roleName" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.roleName" :disabled="readonly" placeholder="角色名称" />
					</u-form-item>
					<u-form-item label="上级角色" prop="parentId" :label-width="option.labelWidth || 160">
						<u-input
							v-model="formLabel.parentName"
							placeholder="上级角色"
							type="select"
							@click="
								() => {
									if (!readonly) $refs.treePicker._show()
								}
							"
						/>
					</u-form-item>
					<u-form-item label="角色别名" prop="roleAlias" required :label-width="option.labelWidth || 160">
						<u-input v-model="form.roleAlias" :disabled="readonly" placeholder="角色别名" />
					</u-form-item>
					<u-form-item label="角色排序" prop="sort" required :label-width="option.labelWidth || 160">
						<u-input v-model="form.sort" :disabled="readonly" type="number" placeholder="角色排序" />
					</u-form-item>
				</template>
				<template #loadmore>
					<u-loadmore :status="loadStatus" @loadmore="getList()" />
				</template>
			</rider-curd>
		</view>
		<!-- 上级角色tree -->
		<rider-tree
			ref="treePicker"
			:range="roleTreeList"
			@cancel="$refs.treePicker._hide()"
			@confirm="onTreeConfirm"
			idKey="id"
			nameKey="title"
			:multiple="false"
			:cascade="false"
			:foldAll="false"
			confirmColor="#4E7FF9"
			cancelColor="#757575"
			title="上级角色"
			titleColor="#757575"
		></rider-tree>
		<!-- 菜单权限 -->
		<rider-tree
			ref="menuPicker"
			:range="menuTreeList"
			@cancel="$refs.menuPicker._hide()"
			@confirm="onMenuConfirm"
			idKey="id"
			nameKey="title"
			:multiple="true"
			:cascade="true"
			:foldAll="true"
			confirmColor="#4E7FF9"
			cancelColor="#757575"
			title="菜单权限"
			titleColor="#757575"
		></rider-tree>
	</view>
</template>

<script>
import riderCurd from '@/components/rider-crud/index'
import riderTree from '@/components/rider-crud/components/tree-picker'
import { getList, add, update, remove, roleTree, menuTree, menuTreeKey, grant } from '@/api/system/role.js'
import { tenantSelect } from '@/api/system/tenant.js'
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
				size: 10
			},
			readonly: false, // 查看时控制表单只读
			loadStatus: 'loadmore', // 列表加载状态
			option: {
				navTitle: '角色管理', //标题
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '角色名称',
						prop: 'roleName'
					},
					{
						label: '所属租户',
						prop: 'tenantName'
					},
					{
						label: '角色别名',
						prop: 'roleAlias'
					},
					{
						label: '角色排序',
						prop: 'sort'
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
						name: '菜单权限',
						icon: 'setting',
						color: '#333',
						fontsize: 30,
						width: 40,
						background: '#fff'
					}
				]
			},
			rules: {
				roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
				roleAlias: [{ required: true, message: '请输入角色别名', trigger: 'blur' }],
				sort: [{ required: true, message: '请输入角色排序', trigger: 'blur', type: 'number' }]
			},
			tenantList: [],
			roleTreeList: [],
			menuTreeList: [],
			menuCheckIds: [],
			roleIds: null
		}
	},

	onReady() {
		this.getTenant().then(() => {
			this.getList(true)
		})
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
					if (override) {
						this.list = records
					} else {
						this.list = this.list.concat(records)
					}
					if (this.list && this.list.length > 0) {
						this.list = this.filterList(this.list)
					}
					this.params.current++
					uni.stopPullDownRefresh()
				})
				.catch(err => {
					uni.stopPullDownRefresh()
				})
		},
		filterList(list) {
			if (!list || list.length == 0) return list
			list.forEach(e => {
				e.tenantName = getDicLabel(e.tenantId, this.tenantList, { label: 'tenantName', value: 'tenantId' })
				if (e.children) this.filterList(e.children)
			})
			return list
		},
		// 租户类型
		getTenant() {
			return new Promise(resolve => {
				roleTree().then(res => {
					this.roleTreeList = res.data
				})
				tenantSelect().then(res => {
					this.tenantList = res.data
					resolve()
				})
			})
		},
		// 获取菜单权限内容
		getMenu(roleIds) {
			menuTreeKey({ roleIds }).then(res => {
				this.menuCheckIds = res.data.menu
			})
			menuTree().then(res => {
				this.recursion(this.menuCheckIds, res.data.menu)
				this.menuTreeList = res.data.menu
				setTimeout(() => {
					this.$refs.menuPicker._show()
				}, 10)
			})
		},
		// 递归
		recursion(arr, menu) {
			menu.forEach(e => {
				if (arr.includes(e.id)) e.checked = true
				if (e.hasChildren || (e.children && e.children.length > 0)) {
					this.recursion(arr, e.children)
				}
			})
		},
		// 菜单权限勾选回调
		onMenuConfirm(e) {
			let arr = []
			e.forEach(e => {
				arr.push(e.id)
			})
			const params = {
				apiScopeIds: [],
				dataScopeIds: [],
				roleIds: [this.roleIds],
				menuIds: arr
			}
			grant(params).then(res => {
				uni.showToast({
					icon: 'none',
					title: '操作成功'
				})
			})
		},
		//机构选择回调
		onTreeConfirm(e) {
			this.$set(this.form, 'parentId', e[0].id)
			this.$set(this.formLabel, 'parentName', e[0].name)
		},
		// 搜索 (自行配置搜索内容)
		onSearch(val) {
			this.params = {
				current: 1,
				size: 10,
				roleName: val
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
					this.$set(this.formLabel, 'parentName', data.parentName)
					done()
					break
				case '菜单权限':
					this.roleIds = data.id
					this.getMenu(data.id)
					break
			}
			if (['删除', '编辑'].includes(name)) this.$refs['crud'].hideChildren()
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
						// this.category = ''
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
						// this.category = ''
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
