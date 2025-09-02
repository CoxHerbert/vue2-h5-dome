<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="异常明细记录"
            :background="{ background: '#F7E9DF' }"
            title-color="#333333"
        >
        </u-navbar>
        <view class="page-body" v-if="noticeList.length">
            <view class="row header" :class="noticeCodetype == '领料单编号' ? 'colum4' : 'colum3'">
                <div class="span">专案号</div>
                <div class="span noticeCode">{{ noticeCodetype }}</div>
                <div class="span" v-if="noticeCodetype == '领料单编号'">领料人</div>
                <div class="span" style="line-height: 30rpx">
                    {{ noticeCodetype == '物料编码' ? '结构图纸-当前计划' : '超时时间(H)' }}
                </div>
            </view>
            <view
                class="row table-row"
                v-for="(item, index) in noticeList"
                :key="index"
                :class="noticeCodetype == '领料单编号' ? 'colum4' : 'colum3'"
            >
                <div class="span">{{ item.mtono }}</div>
                <div class="span noticeCode">{{ item.noticeCode }}</div>
                <div class="span" v-if="noticeCodetype == '领料单编号'">{{ item.pickingPerson }}</div>
                <div class="span">{{ item.delayTimeInSeconds }}</div>
            </view>
        </view>
    </view>
</template>

<script>
import { needHideTitleBar } from '@/utils/utils'
export default {
    data() {
        return {
            showTitleBar: true,
            noticeCodetype: '物料编码',
            noticeList: [],
            title: '',
        };
    },
    onLoad(option) {
        this.showTitleBar = !needHideTitleBar();
        //option.notice_type = '1881241440274587649';
        if (option.notice_type) {
            this.getData(option.notice_type);
        }
    },
    methods: {
        async getData(noticeType) {
            uni.showLoading({
                title: '加载中...',
                mask: true, // 是否显示透明蒙层，防止触摸穿透
            });
            const res = await this.$u.api.noticeDetail({
                notice_type: noticeType,
            });
            if (res.code == 200) {
                this.noticeCodetype = res.data.notice_code_type;
                this.noticeList = res.data.expNotices.map((item) => {
                    return {
                        ...item,
                        delayTimeInSeconds: parseFloat(item.delayTimeInSeconds / 3600).toFixed(2),
                    };
                });
                uni.setNavigationBarTitle({
                    title: res.data.title, // 设置页面标题为'页面标题'
                });
                this.title = res.data.title;
                uni.hideLoading();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;

    .page-body {
        padding: 10rpx 10rpx;
        box-sizing: border-box;
        margin-top: 10rpx;
        overflow-x: scroll;

        .row {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            height: 72rpx;
            line-height: 72rpx;

            .span {
                text-align: center;
            }
        }
        .colum4 {
            .span {
                width: 20% !important;
            }
            .noticeCode {
                width: 40% !important;
            }
        }
        .colum3 {
            .span {
                font-size: 28rpx;
                width: 33.33% !important;
            }
        }

        .header {
            background: #f7f6f5;
            border: 2rpx solid #e1e2e5;
            color: #666666;
        }

        .table-row {
            color: #333333;
            border-bottom: 0.5rpx solid #dedbd9;
        }
    }
}
</style>
