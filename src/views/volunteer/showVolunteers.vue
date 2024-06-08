<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">志愿填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您的志愿历史记录。
        </div>
        <el-button type="primary" @click="goToCreateVolunteerForm">填报志愿信息</el-button>
        <el-table :data="volunteers" style="width: 100%">
            <el-table-column property="id" label="志愿 ID"></el-table-column>
            <el-table-column property="vol_name" label="志愿服务名称"></el-table-column>
            <el-table-column label="参与日期">
                <template #default="scope">
                    {{ toYYYYmmDD(scope.row.participate_time) }}
                </template>
            </el-table-column>
            <el-table-column label="志愿类型">
                <template #default="scope">
                    {{ volunteerStates.get(scope.row.vol_type) }}
                </template>
            </el-table-column>
            <el-table-column property="duration_hour" label="持续时间（小时）"></el-table-column>
            <el-table-column property="duration_day" label="持续时间（天）"></el-table-column>
            <el-table-column label="审核状态">
                <template #default="scope">
                    <el-tag :type="statusCodeList[scope.row.verify_status].tagType">{{statusCodeList[scope.row.verify_status].name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="goToVolunteerForm(scope.row.id)">修改</el-button>
                    <el-button @click="deleteVolunteer(scope.row.id)" type="danger" plain>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api/volunteers' // 假设你有一个相应的API来获取志愿的数据
import router from "@/router";
import {ElMessage, ElMessageBox} from "element-plus";

const statusCodeList = {
    0:{name:"草稿",tagType:"info"},
    1:{name:"等待审核",tagType:"warning"},
    2:{name:"审核通过",tagType:"success"},
    3:{name:"审核不通过",tagType:"danger"}
}
const volunteers = ref([])
const volunteerStates = new Map()


const goToCreateVolunteerForm = () => {
  router.push('/volunteer/new')  // 这里的路径应该是填报志愿信息页面的路径

}

onBeforeMount(async () => {
    const response2 = await api.viewApi.getStates()
    volunteerStates.clear()
    for(let state of response2.json.states) {
        volunteerStates.set(state.id, state.state_name)
    }

    const response = await api.viewApi.getRecord(); // 假设你有一个方法叫做getVolunteers来获取志愿的数据
    volunteers.value = response.json.volunteers; // 从你给出的数据结构看来，我们需要加上.volunteerInfo来获取志愿的数据
})

const toYYYYmmDD = (dateStr) => {
    let date = new Date(dateStr)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const deleteVolunteer = (volunteerId) => {
    ElMessageBox.confirm("是否删除本志愿服务信息？").then(() => {
        api.editApi.deleteRecord(volunteerId).then(() => {
            ElMessage.success("所选志愿服务信息已经删除")
            let pid = volunteers.value.findIndex(p => p.id === volunteerId)
            volunteers.value.splice(pid, 1)
        }).catch(error => {
            if(error.network) return;
            error.defaultHandler()
        })
    }).catch()
}
const goToVolunteerForm = (id) => {
    router.push('/volunteer/' + id)  // 这里的路径应该是填报专利信息页面的路径
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