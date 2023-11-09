<template>
    <div class="tabber-warp">
        <div class="warp">
            <div class="itemWarp flex_mid" v-for="(item, index) in tabbarDes" :key="index" @click="getVal(item)">
                <img :src="item.page === $route.path ? item.activeImg : item.normalImg" alt="" />
                <p :class="['font', { color: item.page === $route.path }]">{{ item.txt }}</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            selected: 'index',
            tabbarDes: [
                {
                    txt: '流量充值',
                    page: '/home',
                    normalImg: 'http://xxx.com/ncov/icon/foot/chaxun1.png',
                    activeImg: 'http://xxx.com/ncov/icon/foot/chaxun2.png',
                },
                {
                    txt: '待授权',
                    page: '/apply',
                    normalImg: 'http://xxx.com/ncov/icon/foot/quanbu1.png',
                    activeImg: 'http://xxx.com/ncov/icon/foot/quanbu2.png',
                },
                {
                    txt: '个人中心',
                    page: '/mine',
                    normalImg: 'http://xxx.com/ncov/icon/foot/fankui1.png',
                    activeImg: 'http://xxx.com/ncov/icon/foot/fankui2.png',
                },
            ],
        };
    },
    methods: {
        getVal(res) {
            console.log(this.$route.path);
            this.selected = res.page;
            this.$router.push(res.page);
        },
    },
};
</script>
<style lang="less">
.warp {
    width: 100%;
    border-top: 1px solid #eee;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-around;
    color: #0c0c0c;

    .itemWarp {
        text-align: center;
        .font {
            font-size: 12px;
            &.color {
                color: #6076ff;
            }
        }
    }
}
.warp img {
    width: 20px;
    height: 20px;
}
.tabber-warp img {
    margin-top: 10px;
    margin-bottom: 5px;
}
.tabber-warp {
    width: 100%;
    height: 80px;
    padding-bottom: 5px;
    background: #fff;
    box-shadow: 0px -1px 5px -1px rgba(50, 50, 93, 0.25);
}
</style>
