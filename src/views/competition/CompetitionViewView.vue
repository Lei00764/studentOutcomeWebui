<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch, h, onBeforeMount} from "vue";
import api from "@/api/competition"
import {ElMessage, ElMessageBox, genFileId} from "element-plus";
import globalData from "@/global/global"

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

const reloadPage = () => {
    api.editApi.getTeamInfo(teamId).then(res => {
        competition.value = res.json.competition
        queryForm.competitionId = competition.value.id
        competitionType.value = competition.value.type_name;
        organizer.value = competition.value.organizer;

        term.value = res.json.term
        queryForm.termId = term.value.id
        termLevelName.value = term.value.level_name

        prize.value = res.json.prize
        queryForm.prizeId = prize.value.id

        queryForm.awardDate = res.json.award_date
        queryForm.desc = res.json.desc
        operationLogs.value = res.json.logs;

        teammates.value = res.json.members;

        certUrl.value = res.json.certification_img_url;
        statusCode.value = res.json.status
    }).catch(error => {
        console.log(error)
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}
onBeforeMount(()=>{
    reloadPage()
})

const competition = ref({})
const term = ref({})
const prize = ref({})
const loading = ref(false)
const operationLogs = ref([])
const teammates = ref([])

const certUrl = ref("")
const statusCode = ref(0)

const statusCodeList = {
    0:{name:"草稿",tagType:"info"},
    1:{name:"等待审核",tagType:"warning"},
    2:{name:"审核通过",tagType:"success"},
    3:{name:"审核不通过",tagType:"danger"}
}

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

const teammateRowClassName = ({row, rowIndex}) => {
    if(row.conflict)
        return "teammateError";
    else
        return "";
}


</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">查看竞赛信息</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中查看竞赛信息。若要填报不在系统中的竞赛信息，请提交工单。</p>
        </div>
        <el-descriptions
            class="margin-top"
            title="基础信息"
            :column="4"
            border
        >
            <el-descriptions-item label="竞赛名称">
                {{ competition.name }}
            </el-descriptions-item>
            <el-descriptions-item label="竞赛届数">
                {{ term.name }}
            </el-descriptions-item>
            <el-descriptions-item label="奖项">
                {{ prize.name}}
            </el-descriptions-item>
            <el-descriptions-item label="获奖日期">
                {{ queryForm.awardDate }}
            </el-descriptions-item>
            <el-descriptions-item label="比赛类型">
                <el-text>{{competitionType}}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="主办方">
                <el-text>{{organizer}}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="级别">
                <el-text>{{termLevelName}}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="提交状态">
                <el-tag :type="statusCodeList[statusCode].tagType">{{statusCodeList[statusCode].name}}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="4" label="证书">
                <el-image style="max-width: 800px; max-height: 200px; margin-top:10px"
                          fit="contain" :src="certUrl" :preview-src-list="[certUrl]"/>
            </el-descriptions-item>
            <el-descriptions-item :span="4" label="描述">
                {{ queryForm.desc }}
            </el-descriptions-item>
        </el-descriptions>

        <el-row>
            <p class="sectionTitle">队员贡献</p>
        </el-row>
        <el-table :data="sortedTeammates" :row-class-name="teammateRowClassName">
            <el-table-column label="学号" property="stu_id"/>
            <el-table-column label="姓名" property="stu_name"/>
            <el-table-column label="贡献排名" property="order"/>

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