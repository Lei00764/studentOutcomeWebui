<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">社会服务填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您的社会实践历史记录。
        </div>
        <el-button type="primary" @click="goToSocialActivityForm">填报社会服务信息</el-button>
        <el-table :data="socialActivities" style="width: 100%">
            <el-table-column property="social_id" label="活动 ID"></el-table-column>
            <el-table-column property="social_name" label="活动名称"></el-table-column>
            <el-table-column property="socail_type" label="活动类型"></el-table-column>
            <el-table-column property="social_detiles" label="活动详情"></el-table-column>
            <el-table-column property="participate_time" label="参与日期"></el-table-column>
            <el-table-column property="duration_day" label="持续时间（天）"></el-table-column>
            <el-table-column property="duration_hour" label="持续时间（小时）"></el-table-column>
            <el-table-column property="audit_status" label="审核状态"></el-table-column>
            <el-table-column property="evidence" label="证明材料"></el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api/socialWork' // 假设你有一个相关API来获取社会实践的数据
import router from "@/router";

const socialActivities = ref([])

const goToSocialActivityForm = () => {
  router.push('socialDetail')  // 这里的路径应该是填报社会实践信息页面的路径
}

onBeforeMount(async () => {
    const response = await api.getRecord(); // 假设你有一个名为getSocialActivities的方法来获取社会实践的数据
    socialActivities.value = response.data.data; //获取社会实践的数据 
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