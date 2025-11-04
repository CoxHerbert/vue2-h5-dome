export const fallbackQualifiedOptions = [
  { label: '合格', value: '1' },
  { label: '不合格', value: '0' },
];

export const fallbackExceptionOptions = [];

export const listColumns = [
  { prop: 'drawQty', label: '图档数量' },
  { prop: 'isQualified', label: '是否合格', type: 'dict', dictKey: 'QualifiedEnum' },
  { prop: 'execeptionType', label: '异常类型', type: 'dict', dictKey: 'DC_WIRE_EXCEPTION_TYPE' },
  { prop: 'remark', label: '备注' },
  { prop: 'bomNo', label: 'BOM编码' },
  { prop: 'bomVersion', label: 'BOM版本' },
  { prop: 'drawAddress', label: '图档地址' },
  { prop: 'exeMaterialNumber', label: '物料编码' },
  { prop: 'exeMaterialName', label: '物料名称' },
  { prop: 'mtoNo', label: '专案号' },
  { prop: 'unit', label: '单位' },
  { prop: 'no', label: '线材执行单单号' },
  { prop: 'finishMaterialNumber', label: '成品物料编码' },
  { prop: 'finishMaterialName', label: '成品物料名称' },
];

export const readonlyRowFields = [
  { prop: 'bomNo', label: 'BOM编码' },
  { prop: 'bomVersion', label: 'BOM版本' },
  { prop: 'no', label: '执行单编码' },
  { prop: 'exeMaterialNumber', label: '物料编码' },
  { prop: 'exeMaterialName', label: '物料名称' },
  { prop: 'mtoNo', label: '专案号' },
  { prop: 'unit', label: '单位' },
  { prop: 'finishMaterialNumber', label: '成品物料编码' },
  { prop: 'finishMaterialName', label: '成品物料名称' },
  { prop: 'drawAddress', label: '图档地址' },
];

const emptyRowTemplate = {
  drawQty: '',
  isQualified: '',
  execeptionType: '',
  remark: '',
  itemId: '',
  bomNo: '',
  bomVersion: '',
  drawAddress: '',
  exeMaterialNumber: '',
  exeMaterialName: '',
  itemMaterialNumber: '',
  itemMaterialName: '',
  mtoNo: '',
  unit: '',
  no: '',
  finishMaterialNumber: '',
  finishMaterialName: '',
};

export function createEmptyRow() {
  return { ...emptyRowTemplate };
}

export function normalizeApiRow(data = {}) {
  const row = createEmptyRow();

  row.itemId = data.itemId ?? data.id ?? '';
  row.bomNo = data.bomNo ?? '';
  row.bomVersion = data.bomVersion ?? '';
  row.drawAddress = data.drawAddress ?? '';
  row.exeMaterialNumber = data.exeMaterialNumber ?? data.itemMaterialNumber ?? '';
  row.exeMaterialName = data.exeMaterialName ?? data.itemMaterialName ?? '';
  row.itemMaterialNumber = data.itemMaterialNumber ?? data.exeMaterialNumber ?? '';
  row.itemMaterialName = data.itemMaterialName ?? data.exeMaterialName ?? '';
  row.mtoNo = data.mtoNo ?? '';
  row.unit = data.unit ?? '';
  row.no = data.no ?? data.executeNo ?? '';
  row.finishMaterialNumber = data.finishMaterialNumber ?? '';
  row.finishMaterialName = data.finishMaterialName ?? '';
  row.drawQty = data.drawQty !== undefined && data.drawQty !== null ? String(data.drawQty) : '';
  row.isQualified = data.isQualified ?? '';
  row.execeptionType = data.execeptionType ?? '';
  row.remark = data.remark ?? '';

  return row;
}

export function normalizeDictOptions(dict, fallback = []) {
  const source = Array.isArray(dict?.list) ? dict.list : Array.isArray(dict) ? dict : [];
  if (!source.length) return fallback;
  return source.map((item) => ({
    label:
      item.label ??
      item.dictValue ??
      item.name ??
      item.value ??
      item.text ??
      item.title ??
      '',
    value: item.value ?? item.dictKey ?? item.key ?? item.code ?? item.id ?? item.dictCode ?? '',
  }));
}

export function resolveDictLabel(options, value) {
  if (value === null || value === undefined || value === '') return '';
  const target = options.find((opt) => String(opt.value) === String(value));
  return target?.label ?? '';
}
