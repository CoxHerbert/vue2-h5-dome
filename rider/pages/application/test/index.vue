<template>
    <view class="container">
        <u-navbar
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            title="测试"
            z-index="999"
            :background="{ background: '#F7EEE8' }"
            title-color="#333333"
        >
        </u-navbar>
        <view class="a">
            <dc-select-dialog
                v-bind="props1"
                v-model="value"
                @change="
                    (val) => {
                        handleChange('handleChange', val);
                    }
                "
            />
        </view>
    </view>
</template>
<script>
export default {
    data() {
        return {
            value: '',
            props1: {
                objectName: 'user',
                multiple: true,
                returnType: 'string',
            },
        };
    },
    methods: {
        handleChange(action, val) {
            console.log(action, val);
        },
    },
};
</script>
<style lang="scss" scoped></style>
<style></style>
