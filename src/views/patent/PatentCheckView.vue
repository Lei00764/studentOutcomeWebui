<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch} from "vue";
import {ElMessage, ElMessageBox, genFileId} from "element-plus";
import checkSessionUtil from "@/utils/checkSession"
import api from "@/api/patent";
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";

const routerWatchable = useRoute()

let patentId = 0;

const route = useRoute()

patentId = parseInt(route.params.id)
watch(router, (old, newRoute) => {
    if (route.params.id)
        patentId = parseInt(route.params.id)
    if (typeof (newRoute.params.id) !== "undefined")
        reloadPage();
})

const patents = ref([])
const competitions = ref([])
const terms = ref([])
const prizes = ref([])
const loading = ref(false)
const certificationPictures = ref([])
const operationLogs = ref([])

const certUrl = ref("")
const isCertImageChanged = ref(false)
const statusCode = ref(0)
const checkMessage = ref("")

const infoNotChanged = ref(true)

const queryForm = reactive({
    patentName: null,
    patentAuthor: null,
    awardDate: null,  //submissionDate
    desc: "",  //patent_abstract
    id: null
})

const statusCodeList = {
    0: {name: "草稿", tagType: "info"},
    1: {name: "等待审核", tagType: "warning"},
    2: {name: "审核通过", tagType: "success"},
    3: {name: "审核不通过", tagType: "danger"}
}

const organizer = ref()
const termLevelName = ref()
const competitionType = ref()

const elUploadImg = ref()
const selectStudentPanel = ref()

const reloadPage = () => {
    console.log(patentId + "patentId")
    api.editApi.getPatentInfo(patentId).then(res => {
        let patent = res.json

        patents.value = [patent]
        queryForm.patentName = patent.patent_title
        queryForm.patentAuthor = patent.patent_author
        queryForm.awardDate = patent.submissionDate
        queryForm.desc = patent.patent_abstract
        queryForm.id = patentId
        statusCode.value = patent.auditStatus;

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
}
reloadPage()


const swapImg = (newFileList) => {
    elUploadImg.value.clearFiles()
    let file = newFileList[0]
    file.uid = genFileId()
    console.log(file)
    elUploadImg.value.handleStart(file)
    isCertImageChanged.value = true
}
let certFile = null
const onImgUpload = (file)=> {
    certFile = file
    isCertImageChanged.value = true
}

const onSaveButtonClicked = () => {
    const params = {
        patent_title: queryForm.patentName,
        patent_author: queryForm.patentAuthor,
        submissionDate: queryForm.awardDate,
        patent_abstract: queryForm.desc,
    };
    api.changeRecord(params)
        .then(async res => {
            await uploadImg();
            ElMessage.success("专利信息保存成功");
            reloadPage();
        })
        // .catch(error => {
        //     if (error.network) return;

        //     error.defaultHandler();
        // });
};

// const onSaveButtonClicked = () => {
//     const params = {
//         patent_title: queryForm.patentName,
//         patent_author: queryForm.patentAuthor,
//         submissionDate: queryForm.awardDate,
//         patent_abstract: queryForm.desc,
//     };
//     api.changeRecord(params)
//         .then(async res => {
//             await uploadImg()
//             ElMessage.success("专利信息保存成功")
//             reloadPage()
//         }).catch(error => {
            
//         if (error.network) return
//         switch (error.errorCode) {
//             case 614:
//                 ElMessage.error("有队伍成员未被包含，如果你认为这是个错误，请刷新页面。")
//                 return;
//             case 615:
//                 ElMessage.error("有多余的队伍成员，如果你认为这是个错误，请刷新页面。")
//                 return;
//             case 616:
//                 ElMessage.error("贡献设置错误，如果你认为这是个错误，请刷新页面。")
//                 return;
//             case 617:
//                 ElMessage.error("请完成竞赛名称、届别、奖项、获奖日期的填写！")
//                 return;
//         }

//     })

// }

const uploadImg = async () => {
    console.log(certFile)
    if (!certFile && !isCertImageChanged.value)
        return;

    if (!certFile && isCertImageChanged.value) {
        try {
            let res = await api.editApi.clearCertImage(patentId)
            ElMessage.success("证书清除成功")
        } catch (error) {
            loading.value = false
            if (error.network) return
            error.defaultHandler()
        }
        return
    }

    try {
        let res = await api.editApi.uploadImage(patentId, certFile.raw);

        ElMessage.success("证书上传成功")
    } catch (error) {
        loading.value = false
        if (error.network) return
        switch (error.errorCode) {
            case 611:
                ElMessage.error("证书上传失败，请重试")
                return;
        }
        error.defaultHandler()
    }
}

const onClearOriginalCertImage = () => {
    certUrl.value = ""
    isCertImageChanged.value = true
}

const onRevertButtonClicked = () => {
    ElMessageBox.confirm("确认要撤销对本份参赛记录的更改？", "撤销更改",{
        type: 'warning'
    }).then(()=>{
        reloadPage();
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



</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核专利信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中审核与修改学生填报的专利信息。点击“审核通过”或“打回”将修改本份专利信息的状态并跳转到下一份参赛信息。</p>
            <p>如果需要修改内容后再审核通过，请先点击“保存”，再点击“审核通过”。添加/移除学生的操作将立即生效，但请手动调整并保存新的贡献顺序。</p>
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
      
        <el-col :span="6">
            <el-form-item label="审核状态">
              
                <el-tag :type="statusCodeList[statusCode].tagType">{{statusCodeList[statusCode].name}}</el-tag>
            </el-form-item>
        </el-col>

        <el-row>
            <el-col :span="24">
                <el-form-item label="证书">
                    <el-upload action="" :file-list="certificationPictures" accept=".jpg, .jpeg, .png"
                               :auto-upload="false" list-type="picture" :limit="1" :on-exceed="swapImg"
                               ref="elUploadImg" :on-change="onImgUpload">
                        <el-button type="primary">点击选择</el-button>
                        <el-text>仅允许.jpg/.png图片</el-text>
                        <template #tip>
                            <div v-if="!isCertImageChanged && certUrl">
                                <el-image style="max-width: 800px; height: 100px; margin-top:10px; width: auto"
                                          fit="contain" :src="certUrl" :preview-src-list="[certUrl]"/>
                                <el-button link @click="onClearOriginalCertImage">清除</el-button>
                            </div>

                        </template>
                    </el-upload>
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
    </div>
</template>

<style scoped>
.sectionTitle {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 10px;
}
.helpText {
    font-size: 14px;
    margin: 0 0 30px;
}
.helpText p {
    margin: 0 0 10px;
}
.pageTitle {
    margin: 0 0 20px;
}
.viewWrapper {
    margin: 0 40px;
}
.operationButtons {
    display: flex;
    justify-content:center;
    margin: 20px 0;
}
</style>
