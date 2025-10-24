import { computed, ref } from 'vue';
import dayjs from 'dayjs';

export const INBOUND_STATUS_META = {
  DC_WMS_IN_STATUS_A: { label: '待审核', type: 'warning' },
  DC_WMS_IN_STATUS_C: { label: '已审核', type: 'success' },
};

const resolveStatusMeta = (status) =>
  INBOUND_STATUS_META[status] ?? { label: '已完成', type: 'primary' };

const createSeedOrders = () => [
  {
    id: 'RK20241001001',
    inStockCode: 'RK20241001001',
    inStockStatus: 'DC_WMS_IN_STATUS_C',
    inStockNumber: 'SRC-20241001-01',
    warehouseName: '一号成品仓',
    applicantName: '李晓明',
    processingPersonnelName: '张主管',
    createTime: '2024-10-01 09:12',
    remark: '首批到货，优先处理',
    detailList: [
      {
        id: 'ITEM-1',
        productCode: 'MAT-0001',
        productName: '电源线组件',
        productSpec: '1.5m/国标',
        productQty: 120,
        productUnit: 'PCS',
        locationCode: 'A-01-01',
      },
      {
        id: 'ITEM-2',
        productCode: 'MAT-0002',
        productName: '信号线束',
        productSpec: '8芯/屏蔽',
        productQty: 60,
        productUnit: 'PCS',
        locationCode: 'A-01-01',
      },
    ],
  },
  {
    id: 'RK20241002003',
    inStockCode: 'RK20241002003',
    inStockStatus: 'DC_WMS_IN_STATUS_A',
    inStockNumber: 'SRC-20241002-03',
    warehouseName: '二号原料仓',
    applicantName: '王婷婷',
    processingPersonnelName: '刘主管',
    createTime: '2024-10-02 14:35',
    remark: '常规入库批次',
    detailList: [
      {
        id: 'ITEM-3',
        productCode: 'MAT-0010',
        productName: '控制线组件',
        productSpec: '6芯/2m',
        productQty: 45,
        productUnit: 'PCS',
        locationCode: 'B-03-07',
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
  const createdAt = payload.createTime ?? dayjs().format('YYYY-MM-DD HH:mm');
  const inStockCode = payload.inStockCode ?? generateOrderId();
  const id = payload.id ?? inStockCode;
  const detailList = (payload.detailList ?? []).map((item) => ({
    ...item,
    id: item.id ?? generateItemId(),
    productQty: Number(item.productQty ?? 0),
  }));

  return {
    id,
    inStockCode,
    inStockStatus: payload.inStockStatus ?? 'DC_WMS_IN_STATUS_A',
    inStockNumber: payload.inStockNumber ?? '',
    warehouseName: payload.warehouseName ?? '',
    applicantName: payload.applicantName ?? '当前用户',
    processingPersonnelName: payload.processingPersonnelName ?? '当前用户',
    createTime: createdAt,
    remark: payload.remark ?? '',
    detailList,
  };
};

export default function useInboundOrders() {
  const orders = ordersRef;

  const totalCount = computed(() =>
    orders.value.reduce((acc, order) => acc + (order.detailList?.length ?? 0), 0)
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
      return decorateOrder({ ...order, ...next, id: order.id, inStockCode: order.inStockCode });
    });
    return orders.value.find((order) => order.id === id);
  };

  return {
    orders,
    totalCount,
    addOrder,
    getOrderById,
    updateOrder,
    resolveStatusMeta,
  };
}
