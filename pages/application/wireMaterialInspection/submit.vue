<template>
    <view class="page-container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="线材质检"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <u-form :model="form" ref="uForm" label-width="auto">
                <view v-for="(group, index) in columns" class="group" :class="getClass(group)" :key="index">
                    <template v-if="group.renderType === 'form'">
                        <view class="title">
                            <view class="index">{{ group.name }}</view>
                        </view>
                        <view class="basic-wrap">
                            <template v-for="(col, rowIndex) in group.items">
                                <u-form-item
                                    :label="col.label"
                                    :prop="col.prop"
                                    :required="col.required"
                                    v-show="!col.showFunc || (col.showFunc && col.showFunc(item))"
                                >
                                    <dc-input-scan
                                        v-bind="col.props"
                                        v-model="form[col.prop]"
                                        @change="
                                            (val) => {
                                                handleFormItemChange(val, col, index);
                                            }
                                        "
                                        v-if="col.type === 'input' && col.scan"
                                    />
                                    <u-input
                                        v-bind="col.props"
                                        v-model="form[col.prop]"
                                        v-if="col.type === 'input'"
                                        @change="
                                            (val) => {
                                                handleFormItemChange(val, col, index);
                                            }
                                        "
                                    />
                                    <u-number-box
                                        v-bind="col.props"
                                        v-model="form[col.prop]"
                                        v-if="col.type === 'number'"
                                        @change="
                                            (val) => {
                                                handleFormItemChange(val, col, index);
                                            }
                                        "
                                    />
                                    <u-radio-group
                                        v-bind="col.props"
                                        v-model="form[col.prop]"
                                        v-else-if="col.type === 'radio'"
                                        @change="
                                            (val) => {
                                                handleFormItemChange(val, col, index);
                                            }
                                        "
                                    >
                                        <u-radio
                                            v-for="(item, index) in dictMaps[col.dictKey]"
                                            :key="index"
                                            :name="item.value"
                                        >
                                            {{ item.label }}
                                        </u-radio>
                                    </u-radio-group>
                                    <dc-select-dict
                                        v-bind="col.props"
                                        v-model="form[col.prop]"
                                        v-else-if="col.type === 'select'"
                                        @change="
                                            (val) => {
                                                handleFormItemChange(val, col, index);
                                            }
                                        "
                                    >
                                    </dc-select-dict>
                                </u-form-item>
                            </template>
                        </view>
                    </template>
                    <template v-if="group.renderType === 'table'">
                        <view class="title">
                            <view class="index">{{ group.name }}</view>
                            <view class="title-right">
                                <u-button class="add" size="mini" @click="doAction('addRow', form[group.prop])">
                                    <u-icon name="plus"></u-icon>添加
                                </u-button>
                                <u-button
                                    size="mini"
                                    @click="
                                        doAction('scan', {
                                            rowIndex: rowIndex,
                                        })
                                    "
                                >
                                    <u-icon name="scan"></u-icon>
                                    扫码
                                </u-button>
                                <view v-if="group.showToggleExpand" @click="handleShowToggleExpand(group)">
                                    <u-icon v-if="group.$isExpand" name="arrow-down"></u-icon>
                                    <u-icon v-else name="arrow-right"></u-icon>
                                </view>
                            </view>
                        </view>
                        <template v-for="(row, rowIndex) in form[group.prop]">
                            <view class="card" :class="getClass(row)">
                                <view class="title">
                                    <view class="index"> #{{ rowIndex + 1 }} </view>
                                    <view class="title-right">
                                        <u-button
                                            style="margin-right: 10rpx"
                                            size="mini"
                                            type="error"
                                            @click="doAction('removeRow', { rowIndex })"
                                        >
                                            <u-icon name="trash-fill"></u-icon>
                                            删除
                                        </u-button>
                                    </view>
                                </view>
                                <dc-field label="BOM编码">
                                    <view class="encod-and-version">
                                        <view>{{ row.bomNo || '-' }}</view>
                                        <view>{{ row.bomVersion || '-' }}</view>
                                    </view>
                                </dc-field>
                                <dc-field label="执行单编码">{{ row.no || '-' }}</dc-field>
                                <dc-field label="物料编码">{{ row.itemMaterialNumber || '-' }}</dc-field>
                                <dc-field label="物料名称">{{ row.itemMaterialName || '-' }}</dc-field>
                                <dc-field label="专案号">{{ row.mtoNo || '-' }}</dc-field>
                                <template v-for="(col, k) in group.items">
                                    <u-form-item
                                        v-if="!col.showFunc || (col.showFunc && col.showFunc(row))"
                                        :label="col.label"
                                        :required="col.required"
                                        :prop="`${group.prop}[${rowIndex}].${col.prop}`"
                                    >
                                        <u-number-box
                                            v-bind="col.props"
                                            v-model="row[col.prop]"
                                            v-if="col.type === 'number'"
                                            @change="
                                                (val) => {
                                                    handleTabletemChange(val, col, rowIndex);
                                                }
                                            "
                                        />
                                        <u-input
                                            v-bind="col.props"
                                            v-model="row[col.prop]"
                                            v-else-if="col.type === 'input'"
                                            @change="
                                                (val) => {
                                                    handleTabletemChange(val, col, rowIndex);
                                                }
                                            "
                                        />
                                        <u-radio-group
                                            v-bind="col.props"
                                            v-model="row[col.prop]"
                                            v-else-if="col.type === 'radio'"
                                            @change="
                                                (val) => {
                                                    handleTabletemChange(val, col, rowIndex);
                                                }
                                            "
                                        >
                                            <u-radio
                                                v-for="(radio, index) in dictMaps[col.dictKey]"
                                                :key="index"
                                                :name="radio.value"
                                            >
                                                {{ radio.label }}
                                            </u-radio>
                                        </u-radio-group>
                                        <dc-select-dict
                                            v-bind="col.props"
                                            v-model="row[col.prop]"
                                            v-else-if="col.type === 'select'"
                                            @change="
                                                (val) => {
                                                    handleTabletemChange(val, col, rowIndex);
                                                }
                                            "
                                        >
                                        </dc-select-dict>
                                    </u-form-item>
                                </template>
                            </view>
                        </template>
                    </template>
                </view>
            </u-form>
            <dc-drag-button @click="doAction('submit')">保存</dc-drag-button>
        </view>
        <dc-scan-code v-if="showScan" ref="scanCodeRef" />
    </view>
