<template>
    <view class="page-container page-material-info">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="出货资料上传"
            :background="{ background: '#F7EEE8' }"
            z-index="999"
            title-color="#333333"
        />

        <view class="page-body">
            <view v-if="formData.id" class="form-box">
                <u-form :model="formData" label-width="120px" ref="formRef">
                    <view v-for="(group, i) in groups" :key="i" class="group">
                        <view class="group-title">{{ group.label }}</view>
                        <view class="group-content">
                            <u-form-item
                                v-for="(item, j) in group.columns || []"
                                :key="j"
                                :label="item.label"
                                :prop="item.prop"
                                :required="item.required"
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
                                            handleFormItemChange(item.prop, val);
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
            <view v-if="!formData.id" class="no-data"> 暂无数据</view>
        </view>
        <dc-scan-code ref="scanCodeRef" v-if="show" />
    </view>
</template>
<script>
import WfUpload from '@/components/wf-ui/components/wf-upload/wf-upload.vue';
import Api from '@/api';
import pageDetail from '@/mixins/page-detail';
import options from './submit';

export default {
    mixins: [pageDetail],
    components: {
        WfUpload,
    },
    data() {
        return {
            show: false,
            formData: {},
            rules: [],
            groups: options().columns,
        };
    },
    watch: {
        formData: {
            handler(newValue, oldValue) {
                this.$nextTick(() => {
                    this.rules = this.generateFormRules(this.groups, newValue);
                    this.$refs.formRef.setRules(this.rules);
                });
            },
            immediate: true,
            deep: true,
        },
    },
    onLoad(option) {
        this.getData(option);
    },
    methods: {
        doAction(action) {
            if (action === 'submit') {
                this.$refs.formRef.validate((valid) => {
                    if (valid) {
                        uni.showLoading({
                            title: '加载中...',
                            mask: true,
                        });
                        Api.scm.ship
                            .saveShipItem({
                                scmMaterial: {
                                    ...this.formData,
                                    attachId: undefined,
                                },
                                attachId:
                                    this.formData.attachId?.length > 0 ? this.formData.attachId?.[0].value : undefined,
                            })
                            .then((res) => {
                                uni.hideLoading();
                                const { code, data } = res;
                                if (code === 200) {
                                    uni.navigateBack({
                                        delta: 1,
                                    });
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
        },
        handleFormItemChange(prop, val) {
            if (prop === 'netWeight') {
                this.formData.allNetWeight = val * this.formData.number;
            }
        },
        getData(params) {
            uni.showLoading({ title: '加载中...' });
            Api.scm.ship
                .getDetail(params)
                .then((res) => {
                    if (res.code === 200) {
                        this.formData = res.data;
                    }
                    uni.hideLoading();
                })
                .catch((err) => {
                    uni.hideLoading();
                });
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
