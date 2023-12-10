<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch, h} from "vue";
import {ElMessage, ElMessageBox, genFileId} from "element-plus";
import checkSessionUtil from "@/utils/checkSession"
import api from "@/api/competition";

const routerWatchable = useRoute()

let teamId = 0;

if(router.currentRoute.value.params?.teamId)
    teamId = parseInt(router.currentRoute.value.params?.teamId)

watch(routerWatchable,(old,newRoute)=>{
    if(router.currentRoute.value.params?.teamId)
        teamId = parseInt(router.currentRoute.value.params?.teamId)
    if(typeof(newRoute.params.teamId) !== "undefined")
        reloadPage();
})


const competitions = ref([])
const terms = ref([])
const prizes = ref([])
const loading = ref(false)
const certificationPictures = ref([])
const operationLogs = ref([])
const teammates = ref([])

const certUrl = ref("")
const isCertImageChanged = ref(false)

const checkMessage = ref("")
const teammatesNotChanged = ref(true)
const infoNotChanged = ref(true)

const queryForm = reactive({
    competitionId: null,
    termId: null,
    prizeId: null,
    awardDate: null,
    desc: ""
})

const organizer = ref()
const termLevelName = ref()
const competitionType = ref()

// upload 的图片超过上限，把原来的图片换掉
const elUploadImg = ref()

