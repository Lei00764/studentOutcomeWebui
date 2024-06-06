<template>
    <div class="viewWrapper">
        <h1 class="pageTitle"> {{ volunteerId === -1? "新增": "修改" }}志愿服务记录</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报志愿服务记录。
        </div>
        <el-form :model="volunteers" label-width="120px" status-icon >

            <el-form-item label="志愿服务名称" style="width: 500px" prop="name">
                <el-input v-model="volunteers.VOL_name" />
            </el-form-item>

            <el-form-item label="日期选择器" prop="time">
                <el-date-picker v-model="volunteers.participate_time" type="date" placeholder="请选择日期" />
            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="volunteers.duration_day" placeholder="天数" clearable />&nbsp 天 &nbsp
                <el-input v-model="volunteers.duration_hour" placeholder="小时" clearable />&nbsp 小时
            </el-form-item>

            <el-form-item label="志愿服务类型" prop="volType">
                <el-select v-model="volunteers.vol_type" placeholder="请选择">
                    <el-option v-for="state in states" :label="state.state_name" :value="state.id" :key="state.id"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="详细描述" prop="volDetails">
                <el-input v-model="volunteers.vol_detail" type="textarea" :rows="4" placeholder="请输入详细描述"></el-input>
            </el-form-item>

            <el-form-item label="佐证材料" prop="evidence">
                <certificate-upload
                    ref="certificateUpload"
                    @image-changed="onCertImgChanged"
                    v-model:cert-url="volunteers.image_id"
                    record-type="volunteer"
                    :record-id="volunteerId"
                />
            </el-form-item>

            <el-form-item>
                <el-button v-if="verify_status!== 2 && verify_status!== 1" type="primary" @click="onSubmit" plain class="submit-button-create">保存</el-button>
                <el-button type="primary" @click="onSubmitToReview" plain class="submit-button-create"
                           v-if="volunteerId !== -1 && verify_status=== 0 || verify_status=== 3">提交审核</el-button>
                <el-button type="primary" @click="onWithdrawReview" plain class="submit-button-create"
                           v-if="volunteerId !== -1 && verify_status=== 2 || verify_status=== 1 ">撤回修改</el-button>
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
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import api from '@/api/volunteers';
import router from "@/router";
import CertificateUpload from "@/components/CertificateUpload.vue";
import {ElMessage} from "element-plus";
import {nextTick} from "vue";
export default {
    components: {CertificateUpload},

    data() {
        return {
            volunteerId: -1,
            volunteers: {
                VOL_name: '',
                participate_time: '',
                duration_day: 0,
                duration_hour: 0,
                vol_type: 1,
                vol_detail: '',
                image_id: null
            },
            operationLogs: [],
            verify_status: 0,
            states: [],
            certImgChanged: false
        };
    },
    methods: {
        onCertImgChanged() {
            this.certImgChanged = true;
        },

        onSubmitToReview() {
            api.editApi.submitToReview(this.volunteerId).then(res => {
                ElMessage.success("成功提交审核")
                this.verify_status = 1;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        onWithdrawReview() {
            api.editApi.withdrawReview(this.volunteerId).then(res => {
                ElMessage.success("成功撤回审核申请")
                this.verify_status = 0;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        onSubmit() {
            console.log('submit!');

            /**
             * @type Volunteer
             */
            let newVolunteer = {
                //左边是api中获取的变量，右边是paper中自己设定的变量
                id: this.volunteerId,
                vol_name: this.volunteers.VOL_name,
                vol_type: this.volunteers.vol_type,
                participate_time: new Date(this.volunteers.participate_time).toISOString().split('T')[0],
                duration_hour: this.volunteers.duration_hour,
                duration_day: this.volunteers.duration_day,

                vol_detail: this.volunteers.vol_detail,
                image_id:  "", // 服务器在更新时会忽略本字段，需要从uploadImg接口进行更新
                verify_status: -1
            }

            if(this.volunteerId === -1) {
                api.editApi.submitCreate(newVolunteer)
                    .then((res) => {
                        this.volunteerId = res.json.newVolunteerId;
                        ElMessage.success("成功创建志愿服务记录");
                        nextTick(async () => {
                            if(this.certImgChanged) {
                                await this.$refs.certificateUpload.uploadImg()
                            }

                            await router.push("/volunteer/" + res.json.newVolunteerId)
                        })

                    }).catch(error => {
                    if(error.network) return;
                    error.defaultHandler()
                })
            } else {
                api.editApi.changeRecord(newVolunteer)
                    .then((res) => {
                        ElMessage.success("成功保存志愿服务记录")
                    }).then(() => {
                    if(this.certImgChanged) {
                        return this.$refs.certificateUpload.uploadImg()
                    }
                })
                    .catch(error => {
                        if(error.network) return;
                        error.defaultHandler()
                    })
            }
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
                let states = await api.viewApi.getStates()
                this.states = states.json.states

                if(router.currentRoute.value.params?.teamId === "new") {
                    this.volunteerId = -1
                } else {
                    this.volunteerId = parseInt(router.currentRoute.value.params.teamId)

                    const res = await api.viewApi.selectStuRecordById(this.volunteerId);
                    let remoteVolunteer = res.json.volunteer
                    this.verify_status = remoteVolunteer.verify_status
                    this.volunteers.VOL_name = remoteVolunteer.vol_name
                    this.volunteers.participate_time = remoteVolunteer.participate_time
                    this.volunteers.duration_day = remoteVolunteer.duration_day
                    this.volunteers.duration_hour = remoteVolunteer.duration_hour
                    this.volunteers.vol_type = remoteVolunteer.vol_type
                    this.volunteers.vol_detail = remoteVolunteer.vol_detail
                    this.volunteers.image_id = remoteVolunteer.image_id ? "/certImg/" + remoteVolunteer.image_id : null;
                    this.verify_status = remoteVolunteer.verify_status

                    this.operationLogs = res.json.logs

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
    background-color: red;
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
