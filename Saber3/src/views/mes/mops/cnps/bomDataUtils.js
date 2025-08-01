const options = () => {
  return {
    columns: [
      {
        name: 'BOM信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'rawMaterialName',
            label: '原材料',
            type: 'wf-select-single',
            objectName: 'rawList',
            required: true,
            props: {
              objectName: 'rawList',
              placeholder: '请选择原材料',
            },
          },
          {
            prop: 'shape',
            label: '形状',
            type: 'dict',
            dictKey: 'DC_RAW_MATERIAL_TYPE',
            labelKey: 'dictValue',
            valueKey: 'dictKey',
            required: true,
            props: {
              placeholder: '请选择形状',
            },
          },
          {
            prop: 'size',
            label: '尺寸(mm)',
            type: 'input',
            required: true,
            props: {
              placeholder: '请输入尺寸(mm)',
            },
          },
          {
            prop: 'cutNumber',
            label: '下料数量',
            type: 'number',
            required: true,
            props: {
              min: 0,
              placeholder: '请输入下料数量',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'bomNumber',
            label: 'BOM用量',
            type: 'number',
            required: true,
            props: {
              disabled: true,
              min: 0,
              placeholder: '请输入BOM用量',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'denominatorNumber',
            label: '分母用量',
            type: 'number',
            required: true,
            props: {
              disabled: true,
              min: 0,
              placeholder: '请输入分母用量',
              style: {
                width: '100%',
              },
            },
          },
        ],
      },
      {
        name: 'BOM明细',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'rawMaterialBom',
        items: [
          // {
          //   prop: 'bomOrder',
          //   type: 'drag',
          //   label: '拖拽',
          // },
          {
            prop: 'bomOrder',
            type: 'input',
            label: 'BOM顺序',
            width: 100,
            props: {
              disabled: true,
              type: 'number',
              placeholder: 'BOM顺序',
            },
          },
          {
            prop: 'rawMaterialName',
            type: 'input',
            label: '原材料名称',
            props: {
              disabled: true,
              placeholder: '工序名称',
            },
          },
          {
            label: '原材料编码',
            prop: 'rawMaterialNumber',
            type: 'input',
            props: {
              placeholder: '描述',
            },
          },
          {
            label: '分子用量',
            prop: 'numeratorNumber',
            type: 'input',
            props: {
              activeValue: true,
              inactiveValue: false,
            },
          },
          {
            prop: 'denominatorNumber',
            type: 'input',
            label: '分母用量',
            props: {
              placeholder: '分母用量',
            },
          },
          {
            label: '操作',
            prop: 'action',
            type: 'actions',
            slotName: 'action',
            fixed: 'right',
            width: 60,
            children: [
              {
                type: 'button',
                label: '删除',
                action: 'row-delete',
                showFunc(scope) {
                  return !scope.row?.bomMaterialId;
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export default options;
