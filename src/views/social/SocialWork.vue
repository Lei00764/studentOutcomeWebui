<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">{{ societyId === -1 ? "填报" : "修改" }}社会服务记录</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报社会服务信息。
        </div>
        <el-form :model="socialWork" label-width="120px" status-icon>

            <el-form-item label="社会服务名称" style="width: 500px" prop="name">
                <el-input v-model="socialWork.social_name" />
            </el-form-item>

            <el-form-item label="日期选择器" prop="time">

                <el-date-picker v-model="socialWork.participate_time" type="date" placeholder="请选择日期" />

            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="socialWork.duration_day" placeholder="天数"  clearable style="margin-right: 10px;"/> 天
                <el-input v-model="socialWork.duration_hour" placeholder="小时" clearable style="margin-right: 10px;margin-left: 10px"/>小时
            </el-form-item>

            <el-form-item label="社会服务类型" prop="socialType">
                <el-select v-model="socialWork.social_type" placeholder="请选择社会服务类型">
                    <el-option v-for="type in societyTypes" :label="type.type_name" :value="type.id" :key="type.id"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="详细描述" prop="socialDetails">
                <el-input v-model="socialWork.social_detail" type="textarea" :rows="4" placeholder="请输入详细描述"></el-input>
            </el-form-item>

            <el-form-item label="佐证材料" prop="evidence">
                <certificate-upload
                    ref="certificateUpload"
                    @image-changed="onCertImgChanged"
                    v-model:cert-url="socialWork.evidence"
                    record-type="society"
                    :record-id="societyId"
                />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit" plain class="submit-button-create">{{ societyId === -1 ? "创建" : "保存" }}</el-button>
                <el-button type="primary" @click="onSubmitToReview" plain class="submit-button-create"
                           v-if="societyId !== -1 && verify_status=== 0 || verify_status=== 3">提交审核</el-button>
                <el-button type="primary" @click="onWithdrawReview" plain class="submit-button-create"
                           v-if="societyId !== -1 && verify_status=== 2 || verify_status=== 1 ">撤回修改</el-button>
                <el-button class="submit-button-cancel" @click="onCancel">返回</el-button>
            </el-form-item>


        </el-form>


        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in operationLogs" :key="index" :timestamp="activity.operation_time">
                {{ activity.operation_text }}
            </el-timeline-item>
        </el-timeline>
    </div>
</template>


