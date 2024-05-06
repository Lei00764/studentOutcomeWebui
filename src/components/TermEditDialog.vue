<script setup>

import {onBeforeMount, ref, watch} from "vue";
import api from "../api/competition"
import {ElMessage, ElMessageBox} from "element-plus";

const emit = defineEmits(['saved', 'prizeUpdated'])

const show = defineModel("show")

const /** @type {{term:CompetitionTerm, competitionId: number}} */ props = defineProps(['term', 'competitionId'])

const /** @type {import("vue").Ref<CompetitionTerm>} */ editingTerm = ref({})

const /** @type {import('vue').Ref<CompetitionLevel[]>}*/ competitionLevels = ref([])


const /** @type {import('vue').Ref<Prize[]>}*/ prizes = ref([])

const nowLevelId = ref(-1)
let oldTypeId = -1;

watch(show, () => {
    if (show.value !== true)
        return;
    if(props.term.id === undefined)
        return

    for(let k in props.term) {
        editingTerm.value[k] = props.term[k];
    }

    if(editingTerm.value.id === -1) {
        if(competitionLevels.value < 1) return;
        nowLevelId.value = competitionLevels.value[0].id;
        oldTypeId = competitionLevels.value[0].id;
        return;
    }

    // 反查找到类型id
    let found = false;
    for(let type of competitionLevels.value) {
        if(type.levelName === editingTerm.value.level_name) {
            nowLevelId.value = type.id;
            oldTypeId = type.id
            found = type
            break
        }
    }
    if(!found)
        nowLevelId.value = competitionLevels.value[0].id;

    api.editApi.queryPrizeOfTerm(editingTerm.value.id).then(res => {
        prizes.value = res.json.prizes
    })


})

onBeforeMount(() => {
    api.metadataEditApi.getCompetitionLevels().then(res => {
        competitionLevels.value = res.json.levels
    })
})

const saveTerm = () => {
    let modified = false;
    for(let k in props.term) {
        if(props.term[k] !== editingTerm.value[k]) {
            modified = true
            break
        }
    }
    if(!modified && nowLevelId.value === oldTypeId) {
        show.value = false;
        return
    }
    api.metadataEditApi.editCompetitionTerm(
        editingTerm.value.id,
        editingTerm.value.term_name,
        nowLevelId.value,
        props.competitionId
    ).then((res) => {
        for(let level of competitionLevels.value) {
            if(level.id === nowLevelId.value) {
                editingTerm.value.level_name = level.levelName;
            }
            if(editingTerm.value.id === -1) {
                editingTerm.value.id = res.json.newTerm.id
            }
        }

        emit("saved", {
            id: editingTerm.value.id,
            term_name: editingTerm.value.term_name,
            level_name: editingTerm.value.level_name
        })
        show.value = false;
    }).catch(error => {
        if(error.network) return
        error.defaultHandler()
    })

}


const deletePrize = (id) => {
    ElMessageBox.confirm("删除本奖项将删除相关的参赛记录，是否继续？").then(()=> {
        api.metadataEditApi.deleteCompetitionPrize(id).then(() => {

            let l = prizes.value.length;
            for(let i = 0; i < l; ++i) {
                if(prizes.value[i].id === id) {
                    ElMessage.success(`已删除奖项。${prizes.value[i].prize_name}`)
                    prizes.value.splice(i, 1);
                    emit("prizeUpdated")
                    break;
                }
            }
        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    })
}

const editPrize = (id) => {
    ElMessageBox.prompt("请输入新名称").then((newName)=> {
        api.metadataEditApi.editCompetitionPrize(id, newName.value, editingTerm.value.id).then(() => {

            let l = prizes.value.length;
            for(let i = 0; i < l; ++i) {
                if(prizes.value[i].id === id) {
                    ElMessage.success(`已修改奖项。${prizes.value[i].prize_name}`)
                    prizes.value[i].prize_name = newName.value;
                    emit("prizeUpdated", prizes.value)
                    break;
                }
            }
        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    })
}

const createPrize = () => {
    ElMessageBox.prompt("请输入新奖项的名称").then((newName)=> {
        api.metadataEditApi.editCompetitionPrize(-1, newName.value, editingTerm.value.id).then(res => {
            ElMessage.success(`已添加奖项。${newName.value}`)
            prizes.value.push(res.json.newPrize)
            emit("prizeUpdated", prizes.value)

        }).catch(error => {
            if(error.network) return
            error.defaultHandler()
        })
    })
}

</script>

<template>
<el-dialog v-model="show" title="修改本届信息">
    <el-form :label-width="150">
        <el-form-item label="ID">
            {{editingTerm.id === -1 ? "新建届别" : editingTerm.id}}
        </el-form-item>
        <el-form-item label="名称">
            <el-input v-model="editingTerm.term_name" />
        </el-form-item>
        <el-form-item label="本届级别">
            <el-select v-model="nowLevelId">
                <el-option v-for="type in competitionLevels" :key="type.id" :label="type.levelName" :value="type.id"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-button @click="saveTerm">保存</el-button>
        </el-form-item>

    </el-form>


    <div v-if="editingTerm.id !== -1">
        <p class="el-dialog__title">修改本届奖项信息</p>
        <p>对奖项信息的修改将立即保存</p>
        <el-button @click="createPrize">添加</el-button>
        <el-table :data="prizes">
            <el-table-column label="ID" >
                <template #default="scope">
                    {{ scope.row.id === -1 ? "新增" : scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column label="名称" property="prize_name" />
            <el-table-column label="操作" >
                <template #default="scope">
                    <el-button @click="editPrize(scope.row.id)">修改</el-button>
                    <el-button @click="deletePrize(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <div v-else>
        <p class="el-dialog__title">保存后可编辑奖项信息</p>
    </div>

</el-dialog>

</template>

<style scoped>

</style>