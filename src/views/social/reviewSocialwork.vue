<script setup>
import { useRoute } from "vue-router";
import router from "@/router";
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "@/api/socialWork";
import CertificateUpload from "@/components/CertificateUpload.vue";

let socialworkId = 0;

const route = useRoute()

socialworkId = parseInt(route.params.Id)
watch(route, (old, newRoute) => {
    if (route.params.id) {
        socialworkId = parseInt(route.params.id)
    }
    if (typeof (newRoute.params.id) !== "undefined")
        reloadPage();
})

const socialworkStates = ref([])

const loading = ref(false)

const operationLogs = ref([])
const certificateUpload = ref()

const isCertImageChanged = ref(false)
const statusCode = ref(0)
const checkMessage = ref("")

const infoNotChanged = ref(true)

/**
 *
 * @type {import("vue").Ref<SimpleStudent>}
 */
const student = ref({stu_id: "", stu_name: "", grade: "", user_id: -1})
const queryForm = reactive({
    socialworkName: "",
    socialworkAuthor: "",
    awardDate: "",  //submissionDate
    desc: "",
    socialwork_situation: 0,
    attachment: "",
    operationLogs: [],
    durationHour: 0,
    durationDay: 0
})

const statusCodeList = {
    0: { name: "草稿", tagType: "info" },
    1: { name: "等待审核", tagType: "warning" },
    2: { name: "审核通过", tagType: "success" },
    3: { name: "审核不通过", tagType: "danger" }
}


const reloadPage = () => {
    console.log(socialworkId + "socialworkId")
    api.viewApi.getTypes().then(res => {
        socialworkStates.value = res.json.types
    }).then(() => {
        api.viewApi.getRecordById(socialworkId).then(res => {
            let socialWork = res.json.society

            queryForm.socialworkName = socialWork.society_name
            queryForm.awardDate = socialWork.participate_time
            queryForm.desc = socialWork.society_detail
            queryForm.socialwork_situation = socialWork.society_type
            queryForm.attachment = socialWork.evidence ? "/certImg/" + socialWork.evidence : null;
            queryForm.durationHour = socialWork.duration_hour
            queryForm.durationDay = socialWork.duration_day

            statusCode.value = socialWork.verify_status;
            queryForm.operationLogs = res.json.logs
            student.value = res.json.student

            isCertImageChanged.value = false

        }).catch(error => {
            console.log("error:", error)
            loading.value = false
            if (error.network) return
            error.defaultHandler()
        })
        isCertImageChanged.value = false;
        infoNotChanged.value = true;
    })

}
reloadPage()

const onSaveButtonClicked = () => {
    /**
     *
     * @type Society
     */
    let newSocialWork = {
        //左边是api中获取的变量，右边是paper中自己设定的变量
        id: socialworkId,
        society_name: queryForm.socialworkName,
        society_type: queryForm.socialwork_situation,
        participate_time: queryForm.awardDate,
        duration_day: queryForm.durationDay,
        duration_hour: queryForm.durationHour,
        verify_status: -1,
        society_detail: queryForm.desc,
        evidence: ""
    }
    api.editApi.changeRecord(newSocialWork)
        .then(async res => {
            await uploadImg();
            ElMessage.success("社会服务信息保存成功");
            reloadPage();
        })
        .catch(error => {
            if (error.network) return;
            error.defaultHandler();
        });
};


const uploadImg = async () => {
    await certificateUpload.value.uploadImg()
}

const onRevertButtonClicked = () => {
    ElMessageBox.confirm("确认要撤销对本份参赛记录的更改？", "撤销更改", {
        type: 'warning'
    }).then(() => {
        reloadPage();
        certificateUpload.value.revertChange()
    }).catch(() => { })

}

const onPassButtonClicked = async () => {
    try {
        await api.checkApi.changeVerifyStatus(socialworkId, 2, checkMessage.value);
        ElMessage.success("审核通过记录保存成功");
        reloadPage()
    } catch (error) {
        if (error.network) return;
        error.defaultHandler();
    }


}

const onDenyButtonClicked = async () => {
    try {
        await api.checkApi.changeVerifyStatus(socialworkId, 2, checkMessage.value);
        checkMessage.value = "";
        ElMessage.success("审核不通过记录保存成功");
        reloadPage()
    } catch (error) {
        if (error.network) return;
        error.defaultHandler();
    }
}