<script>
import api from '@/api/socialWork';
import router from "@/router";
import CertificateUpload from "@/components/CertificateUpload.vue";
import {ElMessage} from "element-plus";
import {nextTick} from "vue";
export default {
    components: {CertificateUpload},

    data() {
        return {
            societyId: -1,
            verify_status: 0,
            socialWork: {
                social_name: '',
                participate_time: '',
                duration_day: '',
                duration_hour: '',
                social_type: 1,
                social_detail: '',
                evidence: ''
            },
            operationLogs: [],
            societyTypes: [],
            evidenceCheck: {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
            },
            certImgChanged: false,
        };
    },
    methods: {
        onCancel() {
            router.push("/socialWork")
        },

        onSubmit() {
            console.log('submit!');

            /**
             *
             * @type Society
             */
            let newSociety = {
                id: this.societyId,
                society_name: this.socialWork.social_name,
                participate_time: new Date(this.socialWork.participate_time).toISOString().split('T')[0],
                society_type: this.socialWork.social_type,
                duration_day: this.parseToInt(this.socialWork.duration_day),
                duration_hour: this.parseToInt(this.socialWork.duration_hour),

                verify_status: -1,
                society_detail: this.socialWork.social_detail, // 新添加的字段
                evidence: '',

            }

            if(this.societyId === -1) {
                api.editApi.submitCreate(newSociety)
                    .then((res) => {
                        this.societyId = res.json.newSocietyId;
                        ElMessage.success("成功创建社会服务信息");
                        nextTick(async () => {
                            if(this.certImgChanged) {
                                setTimeout(async ()=> {
                                    await this.$refs.certificateUpload.uploadImg()
                                    await router.push("/socialDetail/" + res.json.newSocietyId)
                                    location.reload()
                                }, 500)

                            } else {
                                await router.push("/socialDetail/" + res.json.newSocietyId)
                                location.reload()
                            }


                        })

                    }).catch(error => {
                    if(error.network) return;
                    error.defaultHandler()
                })
            } else {
                api.editApi.changeRecord(newSociety)
                    .then((res) => {
                        ElMessage.success("成功保存社会服务信息")
                    }).then(() => {
                    if(this.certImgChanged) {
                        return this.$refs.certificateUpload.uploadImg()
                    }
                    location.reload()
                })
                    .catch(error => {
                        if(error.network) return;
                        error.defaultHandler()
                    })
            }
        },

        onSubmitToReview() {
            api.editApi.submitToReview(this.societyId).then(res => {
                ElMessage.success("成功提交审核")
                this.verify_status = 1;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        onWithdrawReview() {
            api.editApi.withdrawReview(this.societyId).then(res => {
                ElMessage.success("成功撤回审核申请")
                this.verify_status = 0;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },


        onCertImgChanged() {
            this.certImgChanged = true;
        },
        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                return 0;
            }
            return parsedValue;
        },
        async getRecord() {
            try {
                this.societyTypes = (await api.viewApi.getTypes()).json.types

                if(router.currentRoute.value.params?.teamId === "new") {
                    this.societyId = -1
                } else {
                    this.societyId = parseInt(router.currentRoute.value.params.teamId)

                    let res = await api.viewApi.getRecordById(this.societyId)
                    let remoteSociety = res.json.society
                    this.socialWork.duration_day = remoteSociety.duration_day
                    this.socialWork.social_detail = remoteSociety.society_detail
                    this.socialWork.social_name = remoteSociety.society_name
                    this.socialWork.participate_time = remoteSociety.participate_time
                    this.socialWork.duration_hour = remoteSociety.duration_hour
                    this.socialWork.social_type = remoteSociety.society_type
                    this.socialWork.evidence =  remoteSociety.evidence ? "/certImg/" + remoteSociety.evidence : null;

                    this.operationLogs = res.json.logs
                    this.verify_status = remoteSociety.verify_status
                }

            } catch (error) {
                if(error.network) return;
                error.defaultHandler()
            }

        },

    },
    mounted() {
        this.getRecord();
    },
};
</script>


<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
}

.header-left {
    margin-right: 10px;
    /* 根据需要调整左侧元素的右边距 */
}

.sectionTitle {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0;
}

.helpText {
    margin: 20px 0 20px 0;
    color: #999;
}

.pageTitle {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;
}

.viewWrapper {
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36, 37, 38, .05);
    border-radius: 3px;
    padding: 20px;
}

.demo-date-picker {
    display: flex;
    width: 100%;
    padding: 0;
    flex-wrap: wrap;
}

.demo-date-picker .block {
    padding: 5px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    flex: 1;
    text-align: left;
}

.demo-date-picker .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 20px;
}

.duration-input .el-input {
    --el-input-width: 220px;
}

.upload-evidence-text {
    font-size: 15px;
    margin-bottom: 10px;
    height: 18px;
}

.submit-button-create {
    width: 120px;
    height: 30px;
}

.submit-button-cancel {
    width: 120px;
    height: 30px;
}

.submit-button-cancel:hover {
    /* width: 120px;
    height: 30px; */
    background-color: var(--el-color-danger);
    color: white;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.text {
    font-size: 14px;
}

.item {
    margin-bottom: 18px;
}

.box-card {
    width: 300px;
    margin-bottom: 30px;
}

.seperate-words {
    height: 50px;
    margin-left: 30px;
    margin-top: 50px;
    margin-bottom: 50px;
}
</style>
