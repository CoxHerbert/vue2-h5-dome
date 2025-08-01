import { secondToHour } from '@/utils/util';
/** 检验配置页面 */
const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'technologyName',
        label: '工艺名称',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 120,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入工艺名称',
        },
      },
      {
        prop: 'technologyCode',
        label: '工艺编码',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 120,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入工艺编码',
        },
      },
      {
        prop: 'technologyOrder',
        label: '工艺顺序',
        type: 'rowText',
        align: 'center',
        minWidth: 120,
      },
      {
        prop: 'standardWorkingHour',
        label: '单件标工（h）',
        type: 'rowText',
        align: 'center',
        minWidth: 120,
        transVal(scope) {
          return secondToHour(scope.row.standardWorkingHour);
        },
      },
      {
        prop: 'isOutSource',
        label: '是否委外',
        type: 'rowText',
        align: 'center',
        minWidth: 120,
        transVal(scope) {
          if ([false, true].includes(scope.row.isOutSource)) {
            return scope.row.isOutSource ? '是' : '否';
          }
          return '-';
        },
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 120,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
          },
        ],
      },
    ],
  };
};

export default options;
