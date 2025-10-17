<!-- pages/MaterialInfo.vue -->
<template>
  <div class="page-container page-material-info">
    <!-- 顶部栏（按需隐藏） -->
    <van-nav-bar
      fixed
      :z-index="999"
      title="物料信息维护"
      left-arrow
      :style="{ background: '#F7EEE8' }"
      class="mi-navbar"
      @click-left="$router?.back?.()"
    />

    <div class="page-body">
      <!-- 搜索区 -->
      <div class="search-container">
        <van-search
          v-model="snCode"
          placeholder="请输入物料编码查询"
          shape="square"
          :show-action="false"
          :input-align="'left'"
          class="mi-search"
          @search="doAction('search')"
        />
        <van-button type="success" class="u-btn" @click="doAction('handleSearch')">
          <van-icon name="search" size="18" /> 查询
        </van-button>
        <van-button type="primary" class="u-btn" @click="doAction('scanCode')">
          <van-icon name="scan" size="18" />
        </van-button>
      </div>

      <!-- 表单 -->
      <div v-if="formData.id" class="form-box">
        <van-form ref="formRef" :model="formData" :rules="rules">
          <div v-for="(group, i) in groups" :key="i" class="group">
            <div class="group-title">{{ group.label }}</div>
            <div class="group-content">
              <!-- 字段渲染 -->
              <div
                v-for="(item, j) in group.columns || []"
                :key="j"
                class="mi-form-item"
                :class="{ disabled: item.props && item.props.disabled }"
              >
                <!-- input -->
                <van-field
                  v-if="item.type === 'input'"
                  v-model="formData[item.prop]"
                  :name="item.prop"
                  :label="item.label"
                  :placeholder="`请输入${item.label}`"
                  v-bind="item.props"
                />

                <!-- dc-select-popup -->
                <dc-select-popup
                  v-else-if="item.type === 'dc-select-popup'"
                  v-model="formData[item.prop]"
                  v-bind="item.props"
                />

                <!-- dc-select-dict -->
                <dc-select-dict
                  v-else-if="item.type === 'dc-select-dict'"
                  v-model="formData[item.prop]"
                  v-bind="item.props"
                />

                <!-- dc-number -->
                <dc-number
                  v-else-if="item.type === 'dc-number'"
                  v-model="formData[item.prop]"
                  v-bind="item.props"
                  @change="(val) => handleFormItemChange(item, val)"
                />

                <!-- 上传 -->
                <div v-else-if="item.type === 'upload-img'" class="upload-img-box">
                  <div class="upload-box">
                    <WfUpload v-model="formData[item.prop]" :column="item.props.column" />
                  </div>
                </div>

                <!-- dc-weight -->
                <dc-weight
                  v-else-if="item.type === 'dc-weight'"
                  v-model="formData[item.prop]"
                  v-bind="item.props"
                  @change="(val) => handleFormItemChange(item, val)"
                />
              </div>
            </div>
          </div>
        </van-form>
      </div>

      <!-- 底部按钮 -->
      <div v-if="formData.id" class="page-body_footer">
        <van-button class="u-btn" block type="success" @click="doAction('submit')">
          <van-icon name="passed" size="18" /> 提交
        </van-button>
      </div>

      <!-- 无数据提示 -->
      <div v-if="!formData.id" class="no-data">暂无数据, 请先扫码查询</div>
    </div>

    <!-- 扫码弹窗（保留原有逻辑/接口） -->
    <dc-scan-code v-if="show" ref="scanCodeRef" @confirm="handleScanCode" />
  </div>
</template>

<script>
import { nextTick } from 'vue';
import { showLoadingToast, closeToast, showToast } from 'vant';
import WfUpload from '@/components/wf-ui/components/wf-upload/wf-upload.vue';
import Api from '@/api';

