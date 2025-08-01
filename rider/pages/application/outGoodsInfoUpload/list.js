const options = () => {
    return {
        columns: [
            { prop: 'billNumber', type: 'rowText', label: '单据编号' },
            { prop: 'materialCode', type: 'rowText', label: '物料编号' },
            { prop: 'materialName', type: 'rowText', label: '物料名称' },
            { prop: 'number', type: 'rowText', label: '数量' },
            { prop: 'singleNetWeight', type: 'rowText', label: '单个净重' },
            { prop: 'allNetWeight', type: 'rowText', label: '总净重' },
            { prop: 'grossWeight', type: 'rowText', label: '毛重' },
            { prop: 'weightUnit', type: 'rowText', label: '重量单位' },
        ],
    };
};

export default options;
