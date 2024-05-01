<script setup>

import {reactive, ref} from "vue";
import api from "@/api/competition";
import CompetitionEditDialog from "@/components/CompetitionEditDialog.vue";

const queryForm = reactive({
    competitionId: null,
    termId: null,
    prizeId: null,
    awardDate: null,
    desc: ""
})

const infoNotChanged = ref(true)

/**
 * @type {import("vue").Ref<Competition[]>}
 */
const competitions = ref([])

/**
 *
 * @type {import("vue").Ref<Competition>}
 */
const editingCompetition = ref()

/**
 *
 * @type {import("vue").Ref<CompetitionTerm[]>}
 */
const terms = ref([])

/**
 *
 * @type { Map<number, Prize[]>}
 */
const prizes = reactive(new Map())
const loading = ref(false)
const operationLogs = ref([])

const organizer = ref()
const competitionType = ref()

const competitionEditDialogShow = ref(false)

const setInfoChanged = (_) => {
    infoNotChanged.value = false;
}

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

const onCompetitionSelected = (competitionId) => {
    if(!queryForm.competitionId){
        return
    }

    for(let t of competitions.value) {
        if(competitionId === t.id) {
            competitionType.value = t.type_name
            organizer.value = t.organizer
            editingCompetition.value = t
        }
    }
    prizes.clear()
    loadTerms()

}

const loadTerms = () => {
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


const loadPrize = (termId) => {

    api.editApi.queryPrizeOfTerm(termId).then(res => {
        prizes.set(termId, res.json.prizes)
        loading.value = false
    }).catch(error => {
        loading.value = false
        if(error.network) return
        error.defaultHandler()
    })
}

const prizeToStr = (termId) => {
    let p = prizes.get(termId);
    if (!p || p.length === 0){
        return "-"
    }
    let sortedPrizes = p.sort((a , b) => 0 + (a.prize_order < b.prize_order))
    let names = sortedPrizes.map(v => v.prize_name)
    return names.join(" ")

}

/**
 *
 * @type {import("vue").Ref<CompetitionTerm[]>}
 */
const multipleSelection = ref([])
const handleSelectionChange = (val) => {
    multipleSelection.value = val
}

const startCreate = () => {
    editingCompetition.value = {
        id: -1,
        competition_name: "",
        organizer: "",
        type_name: ""
    }
    competitionEditDialogShow.value = true;
}

/**
 *
 * @param savedCompetition {Competition}
 */
const onCompetitionSaved = (savedCompetition) => {
    for(let t of competitions.value) {
        if(savedCompetition.id === t.id) {
            for(let k in savedCompetition) {
                t[k] = savedCompetition[k];
            }
            competitionType.value = t.type_name
            organizer.value = t.organizer
            editingCompetition.value = t
            return
        }
    }


}

</script>

<template>

    <div class="viewWrapper">
        <h1 class="pageTitle">竞赛管理</h1>
        <div class="helpText">
            <p>帮助：您可以在本页面中增删改查竞赛及其相关内容。</p>
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
                        @change="(_)=>{onCompetitionSelected(_);setInfoChanged(_);}"
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
                <el-button @click="startCreate">新建</el-button>
                <el-button>批量导入</el-button>
            </el-col>
        </el-row>
        <el-row v-if="queryForm.competitionId">
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
                <el-button @click="() => {competitionEditDialogShow = true}" >修改竞赛基本信息</el-button>
                <el-button>删除</el-button>
            </el-col>
        </el-row>

        竞赛届别：
        <el-button v-if="multipleSelection.length > 0">删除所选届别</el-button>
        <el-table :data="terms" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column property="id" label="ID"/>
            <el-table-column property="term_name" label="届名"/>
            <el-table-column property="level_name" label="级别"/>
            <el-table-column label="所设奖项">
                <template #default="scope">
                    <span v-if="prizes.has(scope.row.id)">
                        {{ prizeToStr(scope.row.id) }}
                    </span>
                    <el-link v-else @click="loadPrize(scope.row.id)">
                        查看
                    </el-link>
                </template>

            </el-table-column>
            <el-table-column label="操作">
                <el-button>修改</el-button>
                <el-button>删除</el-button>
            </el-table-column>
        </el-table>

        <competition-edit-dialog v-model:show="competitionEditDialogShow" :competition="editingCompetition" @saved="onCompetitionSaved"/>



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