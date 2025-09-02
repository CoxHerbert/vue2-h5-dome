<template>
    <view class="page-container page-material-info">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="物料信息维护"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />
        <view class="page-body">
            <view class="search-container">
                <u-search
                    v-model="snCode"
                    placeholder="请输入物料编码查询"
                    shape="square"
                    :show-action="false"
                    :input-style="{
                        borderRadius: 0,
                    }"
                    @search="doAction('search')"
                ></u-search>
                <u-button type="success" @click="doAction('handleSearch')">
                    <u-icon name="search" size="28" />查询
                </u-button>
                <u-button type="primary" @click="doAction('scanCode')"> <u-icon name="scan" size="28" /> </u-button>
            </view>
            <view v-if="formData.id" class="form-box">
                <u-form :model="formData" :rules="rules" label-width="120px" ref="formRef">
                    <view v-for="(group, i) in groups" :key="i" class="group">
                        <view class="group-title">{{ group.label }}</view>
                        <view class="group-content">
                            <u-form-item
                                v-for="(item, j) in group.columns || []"
                                :key="j"
                                :label="item.label"
                                :prop="item.prop"
                                :class="{
                                    disabled: item.props && item.props.disabled,
                                }"
                            >
                                <u-input
                                    v-if="item.type === 'input'"
                                    v-model="formData[item.prop]"
                                    :placeholder="`请输入${item.label}`"
                                    v-bind="item.props"
                                />
                                <dc-select-popup
                                    v-else-if="item.type === 'dc-select-popup'"
                                    v-model="formData[item.prop]"
                                    v-bind="item.props"
                                ></dc-select-popup>
                                <dc-select-dict
                                    v-else-if="item.type === 'dc-select-dict'"
                                    v-model="formData[item.prop]"
                                    v-bind="item.props"
                                ></dc-select-dict>
                                <dc-number
                                    v-else-if="item.type === 'dc-number'"
                                    v-model="formData[item.prop]"
                                    v-bind="item.props"
                                    @change="
                                        (val) => {
                                            handleFormItemChange(item, val);
                                        }
                                    "
                                />
                                <view v-else-if="item.type == 'upload-img'" class="upload-img-box">
                                    <view class="upload-box">
                                        <WfUpload v-model="formData[item.prop]" :column="item.props.column" />
                                    </view>
                                    <!-- <view v-if="Array.isArray(formData[item.prop]) && (formData[item.prop].length > 0)" class="clear">清空</view> -->
                                </view>
                                <dc-weight
                                    v-else-if="item.type == 'dc-weight'"
                                    v-model="formData[item.prop]"
                                    v-bind="item.props"
                                    @change="
                                        (val) => {
                                            handleFormItemChange(item, val);
                                        }
                                    "
                                />
                                <!-- {{ formData[item.prop] }} -->
                            </u-form-item>
                        </view>
                    </view>
                </u-form>
                <!-- {{ formData.attachId }} -->
            </view>
            <view v-if="formData.id" class="page-body_footer">
                <u-button class="u-btn" type="success" @click="doAction('submit')">
                    <u-icon name="checkmark" size="28" />提交
                </u-button>
            </view>
            <view v-if="!formData.id" class="no-data"> 暂无数据,请先扫码查询 </view>
        </view>
        <dc-scan-code ref="scanCodeRef" @confirm="handleScanCode" v-if="show" />
    </view>
</template>
<script>
import { needHideTitleBar } from '@/utils/utils';
import WfUpload from '@/components/wf-ui/components/wf-upload/wf-upload.vue';
import Api from '@/api';

