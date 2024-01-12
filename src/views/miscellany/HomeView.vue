<script setup>
import { ref, onMounted } from "vue";
import { ElTable, ElTableColumn } from "element-plus";

import api from "@/api/notice.js";

const system_notice = ref([])

const getSystemNotice = () => {
    api.getSystemNotice().then(res => {
        system_notice.value = res.data.data.noticeList
            .sort((a, b) => new Date(a.send_time) - new Date(b.send_time));
    })
}

onMounted(() => {
    getSystemNotice();
})

const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
}
</script>

<template>
    <div class="viewWrapper">
        <span>
        </span>
        <h1 class="pageTitle">首页</h1>
        <div class="helpText">
            帮助：请在侧边栏中选择您需要的功能。
        </div>

        <h2>系统通知</h2>
        <el-table :data="system_notice">
            <el-table-column prop="send_time" label="发送时间" sortable>
                <template #default="{ row }">
                    {{ formatTime(row.send_time) }}
                </template>
            </el-table-column>
            <el-table-column prop="content" label="内容"></el-table-column>
            <el-table-column prop="related_link" label="相关链接"></el-table-column>
        </el-table>
    </div>
</template>

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