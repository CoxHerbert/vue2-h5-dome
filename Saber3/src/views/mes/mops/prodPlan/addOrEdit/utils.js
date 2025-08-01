const options = pageMode => {
  if (pageMode === 'look') {
    return {
      columns: [
        {
          name: '基本信息',
          classList: 'form-basic-group',
          renderType: 'form',
          showToggleExpand: true,
          prop: 'basic',
          items: [
            {
              prop: 'billNo',
              label: '单据编号',
              type: 'input',
              width: 100,
              props: {
                placeholder: '请输入单据编号',
                disabled: true,
              },
            },
            {
              prop: 'mtoNo',
              label: '计划跟踪号',
              type: 'input',
              props: {
                placeholder: '请输入计划跟踪号',
                disabled: true,
              },
            },
            {
              prop: 'billType',
              label: '单据类型',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '请输入单据类型',
              },
            },
            {
              prop: 'materialNumber',
              label: '物料编号',
              type: 'input',
              props: {
                placeholder: '请输入物料编号',
                disabled: true,
              },
            },
            {
              prop: 'materialName',
              label: '物料名称',
              type: 'input',
              props: {
                placeholder: '请输入物料名称',
                disabled: true,
              },
            },
            {
              prop: 'billStatus',
              label: '单据状态',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'number',
              label: '计划数量',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'unit',
              label: '单位',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'isScheduleWork',
              label: '是否排程',
              type: 'switch',
              props: {
                disabled: true,
                activeValue: true,
                inactiveValue: false,
              },
            },
            {
              prop: 'businessStatus',
              label: '业务状态',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'planStartTime',
              label: '计划开始时间',
              type: 'date',
              props: {
                disabled: true,
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD',
                clearable: true,
                style: {
                  width: '100%',
                },
              },
            },
            {
              prop: 'planEndTime',
              label: '计划结束时间',
              type: 'date',
              props: {
                disabled: true,
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD',
                clearable: true,
                style: {
                  width: '100%',
                },
              },
            },
            {
              prop: 'version',
              label: '版本',
              type: 'input',
              props: {
                disabled: true,
              },
            },
          ],
        },
        {
          name: '工序信息',
          classList: 'form-detail-group',
          renderType: 'table',
          showToggleExpand: false,
          prop: 'createdProcessDetail',
          items: [
            {
              prop: 'technologyOrder',
              type: 'input',
              label: '工艺顺序',
              width: 100,
              props: {
                disabled: true,
                type: 'number',
                placeholder: '顺序',
              },
            },
            {
              prop: 'technologyName',
              type: 'input',
              label: '工序名称',
              required: true,
              props: {
                disabled: true,
                placeholder: '工序名称',
              },
            },
            {
              label: '描述',
              prop: 'unit',
              type: 'input',
              props: {
                placeholder: '描述',
              },
            },
            {
              label: '是否委外',
              prop: 'isOutSource',
              type: 'switch',
              width: 100,
              required: true,
              props: {
                activeValue: true,
                inactiveValue: false,
              },
              transVal(scope) {
                if ([undefined, null].includes(scope.row.isOutSource)) {
                  return '-';
                }
                return scope.row.isOutSource ? '是' : '否';
              },
            },
            {
              prop: 'prepareWorkingHour',
              type: 'input',
              label: '准备工时(分)',
              required: true,
              props: {
                placeholder: '准备工时(分)',
              },
            },
            {
              prop: 'singleWorkingHour',
              type: 'input',
              label: '单件标工(分)',
              required: true,
              props: {
                placeholder: '单件标工(分)',
              },
            },
            {
              prop: 'allWorkingHour',
              type: 'input',
              label: '总工时(分)',
              required: true,
              props: {
                disabled: true,
                placeholder: '总工时(分)',
              },
            },
          ],
        },
      ],
    };
  }
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'billNo',
            label: '单据编号',
            type: 'input',
            width: 100,
            props: {
              placeholder: '请输入单据编号',
              disabled: true,
            },
          },
          {
            prop: 'mtoNo',
            label: '计划跟踪号',
            type: 'input',
            props: {
              placeholder: '请输入计划跟踪号',
              disabled: true,
            },
          },
          {
            prop: 'billType',
            label: '单据类型',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '请输入单据类型',
            },
          },
          {
            prop: 'materialNumber',
            label: '物料编号',
            type: 'input',
            props: {
              placeholder: '请输入物料编号',
              disabled: true,
            },
          },
          {
            prop: 'materialName',
            label: '物料名称',
            type: 'input',
            props: {
              placeholder: '请输入物料名称',
              disabled: true,
            },
          },
          {
            prop: 'billStatus',
            label: '单据状态',
            type: 'input',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'number',
            label: '计划数量',
            type: 'input',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'unit',
            label: '单位',
            type: 'input',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'isScheduleWork',
            label: '是否排程',
            type: 'switch',
            props: {
              disabled: true,
              activeValue: true,
              inactiveValue: false,
            },
          },
          {
            prop: 'businessStatus',
            label: '业务状态',
            type: 'input',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'planStartTime',
            label: '计划开始时间',
            type: 'date',
            props: {
              disabled: true,
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'planEndTime',
            label: '计划结束时间',
            type: 'date',
            props: {
              disabled: true,
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'version',
            label: '版本',
            type: 'input',
            props: {
              disabled: true,
            },
          },
        ],
      },
      {
        name: '工序信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'createdProcessDetail',
        items: [
          {
            prop: 'technologyOrder',
            type: 'input',
            label: '工艺顺序',
            width: 100,
            props: {
              disabled: true,
              type: 'number',
              placeholder: '顺序',
            },
          },
          {
            prop: 'technologyName',
            type: 'input',
            label: '工序名称',
            props: {
              disabled: true,
              placeholder: '工序名称',
            },
          },
          {
            label: '描述',
            prop: 'unit',
            type: 'input',
            props: {
              placeholder: '系统生成',
            },
          },
          {
            label: '是否委外',
            prop: 'isOutSource',
            type: 'switch',
            required: true,
            props: {
              activeValue: true,
              inactiveValue: false,
            },
            transVal(scope) {
              if ([undefined, null].includes(scope.row.isOutSource)) {
                return '-';
              }
              return scope.row.isOutSource ? '是' : '否';
            },
          },
          {
            prop: 'prepareWorkingHour',
            type: 'input',
            label: '准备工时(分)',
            required: true,
            props: {
              placeholder: '准备工时(分)',
            },
          },
          {
            prop: 'singleWorkingHour',
            type: 'input',
            label: '单件标工(分)',
            required: true,
            props: {
              placeholder: '单件标工(分)',
            },
          },
          {
            prop: 'allWorkingHour',
            type: 'input',
            label: '总工时(分)',
            required: true,
            props: {
              disabled: true,
              placeholder: '总工时(分)',
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
              },
            ],
          },
        ],
      },
    ],
  };
};

export default options;