export default {
    components: {
        WfUpload,
    },
    data() {
        return {
            show: false,
            snCode: '', // process.env.NODE_ENV === 'development'? 'PG-00###202504031037224230' : '',
            showTitleBar: null,
            formData: {},
            rules: [],
            groups: [
                {
                    label: '基本信息',
                    columns: [
                        {
                            label: '物料名称',
                            prop: 'materialName',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        {
                            label: '物料编码',
                            prop: 'materialNumber',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        {
                            label: '品牌',
                            prop: 'brand',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        {
                            label: '规格型号',
                            prop: 'specification',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        {
                            label: '单位',
                            prop: 'unitDict',
                            type: 'dc-select-dict',
                            props: {
                                disabled: true,
                                dictKey: 'DC_ERP_UNIT',
                                labelKey: 'dictValue',
                                valueKey: 'dictKey',
                                placeholder: '请选择',
                            },
                        },
                        {
                            label: '物料属性',
                            prop: 'attribute',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        {
                            label: '存货类别',
                            prop: 'categoryName',
                            type: 'input',
                            props: {
                                disabled: true,
                            },
                        },
                        // {
                        //     label: '是否需要版本号',
                        //     prop: 'isMustVersion',
                        //     type: 'radio',
                        //     options: [
                        //         {
                        //             label: '是',
                        //             value: 1,
                        //         },
                        //         {
                        //             label: '否',
                        //             value: 0,
                        //         }
                        //     ]
                        // },
                        // {
                        //     label: '启用状态',
                        //     prop: 'enableStatus',
                        //     type: 'input'
                        // },
                    ],
                },
                {
                    label: '尺寸信息',
                    columns: [
                        {
                            label: '尺寸单位',
                            prop: 'sizeUnit',
                            type: 'dc-select-dict',
                            props: {
                                dictKey: 'DC_ERP_UNIT',
                                labelKey: 'dictValue',
                                valueKey: 'dictKey',
                                placeholder: '请选择',
                            },
                        },
                        {
                            label: '长',
                            prop: 'length',
                            type: 'dc-number',
                            props: {
                                min: 0,
                                precision: 4,
                            },
                        },
                        {
                            label: '宽',
                            prop: 'width',
                            type: 'dc-number',
                            props: {
                                min: 0,
                                precision: 4,
                            },
                        },
                        {
                            label: '高',
                            prop: 'height',
                            type: 'dc-number',
                            props: {
                                min: 0,
                                precision: 4,
                            },
                        },
                    ],
                },
                {
                    label: '重量信息',
                    columns: [
                        {
                            label: '数量',
                            prop: 'qty',
                            type: 'dc-number',
                            props: {
                                placeholder: '请输入',
                                min: 1,
                                precision: 0,
                            },
                        },
                        {
                            label: '重量单位',
                            prop: 'weightUnit',
                            type: 'dc-select-dict',
                            props: {
                                dictKey: 'DC_ERP_UNIT',
                                labelKey: 'dictValue',
                                valueKey: 'dictKey',
                                placeholder: '请选择',
                            },
                        },
                        {
                            label: '毛重',
                            prop: 'grossWeight',
                            type: 'dc-weight',
                            props: {
                                placeholder: '请输入',
                                min: 0,
                                precision: 4,
                            },
                        },
                        {
                            label: '净重',
                            prop: 'netWeight',
                            type: 'dc-weight',
                            props: {
                                placeholder: '请输入',
                                min: 0,
                                precision: 4,
                            },
                        },
                    ],
                },
                {
                    label: '附件信息',
                    columns: [
                        {
                            label: '附件',
                            prop: 'attachId',
                            type: 'upload-img',
                            props: {
                                column: {
                                    type: 'upload',
                                    label: '上传',
                                    span: 24,
                                    display: true,
                                    showFileList: true,
                                    multiple: false,
                                    limit: 1,
                                    propsHttp: {
                                        url: 'attachId',
                                        name: 'originalName',
                                        res: 'data',
                                    },
                                    prop: 'attachId',
                                    action: '/blade-resource/oss/endpoint/put-file-attach-path',
                                    drag: true,
                                    headers: {
                                        filePath: 'scm/material',
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        };
    },
    created() {
        this.showTitleBar = !needHideTitleBar();
    },
    methods: {
        scanCode() {
            this.show = true;
            this.$nextTick(() => {
                this.$refs.scanCodeRef
                    .open()
                    .then((val) => {
                        if (!val) return;
                        this.snCode = val;
                        this.handleSearch();
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
            this.handleSearch();
        },
        handleSearch() {
            uni.showLoading({
                title: '加载中...',
                mask: true,
            });
            Api.scm.scmMaterial
                .load({
                    qrcode: this.snCode,
                })
                .then((res) => {
                    uni.hideLoading();
                    const { code, data } = res;
                    if (code === 200) {
                        this.formData = {
                            ...data,
                            materialFileId: undefined,
                            attachId: data.materialFileId ? [{ value: data.materialFileId }] : [], // data.materialFileId
                        };
                        if (data.materialFileId) {
                            Api.scm.scmMaterial.getFileById({ ids: data.materialFileId }).then((resFile) => {
                                const { code, data } = resFile;
                                if (code === 200 && data?.[0]) {
                                    this.formData.attachId = [
                                        {
                                            label: data[0].originalName,
                                            value: data[0].id,
                                        },
                                    ];
                                }
                            });
                        }
                    }
                })
                .catch(() => {
                    uni.hideLoading();
                });
        },
        doAction(action) {
            if (['scanCode', 'handleSearch'].includes(action)) {
                this[action]();
            } else if (action === 'submit') {
                this.$refs.formRef.validate((valid) => {
                    if (valid) {
                        uni.showLoading({
                            title: '加载中...',
                            mask: true,
                        });
                        Api.scm.scmMaterial
                            .update({
                                scmMaterial: {
                                    ...this.formData,
                                    attachId: undefined,
                                },
                                attachId:
                                    this.formData.attachId?.length > 0 ? this.formData.attachId?.[0].value : undefined,
                            })
                            .then((res) => {
                                uni.hideLoading();
                                console.log('res', res);
                                const { code, data } = res;
                                if (code === 200) {
                                    uni.showToast({
                                        icon: 'none',
                                        title: '保存成功',
                                    });
                                }
                            })
                            .catch((error) => {
                                uni.hideLoading();
                                uni.showToast({
                                    icon: 'none',
                                    title: error.msg,
                                });
                            });
                    }
                });
            }
            console.log('action', action);
        },
        handleFormItemChange(col, val) {
            if (col.prop === 'grossWeight') {
                if (![undefined, null].includes(val)) {
                    this.formData[col.prop] = (val / this.formData.qty).toFixed(4);
                }
                if (![undefined, null].includes(this.formData.qty)) {
                    this.formData.grossWeight = null;
                }
            } else if (col.prop === 'netWeight') {
                if (![undefined, null].includes(val)) {
                    this.formData[col.prop] = (val / this.formData.qty).toFixed(4);
                }
                if (![undefined, null].includes(this.formData.qty)) {
                    this.formData.netWeight = null;
                }
            } else if (col.prop === 'qty') {
                this.formData.grossWeight = null;
                this.formData.netWeight = null;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.page-material-info {
    min-height: 100vh;
    display: flex;
    flex-flow: column nowrap;
    background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 12%) !important;
    padding-bottom: 200rpx;
    box-sizing: border-box;
    .no-data {
        width: 100%;
        text-align: center;
        margin-top: 100px;
        color: #999;
    }
    ::v-deep .uni-input-wrapper {
        .uni-input-input {
            width: calc(100% - 16px);
        }
    }

    .disabled ::v-deep.uni-input-input {
        background-color: rgba(0, 0, 0, 0.05) !important;
    }

    ::v-deep .uni-input-input:disabled {
        background-color: rgba(0, 0, 0, 0.05);
    }
    .search-container {
        display: flex;
        align-items: center;
        ::v-deep.u-content {
            border-radius: 0 !important;
        }

        .u-btn {
            height: 64rpx;
            border-radius: 0;
        }
    }
    .page-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
    }
    .group-title {
        padding: 10px 0;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        line-height: 2;
    }

    ::v-deep.u-form-item--left {
        padding-left: 16px;
    }

    .group-content {
        border-radius: 6px;
        background-color: #fff;
    }

    .page-body_footer {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 100;
        padding-bottom: calc(24rpx + constant(safe - area - inset - bottom));
        padding-bottom: calc(24rpx + env(safe - area - inset - bottom));
    }
    .u-btn {
        border-radius: 0 !important;
    }

    .upload-img-box {
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-flow: row nowrap;
        position: relative;

        .upload-box {
            flex: 1;
        }

        ::v-deep.wf-upload {
            width: calc(100% - 80px);
            min-width: 200px;
            flex: 1;

            .wf-upload-file {
                width: 200px;
            }
            .wf-upload-file__item--name {
                display: block;
                width: 200px;
            }
        }

        .clear {
            background-color: gray;
            width: 80px;
        }
    }
}
</style>
