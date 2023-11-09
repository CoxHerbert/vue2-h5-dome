<template>
    <div class="navigation-container">
        <img class="back" src="@/assets/home/back-icon.png" alt="" srcset="" v-if="backIsShow" />
        <div class="navigation-title">{{ title }}</div>
    </div>
</template>

<script>
export default {
    name: 'navigation',
    props: {
        title: {
            type: String,
            default: '',
        },
        backIsShow: {
            type: Boolean,
            default: true,
        },
    },
};
</script>

<style lang="less" scoped>
.navigation-container {
    position: relative;
    display: flex;
    height: 60px;
    width: 100%;
    border-bottom: 1px solid #ccc;
    .back {
        margin-top: -9px;
        position: absolute;
        top: 50%;
        left: 20px;
        height: 18px;
        width: 18px;
    }
    .navigation-title {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: 400;
        color: #3d3d3d;
    }
}
</style>
