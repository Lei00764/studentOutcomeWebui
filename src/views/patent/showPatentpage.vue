<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">专利填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您的专利历史记录。
        </div>
        <el-button type="primary" @click="goToPatentForm">填报专利信息</el-button>
        <el-table :data="patents" style="width: 100%">
            <el-table-column property="patent_id" label="专利 ID"></el-table-column>
            <el-table-column property="patent_title" label="专利标题"></el-table-column>
            <el-table-column property="patent_author" label="专利作者"></el-table-column>
            <el-table-column property="patent_abstract" label="专利摘要"></el-table-column>
            <el-table-column property="submissionDate" label="提交日期"></el-table-column>
            <el-table-column property="attachments" label="附件"></el-table-column>
            <el-table-column property="patent_situation" label="专利状况"></el-table-column>
            <el-table-column property="auditStatus" label="审核状态"></el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onBeforeMount} from 'vue'
import api from '@/api/patent' // 这需要根据你的实际api文件调整
import router from "@/router";
// 使用专利的api来获取数据
const patents = ref([])
const goToPatentForm = () => {
  router.push('patentdetile')  // 这里的路径应该是填报专利信息页面的路径
}
onBeforeMount(async () => {
    const response = await api.getRecord()
    patents.value = response.data.data // 将数据存储在patents中
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
</style>