<template>
    <div class="page">
        <navigation :title="title"></navigation>
        <transition>
            <mine></mine>
        </transition>
        <tabber></tabber>
    </div>
</template>

<script>
import navigation from '@/components/home/navigation';
import tabber from '@/components/home/tabber';
import mine from './mine';
export default {
    data() {
        return {
            dataList: [],
            date: null,
            timer: null,
        };
    },
    components: {
        navigation,
        tabber,
        mine,
    },
    computed: {
        title() {
            return this.$route.meta.title;
        },
    },
    created() {},
    beforeDestroy() {},
    methods: {},
};
</script>

<style lang="less" scoped>
.page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
}
</style>
