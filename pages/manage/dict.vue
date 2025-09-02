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
					<u-form-item label="字典编号" prop="code" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.code" :disabled="readonly" placeholder="字典编号" />
					</u-form-item>
					<u-form-item label="字典名称" prop="dictValue" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.dictValue" :disabled="readonly" placeholder="字典名称" />
					</u-form-item>
					<u-form-item label="字典排序" prop="sort" :label-width="option.labelWidth || 160" required>
						<u-input v-model="form.sort" :disabled="readonly" type="number" placeholder="字典排序" />
					</u-form-item>
					<u-form-item label="封存" prop="isSealed" :label-width="option.labelWidth || 160" required>
						<u-radio-group v-model="form.isSealed" :disabled="readonly">
							<u-radio shape="circle" :name="1" active-color="#4E7FF9">是</u-radio>
							<u-radio shape="circle" :name="0" active-color="#4E7FF9">否</u-radio>
						</u-radio-group>
					</u-form-item>
					<u-form-item label="字典备注" :label-width="option.labelWidth || 160" prop="remark">
						<u-input
							v-model="form.remark"
							:disabled="readonly"
							type="textarea"
							:maxlength="-1"
							:height="35"
							placeholder="字典备注"
						/>
					</u-form-item>
				</template>
				<template #loadmore>
					<u-loadmore :status="loadStatus" @loadmore="getList()" />
				</template>
			</rider-curd>
		</view>
		<!-- 字典配置 -->
		<u-popup v-model="configShow" mode="bottom" height="100vh" @close="onConfigClose" :mask-close-able="false">
			<scroll-view scroll-y="true" style="height: 100vh; background: #f5f5f5">
				<rider-curd
					ref="childCrud"
					v-model="childForm"
					:navBack="onConfigClose"
					@search="onChildSearch"
					:option="{ ...configOption, navTitle: `${configName} - 字典配置` }"
					:data="childList"
					:rules="rules"
					:readonly.sync="readonly"
					@action-click="onActionClick"
					@submit="onSubmit"
					@del="onRemove"
				>
					<template #form>
						<u-form-item label="字典编号" prop="code" :label-width="configOption.labelWidth || 160" required>
							<u-input v-model="childForm.code" disabled placeholder="字典编号" />
						</u-form-item>
						<u-form-item label="字典名称" prop="dictValue" :label-width="configOption.labelWidth || 160" required>
							<u-input v-model="childForm.dictValue" :disabled="readonly" placeholder="字典名称" />
						</u-form-item>
						<u-form-item label="上级字典" :label-width="configOption.labelWidth || 160">
							<u-input v-model="parentData.dictValue" disabled placeholder="上级字典" />
						</u-form-item>
						<u-form-item label="字典键值" prop="dictKey" :label-width="configOption.labelWidth || 160" required>
							<u-input v-model="childForm.dictKey" :disabled="readonly" placeholder="字典键值" />
						</u-form-item>
						<u-form-item label="字典排序" prop="sort" :label-width="configOption.labelWidth || 160" required>
							<u-input v-model="childForm.sort" :disabled="readonly" type="number" placeholder="字典排序" />
						</u-form-item>
						<u-form-item label="封存" prop="isSealed" :label-width="configOption.labelWidth || 160" required>
							<u-radio-group v-model="childForm.isSealed" :disabled="readonly">
								<u-radio shape="circle" :name="1" active-color="#4E7FF9">是</u-radio>
								<u-radio shape="circle" :name="0" active-color="#4E7FF9">否</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="字典备注" prop="remark" :label-width="configOption.labelWidth || 160">
							<u-input
								v-model="childForm.remark"
								:disabled="readonly"
								type="textarea"
								:maxlength="-1"
								:height="35"
								placeholder="字典备注"
							/>
						</u-form-item>
					</template>
					<template #loadmore>
						<u-loadmore :status="childLoadStatus" @loadmore="getChild()" />
					</template>
				</rider-curd>
			</scroll-view>
		</u-popup>
	</view>
</template>

