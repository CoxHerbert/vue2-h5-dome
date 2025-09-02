<template>
    <view class="container">
        <u-navbar
            v-if="showTitleBar"
            :is-fixed="true"
            :border-bottom="false"
            back-icon-name="arrow-leftward"
            :title="$LT('titleMain')"
            :background="{ background: '#F7E9DF' }"
            title-color="#333333"
        >
        </u-navbar>
        <dc-lang :showTitleBar="showTitleBar"></dc-lang>
        <!-- <view class="lang-box" :class="{
            'hide-mode': !showTitleBar
        }" @click="chooseLang">
            {{ langLabel }}<view class="icon-bottom"></view>
        </view> -->
        <u-form labelPosition="left" :model="form" ref="uForm">
            <!-- {{ 个人信息 }} -->
            <view class="form-wrapper">
                <u-form-item
                    class="group-item"
                    :label="$LT('personalInfo')"
                    label-width="600"
                    :labelStyle="{ fontWeight: 'bold', fontSize: '30rpx' }"
                ></u-form-item>
                <u-form-item :label="$LT('IDPhoto')" prop="deptName" :label-width="labelWidth || 160">
                    <view slot="right" class="avator" @click="chooseAndUploadImage('avatarId')">
                        <image v-if="form.avatarId" :src="form.avatarId" class="avatarId-image" mode="aspectFill">
                        </image>
                        <image v-else src="@/static/images/mravator.png" class="avatarId-image" mode="aspectFill">
                        </image>
                        <u-icon name="arrow-right"></u-icon>
                    </view>
                    
                <text class="notice">{{$LT('IDPhotoNotice')}}</text>
                </u-form-item>
                <u-form-item :label="$LT('fullName')" prop="name" :label-width="labelWidth || 160">
                    <u-input v-model="form.name" inputAlign="right" :disabled="readonly" :placeholder="$LT('InputPlaceholder')" />
                </u-form-item>
                <u-form-item :label="$LT('age')" prop="age" :label-width="labelWidth || 160">
                    <u-input
                        v-model="form.age"
                        inputAlign="right"
                        :disabled="readonly"
                        :placeholder="$LT('InputPlaceholder')" 
                        type="number"
                    />
                </u-form-item>
                <u-form-item :label="$LT('IDNumber')" prop="cardNo" :label-width="labelWidth || 160">
                    <u-input
                        v-model="form.cardNo"
                        inputAlign="right"
                        :disabled="readonly"
                        :placeholder="$LT('InputPlaceholder')"
                    />
                </u-form-item>
                <u-form-item :label="$LT('frontOfIDCard')" prop="idCardFront" :label-width="360">
                      <view slot="right" class="avator" @click="chooseAndUploadImage('idCardFront')">
                        <image v-if="form.idCardFront" :src="form.idCardFront" class="avatarId-image" mode="aspectFill">
                        </image>
                        <image v-else src="@/static/images/sfz/sfzzm.svg" class="avatarId-image" mode="aspectFill">
                        </image>
                        <u-icon name="arrow-right"></u-icon>
                    </view>
                </u-form-item>
                <u-form-item :label="$LT('backOfIDCard')" prop="idCardBack" :label-width="360">
                      <view slot="right" class="avator" @click="chooseAndUploadImage('idCardBack')">
                        <image v-if="form.idCardBack" :src="form.idCardBack" class="avatarId-image" mode="aspectFill">
                        </image>
                        <image v-else src="@/static/images/sfz/sfzfm.svg" class="avatarId-image" mode="aspectFill">
                        </image>
                        <u-icon name="arrow-right"></u-icon>
                    </view>
                </u-form-item>
                <u-form-item :label="$LT('contactNumber')" prop="mobile" :label-width="260">
                    <u-input
                        v-model="form.mobile"
                        inputAlign="right"
                        :disabled="readonly"
                        :placeholder="$LT('InputPlaceholder')"
                        type="number"
                    />
                </u-form-item>

                <u-form-item :label="$LT('nationality')" prop="nation" :label-width="labelWidth || 160">
                    <u-input
                        v-if="!readonly"
                        v-model="form.nation"
                        @click="() => (nationShow = true)"
                        type="select"
                        inputAlign="right"
                        :placeholder="$LT('selectPlaceholder')"
                    />
                    <u-input v-else v-model="form.nation" inputAlign="right" :disabled="readonly" />
                </u-form-item>
                <u-form-item :label="$LT('nativePlace')" prop="address" :label-width="labelWidth || 160">
                    <u-input v-model="form.address" inputAlign="right" :disabled="readonly" :placeholder="$LT('InputPlaceholder')" />
                </u-form-item>
                <u-form-item :label="$LT('degreeOfEducation')" prop="education" :label-width="260">
                    <u-input
                        v-if="!readonly"
                        v-model="form.education"
                        :placeholder="$LT('selectPlaceholder')"
                        type="select"
                        inputAlign="right"
                        :disabled="readonly"
                        @click="() => (educationShow = true)"
                    />
                    <u-input v-else v-model="form.education" inputAlign="right" :disabled="readonly" />
                </u-form-item>
                <u-form-item :label="$LT('graduationSchool')" prop="graduateSchool" :label-width="260">
                    <u-input
                        v-model="form.graduateSchool"
                        inputAlign="right"
                        :disabled="readonly"
                        :placeholder="$LT('InputPlaceholder')"
                    />
                </u-form-item>

                <u-form-item :label="$LT('passportNo')" prop="passportNumber" :label-width="260">
                    <u-input
                        v-model="form.passportNumber"
                        inputAlign="right"
                        :disabled="readonly"
                        :placeholder="$LT('InputPlaceholder')"
                    />
                </u-form-item>
            </view>

            <view class="form-wrapper">
                <u-form-item
                    :label="$LT('WorkInformation')"
                    label-width="500"
                    :labelStyle="{ fontWeight: 'bold', fontSize: '30rpx' }"
                ></u-form-item>
                <u-form-item :label="$LT('ExternalAssistanceCompany')" prop="companyDict" :label-width="360">
                    <u-input
                        v-if="!readonly"
                        v-model="form.companyDict"
                        inputAlign="right"
                        :placeholder="$LT('selectPlaceholder')"
                        type="select"
                        @click="() => ((companyShow = true), getLaborCompanyList())"
                    />
                    <u-input v-else v-model="form.companyDict" inputAlign="right" :disabled="readonly" />
                </u-form-item>
                <u-form-item :label="$LT('post')" prop="positionDict" :label-width="labelWidth || 160">
                    <u-input
                        v-if="!readonly"
                        v-model="form.positionDict"
                        inputAlign="right"
                         :placeholder="$LT('selectPlaceholder')"
                        type="select"
                        @click="() => (positionShow = true)"
                    />
                    <u-input v-else v-model="form.positionDict" inputAlign="right" :disabled="readonly" />
                </u-form-item>
                <u-form-item :label="$LT('workingSeniority')" prop="workYear" :label-width="360">
                    <u-input
                        v-if="!readonly"
                        v-model="form.workYear"
                        inputAlign="right"
                         :placeholder="$LT('selectPlaceholder')"
                        type="select"
                        @click="() => (workYearShow = true)"
                    />
                    <u-input v-else v-model="form.workYear" inputAlign="right" :disabled="readonly" />
                </u-form-item>
                <u-form-item :label="$LT('isAccommodationAvailable')" prop="isAccommodation" :label-width="360">
                    <u-input
                        v-if="!readonly"
                        v-model="form.isAccommodation"
                        inputAlign="right"
                        :placeholder="$LT('selectPlaceholder')"
                        type="select"
                        @click="() => (isAccommodationShow = true)"
                    />
                    <u-input v-else v-model="form.isAccommodation" inputAlign="right" :disabled="readonly" />
                </u-form-item>
            </view>
        </u-form>

        <view class="btn-bottom" v-if="type != 'look'">
            <u-button
                :loading="loading"
                :text="$LT('submit')"
                shape="circle"
                @click="onSubmit"
                :customStyle="{ backgroundColor: '#F78431', color: '#fff', marginTop: '10rpx' }"
                >{{$LT('submit')}}</u-button
            >
        </view>
        <!-- 民族 -->
        <u-select
            v-model="nationShow"
            :list="nationList"
            value-name="label"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'nation')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>
        <!-- 学历 -->
        <u-select
            v-model="educationShow"
            :list="educationList"
            value-name="label"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'education')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>

        <!-- 工作年限 -->
        <u-select
            v-model="workYearShow"
            :list="workYearList"
            value-name="label"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'workYear')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>

        <!-- 岗位 -->
        <u-select
            v-model="positionShow"
            :list="positionDictList"
            value-name="value"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'jobGradeDictCode')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>

        <!-- 公司列表 -->
        <u-select
            v-model="companyShow"
            :list="laborCompanyList"
            value-name="value"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'companyId')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>

        <!-- 是否住宿 -->
        <u-select
            v-model="isAccommodationShow"
            :list="isAccommodationList"
            value-name="label"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'isAccommodation')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>

        <!-- 语言选择 -->
        <u-select
            v-model="isLangSelectShow"
            :list="langSelectList"
            value-name="value"
            label-name="label"
            @confirm="(e) => onConfirm(e, 'isLangSelectShow')"
            confirm-color="rgb(247, 132, 49)"
            safe-area-inset-bottom
        ></u-select>
    </view>
