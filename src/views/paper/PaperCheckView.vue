<script setup>
import { useRoute } from "vue-router";
import router from "@/router";
import {computed, onBeforeMount, reactive, ref, watch} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "@/api/paper";
import CertificateUpload from "@/components/CertificateUpload.vue";

let paperId = 0;

const route = useRoute();

paperId = parseInt(route.params.id);
watch(route, (old, newRoute) => {
    if (route.params.id)
        paperId = parseInt(route.params.id);
    if (typeof newRoute.params.id !== "undefined")
        reloadPage();
});

const paperStates = ref([]);

const loading = ref(false);

const operationLogs = ref([]);
const certificateUpload = ref();
/**
 *
 * @type {import("vue").Ref<SimpleStudent>}
 */
const student = ref({stu_id: "", stu_name: "", grade: "", user_id: -1})
const isCertImageChanged = ref(false);
const statusCode = ref(0);
const checkMessage = ref("");

const infoNotChanged = ref(true);

const queryForm = reactive({
    paperTitle: "",
    paperType: 0,
    submissionDate: "",
    authors: "", 
    abstract: "", 
    attachment: "", 
});

const statusCodeList = {
    0: { name: "草稿", tagType: "info" },
    1: { name: "等待审核", tagType: "warning" },
    2: { name: "审核通过", tagType: "success" },
    3: { name: "审核不通过", tagType: "danger" },
};

const reloadPage = () => {
    console.log(paperId + "paperId");
        api.editApi.selectStuRecordById(paperId).then((res) => {
            let paper = res.json.paper;

            queryForm.paperTitle = paper.paper_title;
            queryForm.paperType = paper.paper_situation;
            queryForm.submissionDate = paper.submission_date;
            queryForm.authors = paper.paper_author;
            queryForm.abstract = paper.paper_abstract;
            
            statusCode.value = paper.verify_status;
            student.value = res.json.student
            isCertImageChanged.value = false;
            operationLogs.value = res.json.logs

        }).catch((error) => {
            console.log("error:", error);
            loading.value = false;
            if (error.network) return;
            error.defaultHandler();
        });
        isCertImageChanged.value = false;
        infoNotChanged.value = true;
    };

onBeforeMount(() => {
    api.getStates().then(res => {
        paperStates.value = res.json.states
        reloadPage();
    })
})

const onSaveButtonClicked = () => {
    /**
     *
     * @type Paper
     */
    let newPaper = {
        id: paperId,
        paper_title: queryForm.paperTitle,
        paper_author: queryForm.authors,
        paper_abstract: queryForm.abstract,
        submission_date: new Date(queryForm.submissionDate).toISOString().split('T')[0],
        // attachments:  queryForm.attachment,
        paper_situation:queryForm.paperType,
        verify_status: -1
    };
    api.editApi.changeRecord(newPaper)
        .then(async (res) => {
            // await uploadImg();
            ElMessage.success("论文信息保存成功");
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
    ElMessageBox.confirm("确认要撤销对本份论文记录的更改？", "撤销更改", {
        type: 'warning'
    }).then(() => {
        reloadPage();
        certificateUpload.value.revertChange();
    }).catch(() => { });
};

const onPassButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(paperId, 2, checkMessage.value);
    reloadPage();
};

const onDenyButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(paperId, 3, checkMessage.value);
    reloadPage();
    checkMessage.value = "";
};

const onGoBackButtonClicked = () => {
    router.push("/paperCheck");
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
        <h1 class="pageTitle">审核论文信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中审核与修改学生提交的论文信息。点击“审核通过”或“打回”将修改本份论文信息的状态并跳转到下一份论文信息。</p>
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
                <el-form-item label="论文标题">
                    <el-input
                        v-model="queryForm.paperTitle"
                        placeholder="请输入论文标题"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="论文作者">
                    <el-input
                        v-model="queryForm.authors"
                        placeholder="请输入作者"
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="论文状态">
                    <el-select v-model="queryForm.paperType" placeholder="请选择论文的当前状态">
                        <el-option v-for="type in paperStates" :label="type.state_name" :value="type.id" :key="type.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="6">
                <el-form-item label="提交日期">
                    <el-date-picker
                        v-model="queryForm.submissionDate"
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
<!--        <el-row>-->
<!--            <el-col :span="24">-->
<!--                <el-form-item label="证明材料">-->
<!--                    <certificate-upload-->
<!--                        ref="certificateUpload"-->
<!--                        @image-changed="onCertImgChanged"-->
<!--                        v-model:cert-url="queryForm.attachment"-->
<!--                        record-type="paper"-->
<!--                        :record-id="paperId"-->
<!--                    />-->
<!--                </el-form-item>-->

<!--            </el-col>-->
<!--        </el-row>-->
        <el-row>
            <el-col :span="24">
                <el-form-item label="附加信息">
                    <el-input
                        v-model="queryForm.abstract"
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
