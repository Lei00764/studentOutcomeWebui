<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">社会服务填报</h1>
        <div class="helpText">
            帮助：在此页面中，您可以查看您的社会实践历史记录。
        </div>
        <el-button type="primary" @click="goToCreateSocialActivity">填报社会服务信息</el-button>
        <el-table :data="socialActivities" style="width: 100%">
            <el-table-column property="id" label="活动 ID"></el-table-column>
            <el-table-column property="society_name" label="活动名称"></el-table-column>
            <el-table-column label="活动类型">
                <template #default="scope">
                    {{ societyTypes[scope.row.society_type] }}
                </template>
            </el-table-column>
            <el-table-column property="participate_time" label="参与日期">
                <template #default="scope">
                    {{ toYYYYmmDD(scope.row.participate_time) }}
                </template>
            </el-table-column>
            <el-table-column property="duration_day" label="持续时间（天）"></el-table-column>
            <el-table-column property="duration_hour" label="持续时间（小时）"></el-table-column>
            <el-table-column property="verify_status" label="审核状态">
                <template #default="scope">
                    <el-tag :type="statusCodeList[scope.row.verify_status].tagType">{{statusCodeList[scope.row.verify_status].name}}</el-tag>
                </template>

            </el-table-column>
            <el-table-column>
                <template #default="scope">
                    <el-button @click="goToSocialActivityForm(scope.row.id)">修改</el-button>
                    <el-button @click="deleteSociety(scope.row.id)" type="danger" plain>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/api/socialWork' // 假设你有一个相关API来获取社会实践的数据
import router from "@/router";
import {ElMessage, ElMessageBox} from "element-plus";

const socialActivities = ref([])

const goToCreateSocialActivity = () => {
  router.push('/socialDetail/new')  // 这里的路径应该是填报社会实践信息页面的路径
}

const goToSocialActivityForm = (id) => {
    router.push('/socialDetail/' + id)  // 这里的路径应该是填报专利信息页面的路径
}

const deleteSociety = (id) => {
    ElMessageBox.confirm("是否删除本社会服务记录？").then(() => {
        api.deleteRecord(id).then(() => {
            ElMessage.success("所选专利已经删除")
            let pid = socialActivities.value.findIndex(p => p.id === id)
            socialActivities.value.splice(pid, 1)
        }).catch(error => {
            if(error.network) return;
            error.defaultHandler()
        })
    }).catch()
}

const statusCodeList = {
    0:{name:"草稿",tagType:"info"},
    1:{name:"等待审核",tagType:"warning"},
    2:{name:"审核通过",tagType:"success"},
    3:{name:"审核不通过",tagType:"danger"}
}

const toYYYYmmDD = (dateStr) => {
    let date = new Date(dateStr)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const societyTypes = {}

onBeforeMount(async () => {
    let types = (await api.getTypes()).json.types
    for (let type of types) {
        societyTypes[type.id] = type.type_name
    }

    const response = await api.getStudentRecords(); // 假设你有一个名为getSocialActivities的方法来获取社会实践的数据
    socialActivities.value = response.json.societies; //获取社会实践的数据
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