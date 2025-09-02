const options = () => {
    return {
        columns: [
            {
                label: '基本信息',
                renderType: 'form',
                columns: [
                    {
                        label: '单据编号',
                        prop: 'billNumber',
                        type: 'input',
                        props: {
                            disabled: true,
                        },
                    },
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
                        prop: 'materialCode',
                        type: 'input',
                        props: {
                            disabled: true,
                        },
                    },
                    {
                        label: '总数量',
                        prop: 'number',
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
                label: '重量信息',
                renderType: 'form',
                columns: [
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
                        required: true,
                        props: {
                            placeholder: '请输入',
                            min: 0,
                            precision: 4,
                        },
                    },
                    {
                        label: '净重',
                        prop: 'singleNetWeight',
                        type: 'dc-weight',
                        required: true,
                        props: {
                            placeholder: '请输入',
                            min: 0,
                            precision: 4,
                        },
                    },
                    {
                        label: '总净重',
                        prop: 'allNetWeight',
                        type: 'input',
                        props: {
                            disabled: true,
                        },
                    },
                ],
            },
            {
                label: '附件信息',
                renderType: 'form',
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
                                    filePath: 'scm/ship',
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default options;
