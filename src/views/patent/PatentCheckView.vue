<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import api from "@/api/patent";
import CertificateUpload from "@/components/CertificateUpload.vue";

let patentId = 0;

const route = useRoute()

patentId = parseInt(route.params.id)
watch(route, (old, newRoute) => {
    if (route.params.id)
        patentId = parseInt(route.params.id)
    if (typeof (newRoute.params.id) !== "undefined")
        reloadPage();
})

const patents = ref([])

const patentStates = ref([])

const loading = ref(false)

const operationLogs = ref([])
const certificateUpload = ref()
const certUrl = ref("")
const isCertImageChanged = ref(false)
const statusCode = ref(0)
const checkMessage = ref("")

const infoNotChanged = ref(true)

const queryForm = reactive({
    patentName: "",
    patentAuthor: "",
    awardDate: null,  //submissionDate
    desc: "",  //patent_abstract
    patent_situation: 0,
    attachment: null,
    operationLogs: []
})

const statusCodeList = {
    0: {name: "草稿", tagType: "info"},
    1: {name: "等待审核", tagType: "warning"},
    2: {name: "审核通过", tagType: "success"},
    3: {name: "审核不通过", tagType: "danger"}
}


const reloadPage = () => {
    console.log(patentId + "patentId")
    api.getStates().then(res => {
        patentStates.value = res.json.states
    }).then(() => {
        api.selectStuRecordById(patentId).then(res => {
            let patent = res.json.patent

            patents.value = [patent]
            queryForm.patentName = patent.patent_title
            queryForm.patentAuthor = patent.patent_author
            queryForm.awardDate = patent.submission_date
            queryForm.desc = patent.patent_abstract
            queryForm.patent_situation = patent.patent_situation
            queryForm.attachment = patent.attachments ? "/certImg/" + patent.attachments : null;
            queryForm.operationLogs = res.json.logs

            statusCode.value = patent.verify_status;

            isCertImageChanged.value = false
            certUrl.value = patent.attachments;
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
    let newPatent = {
        //左边是api中获取的变量，右边是paper中自己设定的变量
        patent_abstract: queryForm.desc,
        submission_date: new Date(queryForm.awardDate).toISOString().split('T')[0],
        attachments:  queryForm.attachment,
        patent_author: queryForm.patentAuthor,
        patent_title: queryForm.patentName,
        id: patentId,
        patent_situation: queryForm.patent_situation,
        verify_status: -1
    }
    api.changeRecord(newPatent)
        .then(async res => {
            await uploadImg();
            ElMessage.success("专利信息保存成功");
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
    ElMessageBox.confirm("确认要撤销对本份参赛记录的更改？", "撤销更改",{
        type: 'warning'
    }).then(()=>{
        reloadPage();
        certificateUpload.value.revertChange()
    }).catch(()=>{})

}

const onPassButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(patentId, 2, checkMessage.value);
    reloadPage()
    //await onNextButtonClicked();
}

const onDenyButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(patentId, 3, checkMessage.value);
    reloadPage()
    //await onNextButtonClicked();
    checkMessage.value = "";
}

const onGoBackButtonClicked = () => {
    router.push("/patentCheck");
}

const setInfoChanged = (_) => {
    infoNotChanged.value = false;
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
                <el-form-item label="专利名称">
                    <el-input
                        v-model="queryForm.patentName"
                        placeholder="请输入专利名称"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="专利作者">
                    <el-input
                        v-model="queryForm.patentAuthor"
                        placeholder="请输入专利作者"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="专利获得日期">
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
            <el-col :span="6">
                <el-form-item label="专利状态">
                    <el-select v-model="queryForm.patent_situation" placeholder="请选择专利状态">
                        <el-option v-for="state in patentStates" :label="state.state_name" :value="state.id" :key="state.id"></el-option>
                    </el-select>
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
                        record-type="patent"
                        :record-id="patentId"
                    />
                </el-form-item>

            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="专利摘要">
                    <el-input
                        v-model="queryForm.desc"
                        type="textarea"
                        placeholder=""
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
        </el-row>

        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in queryForm.operationLogs" :key="index" :timestamp="activity.operation_time">
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
