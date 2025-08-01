const options = () => {
    return {
        columns: [
            {
                prop: 'drawQty',
                type: 'rowText',
                label: '图档数量',
                minWidth: '140px',
                required: true,
                props: {
                    placeholder: '图档数量',
                },
            },
            {
                prop: 'isQualified',
                type: 'dict',
                label: '是否合格',
                dictKey: 'QualifiedEnum',
            },
            {
                prop: 'execeptionType',
                type: 'dict',
                label: '异常类型',
                dictKey: 'DC_WIRE_EXCEPTION_TYPE',
            },
            {
                prop: 'remark',
                type: 'rowText',
                label: '备注',
            },
            {
                prop: 'itemId',
                type: 'dc-view',
                label: '执行单明细',
                // props: {
                //     objectName:
                // }
            },
            {
                prop: 'bomNo',
                type: 'rowText',
                label: 'bom编码',
            },
            {
                prop: 'bomVersion',
                type: 'rowText',
                label: 'bom版本',
            },
            {
                prop: 'drawAddress',
                type: 'rowText',
                label: '图档地址',
            },
            {
                prop: 'exeMaterialNumber',
                type: 'rowText',
                label: '物料编码',
            },
            {
                prop: 'exeMaterialName',
                type: 'rowText',
                label: '物料名称',
            },
            {
                prop: 'mtoNo',
                type: 'rowText',
                label: '专案号',
            },
            {
                prop: 'unit',
                type: 'rowText',
                label: '单位',
            },
            {
                prop: 'no',
                type: 'rowText',
                label: '线材执行单单号',
            },
            {
                prop: 'finishMaterialNumber',
                type: 'rowText',
                label: '成品物料编码',
            },
            {
                prop: 'finishMaterialName',
                type: 'rowText',
                label: '成品物料名称',
            },
        ],
    };
};

export default options;
