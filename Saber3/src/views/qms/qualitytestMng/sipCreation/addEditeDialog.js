/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        prop: 'category',
        label: '检验类别',
        type: 'dict',
        dictKey: 'DC_INSPECTION_CLASS',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        required: true,
      },

      {
        prop: 'checkType',
        label: '检验类型',
        type: 'dict',
        dictKey: 'DC_SIP_CHECK_TYPE',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        required: true,
      },
      {
        prop: 'materialIdCollection',
        label: '检验物料',
        type: 'wf-select-dialog',
        display: true,
        required: true,
        props: {
          objectName: 'materialListByMtoNo',
          placeholder: '请选择检验物料',
          multiple: true,
        },
      },
      {
        prop: 'materialIdCollection',
        label: '检验物料',
        type: 'wf-select-dialog',
        display: true,
        required: true,
        props: {
          objectName: 'SnCheckMaterial',
          placeholder: '请选择检验物料',
          multiple: true,
          query: {
            fuseorgid: 100006,
          },
        },
      },
      {
        prop: 'materialNumberCollection',
        label: '检验物料',
        type: 'dict',
        dictKey: 'DC_SIP_CHECK_ITEM',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        display: true,
        required: true,
        props: {
          placeholder: '请选择检验物料',
        },
      },
      {
        prop: 'isConfig',
        label: '是否启用',
        type: 'dict',
        align: 'center',
        dictKey: 'DC_COMMON_TRUEORFALSE',
        required: true,
      },
    ],
  };
};

export default options;
