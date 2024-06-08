<script setup>
import {computed, onBeforeMount, onMounted, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
// 修改这一行，使用你的API获取志愿服务数据
import api from '@/api/export'
// 如果你没有学生选择面板，可以将这行注释掉
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";

// 原本的重要代码逻辑保留，并修改一些变量名称和结构以符合新的数据结构 


const getVolunteerServiceTeam = () => {
    // 更改此处的API和处理的数据结构，来获取志愿服务数据
    // ... 其它代码
}

onBeforeMount(getVolunteerServiceTeam)
</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">表格导出</h1>
        <div class="helpText">
            帮助：在此页面中，您可以根据提交时间导出表格。
        </div>
    </div>
    <!-- 如果你没有学生选择面板，可以将这行注释掉 -->
    <SelectStudentPanel ref="selectStudentPanel"></SelectStudentPanel>
</template>

<!-- 此处的样式仍然可以使用，如果有特定需求可以根据需要修改 -->
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