</template>
<script>
import { famousClan, educationLevels, workYearList, isstayList } from '@/utils/dictData';
import { selfloginFormVerification } from '@/utils/formVerification';
import { uplpadUrl } from '@/common/setting';
import { getlabelByValue, needHideTitleBar } from '@/utils/utils';
import { mapMutations } from 'vuex';

import store from '@/store/';
import getLangLabel from '../../i18n';

import dcLang from '@/components/dc/dc-lang/index.vue'

export default {
    components: {
        dcLang
    },
    data() {
        return {
            // lang: 'cn',
            isLangSelectShow: false,
            langSelectList: [
               {
                    label: '中文',
                    value: 'cn',
               },
               {
                    label: 'Tiếng Việt',
                    value: 'vn',
               },
            ],
            showTitleBar: true,
            // 外协公司
            companyShow: false,
            laborCompanyList: [],
            loading: false,
            // 学历
            educationList: educationLevels,
            educationShow: false,
            // 民族
            nationList: famousClan,
            nationShow: false,
            // 工作年限
            workYearList: workYearList,
            workYearShow: false,
            // 是否住宿
            isAccommodationList: isstayList,
            isAccommodationShow: false,

            form: {
                avatarId: '',
                // address: '安徽阜阳',
                // age: '29',
                // avatarId: 'https://static.eastwinbip.com/bip2-dev/upload/20250118/b4c3e4946c3116d33e0374882436a0d6.png',
                // cardNo: '34122619950323417X',
                // education: '本科',
                // graduateSchool: '湖南电子科技技术学院',
                // isAccommodation: '是',
                // mobile: '15551416301',
                // name: '李厚安',
                // nation: '汉族',
                // positionDictCode: 0,
                // workYear: '5-10年',
            },
            readonly: false, // 查看时控制表单只读
            labelWidth: 160, //form表单lable宽度， 默认160，单位rpx
            categoryShow: false,
            categoryList: [
                {
                    label: '12',
                    value: '123',
                },
            ],
            userInfo: uni.getStorageSync('userInfo') || this.$store.state.userInfo,
            userId: '',
            // 岗位字典
            positionDictList: [],
            positionShow: false,
            type: '',
        };
    },
    onLoad(options) {
        // console.log('this.$store.state.loginInfo', this.$store.state.loginInfo.lang);
        if(!this.$store.state.loginInfo.lang) {
            this.SET_LANG({
                lang: 'cn'
            })
        }
        this.type = options.type;
        if (options.type == 'look') {
            this.readonly = true;
        }
        if (options.type == 'look' || options.type == 'edit' || options.type == 'reApply') {
            this.getlaborRegisterDetail();
        }

        // uni.showModal({
        // 	title: '提示',
        // 	content: '该人员目前在职，不可提交身份信息',
        // 	confirmColor: '#fff',
        // 	success: function(res) {
        // 		if (res.confirm) {
        // 			console.log('用户点击确定');
        // 		} else if (res.cancel) {
        // 			console.log('用户点击取消');
        // 		}
        // 	},
        // });
    },

    created() {
        this.showTitleBar = !needHideTitleBar();
        this.getDictionary();
        this.getLaborCompanyList();
    },

    mounted() {
        this.$route.query.type = this.type;
        store.dispatch('getUserInfo');
    },
    computed: {
        lang() {
            return this.$store.state.loginInfo.lang
        }
    },
    methods: {
        ...mapMutations(['LOGIN_USERINFO']),

        $LT(key){
            return getLangLabel('selfLogin', key, this.lang);
        },
        getLaborCompanyList() {
            return new Promise((resolve, reject) => {
                this.$u.api
                    .laborCompanyList({
                        current: 1,
                        size: 100000,
                    })
                    .then((res) => {
                        if (res.code == 200) {
                            this.laborCompanyList = res.data.records.map((item) => {
                                return {
                                    label: item.name,
                                    value: item.id,
                                };
                            });
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    });
            });
        },
        // 获取职位字典
        getDictionary() {
            this.$u.api
                .dictionary({
                    code: 'DC_LABOR_POSITION',
                })
                .then((res) => {
                    if (res.code == 200) {
                        this.positionDictList = res.data.map((item) => {
                            return {
                                label: item.dictValue,
                                value: item.dictKey,
                            };
                        });
                    }
                });
        },

        // 暂存用户id
        userCreateFn() {
            if (this.userInfo.user_id == 'null') {
                this.$u.api
                    .userCreate({
                        oauthId: this.userInfo.oauth_id,
                    })
                    .then((res) => {
                        if (res.code == 200) {
                            this.LOGIN_USERINFO(res.data);
                            this.userInfo = obj;
                            console.log(res.userInfo);
                        }
                    });
            }
        },

        chooseLang() {
            this.isLangSelectShow = true;    
        },

        // 类型回调
        onConfirm(e, type) {
            this.$set(this.form, type, e[0].value);
            if (type == 'jobGradeDictCode') {
                this.$set(this.form, 'positionDict', e[0].label);
            } else if (type == 'companyId') {
                this.$set(this.form, 'companyDict', e[0].label);
            } 
            // else if(type === 'isLangSelectShow') {
            //     this.SET_LANG({
            //         lang: e[0].value
            //     })
            //     // this.$set(this, 'lang', e[0].value );
            // }
        },

        // 表单提交
        async onSubmit() {
            let form = await selfloginFormVerification(this.form);
            if (form == 200) {
                this.loading = true;
                let data = Object.assign(this.form, {
                    oauthId: uni.getStorageSync('loginInfo').oauth_id,
                    userId: uni.getStorageSync('loginInfo').user_id,
                    applyStatus: '待初试',
                    preliminaryConclusion: '',
                    preliminaryDescription: '',
                    finalConclusion: '',
                    finalDescription: '',
                });
                if (data.id) {
                    this.$u.api
                        .updatelaborRegister(data)
                        .then((res) => {
                            this.loading = false;
                            if (res.code == 200) {
                                uni.showToast({
                                    title: this.$LT('submittedSuccessfully'),
                                    icon: 'none',
                                });
                                setTimeout(() => {
                                    uni.redirectTo({
                                        url: '/pages/home/auditResult',
                                    });
                                }, 1000);
                            }
                        })
                        .catch((e) => {
                            this.loading = false;
                        });
                } else {
                    this.$u.api.laborRegister(data).then((res) => {
                        if (res.code == 200) {
                            uni.showToast({
                                title: this.$LT('submittedSuccessfully'),
                                icon: 'none',
                            });
                            setTimeout(() => {
                                uni.redirectTo({
                                    url: '/pages/home/registSuccess',
                                });
                            }, 1000);
                        }
                        this.loading = false;
                    });
                }
            }
        },
        chooseAndUploadImage(key = 'avatarId') {
            if (this.type == 'look') {
                return false;
            }
            let accessToken = uni.getStorageSync('accessToken');
            // 选择图片
            uni.chooseImage({
                count: 1, // 默认9，设置图片的数量
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: (chooseImageRes) => {
                    uni.showLoading({
                        title:  this.$LT('uploading'),
                        mask: true, // 是否显示透明蒙层，防止触摸穿透
                    });
                    const tempFilePaths = chooseImageRes.tempFilePaths;
                    const uploadTask = uni.uploadFile({
                        url: uplpadUrl, // 服务器上传接口地址
                        filePath: tempFilePaths[0],
                        name: 'file', // 必须填写，后台用来接收文件
                        formData: {},
                        header: {
                            authorization: 'Basic cmlkZXI6cmlkZXJfc2VjcmV0',
                            'blade-Requested-With': 'BladeHttpRequest',
                            'blade-Auth': 'bearer ' + accessToken,
                        },
                        success: (res) => {
                            let data = JSON.parse(res.data);
                            if (data.code == 200) {
                                const match = data.data.link.match(/\/\d{6}\-/);
                                let sublink = data.data.link.substring(match.index);
                                // let sublink = data.data.link.substring(data.data.link.indexOf('bip2'));
                                let devAvatarId = 'https://static.eastwinbip.com' + sublink;
                                this.$set(this.form, key,  process.env.NODE_ENV === 'development' ? devAvatarId : data.data.link);
                                
                                uni.hideLoading();
                            }
                        },
                        fail: (uploadFileErr) => {
                            console.error('图片上传失败', uploadFileErr);
                            uni.hideLoading();
                        },
                    });
                    // 监听上传进度变化
                    uploadTask.onProgressUpdate((res) => {
                        console.log('上传进度' + res.progress + '%');
                    });
                },
                fail: (chooseImageErr) => {
                    uni.hideLoading();
                    console.error('选择图片失败', chooseImageErr);
                },
            });
        },

        // 获取用户的登记信息
        getlaborRegisterDetail() {
            this.$u.api
                .laborRegisterDetail({
                    createUser: uni.getStorageSync('loginInfo').user_id,
                })
                .then(async (res) => {
                    if (res.code == 200) {
                        this.form = res.data;
                        let positionDict = await getlabelByValue('DC_LABOR_POSITION', res.data.jobGradeDictCode);
                        if (this.type == 'reApply') {
                            this.form.id = null;
                        }
                        this.$set(this.form, 'positionDict', positionDict);
                        let getList = await this.getLaborCompanyList();
                        if (getList) {
                            let companyDict = this.laborCompanyList.find(
                                (item) => item.value == this.form.companyId
                            ).label;
                            this.$set(this.form, 'companyDict', companyDict);
                        }
                    }
                });
        },
    },
};
</script>
<style>
page {
    background: #f7f7f7;
}
</style>
<style lang="scss" scoped>
.container {
    position: relative;
    padding: 10rpx 28rpx 200rpx;
    box-sizing: border-box;
    background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 28%);
    .group-item {
        ::deep.u-form-item--left {
            border: 1px solid red;
            width: 100%!important;
        }
        ::v-deep.u-form-item--right {
            display: none;
        }
    }
    .lang-box {
        align-items: center;
        display: flex;
        flex-flow: row nowrap;
        padding: 0 8px;
        height: 32px;
        border-radius: 4px;
        line-height: 30px;
        border: 1px solid #ccc;
        position: fixed;
        right: 16px;
        top: 6px;
        z-index: 981;

        &.hide-mode {
            position: absolute;
        }

        .icon-bottom {
            margin-left: 6px;
            transform: rotate(45deg);
            width: 8px;
            border: 1px solid #666;
            height: 8px;
            border-top-color: transparent;
            border-left-color: transparent;
        }
    }
    .notice {
        font-size: 12px;
        color: #666;
    }

    .form-wrapper {
        background-color: #fff;
        padding: 0px 24rpx;
        box-sizing: border-box;
        border-radius: 4px 4px 4px 4px;
        margin-bottom: 24rpx;

        .title {
            font-weight: bold;
            font-size: 15px;
            color: #333333;
            border-bottom: 1rpx solid #e4e7ed;
            height: 96rpx;
            line-height: 96rpx;
        }

        .avatarId-image {
            width: 32px;
            height: 32px;
            border-radius: 8px 8px 8px 8px;
        }

        .avator {
            display: flex;
            align-items: center;

            image {
                margin-right: 10rpx;
            }
        }
    }

    .btn-bottom {
        width: 100%;
        background-color: #fff;
        position: absolute;
        bottom: 0px;
        z-index: 9;
        left: 0px;
        padding: 24rpx;
        box-sizing: border-box;
        border-top: 1px solid #fff;
    }
}
</style>