export default {
  name: 'MaterialInfo',
  components: { WfUpload },
  data() {
    return {
      show: false,
      snCode: '',
      showTitleBar: null,
      formData: {},
      // Vant Form 的 rules 结构：{ [fieldName]: Rule[] }
      rules: {
        // 示例：
        // qty: [{ required: true, message: '请输入数量', trigger: 'onBlur' }]
      },
      groups: [
        {
          label: '基本信息',
          columns: [
            { label: '物料名称', prop: 'materialName', type: 'input', props: { disabled: true } },
            { label: '物料编码', prop: 'materialNumber', type: 'input', props: { disabled: true } },
            { label: '品牌', prop: 'brand', type: 'input', props: { disabled: true } },
            { label: '规格型号', prop: 'specification', type: 'input', props: { disabled: true } },
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
            { label: '物料属性', prop: 'attribute', type: 'input', props: { disabled: true } },
            { label: '存货类别', prop: 'categoryName', type: 'input', props: { disabled: true } },
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
            { label: '长', prop: 'length', type: 'dc-number', props: { min: 0, precision: 4 } },
            { label: '宽', prop: 'width', type: 'dc-number', props: { min: 0, precision: 4 } },
            { label: '高', prop: 'height', type: 'dc-number', props: { min: 0, precision: 4 } },
          ],
        },
        {
          label: '重量信息',
          columns: [
            {
              label: '数量',
              prop: 'qty',
              type: 'dc-number',
              props: { placeholder: '请输入', min: 1, precision: 0 },
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
              props: { placeholder: '请输入', min: 0, precision: 4 },
            },
            {
              label: '净重',
              prop: 'netWeight',
              type: 'dc-weight',
              props: { placeholder: '请输入', min: 0, precision: 4 },
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
                  propsHttp: { url: 'attachId', name: 'originalName', res: 'data' },
                  prop: 'attachId',
                  action: '/blade-resource/oss/endpoint/put-file-attach-path',
                  drag: true,
                  headers: { filePath: 'scm/material' },
                },
              },
            },
          ],
        },
      ],
    };
  },
  methods: {
    scanCode() {
      this.show = true;
      nextTick(() => {
        this.$refs.scanCodeRef
          ?.open()
          .then((val) => {
            if (!val) return;
            this.snCode = val;
            this.handleSearch();
            this.show = false;
          })
          .catch(() => {
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
      const toast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 });
      Api.scm.scmMaterial
        .load({ qrcode: this.snCode })
        .then((res) => {
          closeToast();
          const { code, data } = res || {};
          if (code === 200) {
            this.formData = {
              ...data,
              materialFileId: undefined,
              attachId: data?.materialFileId ? [{ value: data.materialFileId }] : [],
            };
            if (data?.materialFileId) {
              Api.scm.scmMaterial.getFileById({ ids: data.materialFileId }).then((resFile) => {
                const { code: fileCode, data: fileData } = resFile || {};
                if (fileCode === 200 && fileData?.[0]) {
                  this.formData.attachId = [
                    { label: fileData[0].originalName, value: fileData[0].id },
                  ];
                }
              });
            }
          }
        })
        .catch(() => {
          closeToast();
        });
    },
    doAction(action) {
      if (['scanCode', 'handleSearch', 'search'].includes(action)) {
        // 兼容你原有触发点
        return action === 'scanCode' ? this.scanCode() : this.handleSearch();
      }
      if (action === 'submit') {
        this.$refs.formRef?.validate?.().then(() => {
          const loading = showLoadingToast({
            message: '加载中...',
            forbidClick: true,
            duration: 0,
          });
          Api.scm.scmMaterial
            .update({
              scmMaterial: { ...this.formData, attachId: undefined },
              attachId: this.formData.attachId?.length
                ? this.formData.attachId?.[0].value
                : undefined,
            })
            .then((res) => {
              closeToast();
              const { code } = res || {};
              if (code === 200) {
                showToast({ message: '保存成功' });
              }
            })
            .catch((error) => {
              closeToast();
              showToast({ message: error?.msg || '保存失败' });
            });
        });
      }
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

  /* 替换 uView 深度选择器为 Vue3 :deep */
  :deep(.van-field__control) {
    width: calc(100% - 16px);
  }

  .disabled :deep(.van-field__control) {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }

  // .search-container {
  //   display: flex;
  //   align-items: center;

  //   .mi-search {
  //     flex: 1;
  //   }

  //   .u-btn {
  //     height: 64rpx;
  //     border-radius: 0;
  //     margin-left: 8px;
  //   }
  // }

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

  .group-content {
    border-radius: 6px;
    background-color: #fff;
    padding: 4px 0;
  }

  .mi-form-item + .mi-form-item {
    border-top: 1px solid #f5f5f5;
  }

  .page-body_footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding: 12px 16px calc(24rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.04);
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

    :deep(.wf-upload) {
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
