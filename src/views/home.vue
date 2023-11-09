<template>
    <div class="content">
        <div class="tabs-container">
            <ul class="tab-list">
                <li class="tab-item" v-for="(tab, index) in tabList" :key="index">
                    {{ tab.text }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
// import swiper from 'swiper';
export default {
    data() {
        return {
            tabList: [
                {
                    text: '全部',
                    id: '',
                },
                {
                    text: '上架1',
                    id: '',
                },
                {
                    text: '上架2',
                    id: '',
                },
                {
                    text: '上架3',
                    id: '',
                },
                {
                    text: '上架4',
                    id: '',
                },
                {
                    text: '上架5',
                    id: '',
                },
                {
                    text: '上架6',
                    id: '',
                },
            ],
        };
    },
    components: {},
    created() {},
    beforeDestroy() {},
    methods: {},
};
</script>

<style lang="less" scoped>
.tabs-container {
    overflow-x: auto;
}
.tab-list {
    display: flex;

    .tab-item {
        padding: 0 20px;
        height: 30px;
        background: #eaeaea;
        border-radius: 6px 6px 6px 6px;
        &.active {
            background: #687af7;
        }
    }
}
</style>
