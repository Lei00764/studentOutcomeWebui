<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">志愿填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您的志愿历史记录。
        </div>
        <el-button type="primary" @click="goToVolunteerForm">填报志愿信息</el-button>
        <el-table :data="volunteers" style="width: 100%">
            <el-table-column property="id" label="志愿 ID"></el-table-column>
            <el-table-column property="vol_name" label="志愿标题"></el-table-column>
            <el-table-column property="user_id" label="用户ID"></el-table-column>
            <el-table-column property="vol_detail" label="志愿详情"></el-table-column>
            <el-table-column property="participate_time" label="参与日期"></el-table-column>
            <el-table-column property="vol_type" label="志愿类型"></el-table-column>
            <el-table-column property="duration_hour" label="持续时间（小时）"></el-table-column>
            <el-table-column property="duration_day" label="持续时间（天）"></el-table-column>
            <el-table-column property="verify_status" label="审核状态"></el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api/volunteers' // 假设你有一个相应的API来获取志愿的数据
import router from "@/router";

const volunteers = ref([])

const goToVolunteerForm = () => {
  router.push('volunteersDetail')  // 这里的路径应该是填报志愿信息页面的路径
}

onBeforeMount(async () => {
    const response = await api.getRecord(); // 假设你有一个方法叫做getVolunteers来获取志愿的数据
    volunteers.value = response.data.data.volunteerInfo; // 从你给出的数据结构看来，我们需要加上.volunteerInfo来获取志愿的数据
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