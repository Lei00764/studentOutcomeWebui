<script setup>
import {computed, onBeforeMount, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
import api from '@/api/competition'
import globalData from "@/global/global"
import router from "@/router";

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
    {field: "competition_name", name: "比赛"},
    {field: "competition_term_name", name: "届数"},
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
let showAllElements = ref(false)
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

const getCompetitionTeam = () => {
    api.viewApi.getTeamPageWithKeyword(
        queryFormReal.field,
        queryFormReal.keyword,
        queryFormReal.precise,
        currentPage.value
    ).then(res => {
        teams.v = res.json.teams
        total.value = res.json.count
        if(firstFetch){
            showAllElements.value = res.json.count > 0;
            firstFetch = false
        }
    }).catch(error => {
        if(error.network) return
        error.defaultHandler();
    })
}

onBeforeMount(()=>{
    getCompetitionTeam()
})

watch(currentPage, ()=>{
    getCompetitionTeam()
})

const onClear = () => {
    queryForm.field = ''
    queryForm.keyword = ''
    queryForm.precise = false
}


const searchFieldValue = computed(()=>{
    switch(queryForm.field){
        case 'status_code':
            let ans = [];
            for(let nowCode in statusCode){
                ans.push({d:statusCode[nowCode].name, v:nowCode})
            }
            return ans;
        default:
            return []
    }
})

const isSelectOnly = computed(()=>{
    let ls = ['status_code']
    return ls.includes(queryForm.field)
})

const inputInvitationCode = () => {
    ElMessageBox.prompt('请输入邀请码', '邀请码', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
    }).then(({ value }) => {
        api.viewApi.useInvitationCode(value).then(res => {
            ElMessage.success("邀请码输入成功")
            setTimeout(()=>{
                getCompetitionTeam()
            }, 1000)
        }).catch(error => {
            if(error.network) return
            switch(error.errorCode){
                case 606:
                    ElMessage.error("邀请码无效")
                    break;
                default:
                    error.defaultHandler()
            }
        })
    }).catch(() => {

    })
}

const goStartEdit = (row) => {
    router.push("/competition/edit/" + row.team_id)
}

const leaveTeam = (selectedTeamId) => {
    ElMessageBox.confirm("确认要退出本参赛队伍吗？如果你是最后一个成员，本条参赛信息将被删除。", "退出队伍",
        {
            type: 'warning',
            confirmButtonText: '退出'
        }).then(()=>{
        api.viewApi.leaveTeam(selectedTeamId).then(res => {
            ElMessage.success("已从所选参赛队伍中退出。")
            setTimeout(()=>{
                getCompetitionTeam()
            }, 1000)

        }).catch(error => {
            if(error.network) return
            switch (error.errorCode){
                case 612:
                    ElMessage.error("你已经不在队伍中了。")
                    return;
                case 613:
                    ElMessage.error("只能从草稿/打回状态的参赛队伍中退出。")
                    return;
            }
            error.defaultHandler()
        })
    })
}

const goNewTeam = () => {
    router.push("/competition/new");
}

const goViewTeam = (row) => {
    router.push("/competition/view/" + row.team_id)
}

const withdrawTeam = (selectedTeamId) => {
    ElMessageBox.confirm("确认要撤回审核请求？重新审核需要重新排队。", "撤回审核申请",
        {
            type: 'warning',
            confirmButtonText: '撤回'
        }).then(()=>{
        api.viewApi.withdrawSubmittedTeam(selectedTeamId).then(res => {
            ElMessage.success("已撤回所选参赛信息的审核请求。")
            setTimeout(()=>{
                getCompetitionTeam()
            }, 1000)

        }).catch(error => {
            if(error.network) return
            switch (error.errorCode){
                case 622:
                    ElMessage.error("只能撤回等待审核状态的参赛信息。")
                    return;
            }
            error.defaultHandler()
        })
    })
}



</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">竞赛填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改竞赛信息，也可以使用邀请码加入其他人填报的竞赛队伍。
        </div>
        <el-form :inline="true" :model="queryForm" class="queryForm" v-if="showAllElements">
            <el-form-item label="查询字段">
                <el-select
                    v-model="queryForm.field"
                    clearable
                    @change="()=>{queryForm.keyword=''}"
                >
                    <el-option label="无" value="" />
                    <el-option label="ID" value="team_id"/>
                    <el-option v-for="f in fields" :label="f.name" :value="f.field" />
                    <el-option label="状态" value="status_code"/>
                </el-select>
            </el-form-item>

            <el-form-item label="关键字" v-if="!isSelectOnly">
                <el-input v-model="queryForm.keyword" placeholder="无" clearable />
            </el-form-item>
            <el-form-item label="选择" v-if="isSelectOnly">
                <el-select
                    v-model="queryForm.keyword"
                    placeholder="无"
                    clearable
                >
                    <el-option v-for="op in searchFieldValue" :label="op.d" :value="op.v"/>
                </el-select>

            </el-form-item>

            <el-form-item v-if="!isSelectOnly">
                <el-checkbox label="精确匹配" v-model="queryForm.precise"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">筛选</el-button>
                <el-button  @click="onClear">清空</el-button>
                <span class="resultCounter">&nbsp; 共 {{total}} 个结果</span>
            </el-form-item>
        </el-form>
        <div class="operationButtons">
            <span v-if="!showAllElements">
                本账号名下没有竞赛信息，你可以&nbsp;
            </span>
            <el-button type="primary" @click="goNewTeam">填报竞赛信息</el-button>
            <el-button type="primary" @click="inputInvitationCode" >输入邀请码</el-button>
        </div>

        <el-table
            ref="multipleTableRef"
            :data="teams.v"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            v-if="showAllElements"
        >
            <el-table-column property="team_id" label="ID"></el-table-column>
            <el-table-column v-for="f in fields" :property="f.field" :label="f.name"></el-table-column>
            <el-table-column label="审核状态">
                <template #default="scope">
                    <el-tag :type="statusCode[scope.row.status_code].tagType">{{statusCode[scope.row.status_code].name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                        <el-button link type="primary" size="small" @click="goStartEdit(scope.row)"
                                   v-if="scope.row.status_code===0 || scope.row.status_code===3"
                        >编辑</el-button>
                        <el-button link type="primary" size="small" @click="leaveTeam(scope.row.id)"
                                   v-if="scope.row.status_code===0 || scope.row.status_code===3"
                        >退出队伍</el-button>
                        <el-button link type="primary" size="small" @click="goViewTeam(scope.row) " v-else>查看</el-button>
                        <el-button link type="primary" size="small" @click="withdrawTeam(scope.row)"
                                   v-if="scope.row.status_code===1"
                        >撤回</el-button>

                </template>
            </el-table-column>
        </el-table>
        <div class="paginationBlock" v-if="showAllElements">
            <el-pagination layout="prev, pager, next" :total="total" v-model:current-page="currentPage" :default-page-size="20"/>
        </div>

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

.queryForm .el-input {
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