const onGoBackButtonClicked = () => {
    router.push("/SocialCheckListView");
}

const setInfoChanged = (_) => {
    console.log('had change',infoNotChanged.value)
    infoNotChanged.value = false;
    console.log('isAnythingChanged',isAnythingChanged.value )
}

const isAnythingChanged = computed(() => {
    return !infoNotChanged.value || isCertImageChanged.value;
})

const onCertImgChanged = () => {
    isCertImageChanged.value = true;
}

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核社会服务信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中审核与修改学生填报的社会服务信息。点击“审核通过”或“打回”将修改本份社会服务信息的状态并跳转到下一份参赛信息。</p>
            <p>如果需要修改内容后再审核通过，请先点击“保存”，再点击“审核通过”。</p>
        </div>

        <div class="operationButtons">
            <el-button type="primary" @click="onGoBackButtonClicked" plain>返回</el-button>
        </div>

        <el-row>
            <el-col :span="24">
                <el-form-item label="评审意见">
                    <el-input v-model="checkMessage" :autosize="{ minRows: 2, maxRows: 10 }" type="textarea"
                        placeholder="" />
                </el-form-item>
            </el-col>
        </el-row>

        <div class="operationButtons">
            <el-button type="primary" @click="onSaveButtonClicked" :disabled="!isAnythingChanged">保存更改</el-button>
            <el-button type="danger" @click="onRevertButtonClicked" :disabled="!isAnythingChanged">撤销更改</el-button>
            <el-button type="success" @click="onPassButtonClicked" :disabled="isAnythingChanged">审核通过</el-button>
            <el-button type="danger" @click="onDenyButtonClicked" :disabled="isAnythingChanged">打回</el-button>
        </div>

        <el-row>
            <el-col :span="24">
                <p class="sectionTitle">基础信息</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6">
                <el-form-item label="社会服务名称">
                    <el-input v-model="queryForm.socialworkName" placeholder="请输入社会服务名称" @input="setInfoChanged" />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="志愿类型">
                    <el-select v-model="queryForm.socialwork_situation" placeholder="请选择">
                        <el-option v-for="state in socialworkStates" :label="state.type_name" :value="state.id" :key="state.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="志愿活动日期">
                    <el-date-picker
                        v-model="queryForm.awardDate"
                        type="date"
                        placeholder="请选择"
                        @change="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="18">
                <el-form-item label="志愿时长">
                    <el-col :span="8">
                        <el-input
                            v-model="queryForm.durationDay"
                            placeholder="请输入社会活动时长"
                            @input="setInfoChanged"
                        />
                    </el-col>
                    <el-col :span="3">
                        <div style="width: 100%; text-align: center" >
                             天
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <el-input
                            v-model="queryForm.durationHour"
                            placeholder="请输入社会活动时长"
                            @input="setInfoChanged"
                        />
                    </el-col>
                    <el-col :span="3">
                        <div style="width: 100%; text-align: center" >
                            小时
                        </div>
                    </el-col>

                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="6">
                <el-form-item label="审核状态">
                    <el-tag :type="statusCodeList[statusCode].tagType">{{ statusCodeList[statusCode].name }}</el-tag>
                </el-form-item>
            </el-col>
        </el-row>


        <el-row>
            <el-col :span="24">
                <el-form-item label="证明材料">
                    <certificate-upload ref="certificateUpload" @image-changed="onCertImgChanged"
                        v-model:cert-url="queryForm.attachment" record-type="socialwork" :record-id="socialworkId" />
                </el-form-item>

            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="社会服务摘要">
                    <el-input v-model="queryForm.desc" type="textarea" placeholder="" @input="setInfoChanged" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <p class="sectionTitle">申请人</p>
        </el-row>
        <el-row>
            <el-col :span="6">
                <el-form-item label="学号">
                    {{student.stu_id}}
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="姓名">
                    {{student.stu_name}}
                </el-form-item>
            </el-col>
        </el-row>

        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in queryForm.operationLogs" :key="index"
                :timestamp="activity.operation_time">
                {{ activity.operation_text }}
            </el-timeline-item>
        </el-timeline>
    </div>
</template>

<style scoped>
.viewWrapper {
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36, 37, 38, .05);
    border-radius: 3px;
    padding: 20px;
}

.pageTitle {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;
}

.helpText {
    margin: 20px 0 20px 0;
    color: #999;
}

.sectionTitle {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 10px;
}

.operationButtons {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}
</style>
