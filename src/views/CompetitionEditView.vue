<script setup>
import router from "@/router";
import {computed, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import { genFileId } from 'element-plus'

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
if(router.currentRoute.value.params?.teamId)
    teamId = router.currentRoute.value.params?.teamId

const competitions = ref([])
const terms = ref([])
const prizes = ref([])
const loading = ref(false)
const certificationPictures = ref([])

const queryForm = reactive({
    competitionId: null,
    termId: null,
    prizeId: null,
    prizeDate: new Date(),
    desc: ""
})

const termOrganizer = ref()
const termType = ref()
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
    if(!queryForm.competitionId){
        terms.value = []
        return
    }
    for(let t of competitions.value){
        if(t.id === queryForm.competitionId){
            competitionType.value = t.type_name
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
            termType.value = t.type_name;
            termOrganizer.value = t.organizer;
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

const teammates = ref([
    {user_id:123, stu_id:13245, stu_name:"STUDENT", order:1}
])

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
                        v-model="queryForm.prizeDate"
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
                    <el-text>{{termOrganizer}}</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="级别">
                    <el-text>{{termType}}</el-text>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="证书">
                    <el-upload action="" :file-list="certificationPictures" accept=".jpg, .jpeg, .png"
                               :auto-upload="false" list-type="picture" :limit="1" :on-exceed="swapImg" ref="elUploadImg">
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
</style>