<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">论文信息填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您填报的论文的历史记录。
        </div>
        <el-button type="primary" @click="goToPaperForm('new')">填报专利信息</el-button>
        <el-table :data="papers" style="width: 100%">
            <el-table-column property="id" label="ID"></el-table-column>
            <el-table-column property="paper_title" label="论文标题"></el-table-column>
            <el-table-column property="paper_author" label="论文作者"></el-table-column>
            <el-table-column  label="提交日期">
                <template #default="scope">
                    {{ toYYYYmmDD(scope.row.submission_date) }}
                </template>
            </el-table-column>

            <el-table-column label="论文状况">
                <template #default="scope">
                    {{ paperStates.get(scope.row.paper_situation) }}
                </template>
            </el-table-column>
            <el-table-column property="verify_status" label="审核状态">
                <template #default="scope">
                    <el-tag :type="statusCodeList[scope.row.verify_status].tagType">{{statusCodeList[scope.row.verify_status].name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="goToPaperForm(scope.row.id)">修改</el-button>
                    <el-button @click="deletePaper(scope.row.id)" type="danger" plain>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import {ref, onBeforeMount} from 'vue'
import api from '@/api/paper' // 这需要根据你的实际api文件调整
import router from "@/router";
import {ElMessage, ElMessageBox} from "element-plus";
// 使用专利的api来获取数据
/**
 * @type {import("vue").Ref<Paper[]>}
 */
const papers = ref([])

/**
 * @type {Map<number, string>}
 */
const paperStates = new Map()

const statusCodeList = {
    0:{name:"草稿",tagType:"info"},
    1:{name:"等待审核",tagType:"warning"},
    2:{name:"审核通过",tagType:"success"},
    3:{name:"审核不通过",tagType:"danger"}
}

const goToPaperForm = (id) => {
    router.push('/paper/' + id)  // 这里的路径应该是填报专利信息页面的路径
}
onBeforeMount(async () => {
    const response2 = await api.getStates()
    paperStates.clear()
    for(let state of response2.json.states) {
        paperStates.set(state.id, state.state_name)
    }

    const response = await api.editApi.getRecord()
    papers.value = response.json.papers // 将数据存储在papers中

})

const toYYYYmmDD = (dateStr) => {
    let date = new Date(dateStr)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const deletePaper = (paperId) => {
    ElMessageBox.confirm("是否删除本专利？").then(() => {
        api.editApi.deleteRecord(paperId).then(() => {
            ElMessage.success("所选专利已经删除")
            let pid = papers.value.findIndex(p => p.id === paperId)
            papers.value.splice(pid, 1)
        }).catch(error => {
            if(error.network) return;
            error.defaultHandler()
        })
    }).catch()
}
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
</style>