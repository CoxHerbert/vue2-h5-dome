<template>
    <div id="app">
        <transition>
            <router-view />
        </transition>
    </div>
</template>

<style lang="less" scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>