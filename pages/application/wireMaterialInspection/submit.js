const options = () => {
    return {
        columns: [
            {
                name: '基本信息',
                classList: 'form-basic-group',
                renderType: 'form',
                showToggleExpand: false,
                $isExpand: true,
                prop: 'basic',
                items: [
                    {
                        prop: 'locatorNo',
                        type: 'input',
                        label: '库位编码',
                        minWidth: '140px',
                        scan: true,
                        required: true,
                        props: {
                            placeholder: '库位编码',
                        },
                    },
                ],
            },
            {
                name: '明细信息',
                classList: 'form-detail-group',
                renderType: 'table',
                showToggleExpand: false,
                prop: 'data',
                items: [
                    {
                        prop: 'drawQty',
                        type: 'input',
                        label: '图档数量',
                        minWidth: '140px',
                        required: true,
                        props: {
                            placeholder: '图档数量',
                        },
                    },
                    {
                        prop: 'isQualified',
                        type: 'radio',
                        label: '是否合格',
                        minWidth: '140px',
                        dictKey: 'QualifiedEnum',
                        required: true,
                        props: {
                            placeholder: '是否合格',
                        },
                    },
                    {
                        prop: 'execeptionType',
                        type: 'select',
                        label: '异常类型',
                        minWidth: '140px',
                        required: true,
                        showFunc(row) {
                            return row.isQualified === '0';
                        },
                        props: {
                            dictKey: 'DC_WIRE_EXCEPTION_TYPE',
                            placeholder: '请选择异常类型',
                        },
                    },
                    {
                        prop: 'remark',
                        type: 'input',
                        label: '备注',
                        minWidth: '140px',
                        props: {
                            placeholder: '备注',
                        },
                    },
                ],
            },
        ],
    };
};

export default options;
