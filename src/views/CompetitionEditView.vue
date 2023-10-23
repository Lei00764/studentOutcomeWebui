<script setup>
import {useRoute} from "vue-router";
import router from "@/router";
import {computed, reactive, ref, watch} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import { genFileId } from 'element-plus'
const routerWatchable = useRoute()

const actionText = computed(()=>{
    if(router.currentRoute.value.name === "teamNew")
        return "新建"
    if(router.currentRoute.value.name === "teamEdit")
        return "编辑"
    if(router.currentRoute.value.name === "teamView")
        return "查看"
})

const pageMode = router.currentRoute.value.name;
let teamId = 0;

watch(routerWatchable,(old,newRoute)=>{
    if(pageMode==="teamNew")
        return;
    if(router.currentRoute.value.params?.teamId)
        teamId = router.currentRoute.value.params?.teamId
    if(typeof(newRoute.params.teamId) !== "undefined")
        reloadPage();
})

const reloadPage = () => {
    if(pageMode === "teamNew") return;
    axios.post("/api/Competition/getTeamInfo",{
        team_id: teamId
    }).then(res => {
        let competition = res.json.competition
        competitions.value = [competition]
        queryForm.competitionId = competition.id
        competitionType.value = competition.type_name;
        organizer.value = competition.organizer;

        let term = res.json.term
        loadTerms()
        queryForm.termId = term.id
        termLevelName.value = term.level_name

        let prize = res.json.prize
        onTermSelected()
        queryForm.prizeId = prize.id

        queryForm.awardDate = res.json.award_date
        queryForm.desc = res.json.desc
        operationLogs.value = res.json.logs;

        teammates.value = res.json.members;
    }).catch(error => {
        console.log(error)
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}
reloadPage()

if(router.currentRoute.value.params?.teamId)
    teamId = router.currentRoute.value.params?.teamId

const competitions = ref([])
const terms = ref([])
const prizes = ref([])
const loading = ref(false)
const certificationPictures = ref([])
const operationLogs = ref([])
const teammates = ref([])

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

const loadCompetitions = (keyword) => {
    loading.value = true
    if(keyword === ""){
        return;
    }
    axios.post("/api/Competition/queryCompetition",{
        keyword: keyword
    }).then(res => {
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
    for(let t of competitions.value){
        if(t.id === queryForm.competitionId){
            competitionType.value = t.type_name
            organizer.value = t.organizer
        }
    }

    axios.post("/api/Competition/queryTerm",{
        competition_id: queryForm.competitionId
    }).then(res => {
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
    axios.post("/api/Competition/termPrize",{
        term_id: queryForm.termId
    }).then(res => {
        prizes.value = res.json.prizes
        loading.value = false
    }).catch(error => {
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}

// upload 的图片超过上限，把原来的图片换掉
const elUploadImg = ref()
const swapImg = (newFileList) => {
    elUploadImg.value.clearFiles()
    let file = newFileList[0]
    file.uid = genFileId()
    console.log(file)
    elUploadImg.value.handleStart(file)
}
let certFile = null
const onImgUpload = (file)=> {
    certFile = file
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
        axios.post("/api/Competition/newTeam",{
            competition_id: queryForm.competitionId,
            term_id: queryForm.termId,
            prize_id: queryForm.prizeId,
            award_date: queryForm.awardDate,
            desc: queryForm.desc
        }).then(async res => {
            teamId = res.json.team_id;
            console.log(certificationPictures.value)
            if(certFile){
                await uploadImg()
            }
            ElMessage.success("竞赛信息保存成功")
            await router.replace("/competition/edit/" + res.json.team_id)
        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    }
}

const uploadImg = async () => {
    console.log(certFile)
    if (!certFile)
        return;
    try {
        let res = await axios.post("/api/Competition/imgUpload", {
            team_id: teamId,
            image: certFile.raw
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        ElMessage.success("证书上传成功")
    }catch(error){
        loading.value = false
        switch (error.errorCode){
            case 611:
                ElMessage.error("证书上传失败，请重试")
                return;
        }
        if (error.network) return
        error.defaultHandler()
    }
}

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">{{actionText}}竞赛信息</h1>
        <div class="helpText">
            帮助：您可以在本页面中{{actionText}}竞赛信息。
        </div>
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
                        @change="loadTerms"
                    >
                        <el-option
                            v-for="item in competitions"
                            :key="item.id"
                            :label="item.name"
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
                        @change="onTermSelected"
                    >
                        <el-option
                            v-for="item in terms"
                            :key="item.id"
                            :label="item.name"
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

                    >
                        <el-option
                            v-for="item in prizes"
                            :key="item.id"
                            :label="item.name"
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
                    />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row v-if="pageMode!=='teamNew'">
            <el-col :span="24">
                <el-form-item label="队员贡献">
                    <el-button type="primary">邀请队员</el-button>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row v-else>
            <el-col>
                <p>保存后可进一步修改队伍成员及其贡献。</p>
            </el-col>
        </el-row>
        <el-table :data="teammates" v-if="pageMode!=='teamNew'">
            <el-table-column label="学号" property="stu_id"/>
            <el-table-column label="姓名" property="stu_name"/>
            <el-table-column label="贡献排名" property="order"/>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="">移除</el-button>
                </template>
            </el-table-column>

        </el-table>
        <div class="operationButtons" v-if="pageMode==='teamNew' || pageMode==='teamEdit'">
            <el-button type="primary" @click="onSaveButtonClicked">保存</el-button>
        </div>

        <el-divider></el-divider>

        <el-col v-if="pageMode!=='teamNew'">
            <p class="sectionName">操作日志</p>
        </el-col>
<!--        <el-table v-if="pageMode!=='teamNew'">-->
<!--            <el-table-column label="日期" :width="200"/>-->
<!--            <el-table-column label="操作" />-->
<!--        </el-table>-->
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

.sectionName {
    font-size: var(--el-form-label-font-size);
    color: var(--el-text-color-regular);
    margin: 10px 0;
}
</style>