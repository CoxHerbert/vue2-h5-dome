<template>
  <basic-container>
    <div class="content-warp">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="resetQuery"
          @search="handleQuery"
        ></dc-search>
        <!-- <div class="title">
          <el-tabs v-model="applyStatus" @tab-click="handleClick">
            <el-tab-pane
              :label="item.label"
              :name="item.value"
              v-for="(item, index) in statusList"
              :key="index"
            ></el-tab-pane>
          </el-tabs>
        </div>
        <div class="search-area">
        
        </div> -->
      </div>
      <div class="toolbar">
        <el-button
          type="primary"
          icon="el-icon-plus"
          v-permission="{ id: 'SALE_ORDER_ADD' }"
          @click="handleAddEdite"
          >新增销售订单
        </el-button>
      </div>

      <!-- <div class="search">
        <div class="search-left">
          <el-form :model="queryParams" ref="queryRef" :inline="true" @keyup.enter="handleQuery">
            <el-form-item label="单据编号" prop="no">
              <el-input
                type="text"
                v-model="queryParams.no"
                placeholder="请输入单据编号"
              ></el-input>
            </el-form-item>

            <el-form-item label="专案号" prop="mtono">
              <el-input
                type="text"
                v-model="queryParams.mtono"
                placeholder="请输入专案号"
              ></el-input>
            </el-form-item>

            <el-form-item label="单据类型" prop="billtypeDict">
              <el-select v-model="queryParams.billtypeDict" placeholder="请选择采购类型" clearable>
                <el-option
                  v-for="(item, index) in DC_SALE_ORDER_TYPE"
                  :key="index"
                  :value="item.dictKey"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="预计验收日期" prop="acceptanceDate">
              <el-date-picker
                style="width: 100%"
                v-model="queryParams.acceptanceDate"
                type="date"
                placeholder="请选择采购日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                @click.stop
              />
            </el-form-item>

            <el-form-item label="销售员" prop="purchaserId">
              <dc-select-user
                v-model="queryParams.salespersonId"
                placeholder="请选择销售员"
                :multiple="false"
                :multiple-limit="0"
              />
            </el-form-item>

            <el-form-item label="客户" prop="customerId">
              <dc-select-dialog
                v-model="queryParams.customerId"
                placeholder="请选择客户"
                objectName="customer"
                type="input"
                :multiple="false"
                :multiple-limit="1"
                :clearable="true"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="search-right">
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div> -->
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-dblclick="lookReport">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="组织" align="center" prop="orgId">
            <template #default="scoped">
              <dc-dict type="text" :options="SCMORG_LIST_CACHE" :value="scoped.row.orgId" />
            </template>
          </el-table-column>
          <el-table-column
            label="单据编号"
            prop="no"
            width="110"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column
            label="专案号"
            prop="mtono"
            width="110"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>

          <el-table-column label="单据类型" align="center" prop="billtypeDict" width="100">
            <template #default="scoped">
              <dc-dict-key
                type="text"
                color="#666"
                :options="DC_SALE_ORDER_TYPE"
                :value="scoped.row.billtypeDict"
              />
            </template>
          </el-table-column>

          <el-table-column label="销售员" align="center" prop="salespersonId">
            <template #default="scoped">
              <dc-view v-model="scoped.row.salespersonId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column
            label="客户"
            width="260"
            align="center"
            prop="customerId"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span class="line-one">
                <dc-view v-model="scoped.row.customerId" objectName="customer" showKey="realName" />
              </span>
            </template>
          </el-table-column>
          <el-table-column label="增值税率(%)" align="center" prop="taxRate"> </el-table-column>
          <el-table-column label="币种" align="center" prop="currency">
            <template #default="scoped">
              <dc-dict-key
                color="#666"
                type="text"
                :options="DC_FINANCE_CURRENCY"
                :value="scoped.row.currency"
              />
            </template>
          </el-table-column>
          <el-table-column label="预计验收日期" width="110" align="center" prop="acceptanceDate">
            <template #default="scoped">
              {{ scoped.row.acceptanceDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="预计开票日期" width="110" align="center" prop="billingDate">
            <template #default="scoped">
              {{ scoped.row.billingDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="审批状态" align="center" prop="currentTask"> </el-table-column>
          <el-table-column label="流程状态" align="center" prop="processStatus" width="100">
            <template #default="scoped">
              <div
                class="status"
                :class="
                  scoped.row.processStatus == '开立'
                    ? 'pendApproval'
                    : scoped.row.processStatus == '审批中'
                    ? 'inApproval'
                    : scoped.row.processStatus == '审批结束'
                    ? 'finished'
                    : 'red'
                "
              >
                {{ scoped.row.processStatus }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                v-permission="{ id: 'SALE_ORDER_DETAIL', row: scoped.row }"
                @click="lookReport(scoped.row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                @click="handleAddEdite(scoped.row)"
                v-if="scoped.row.processStatus == '开立' && scoped.row.createUser == userId"
                v-permission="{ id: 'SALE_ORDER_EDIT', row: scoped.row }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                v-if="scoped.row.processStatus == '开立' && scoped.row.createUser == userId"
                v-permission="{ id: 'SALE_ORDER_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
const store = useStore();
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  statusList: [
    {
      label: '全部',
      value: '全部',
    },
    {
      label: '未审核',
      value: '审批中',
    },
    {
      label: '已审核',
      value: '审批结束',
    },
  ],
  applyStatus: '全部',
  userId: store.getters.userInfo.user_id,
});

const { queryParams, dataList, loading, total, statusList, applyStatus, userId } = toRefs(data);
// 数据字典
const { SCMORG_LIST_CACHE, DC_FINANCE_CURRENCY, DC_SALE_ORDER_TYPE } = proxy.useCache([
  { key: 'SCMORG_LIST_CACHE' },
  { key: 'DC_FINANCE_CURRENCY' },
  { key: 'DC_SALE_ORDER_TYPE' },
]);

const searchConfig = computed(() => {
  return {
    resetExcludeKeys: ['page', 'current', 'processStatus'],
    tabConfig: {
      prop: 'processStatus',
      items: statusList.value,
    },
    searchItemConfig: {
      paramType: {
        no: {
          paramKey: 'no',
          type: 'input',
          label: '单据编号',
        },
        mtono: {
          paramKey: 'mtono',
          type: 'input',
          label: '专案号',
        },
        billtypeDict: {
          paramKey: 'billtypeDict',
          type: 'select',
          labelKey: 'label',
          valueKey: 'dictKey',
          label: '单据类型',
          options: DC_SALE_ORDER_TYPE.value,
        },
        acceptanceDate: {
          paramKey: 'acceptanceDate',
          type: 'el-date-picker',
          label: '预计验收日期',
          props: {
            placeholder: '请选择预计验收日期',
            format: 'YYYY/MM/DD',
            valueFormat: 'YYYY-MM-DD',
          },
        },
        purchaserId: {
          paramKey: 'purchaserId',
          type: 'dc-select-user',
          label: '销售员',
          props: {
            placeholder: '请选择销售员',
            objectName: 'user',
            returnType: 'string',
            multiple: false,
            multipleLimit: 1,
          },
        },
        customerId: {
          paramKey: 'customerId',
          type: 'dc-select-dialog',
          label: '客户',
          props: {
            placeholder: '请选择客户',
            objectName: 'customer',
            returnType: 'string',
            multiple: false,
            multipleLimit: 1,
          },
        },
      },
    },
  };
});

onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  console.log(e.props.name);
  applyStatus.value = e.props.name;
  queryParams.value = {
    current: 1,
    size: 10,
    processStatus: e.props.name == '全部' ? null : e.props.name,
  };
  nextTick(() => {
    getData();
  });
};

// 添加修改
const handleAddEdite = row => {
  router.push({
    path: '/scm/saleMng/saleOrder/addorEdite',
    query: {
      id: row.id,
    },
  });
};

// 详情
const lookReport = row => {
  router.push({
    path: '/scm/saleMng/saleOrder/addorEdite',
    query: {
      id: row.id,
      type: 'look',
    },
  });
};

// 删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将 [${ids}] 数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      return Api.scm.saleOrder.remove(ids);
    })
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
      getData();
    });
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  // dataparam.createUser = userId.value;
  const res = await Api.scm.saleOrder.getList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style scoped lang="scss">
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

.line-one {
  width: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 10px;
      // height: 50px;
      // display: flex;
      // align-items: center;
      // margin-bottom: 20px;
    }
    .toolbar {
      padding: 10px 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}

:deep(.el-tabs__nav-wrap):after {
  height: 0px !important;
}

:deep(.el-tabs__item) {
  height: 52px !important;
}
</style>
