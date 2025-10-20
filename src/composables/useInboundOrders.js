import { computed, ref } from 'vue';
import dayjs from 'dayjs';

const createSeedOrders = () => [
  {
    id: 'RK20241001001',
    inboundNo: 'RK20241001001',
    locatorNo: 'A-01-01',
    createdAt: '2024-10-01 09:12',
    createdBy: '李晓明',
    remark: '首批到货，优先处理',
    items: [
      {
        id: 'ITEM-1',
        bomNo: 'BOM-01-001',
        bomVersion: 'V3.2',
        drawAddress: 'https://example.com/draw/1',
        drawQty: 120,
        exeMaterialNumber: 'MAT-0001',
        exeMaterialName: '电源线组件',
        finishMaterialNumber: 'FIN-9001',
        finishMaterialName: '终端电源线',
        mtoNo: 'MTO-202409-01',
        unit: 'PCS',
        no: 'DC-EXEC-202409-01',
        isQualified: '1',
        execeptionType: '',
        remark: '外观正常',
      },
      {
        id: 'ITEM-2',
        bomNo: 'BOM-02-010',
        bomVersion: 'V1.8',
        drawAddress: 'https://example.com/draw/2',
        drawQty: 60,
        exeMaterialNumber: 'MAT-0002',
        exeMaterialName: '信号线束',
        finishMaterialNumber: 'FIN-9002',
        finishMaterialName: '成品信号线束',
        mtoNo: 'MTO-202409-02',
        unit: 'PCS',
        no: 'DC-EXEC-202409-02',
        isQualified: '0',
        execeptionType: '表面瑕疵',
        remark: '外皮存在划痕',
      },
    ],
  },
  {
    id: 'RK20241002003',
    inboundNo: 'RK20241002003',
    locatorNo: 'B-03-07',
    createdAt: '2024-10-02 14:35',
    createdBy: '王婷婷',
    remark: '常规入库',
    items: [
      {
        id: 'ITEM-3',
        bomNo: 'BOM-08-020',
        bomVersion: 'V2.1',
        drawAddress: 'https://example.com/draw/8',
        drawQty: 45,
        exeMaterialNumber: 'MAT-0010',
        exeMaterialName: '控制线组件',
        finishMaterialNumber: 'FIN-9010',
        finishMaterialName: '控制线成品',
        mtoNo: 'MTO-202410-08',
        unit: 'PCS',
        no: 'DC-EXEC-202410-08',
        isQualified: '1',
        execeptionType: '',
        remark: '尺寸合格',
      },
    ],
  },
];

const ordersRef = ref(createSeedOrders());

const generateOrderId = () => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const randomSuffix = Math.floor(Math.random() * 900 + 100);
  return `RK${timestamp}${randomSuffix}`;
};

const generateItemId = () => `ITEM-${Math.random().toString(36).slice(2, 8)}`;

const decorateOrder = (payload) => {
  const createdAt = payload.createdAt ?? dayjs().format('YYYY-MM-DD HH:mm');
  const inboundNo = payload.inboundNo ?? generateOrderId();
  const id = payload.id ?? inboundNo;
  const items = (payload.items ?? []).map((item) => ({
    ...item,
    id: item.id ?? generateItemId(),
    drawQty: Number(item.drawQty ?? 0),
    isQualified: item.isQualified ?? '1',
    execeptionType: item.execeptionType ?? '',
  }));

  return {
    id,
    inboundNo,
    locatorNo: payload.locatorNo ?? '',
    createdAt,
    createdBy: payload.createdBy ?? '当前用户',
    remark: payload.remark ?? '',
    items,
  };
};

export default function useInboundOrders() {
  const orders = ordersRef;

  const totalCount = computed(() =>
    orders.value.reduce((acc, order) => acc + (order.items?.length ?? 0), 0)
  );

  const addOrder = (payload) => {
    const order = decorateOrder(payload);
    orders.value = [order, ...orders.value];
    return order;
  };

  const getOrderById = (id) => orders.value.find((item) => item.id === id);

  const updateOrder = (id, updater) => {
    orders.value = orders.value.map((order) => {
      if (order.id !== id) return order;
      const next = typeof updater === 'function' ? updater(order) : { ...order, ...updater };
      return decorateOrder({ ...order, ...next, id: order.id, inboundNo: order.inboundNo });
    });
    return orders.value.find((order) => order.id === id);
  };

  return {
    orders,
    totalCount,
    addOrder,
    getOrderById,
    updateOrder,
  };
}