</template>
<script>
import Api from '@/api/index';
import pageDetail from '@/mixins/page-detail';
import options from './submit';

export default {
    mixins: [pageDetail],
    name: 'WireMaterialInspection',
    data() {
        return {
            open: true,
            value: null,
            columns: options().columns,
            form: {
                name: '',
                data: [],
            },
            dictMaps: {
                QualifiedEnum: [
                    {
                        label: '合格',
                        value: '1',
                    },
                    {
                        label: '不合格',
                        value: '0',
                    },
                ],
            },
            showScan: false,
            rules: {},
        };
    },
    watch: {
        form: {
            handler(newValue, oldValue) {
                this.$nextTick(() => {
                    this.rules = this.generateFormRules(this.columns, newValue);
                    this.$refs.uForm.setRules(this.rules);
                });
            },
            immediate: true,
            deep: true,
        },
    },
    onLoad() {},
    onReady() {},
    methods: {
        doAction(action, row) {
            switch (action) {
                case 'submit':
                    this.handleSubmit();
                    return;
                case 'addRow':
                    this.form.data.unshift({ $isExpand: false });
                    return;
                case 'removeRow':
                    uni.showModal({
                        title: '确定要删除吗？',
                        success: (action) => {
                            if (action.confirm) {
                                this.form.data.splice(row.rowIndex, 1);
                            }
                        },
                    });
                    return;
                case 'scan':
                    this.showScan = true;
                    this.$nextTick(() => {
                        this.$refs.scanCodeRef
                            .open()
                            .then((val) => {
                                this.loading = true;
                                Api.mps.wireQc
                                    .getDrawContent({ key: val })
                                    .then((res) => {
                                        const { code, data } = res;
                                        if (code === 200) {
                                            const rowIndex = this.form.data.length;
                                            this.$set(this.form.data, rowIndex, {
                                                ...this.form.data[rowIndex],
                                                ...data,
                                                drawQty: String(data?.drawQty || 0),
                                            });
                                        }
                                        this.loading = false;
                                    })
                                    .catch((err) => {
                                        this.loading = false;
                                    });
                                this.showScan = false;
                            })
                            .catch((err) => {
                                this.showScan = false;
                            });
                    });
                    return;
            }
        },
        /** 行操作 **/
        rowAction(action, scope) {
            switch (action) {
                case 'scan':
                    return;
            }
        },
        /** 处理form表单项变化 **/
        handleFormItemChange(val, col, index) {},
        /** 处理列表行变化 **/
        handleTabletemChange(val, col, index) {
            if (col.prop === 'isQualified') {
                this.form.data[index].execeptionType = '';
            } else if (col.prop === 'execeptionType') {
                let row = { ...this.form.data[index], execeptionType: val };
                this.$set(this.form.data, index, row);
            }
        },
        handleSubmit() {
            this.$refs.uForm.validate((valid) => {
                if (valid) {
                    uni.showModal({
                        title: '确定要提交吗？',
                        success: (action) => {
                            if (action.confirm) {
                                const formData = this.form.data.map((item) => {
                                    return {
                                        ...item,
                                        locatorNo: this.form.locatorNo,
                                        drawQty: item.drawQty,
                                    };
                                });
                                uni.showLoading({
                                    title: '保存中...',
                                    mask: true,
                                });
                                Api.mps.wireQc
                                    .batchSave(formData)
                                    .then((res) => {
                                        const { code, data } = res;
                                        if (code === 200) {
                                            uni.showToast({
                                                icon: 'none',
                                                title: '保存',
                                            });
                                            uni.navigateBack({
                                                delta: 1, // 返回的页面数，默认为1
                                                success: () => {
                                                    // 通过路由参数传递刷新标志
                                                    uni.$emit('refreshData', true);
                                                },
                                            });
                                        }
                                        uni.hideLoading();
                                    })
                                    .catch((err) => {
                                        console.log(err);
										uni.showToast({
											title: err.data.msg,
											icon: 'error', // 可选 'success'、'loading'、'none'
											duration: 2000, // 提示持续时间，单位毫秒
											mask: true, // 是否显示透明蒙层，防止触摸穿透
										})
                                        uni.hideLoading();
                                    });
                            }
                        },
                    });
                } else {
                    console.log('验证失败');
                }
            });
        },
        getClass(item) {
            return item.$isExpand ? 'expand' : '';
        },
    },
};
</script>
<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;

    .page-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;

        .group {
            margin: 20rpx;
            transition: height 0.5s ease 0.5s;
            overflow: hidden;
            .basic-wrap {
                padding-left: 20rpx;
            }
            .title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10rpx 0;
                border-bottom: 1px solid rgba(204, 204, 204, 0.3);
                .index {
                    font-size: 32rpx;
                    font-weight: 600;
                }
                &-right {
                    display: flex;
                    .add {
                        margin-right: 10rpx;
                    }
                    .delete {
                        margin-right: 10rpx;
                        color: red;
                    }
                }
            }
        }
        .card {
            position: relative;
            padding: 20rpx;
            margin: 20rpx;
            border-radius: 10rpx;
            box-shadow: #ccc 0px 5rpx 5rpx 5rpx;
            transition: height 0.5s ease 0.5s;
            overflow: hidden;
            .title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10rpx 0;
                margin-bottom: 10rpx;
                border-bottom: 1px solid rgba(204, 204, 204, 0.3);
                .index {
                    font-size: 28rpx;
                    font-weight: 600;
                }
            }
            .encod-and-version {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
        }

        .actions {
            display: flex;
            flex-direction: row-reverse;
            margin-top: 10rpx;
            width: 100%;
        }
    }
}
</style>
