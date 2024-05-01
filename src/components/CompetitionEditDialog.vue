<script setup>

import {onBeforeMount, ref, watch} from "vue";
import api from "../api/competition"

const emit = defineEmits(['saved'])

const show = defineModel("show")

/**
 *
 * @type {{competition:Competition}}
 */
const props = defineProps(['competition'])

/**
 * @type {import("vue").Ref<Competition>}
 */
const editingCompetition = ref({})

/**
 *
 * @type {import('vue').Ref<CompetitionType[]>}
 */
const competitionTypes = ref([])
const nowTypeId = ref(-1)
let oldTypeId = -1;

watch(show, () => {
    if (show.value !== true)
        return;
    if(props.competition.id === undefined)
        return

    for(let k in props.competition) {
        editingCompetition.value[k] = props.competition[k];
    }

    if(editingCompetition.value.id === -1) {
        if(competitionTypes.value < 1) return;
        nowTypeId.value = competitionTypes.value[0].id;
        oldTypeId = competitionTypes.value[0].id;
        return;
    }

    // 反查找到类型id
    let found = false;
    for(let type of competitionTypes.value) {
        if(type.name === editingCompetition.value.type_name) {
            nowTypeId.value = type.id;
            oldTypeId = type.id
            found = type
            break
        }
    }
    if(!found)
        nowTypeId.value = -1;

})

onBeforeMount(() => {
    api.metadataEditApi.getCompetitionTypes().then(res => {
        competitionTypes.value = res.json.types
    })
})

const saveCompetition = () => {
    let modified = false;
    for(let k in props.competition) {
        if(props.competition[k] !== editingCompetition.value[k]) {
            modified = true
            break
        }
    }
    if(!modified && nowTypeId.value === oldTypeId) {
        show.value = false;
        return
    }
    api.metadataEditApi.editCompetition(
        editingCompetition.value.id,
        editingCompetition.value.competition_name,
        editingCompetition.value.organizer,
        nowTypeId.value
    ).then((res) => {
        for(let type of competitionTypes.value) {
            if(type.id === nowTypeId.value) {
                editingCompetition.value.type_name = type.name;
            }
        }

        emit("saved", editingCompetition.value)
        show.value = false;
    }).catch(error => {
        if(error.network) return
        error.defaultHandler()
    })


}

</script>

<template>
<el-dialog v-model="show" title="修改竞赛基本信息">
    <el-form :label-width="150">
        <el-form-item label="ID">
            {{editingCompetition.id === -1 ? "新建竞赛" : editingCompetition.id}}
        </el-form-item>
        <el-form-item label="名称">
            <el-input v-model="editingCompetition.competition_name" />
        </el-form-item>
        <el-form-item label="主办方">
            <el-input v-model="editingCompetition.organizer" />
        </el-form-item>
        <el-form-item label="类型">
            <el-select v-model="nowTypeId">
                <el-option v-for="type in competitionTypes" :key="type.id" :label="type.name" :value="type.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button @click="saveCompetition">保存</el-button>
        </el-form-item>
    </el-form>
</el-dialog>

</template>

<style scoped>

</style>