<script>
import riderCurd from '@/components/rider-crud/index'
import { parentList, add, update, remove, dictionary, child, dictTree } from '@/api/system/dict.js'
import { getDicLabel } from '@/components/rider-crud/util/tool.js'
export default {
	components: { riderCurd },
	data() {
		return {
			configShow: false, //字典管理弹窗
			form: {
				isSealed: 0
			},
			list: [],
			params: {
				current: 1,
				size: 10
			},
			readonly: false, // 查看时控制表单只读
			parentData: {}, // 上级数据信息
			childList: [],
			childForm: {
				isSealed: 0
			},
			childParams: {
				current: 1,
				size: 10,
				parentId: null
			},
			loadStatus: 'loadmore', // 列表加载状态
			childLoadStatus: 'loadmore', // 列表加载状态
			option: {
				navTitle: '字典管理', //标题
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '字典编号',
						prop: 'code'
					},
					{
						label: '字典名称',
						prop: 'dictValue'
					},

					{
						label: '字典排序',
						prop: 'sort'
					},
					{
						label: '封存',
						prop: 'sealedName'
					},
					{
						label: '字典备注',
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
						name: '设置',
						icon: 'setting',
						color: '#333',
						fontsize: 30,
						width: 40,
						background: '#fff'
					}
				]
			},
			configName: '',
			configOption: {
				navBackIcon: 'close', //导航栏左上角icon
				manageBtn: true, // 右上角管理按钮，默认不显示
				searchShow: true, //是否显示搜索，默认不显示
				labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
				column: [
					{
						label: '字典编号',
						prop: 'code'
					},
					{
						label: '字典名称',
						prop: 'dictValue'
					},
					{
						label: '字典键值',
						prop: 'dictKey'
					},
					{
						label: '字典排序',
						prop: 'sort'
					},
					{
						label: '封存',
						prop: 'sealedName'
					},
					{
						label: '字典备注',
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
				code: [{ required: true, message: '请输入字典编号', trigger: 'blur' }],
				dictValue: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
				sort: [{ required: true, message: '请输入字典排序', trigger: 'blur', type: 'number' }],
				isSealed: [{ required: true, message: '请选择是否封存', trigger: 'blur', type: 'number' }],
				dictKey: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
			}
		}
	},

	onReady() {
		this.getList(true)
	},
	onPullDownRefresh() {
		this.getList(true)
		this.getChild(true)
	},
	onReachBottom() {
		if (this.loadStatus == 'nomore') return
		this.getList()

		if (this.childLoadStatus == 'nomore') return
		this.getChild()
	},
	methods: {
		// 获取列表
		getList(override = false) {
			if (override) {
				this.params.current = 1
			}
			const { size } = this.params
			parentList(this.params)
				.then(res => {
					const { records } = res.data
					if (records.length < size) this.loadStatus = 'nomore'
					else this.loadStatus = 'loadmore'
					if (override) {
						this.list = records
					} else {
						this.list = this.list.concat(records)
					}
					if (this.list && this.list.length > 0) {
						this.list.map(e => {
							e.sealedName = e.isSealed ? '是' : '否'
						})
					}
					this.params.current++
					uni.stopPullDownRefresh()
				})
				.catch(err => {
					uni.stopPullDownRefresh()
				})
		},
		// 获取子类列表
		getChild(override = false) {
			if (override) {
				this.childParams.current = 1
			}
			const { size } = this.childParams
			child(this.childParams)
				.then(res => {
					const records = res.data
					if (records.length < size) this.childLoadStatus = 'nomore'
					else this.childLoadStatus = 'loadmore'
					if (override) {
						this.childList = records
					} else {
						this.childList = this.childList.concat(records)
					}
					if (this.childList && this.childList.length > 0) {
						this.childList.map(e => {
							e.sealedName = e.isSealed ? '是' : '否'
						})
					}
					this.childParams.current++
					uni.stopPullDownRefresh()
				})
				.catch(err => {
					uni.stopPullDownRefresh()
				})
		},

		// 左滑按钮点击
		onActionClick({ index, data, action, done }) {
			const { name } = action
			switch (name) {
				case '新增':
					if (this.parentData.code) {
						this.$set(this.childForm, 'code', this.parentData.code)
						this.$set(this.childForm, 'parentId', this.parentData.id)
						this.$set(this.childParams, 'parentId', this.parentData.id)
					}
					done()
					break
				case '删除':
					this.onRemove(data.id)
					break
				case '查看':
					this.readonly = true
				case '编辑':
					if (data.id) done()
					break
				case '设置':
					this.childForm = {}
					this.parentData = data
					this.configName = data.dictValue
					this.$set(this.childParams, 'parentId', data.id)
					this.getChild(true)
					setTimeout(() => {
						this.configShow = true
					}, 100)
					break
				case '新增子项':
					this.childForm = {}
					this.parentData = data
					this.$set(this.childForm, 'code', data.code)
					this.$set(this.childForm, 'parentId', data.id)
					this.$set(this.childParams, 'parentId', data.id)
					done()
					break
			}
			if (['删除', '编辑', '新增子项'].includes(name)) {
				this.$refs['crud'].hideChildren()
				this.$refs['childCrud'].hideChildren()
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
		},
		//字典配置关闭
		onConfigClose() {
			this.configShow = false
			this.childParams = {
				current: 1,
				size: 10,
				parentId: null
			}
			this.parentData = {}
			this.form = { isSealed: 0 }
			this.childForm = { isSealed: 0 }
			setTimeout(() => {
				this.getChild(true)
			})
		},
		// 搜索 (自行配置搜索内容)
		onSearch(val) {
			this.params = {
				current: 1,
				size: 10,
				dictValue: val
			}
			this.getList(true)
		},
		// 子级搜索
		onChildSearch(val) {
			this.childForm = {
				current: 1,
				size: 10,
				dictValue: val
			}
			this.getChild(true)
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

.config-title {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 20rpx solid #f5f5f5;
	color: #fff;
	background: linear-gradient(45deg, #4e7ff9 0%, #59a5fb 100%);
}
</style>