const reloadPage = () => {
    api.editApi.getTeamInfo(teamId).then(res => {
        let competition = res.json.competition
        competitions.value = [competition]
        queryForm.competitionId = competition.id
        competitionType.value = competition.type_name;
        organizer.value = competition.organizer;

        let term = res.json.term
        onCompetitionSelected()
        queryForm.termId = term.id
        termLevelName.value = term.level_name

        let prize = res.json.prize
        onTermSelected()
        queryForm.prizeId = prize.id

        queryForm.awardDate = res.json.award_date
        queryForm.desc = res.json.desc
        operationLogs.value = res.json.logs;

        teammates.value = res.json.members;

        isCertImageChanged.value = false
        certUrl.value = res.json.certification_img_url;
    }).catch(error => {
        console.log(error)
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
    isCertImageChanged.value = false;
    teammatesNotChanged.value = true;
    infoNotChanged.value = true;
}
reloadPage()



const onCompetitionKeywordInput = (keyword) => {
    loading.value = true
    if(keyword === ""){
        return;
    }
    api.editApi.queryCompetition(keyword).then(res => {
        competitions.value = res.json.competitions
        loading.value = false
    }).catch(error => {
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}

const onCompetitionSelected = () => {
    queryForm.termId = null;
    queryForm.prizeId = null;
    if(!queryForm.competitionId){
        terms.value = []
        prizes.value = []
        return
    }


    api.editApi.queryTerm(queryForm.competitionId).then(res => {
        terms.value = res.json.terms
        loading.value = false
    }).catch(error => {
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}

const onTermSelected = () => {
    queryForm.prizeId = null;
    if(!queryForm.termId){
        prizes.value = []
        return
    }
    for(let t of terms.value){
        if(t.id === queryForm.termId){
            termLevelName.value = t.level_name;
            competitionType.value = t.type_name
            organizer.value = t.organizer

        }
    }
    api.editApi.queryPrizeOfTerm(queryForm.termId).then(res => {
        prizes.value = res.json.prizes
        loading.value = false
    }).catch(error => {
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}


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

const checkFrom = () => {
    return queryForm.competitionId && queryForm.termId && queryForm.prizeId && queryForm.awardDate;
    // return true;
}

const onSaveButtonClicked = ()=>{

        // 检查团队设置是否正确
        let postDataTeammates = []
        for(let teammate of teammates.value){
            if(teammate.conflict){
                ElMessage.error("请正确设置贡献排序，每个排名必须出现且至多出现一次，不允许并列！")
                return;
            }
            postDataTeammates.push({user_id:teammate.user_id, order:teammate.order})
        }

        api.editApi.editTeam(
            teamId,
            infoNotChanged.value ? null : {
                competition_id: queryForm.competitionId,
                term_id: queryForm.termId,
                prize_id: queryForm.prizeId,
                award_date: queryForm.awardDate,
                desc: queryForm.desc,
            },
            teammatesNotChanged.value ? null : postDataTeammates
        ).then(async res => {
            await uploadImg()
            ElMessage.success("竞赛信息保存成功")
            reloadPage()
        }).catch(error => {
            if(error.network) return
            switch (error.errorCode){
                case 614:
                    ElMessage.error("有队伍成员未被包含，如果你认为这是个错误，请刷新页面。")
                    return;
                case 615:
                    ElMessage.error("有多余的队伍成员，如果你认为这是个错误，请刷新页面。")
                    return;
                case 616:
                    ElMessage.error("贡献设置错误，如果你认为这是个错误，请刷新页面。")
                    return;
                case 617:
                    ElMessage.error("请完成竞赛名称、届别、奖项、获奖日期的填写！")
                    return;
            }
            error.defaultHandler()
        })

}

// 可以判断需不需要上传图片，不用加其他判断了
const uploadImg = async () => {
    console.log(certFile)
    if (!certFile && !isCertImageChanged.value)
        return;

    // 这时候需要清除图片
    if (!certFile && isCertImageChanged.value){
        try {
            let res = await api.editApi.clearCertImage(teamId)
            ElMessage.success("证书清除成功")
        }catch(error){
            loading.value = false
            if (error.network) return
            error.defaultHandler()
        }
        return
    }


    try {
        let res = await api.editApi.uploadImage(teamId, certFile.raw);

        ElMessage.success("证书上传成功")
    }catch(error){
        loading.value = false
        if (error.network) return
        switch (error.errorCode){
            case 611:
                ElMessage.error("证书上传失败，请重试")
                return;
        }
        error.defaultHandler()
    }
}

const sortedTeammates = computed(()=>{
    let ans =  teammates.value.toSorted((a, b) => a.order - b.order);
    let last = undefined;
    let maxOrder = ans.length
    // 由于已经排序，只需检查上一项与这一项的order是否一致
    for(let teammate of ans){
        if(teammate.order > maxOrder){
            teammate.conflict = true;
        }else if(last && last.order === teammate.order){
            last.conflict = true;
            teammate.conflict = true;
        }else{
            teammate.conflict = false;
        }
        last = teammate
    }
    return ans;
})

const teammateOrderOptions = computed(()=>{
    let ans = [];
    let teammateCount = teammates.value.length
    for(let i = 0; i < teammateCount; i++){
        ans.push({v:i + 1})
    }
    return ans;
})

const teammateRowClassName = ({row, rowIndex}) => {
    if(row.conflict)
        return "teammateError";
    else
        return "";
}


const onClearOriginalCertImage = () => {
    certUrl.value = ""
    isCertImageChanged.value = true
}

const onAddStudentClicked = () => {
    //TODO 选择学生的窗口、审核状态显示
    ElMessage.error("这里应该打开一个选择学生的窗口，通过Promise来选择要添加的学生")
}

const onSubmitButtonClicked = () => {
    ElMessageBox.confirm("确认要提交审核吗？如果进行了修改请先保存。", "提交审核",
        {
            type: 'warning'
        }).then(()=>{
        api.editApi.submitToReview(teamId).then(res => {
            ElMessage.success("已提交审核 ")
            router.replace('/competition/view/' + teamId);

        }).catch(error => {
            if(error.network) return
            switch (error.errorCode){
                case 621:
                    ElMessage.error("有队伍成员没有确认贡献")
                    return;
            }
            error.defaultHandler()
        })
    })
}


const setCannotVerify = (_) => {
    teammatesNotChanged.value = false;
}
const setInfoChanged = (_) => {
    infoNotChanged.value = false;
}

const isAnythingChanged = computed(()=>{
    return !infoNotChanged.value || !teammatesNotChanged.value || isCertImageChanged.value;
})

const onNextButtonClicked = async () => {
    if(isAnythingChanged.value === true){
        try{
            await ElMessageBox.confirm("您修改了本份参赛信息，继续将放弃所做的修改，确认继续？", "更改未保存",
                {
                    type: 'warning'
                })
        }catch(e){
            return;
        }
    }
    checkSessionUtil.pushCheckHistory(teamId);
    let nextId = checkSessionUtil.getNext(teamId);
    if(nextId === -1){
        try {
            let res = (await api.checkApi.getNextCheckId(teamId, checkSessionUtil.getCheckSessionId()));
            nextId = res.json.team_id;
        }catch(error){
            if(error.network) return
            error.defaultHandler()
            return;
        }
    }
    if(nextId === -1){
        ElMessage.info("当前没有更多待审核的参赛信息。")
        return;
    }

    await router.push("/competitionCheck/check/" + nextId);
    checkMessage.value = "";
}

const onPreviousButtonClicked = async () => {
    if(isAnythingChanged.value === true){
        try{
            await ElMessageBox.confirm("您修改了本份参赛信息，继续将放弃所做的修改，确认继续？", "更改未保存",
                {
                    type: 'warning'
                })
        }catch(e){
            return;
        }
    }

    checkSessionUtil.pushCheckHistory(teamId);
    let prevId = checkSessionUtil.getPrevious(teamId);
    if(prevId === -1){
        ElMessage.info("当前是您本次审核的第一条参赛信息。")
        return;
    }
    checkMessage.value = "";
    await router.push("/competitionCheck/check/" + prevId);
}

const onRevertButtonClicked = () => {
    ElMessageBox.confirm("确认要确认对本份参赛记录的更改？", "撤销更改",{
        type: 'warning'
    }).then(()=>{
        reloadPage();
    }).catch(()=>{})

}

const onPassButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(teamId, 2, checkMessage.value);
    await onNextButtonClicked();
}

const onDenyButtonClicked = async () => {
    await api.checkApi.changeVerifyStatus(teamId, 3, checkMessage.value);
    await onNextButtonClicked();
    checkMessage.value = "";
}

const onGoBackButtonClicked = () => {
    router.push("/competition/check");
}


</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核参赛信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中审核与修改学生填报的参赛信息。点击“审核通过”或“打回”将修改本份参赛信息的状态并跳转到下一份参赛信息。</p>
            <p>如果需要修改内容后再审核通过，请先点击“保存”，再点击“审核通过”</p>
        </div>

        <div class="operationButtons">
            <el-button type="primary" @click="onGoBackButtonClicked" plain>返回</el-button>
            <el-button type="primary" @click="onPreviousButtonClicked">上一个</el-button>
            <el-button type="primary" @click="onSaveButtonClicked" :disabled="!isAnythingChanged">保存更改</el-button>
            <el-button type="danger" @click="onRevertButtonClicked" :disabled="!isAnythingChanged">撤销更改</el-button>
            <el-button type="success" @click="onPassButtonClicked" :disabled="isAnythingChanged">审核通过</el-button>
            <el-button type="danger" @click="onDenyButtonClicked" :disabled="isAnythingChanged">打回</el-button>
            <el-button type="primary" @click="onNextButtonClicked">下一个</el-button>
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

        <el-row>
            <el-col :span="24">
                <p class="sectionTitle">基础信息</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6">
                <el-form-item label="竞赛名称">
                    <el-select
                        v-model="queryForm.competitionId"
                        filterable
                        remote
                        placeholder="输入关键词进行搜索"
                        remote-show-suffix
                        :remote-method="onCompetitionKeywordInput"
                        :loading="loading"
                        @change="(_)=>{onCompetitionSelected();setInfoChanged(_);}"
                    >
                        <el-option
                            v-for="item in competitions"
                            :key="item.id"
                            :label="item.competition_name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="竞赛届数">
                    <el-select
                        v-model="queryForm.termId"
                        filterable
                        placeholder="请选择"
                        :disabled="!queryForm.competitionId"
                        @change="(_)=>{onTermSelected();setInfoChanged(_);}"
                    >
                        <el-option
                            v-for="item in terms"
                            :key="item.id"
                            :label="item.term_name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="奖项">
                    <el-select
                        v-model="queryForm.prizeId"
                        filterable
                        placeholder="请选择"
                        :disabled="!queryForm.termId"
                        @change="setInfoChanged"
                    >
                        <el-option
                            v-for="item in prizes"
                            :key="item.id"
                            :label="item.prize_name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="获奖日期">
                    <el-date-picker
                        :disabled="!queryForm.termId"
                        v-model="queryForm.awardDate"
                        type="date"
                        placeholder="请选择"
                        @change="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row v-if="queryForm.termId">
            <el-col :span="6">
                <el-form-item label="比赛类型">
                    <el-text>{{competitionType}}</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="主办方">
                    <el-text>{{organizer}}</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="级别">
                    <el-text>{{termLevelName}}</el-text>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="证书">
                    <el-upload action="" :file-list="certificationPictures" accept=".jpg, .jpeg, .png"
                               :auto-upload="false" list-type="picture" :limit="1" :on-exceed="swapImg"
                               ref="elUploadImg" :on-change="onImgUpload">
                        <el-button type="primary">点击选择</el-button>
                        <el-text>&nbsp允许.jpg/.png图片</el-text>
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
                <el-form-item label="描述">
                    <el-input
                        v-model="queryForm.desc"
                        :autosize="{ minRows: 2, maxRows: 10 }"
                        type="textarea"
                        placeholder=""
                        @input="setInfoChanged"
                    />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24">
                <p class="sectionTitle">
                    <span>队员贡献</span>&nbsp
                    <el-button type="primary" @click="onAddStudentClicked">添加学生</el-button>
                </p>
            </el-col>
        </el-row>

        <el-table :data="sortedTeammates" :row-class-name="teammateRowClassName" >
            <el-table-column label="学号" property="stu_id"/>
            <el-table-column label="姓名" property="stu_name"/>
            <el-table-column label="贡献排名">
                <template #default="scope">
                    <el-select v-model="scope.row.order" size="small" @change="setCannotVerify">
                        <el-option
                            v-for="item in teammateOrderOptions"
                            :key="item.v"
                            :label="item.v"
                            :value="item.v"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="确认状态">
                <template #default="scope">
                    <div>
                        <el-tag type="success" v-if="scope.row.verified">已确认</el-tag>
                        <el-tag type="info" v-else>未确认</el-tag>
                    </div>
                </template>
            </el-table-column>

        </el-table>


        <el-divider />

        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item
                v-for="(activity, index) in operationLogs"
                :key="index"
                :timestamp="activity.time"
            >
                {{ activity.msg }}
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

.operationButtons {
    margin: 10px;
    text-align: center;
}

.sectionTitle {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0;
}

:deep(.teammateError) {
    --el-table-tr-bg-color: var(--el-color-error-light-9);
}
</style>