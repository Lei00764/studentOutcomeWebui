<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch, h} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import globalData from "@/global/global"
import api from "@/api/competition";
import CertificateUpload from "@/components/CertificateUpload.vue";

const routerWatchable = useRoute()

const actionText = computed(()=>{
    if(router.currentRoute.value.name === "teamNew")
        return "新建"
    if(router.currentRoute.value.name === "teamEdit")
        return "编辑"
    if(router.currentRoute.value.name === "teamView")
        return "查看"
})

let pageMode = router.currentRoute.value.name;
let teamId = 0;
const teamIdRef = ref(0)

if(router.currentRoute.value.params?.teamId) {
    teamId = parseInt(router.currentRoute.value.params?.teamId)
    teamIdRef.value = teamId;
}

watch(routerWatchable,(old,newRoute)=>{
    if(pageMode==="teamNew")
        return;
    if(router.currentRoute.value.params?.teamId) {
        teamId = parseInt(router.currentRoute.value.params?.teamId)
        teamIdRef.value = teamId;
    }
    if(typeof(newRoute.params.teamId) !== "undefined")
        reloadPage();
})

const reloadPage = () => {
    pageMode = router.currentRoute.value.name;
    if(pageMode === "teamNew") return;
    api.editApi.getTeamInfo(teamId).then(res => {
        let competition = res.json.competition
        competitions.value = [competition]
        queryForm.competitionId = competition.id
        competitionType.value = competition.type_name;

        let term = res.json.term
        loadTerms()
        queryForm.termId = term.id
        termLevelName.value = term.level_name
        organizer.value = term.organizer;

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
}
reloadPage()

const competitions = ref([])
const terms = ref([])
const prizes = ref([])
const loading = ref(false)

const operationLogs = ref([])
const teammates = ref([])

const certUrl = ref("")
const isCertImageChanged = ref(false)

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

const certificateUpload = ref()

const loadCompetitions = (keyword) => {
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

const loadTerms = () => {
    queryForm.termId = null;
    queryForm.prizeId = null;
    if(!queryForm.competitionId){
        terms.value = []
        prizes.value = []
        return
    }

    for(let competition of competitions.value) {
        competitionType.value = competition.type_name
        organizer.value = competition.organizer
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



const checkFrom = () => {
    return queryForm.competitionId && queryForm.termId && queryForm.prizeId && queryForm.awardDate;
    // return true;
}

const onSaveButtonClicked = ()=>{
    if(pageMode === "teamNew"){
        if(!checkFrom()){
            ElMessage.error("请完成竞赛名称、届别、奖项、获奖日期的填写！")
            return
        }
        api.editApi.createNewTeam(
            queryForm.competitionId,
            queryForm.termId,
            queryForm.prizeId,
            queryForm.awardDate,
            queryForm.desc
        ).then(res => {
            teamId = res.json.team_id;
            teamIdRef.value = teamId;
            setTimeout(async () => {
                await certificateUpload.value.uploadImg()
                ElMessage.success("竞赛信息保存成功")
                await router.replace("/competition/edit/" + res.json.team_id)
                reloadPage()
            }, 0)

        }).catch(error => {
            if(error.network) return
            switch (error.errorCode) {
                case 630:
                    ElMessage.error("您已经填报了本届比赛的参赛信息，无需重复填报。")
                    return;
            }
            error.defaultHandler()
        })
    }else if(pageMode === "teamEdit"){
        // 检查团队设置是否正确
        let postDataTeammates = []
        for(let teammate of teammates.value){
            if(teammate.conflict){
                ElMessage.error("请正确设置贡献排序，每个排名必须出现且至多出现一次，不允许并列！")
                return;
            }
            postDataTeammates.push({user_id:teammate.user_id, order:teammate.order})
        }

        let stringDate = queryForm.awardDate;
        if(stringDate.getFullYear){
            stringDate = queryForm.awardDate.getFullYear() + "-" + (queryForm.awardDate.getMonth() + 1) +"-" + queryForm.awardDate.getDate()
        }
        api.editApi.editTeam(
            teamId,
            infoNotChanged.value ? null : {
                competition_id: queryForm.competitionId,
                term_id: queryForm.termId,
                prize_id: queryForm.prizeId,
                award_date: stringDate,
                desc: queryForm.desc,
            },
            teammatesNotChanged.value ? null : postDataTeammates
        ).then(async res => {
            await certificateUpload.value.uploadImg()
            ElMessage.success("竞赛信息保存成功")
            window.location.reload();
        }).catch(error => {
            console.log(error)
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




const onCreateCodeClicked = () => {
    api.editApi.createInvitationCode(teamId).then(res => {
        ElMessage.success("已创建邀请码 "+ res.json.code)
        ElMessageBox.alert(h('p', null, [
            h('span', null, "已创建邀请码: "),
            h('span', {style:'color : var(--el-color-primary);'}, res.json.code),
            h('span', null, ". 队员在竞赛信息管理页面可以输入邀请码加入本竞赛队伍。邀请码有效期24小时。")
        ]), "邀请队员")
    }).catch(error => {
        if(error.network) return
        switch (error.errorCode){
            case 617:
                ElMessage.error("只有队长可以创建邀请码")
                return;
        }
        error.defaultHandler()
    })
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

const teammatesNotChanged = ref(true)
const infoNotChanged = ref(true)
const setCannotVerify = (_) => {
    teammatesNotChanged.value = false;
}
const setInfoChanged = (_) => {
    infoNotChanged.value = false;
}

const setVerified = (row) => {
    api.editApi.setRandVerification(teamId, true).then(res => {
        ElMessage.success("已确认贡献排名，当排名发生更改时需要重新确认。")
        row.verified = true;
    }).catch(error => {
        if(error.network) return;
        switch (error.errorCode) {
            case 620:
                ElMessage.error("只有草稿和被打回状态可以修改确认状态。")
                return;
        }
        error.defaultHandler()
    })
}

const cancelVerified = (row) => {
    api.editApi.setRandVerification(teamId, false).then(res => {
        ElMessage.success("已取消确认贡献排名，当排名发生更改时需要重新确认。")
        row.verified = false;
    }).catch(error => {
        if(error.network) return;
        switch (error.errorCode) {
            case 620:
                ElMessage.error("只有草稿和被打回状态可以修改确认状态。")
                return;
        }
        error.defaultHandler()
    })
}

const onImageChanged = () => {
    isCertImageChanged.value = true
}

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">{{actionText}}竞赛信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中{{actionText}}竞赛信息。若要填报不在系统中的竞赛信息，请提交工单。</p>
            <p v-if="pageMode === 'teamEdit'">设置贡献时必须对队员进行排序，每个排名必须出现且至多出现一次，且不允许并列。</p>
        </div>
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
                        :remote-method="loadCompetitions"
                        :loading="loading"
                        @change="(_)=>{loadTerms();setInfoChanged(_);}"
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
                    <certificate-upload
                        ref="certificateUpload"
                        @image-changed="onImageChanged"
                        v-model:cert-url="certUrl"
                        record-type="competition"
                        :record-id="teamIdRef"
                    />
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

        <el-row v-if="pageMode!=='teamNew'">
            <el-col :span="24">
                <p class="sectionTitle">
                    <span>队员贡献</span>&nbsp
                    <el-button type="primary" @click="onCreateCodeClicked">邀请队员</el-button>
                </p>
            </el-col>
        </el-row>
        <el-row v-else>
            <el-col>
                <p>保存后可进一步修改队伍成员及其贡献。</p>
            </el-col>
        </el-row>
        <el-table :data="sortedTeammates" v-if="pageMode!=='teamNew'" :row-class-name="teammateRowClassName" >
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
                    <div v-if="globalData.userInfo.user_id !== scope.row.user_id">
                        <el-tag type="success" v-if="scope.row.verified">已确认</el-tag>
                        <el-tag type="info" v-else>未确认</el-tag>
                    </div>
                    <div v-else>
                        <div v-if="teammatesNotChanged">
                            <el-button size="small" type="danger" @click="cancelVerified(scope.row)" v-if="scope.row.verified">取消确认</el-button>
                            <el-button size="small" type="primary" @click="setVerified(scope.row)" v-else>确认</el-button>

                        </div>
                        <div v-else>
                            <el-tooltip content="你对成员贡献顺序进行了修改，请先保存再进行操作">
                                <el-button disabled size="small" type="danger"  v-if="scope.row.verified">取消确认</el-button>
                                <el-button disabled size="small" type="primary" v-else>确认</el-button>
                            </el-tooltip>
                        </div>

                    </div>

                </template>
            </el-table-column>

        </el-table>
        <div class="operationButtons" v-if="pageMode==='teamNew' || pageMode==='teamEdit'">
            <el-button type="primary" @click="onSaveButtonClicked" :disabled="infoNotChanged && teammatesNotChanged && !isCertImageChanged">保存草稿</el-button>
            <el-button type="primary" @click="onSubmitButtonClicked" v-if="pageMode!=='teamNew'">提交审核</el-button>
        </div>

        <el-divider />

        <el-col v-if="pageMode!=='teamNew'">
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
    margin-top: 10px;
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