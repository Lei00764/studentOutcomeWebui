<script setup>
import {computed, onBeforeMount, onMounted, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
import api from '@/api/competition'
import checkSessionUtil from "@/utils/checkSession"
import router from "@/router";
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";

const queryForm = reactive({
    field: '',
    keyword: '',
    precise: false
})

const queryFormReal = {
    field: '',
    keyword: '',
    precise: false
}

const currentPage = ref(1)
const total = ref(1)

const fields = [
    {field: "competition_name", name: "比赛名称"},
    {field: "term_name", name: "届数"},
    {field: "prize_name", name: "获奖名称"},
]

const onSubmit = () => {
    if(!queryForm.field && queryForm.keyword){
        ElMessage.error("请选择要筛选的字段，或清空关键字")
        return
    }
    queryFormReal.field = queryForm.field.valueOf()
    queryFormReal.keyword = queryForm.keyword.valueOf()
    queryFormReal.precise = queryForm.precise.valueOf()
    getCompetitionTeam()
}


const multipleTableRef = ref()
const multipleSelection = ref([])
let firstFetch = true
const studentQuery = ref(false)
const selectStudentPanel = ref();

const handleSelectionChange = (val) => {
    multipleSelection.value = val
}

const teams = reactive({v:[]})

const statusCode = {
    0:{name:"草稿",tagType:"info"},
    1:{name:"等待审核",tagType:"warning"},
    2:{name:"审核通过",tagType:"success"},
    3:{name:"审核不通过",tagType:"danger"}
}

/**
 * @typedef FieldSelection 一个字段的所有可选关键词
 * @property {string} name 关键词显示名
 * @property {string} value 关键词实际值
 */

/**
 * @typedef SearchableField 可搜索字段
 * @property {string} field 字段id
 * @property {string} name 字段显示名
 * @property {boolean} canApproximate 是否可以模糊查找（显示精确查找）
 * @property {FieldSelection[] | undefined} selections null代表可以随意输入，否则传入可选关键词数组
 */

/**
 * @typedef CombinedField
 * @property {QueryField} sf
 * @property {SearchableField | undefined} f
 */

/**
 * @type SearchableField[]
 */
const searchableFields = [
    {field: "id", name: "ID", canApproximate: false},
    // {field: "stu_id", name: "学号", canApproximate: false},
    // {field: "stu_name", name: "姓名", canApproximate: true},
    {field: "competition_name", name: "比赛名称", canApproximate: true},
    {field: "term_name", name: "届数", canApproximate: true},
    {field: "prize_name", name: "获奖名称", canApproximate: true},
    {field: "verify_status", name: "状态", canApproximate: false,
        selections:[
            {name:"草稿", value: 0},
            {name:"等待审核", value: 1},
            {name:"审核通过", value: 2},
            {name:"审核不通过", value: 3},
        ]
    }
]


/**
 * @type {Ref<UnwrapRef<CombinedField[]>>}
 */
const selectedFields = ref([

])
const selectedStudent = ref({})

const getCompetitionTeam = () => {
    if(studentQuery.value){
        let userId = selectedStudent.value.user_id;
        api.checkApi.getTeamPageWithStudent(
            userId,
            currentPage.value
        ).then(res => {
            teams.v = res.json.teams
            total.value = res.json.count
            if(firstFetch){
                firstFetch = false
            }
        }).catch(error => {
            if(error.network) return
            error.defaultHandler();
        })
    }else{
        let fields = [];
        for(let sf of selectedFields.value){
            if(sf.sf.keyword !== "")
                fields.push(sf.sf)
        }

        api.checkApi.getTeamPageWithKeyword(
            fields,
            currentPage.value
        ).then(res => {
            teams.v = res.json.teams
            total.value = res.json.count
            if(firstFetch){
                firstFetch = false
            }
        }).catch(error => {
            if(error.network) return
            error.defaultHandler();
        })
    }

}



watch(currentPage, ()=>{
    getCompetitionTeam()
})

const onClear = () => {
    selectedFields.value = [];
    selectedStudent.value = {};
}

const goStartCheck = (row) => {
    checkSessionUtil.getCheckSessionId(true);
    router.push("/competitionCheck/" + row.team_id)
}



/**
 * 查找可用的字段，排除自己当前的字段
 * @param {CombinedField} myField
 * @return {SearchableField[]}
 */
const getAvailableFields = (myField)=>{
    let ans = [];
    for(let f of searchableFields){
        let notIn = true;
        for(let sf of selectedFields.value){
            if(f.field === sf.sf.field && myField.sf.field !== f.field ){
                notIn = false;
                break;
            }

        }
        if(notIn)
            ans.push(f);
    }
    return ans;
}


const addField = () => {
    selectedFields.value.push({sf: {field:"", keyword:""}})
}

const removeField = (sf) => {
    let l = selectedFields.value.length
    for(let i = 0; i < l; i++){
        if(selectedFields.value[i] === sf){
            selectedFields.value.splice(i,1);
        }
    }
}

/**
 * @param {{sf: QueryField, f:SearchableField | undefined}} selectedField
 */
const onFieldSelected = (selectedField) => {
    selectedField.sf.keyword = "";
    for(let f of searchableFields){
        if(f.field === selectedField.sf.field){
            selectedField.f = f;
            if(f.canApproximate){
                selectedField.sf.precise = true;
            }
            return;
        }
    }
    selectedField.f = undefined;
}

const selectStudent = () => {
    selectStudentPanel.value.selectStudent().then((ans)=>{
        console.log(ans);
        selectedStudent.value = ans;
    }).catch((error)=>{
        ElMessage.info("取消选择学生")
    })
}


onBeforeMount(()=>{
    // 预先设置好选择“等待审核”状态

    selectedFields.value.push({
        f: searchableFields[4],
        sf: {field: 'verify_status', keyword: 1}
    })
    getCompetitionTeam()
})

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核参赛记录</h1>
        <div class="helpText">
            帮助：在本页面中，您可以查询并审核学生提交的参赛记录。查询条件间的关系为“与”
        </div>
        <div>
            <el-form  :inline="true" class="queryForm">
                <el-form-item label="查询模式">
                    <el-switch
                        v-model="studentQuery"
                        class="mb-2"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #13ce66"
                        active-text="按学生查询"
                        inactive-text="全局查询"
                    />
                </el-form-item>
            </el-form>

        </div>

        <div>
            <div v-if="!studentQuery">
                <el-form v-for="sf in selectedFields" :inline="true" class="queryForm">
                    <el-form-item label="查询字段">
                        <el-select
                            v-model="sf.sf.field"
                            clearable
                            @change="onFieldSelected(sf)"
                        >

                            <el-option v-for="f in getAvailableFields(sf)" :label="f.name" :value="f.field" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="关键词" v-if="!sf.f || !sf.f.selections">
                        <el-input v-model="sf.sf.keyword" placeholder="无" clearable :disabled="!sf.f" />
                    </el-form-item>

                    <el-form-item label="选择" v-else :label-width="54">
                        <el-select
                            v-model="sf.sf.keyword"
                            placeholder="无"
                            clearable
                        >
                            <el-option v-for="op in sf.f.selections" :label="op.name" :value="op.value" :key="op.value"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="sf.f?.canApproximate">
                        <el-checkbox label="精确匹配" v-model="sf.sf.precise"/>
                    </el-form-item>

                    <el-form-item>
                        <el-button @click="removeField(sf)">
                            -
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div v-else class="queryForm">
                <el-form :inline="true">
                    <el-form-item label="学号" v-if="selectedStudent.user_id">
                        {{ selectedStudent.stu_id }}
                    </el-form-item>
                    <el-form-item label="姓名" v-if="selectedStudent.user_id">
                        {{ selectedStudent.stu_name }}
                    </el-form-item>
                </el-form>

            </div>

            <el-form>
                <el-form-item>
                    <el-button v-if="studentQuery" @click="selectStudent">选择学生</el-button>
                    <el-button v-else @click="addField" :disabled="selectedFields.length >= searchableFields.length">添加条件</el-button>
                    <el-button  @click="onClear">清空</el-button>
                    <el-button type="primary" @click="onSubmit">筛选</el-button>
                    <span class="resultCounter">&nbsp; 共 {{total}} 个结果</span>
                </el-form-item>
            </el-form>

        </div>


        <el-table
            ref="multipleTableRef"
            :data="teams.v"
            style="width: 100%"
            @selection-change="handleSelectionChange"
        >
            <el-table-column property="team_id" label="ID"/>
            <el-table-column label="队员学号">
                <template #default="scope">
                    <p v-for="sn in scope.row.students">{{sn.stu_id}}</p>
                </template>
            </el-table-column>
            <el-table-column label="队员姓名">
                <template #default="scope">
                    <p v-for="sn in scope.row.students">{{sn.stu_name}}</p>
                </template>
            </el-table-column>
            <el-table-column v-for="f in fields" :property="f.field" :label="f.name"></el-table-column>
            <el-table-column label="审核状态">
                <template #default="scope">
                    <el-tag :type="statusCode[scope.row.status_code].tagType">{{statusCode[scope.row.status_code].name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="goStartCheck(scope.row) ">审核</el-button>

                </template>
            </el-table-column>
        </el-table>
        <div class="paginationBlock">
            <el-pagination layout="prev, pager, next" :total="total" v-model:current-page="currentPage" :default-page-size="20"/>
        </div>

    </div>

    <SelectStudentPanel ref="selectStudentPanel"></SelectStudentPanel>
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

:deep(.queryForm) .el-input, :deep(.queryForm) .el-select {
    --el-input-width: 220px;
}

.operationButtons{
    margin-bottom: 20px;
    height: 32px;
    width: 100%;
}

.paginationBlock {
    display: flex;
    justify-content: center;
    margin: 10px 0;
}

.resultCounter{
    color: #999;
}

.dialog-footer{
    text-align: center;
}
</style>