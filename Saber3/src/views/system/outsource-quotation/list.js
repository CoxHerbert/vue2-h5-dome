const options = () => {
  return {
    columns: [
      { type: 'selection', width: '40px', align: 'center', fixed: 'left' },
      { prop: '', label: '序号', width: '60px', align: 'center', type: 'index' },
      {
        label: '专案号',
        prop: 'mtono',
        search: true,
        type: 'input',
        width: 100,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '编码',
        prop: 'fnumber',
        search: true,
        type: 'input',
        width: 100,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '名称',
        prop: 'materialName',
        search: false,
        type: 'input',
        width: 100,
        props: {
          disabled: true,
        },
      },
      {
        label: '版本',
        prop: 'version',
        search: false,
        type: 'input',
        width: 60,
        props: {
          disabled: true,
        },
      },
      {
        label: '源单',
        prop: 'srcBillNo',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '数量',
        prop: 'qty',
        search: false,
        type: 'input',
        required: true,
        props: {
          type: 'number',
          disabled: true,
        },
      },
      {
        label: '材质',
        prop: 'erpSpecificationName',
        search: true,
        type: 'input',
        searchProps: { is: 'input' },
        props: {
          disabled: true,
        },
      },
      {
        label: '密度(kg/m³)',
        prop: 'density',
        search: true,
        type: 'input',
        required: true,
        width: 120,
        searchProps: { is: 'input' },
        props: {
          type: 'number',
        },
      },
      {
        label: '材质费(￥)',
        prop: 'materialCost',
        search: true,
        type: 'input',
        required: true,
        width: 120,
        searchProps: { is: 'input' },
        props: {
          type: 'number',
        },
      },
      {
        label: '形状',
        prop: 'materialShapeId',
        search: true,
        type: 'dict',
        dictKey: 'DC_MATERIAL_SHAPE',
        required: true,
        width: 100,
        searchProps: { is: 'dict' },
      },
      {
        label: '长/直径(mm)',
        prop: 'length',
        search: false,
        type: 'input',
        width: 120,
        required: true,
        props: {
          type: 'number',
        },
      },
      {
        label: '宽(mm)',
        prop: 'width',
        search: false,
        type: 'input',
        width: 100,
        props: {
          type: 'number',
        },
      },
      {
        label: '高(mm)',
        prop: 'height',
        search: false,
        type: 'input',
        required: true,
        width: 100,
        props: {
          type: 'number',
        },
      },
      {
        label: '体积(mm³)',
        prop: 'volume',
        search: false,
        type: 'input',
        required: true,
        width: 120,
        props: {
          disabled: true,
          type: 'number',
        },
      },
      {
        label: '材料费(￥)',
        prop: 'materialFee',
        search: false,
        type: 'input',
        required: true,
        width: 120,
        props: {
          type: 'number',
          disabled: true,
        },
      },
      {
        label: '加工费(￥)',
        prop: 'processFee',
        search: false,
        type: 'input',
        required: true,
        width: 120,
        props: {
          type: 'number',
        },
      },
      {
        label: '表面处理费(￥)',
        prop: 'surfaceFee',
        search: false,
        type: 'input',
        required: true,
        width: 140,
        props: {
          type: 'number',
        },
      },
      {
        label: '总价(￥)',
        prop: 'currentOutsourcePrice',
        search: false,
        type: 'input',
        required: true,
        width: 120,
        props: {
          disabled: true,
          type: 'number',
        },
      },
      {
        label: '状态',
        prop: 'quotationStatusId',
        search: true,
        type: 'dict',
        dictKey: 'DC_WX_VALENCE_STATUS',
        required: true,
        width: 100,
        searchProps: { is: 'dict' },
        props: {
          disabled: true,
        },
      },

      {
        prop: 'options',
        width: 120,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '图纸',
            action: 'viewBatches',
            showFunc(scope) {
              return !scope.row?.isEdit;
            },
          },
          {
            type: 'button',
            label: '核价详情',
            action: 'pricingdetail',
            showFunc(scope) {
              return !scope.row?.isEdit;
            },
          },
          {
            type: 'button',
            label: '历史价格',
            action: 'his-price',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
            },
          },
        ],
      },
    ],
  };
};
export default options;
