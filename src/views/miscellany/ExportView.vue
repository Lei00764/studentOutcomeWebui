<script setup>
import {computed, onBeforeMount, onMounted, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
// 修改这一行，使用你的API获取志愿服务数据
import api from '@/api/export'
// 如果你没有学生选择面板，可以将这行注释掉
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";
import axios from "axios";

// 原本的重要代码逻辑保留，并修改一些变量名称和结构以符合新的数据结构 

const form = ref({
    startDate: '',
    endDate: ''
});

const radio1 = ref('competition')

const toYYYYmmDD = (dateStr) => {
    let date = new Date(dateStr)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const forms = {
    "competition": "竞赛记录",
    "paper": "论文",
    "patent": "专利",
    "social": "社会活动",
    "volunteer": "志愿服务"
}

const exportTable = async () => {
    try {
        let from = toYYYYmmDD(form.value.startDate)
        let to = toYYYYmmDD(form.value.endDate)
        let fileName = `${forms[radio1.value]}${from}_${to}.xlsx`
        downloadURI(`/api/${radio1.value}/export?from=${from}&to=${to}`, fileName);
    } catch (error) {
        ElMessage.error('导出失败，请重试');
    }
}
</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">表格导出</h1>
        <div class="helpText">
            帮助：在此页面中，您可以根据提交时间导出表格。
        </div>

        <div>
            <el-form-item label="导出类型">
                <el-radio-group v-model="radio1">
                    <el-radio-button v-for="(v, k) in forms" :label="k" :key="k">{{v}}</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="开始日期">
                <el-date-picker
                    v-model="form.startDate"
                    type="date"
                    placeholder="选择开始日期"
                    format="YYYY-MM-DD"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="结束日期">
                <el-date-picker
                    v-model="form.endDate"
                    type="date"
                    placeholder="选择结束日期"
                    format="YYYY-MM-DD"
                ></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="exportTable">导出表格</el-button>
            </el-form-item>
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