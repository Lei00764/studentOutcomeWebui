<script setup>

import {reactive, ref} from "vue";
import api from "@/api/competition";
import CompetitionEditDialog from "@/components/CompetitionEditDialog.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import TermEditDialog from "@/components/TermEditDialog.vue";

const queryForm = reactive({
    competitionId: null,
    termId: null,
    prizeId: null,
})

const infoNotChanged = ref(true)

const /** @type {import("vue").Ref<Competition[]>} */ competitions = ref([])
const /** @type {Map<number, Competition>} */ competitionMap = new Map()
const /** @type {import("vue").Ref<Competition>} */ editingCompetition  = ref()
let /** @type {Competition} */ nowCompetition = {}

const /** @type {import("vue").Ref<CompetitionTerm[]>} */ terms = ref([])
const /** @type {Map<number, CompetitionTerm>} */ termMap  = new Map()
const /** @type {import("vue").Ref<CompetitionTerm>} */ editingTerm  = ref()

const /** @type {Map<number, Prize[]>} */ prizes = reactive(new Map())

const loading = ref(false)
const operationLogs = ref([])

const organizer = ref()
const competitionType = ref()

const competitionEditDialogShow = ref(false)
const termEditDialogShow = ref(false)

const reset = () => {
    competitions.value = []
    editingCompetition.value = {}
    prizes.clear()
    termMap.clear()
    terms.value = []
    queryForm.competitionId = null;
}

const setInfoChanged = (_) => {
    infoNotChanged.value = false;
}

function loadCompetitions (keyword) {
    loading.value = true
    if(keyword === ""){
        return;
    }
    api.editApi.queryCompetition(keyword).then(res => {
        competitions.value = res.json.competitions
        competitionMap.clear()
        for(let competition of res.json.competitions) {
            competitionMap.set(competition.id, competition)
        }

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

    let t = competitionMap.get(competitionId);
    if(!t) return;

    competitionType.value = t.type_name
    organizer.value = t.organizer
    nowCompetition = t

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
        termMap.clear()
        for(let term of res.json.terms) {
            termMap.set(term.id, term)
        }
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

const editCompetition = () => {

    editingCompetition.value = {
        id: nowCompetition.id,
        competition_name: nowCompetition.competition_name,
        organizer: nowCompetition.organizer,
        type_name: nowCompetition.type_name
    }
    competitionEditDialogShow.value = true;
}

const createCompetition = () => {
    editingCompetition.value = {
        id: -1,
        competition_name: "",
        organizer: "",
        type_name: ""
    }
    competitionEditDialogShow.value = true;
}

const deleteCompetition = () => {
    ElMessageBox.confirm("确认要删除竞赛\"" + nowCompetition.competition_name + "\"吗? 所有涉及的届别、奖项、参赛记录等信息将全部被删除！").then(() => {
        api.metadataEditApi.deleteCompetition(nowCompetition.id).then(() => {
            ElMessage.success("竞赛\"" + nowCompetition.competition_name + "\"及其相关记录已全部删除。")
            reset()
        }).catch(error => {
            loading.value = false
            if(error.network) return
            error.defaultHandler()
        })
    })
}

/**
 *
 * @param savedCompetition {Competition}
 */
const onCompetitionSaved = (savedCompetition) => {
    let t = competitionMap.get(savedCompetition.id);
    for(let k in savedCompetition) {
        t[k] = savedCompetition[k];
    }
    competitionType.value = t.type_name
    organizer.value = t.organizer
    editingCompetition.value = t


}

const deleteSelectedTerms = () => {
    let termsToDeleteStr = multipleSelection.value.map(v => v.term_name).join(" ")
    ElMessageBox.confirm(`确定要删除 竞赛届别 ${termsToDeleteStr} 吗？所有涉及的奖项、参赛记录等信息将全部被删除！`).then(() => {
        api.metadataEditApi.deleteCompetitionTerms(multipleSelection.value.map(v => v.id)).then(() => {
            ElMessage.success(`赛届别 ${termsToDeleteStr} 及其相关信息已删除`)
            loadTerms()
        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    })


}

const deleteTerm = (termId) => {
    let termsToDeleteStr = termMap.get(termId).term_name
    ElMessageBox.confirm(`确定要删除 竞赛届别 ${termsToDeleteStr} 吗？所有涉及的奖项、参赛记录等信息将全部被删除！`).then(() => {
        api.metadataEditApi.deleteCompetitionTerms([termId]).then(() => {
            ElMessage.success(`赛届别 ${termsToDeleteStr} 及其相关信息已删除`)
            loadTerms()
        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    })
}

/**
 *
 * @param termToEdit {CompetitionTerm}
 */
const editTerm = (termToEdit) => {

    editingTerm.value = {
        id: termToEdit.id,
        term_name: termToEdit.term_name,
        level_name: termToEdit.level_name
    }
    termEditDialogShow.value = true;
}

/**
 *
 * @param savedTerm {CompetitionTerm}
 */
const onTermSaved = (savedTerm) => {
    console.log("SAVED!")
    if(!termMap.has(savedTerm.id)) {
        terms.value.push(savedTerm);
    } else {
        for(let t of terms.value) {
            if(t.id === savedTerm.id){
                t.term_name = savedTerm.term_name;
                t.level_name = savedTerm.level_name;
                break;
            }

        }
    }
    termMap.set(savedTerm.id, savedTerm)
}

const onTermPrizeSaved = (termId) => {
    prizes.delete(termId)
}

const createTerm = () => {
    editingTerm.value = {
        id: -1,
        term_name: "",
        level_name: ""
    }
    termEditDialogShow.value = true;
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
                <el-button @click="createCompetition">新建</el-button>
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
                <el-button @click="editCompetition" >修改竞赛基本信息</el-button>
                <el-button @click="deleteCompetition">删除</el-button>
            </el-col>
        </el-row>

        竞赛届别：
        <el-button v-if="multipleSelection.length > 0" @click="deleteSelectedTerms">删除所选届别</el-button>
        <el-button v-if="queryForm.competitionId" @click="createTerm">添加</el-button>
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
                <template #default="scope">
                    <el-button @click="editTerm(scope.row)">修改</el-button>
                    <el-button @click="deleteTerm(scope.row.id)">删除</el-button>
                </template>


            </el-table-column>
        </el-table>

        <competition-edit-dialog v-model:show="competitionEditDialogShow" :competition="editingCompetition" @saved="onCompetitionSaved"/>
        <term-edit-dialog v-model:show="termEditDialogShow" :term="editingTerm" @saved="onTermSaved" :competition-id="queryForm.competitionId" @prize-updated="onTermPrizeSaved(editingTerm.id)"/>



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