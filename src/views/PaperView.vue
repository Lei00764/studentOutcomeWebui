<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">论文填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改论文信息。
        </div>
        <el-form :inline="true" :model="queryForm" class="queryForm" v-if="showAllElements">
            <el-form-item label="查询字段">
                <el-select v-model="queryForm.field" clearable @change="() => { queryForm.keyword = '' }">
                    <el-option label="无" value="" />
                    <el-option label="ID" value="id" />
                    <el-option v-for="f in fields" :label="f.name" :value="f.field" />
                    <el-option label="状态" value="status_code" />
                </el-select>
            </el-form-item>

            <el-form-item label="关键字" v-if="!isSelectOnly">
                <el-input v-model="queryForm.keyword" placeholder="无" clearable />
            </el-form-item>

            <el-form-item v-if="!isSelectOnly">
                <el-checkbox label="精确匹配" v-model="queryForm.precise" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">筛选</el-button>
                <el-button @click="onClear">清空</el-button>
                <span class="resultCounter">&nbsp; 共 {{ total }} 个结果</span>
            </el-form-item>
        </el-form>

        <div class="operationButtons">
            <span v-if="!showAllElements">
                本账号名下没有竞赛信息，你可以&nbsp;
            </span>
            <el-button type="primary" @click="goNewPaper">填报论文信息</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const queryForm = reactive({
    field: '',
    keyword: '',
    precise: false
})

const total = ref(0)

const fields = [
    { field: "paper_title", name: "论文标题" },
    { field: "author_name", name: "作者" },
    { field: "journal_name", name: "期刊名称" },
];

const onSubmit = () => {
    if (!queryForm.field && queryForm.keyword) {
        ElMessage.error("请选择要筛选的字段，或清空关键字")
        return
    }
    queryFormReal.field = queryForm.field.valueOf()
    queryFormReal.keyword = queryForm.keyword.valueOf()
    queryFormReal.precise = queryForm.precise.valueOf()
    getCompetitionTeam()
}

let showAllElements = ref(true)

const statusCode = {
    0: { name: "草稿", tagType: "info" },
    1: { name: "等待审核", tagType: "warning" },
    2: { name: "审核通过", tagType: "success" },
    3: { name: "审核不通过", tagType: "danger" }
}

const isSelectOnly = computed(() => {
    let ls = ['status_code']
    return ls.includes(queryForm.field)
})

</script>

<style scoped>
.viewWrapper {
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36, 37, 38, .05);
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
</style>