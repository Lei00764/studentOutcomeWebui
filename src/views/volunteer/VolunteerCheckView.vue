<script setup>
import { useRoute } from "vue-router";
import router from "@/router";
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "@/api/volunteers";
import CertificateUpload from "@/components/CertificateUpload.vue";

let volunteerId = 0;

const route = useRoute();

volunteerId = parseInt(route.params.id);
watch(route, (old, newRoute) => {
    if (route.params.id)
        volunteerId = parseInt(route.params.id);
    if (typeof newRoute.params.id !== "undefined")
        reloadPage();
});

const volunteerStates = ref([]);

const loading = ref(false);

const operationLogs = ref([]);
const certificateUpload = ref();
const certUrl = ref("");
const isCertImageChanged = ref(false);
const statusCode = ref(0);
const checkMessage = ref("");

const infoNotChanged = ref(true);

const queryForm = reactive({
    volunteerName: "",
    volunteerType: 1,
    participateTime: "",
    durationHour: 0,
    desc: "",//description
    attachment: "",
});

/**
 *
 * @type {import("vue").Ref<SimpleStudent>}
 */
const student = ref({stu_id: "", stu_name: "", grade: "", user_id: -1})

const statusCodeList = {
    0: { name: "草稿", tagType: "info" },
    1: { name: "等待审核", tagType: "warning" },
    2: { name: "审核通过", tagType: "success" },
    3: { name: "审核不通过", tagType: "danger" },
};

const reloadPage = async () => {
    console.log(volunteerId + "volunteerId");
    try{
        let statesRes = await api.viewApi.getStates()

        volunteerStates.value = statesRes.json.states


        let res = await api.viewApi.selectStuRecordById(volunteerId)
        let volunteer = res.json.volunteer;

        operationLogs.value = res.json.logs

        queryForm.volunteerName = volunteer.vol_name;
        queryForm.volunteerType = volunteer.vol_type;
        queryForm.participateTime = volunteer.participate_time;
        queryForm.durationHour = volunteer.duration_hour;
        queryForm.desc = volunteer.vol_detail;
        queryForm.attachment = volunteer.image_id ? "/certImg/" + volunteer.image_id : null;

        statusCode.value = volunteer.verify_status;
        student.value = res.json.student

            isCertImageChanged.value = false;
        certUrl.value = volunteer.image_id;
    } catch (error) {
        console.log("error:", error);
        loading.value = false;
        if (error.network) return;
        error.defaultHandler();
    }
    isCertImageChanged.value = false;
    infoNotChanged.value = true;
};
reloadPage();

const onSaveButtonClicked = () => {
    let newVolunteer = {
        vol_detail: queryForm.desc,
        participate_time: new Date(queryForm.participateTime).toISOString().split('T')[0],
        image_id:  queryForm.attachment,
        vol_name: queryForm.volunteerName,
        applicant:queryForm.applicant,
        vol_id: volunteerId,
        verify_status: -1
    };
    api.changeRecord(newVolunteer)
        .then(async (res) => {
            await uploadImg();
            ElMessage.success("志愿信息保存成功");
            reloadPage();
        })
        .catch((error) => {
            if (error.network) return;

            error.defaultHandler();
        });
};

const uploadImg = async () => {
    await certificateUpload.value.uploadImg();
};

const onRevertButtonClicked = () => {
    ElMessageBox.confirm("确认要撤销对本份志愿记录的更改？", "撤销更改", {
        type: 'warning'
    }).then(() => {
        reloadPage();
        certificateUpload.value.revertChange();
    }).catch(() => { });
};

const onPassButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(volunteerId, 2, checkMessage.value);
    reloadPage();
};

const onDenyButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(volunteerId, 3, checkMessage.value);
    reloadPage();
    checkMessage.value = "";
};

const onGoBackButtonClicked = () => {
    router.push("/volunteerCheck");
};

const setInfoChanged = (_) => {
    infoNotChanged.value = false;
};

const isAnythingChanged = computed(() => {
    return !infoNotChanged.value || isCertImageChanged.value;
});

const onCertImgChanged = () => {
    isCertImageChanged.value = true;
};

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核专利信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中审核与修改学生填报的专利信息。点击“审核通过”或“打回”将修改本份专利信息的状态并跳转到下一份参赛信息。</p>
            <p>如果需要修改内容后再审核通过，请先点击“保存”，再点击“审核通过”。</p>
        </div>

        <div class="operationButtons">
            <el-button type="primary" @click="onGoBackButtonClicked" plain>返回</el-button>
        </div>

        <el-row>
            <el-col :span="24">
                <el-form-item label="评审意见">
                    <el-input
                        v-model="checkMessage"
                        :autosize="{ minRows: 2, maxRows: 10 }"
                        type="textarea"
                        placeholder=""
                    />
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
                <el-form-item label="志愿活动名称">
                    <el-input
                        v-model="queryForm.volunteerName"
                        placeholder="请输入志愿活动名称"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>

            <el-col :span="6">
                <el-form-item label="志愿类型">
                    <el-select v-model="queryForm.volunteerType" placeholder="请选择">
                        <el-option v-for="state in volunteerStates" :label="state.state_name" :value="state.id" :key="state.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="志愿时长">
                    <el-input
                        v-model="queryForm.durationHour"
                        placeholder="请输入志愿活动时长"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="志愿活动日期">
                    <el-date-picker
                        v-model="queryForm.participateTime"
                        type="date"
                        placeholder="请选择"
                        @change="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="审核状态">
                    <el-tag :type="statusCodeList[statusCode].tagType">{{statusCodeList[statusCode].name}}</el-tag>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="证明材料">
                    <certificate-upload
                        ref="certificateUpload"
                        @image-changed="onCertImgChanged"
                        v-model:cert-url="queryForm.attachment"
                        record-type="volunteer"
                        :record-id="volunteerId"
                    />
                </el-form-item>

            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="志愿活动详情">
                    <el-input
                        v-model="queryForm.desc"
                        type="textarea"
                        placeholder=""
                        @input="setInfoChanged"
                    />
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
            <el-timeline-item v-for="(activity, index) in operationLogs" :key="index" :timestamp="activity.operation_time">
                {{ activity.operation_text }}
            </el-timeline-item>
        </el-timeline>
    </div>
</template>


<style scoped>
.viewWrapper{
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36,37,38,.05);
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
    justify-content:center;
    margin: 20px 0;
}
</style>
