<script setup>
import {computed, onBeforeMount, onMounted, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
// 修改这一行，使用你的API获取志愿服务数据
import api from '@/api/volunteer'
import router from "@/router";
// 如果你没有学生选择面板，可以将这行注释掉
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";

// 原本的重要代码逻辑保留，并修改一些变量名称和结构以符合新的数据结构 

const selectedFields = ref([
    // 预先设置好选择状态
    {f: searchableFields[2], sf: {field: 'vol_type', keyword: '校级'}}
])

// 其它代码...

const searchableFields = [
    {field: "id", name: "ID", canApproximate: false},
    {field: "vol_name", name: "活动名称", canApproximate: true},
    {field: "vol_type", name: "活动级别", canApproximate: false,
        selections:[
            {name: "校级", value: '校级'},
            {name: "省市级", value: '省市级'},
            {name: "国家级", value: '国家级'},
            {name: "国际级", value: '国际级'}
        ]
    }
]

const getVolunteerServiceTeam = () => {
    // 更改此处的API和处理的数据结构，来获取志愿服务数据
    // ... 其它代码
}

onBeforeMount(getVolunteerServiceTeam)
</script>

<template>
    <div class="viewWrapper">
        <!-- 其他元素... -->
        <el-table
            ref="multipleTableRef"
            :data="teams.v"
            style="width: 100%"
            @selection-change="handleSelectionChange"
        >
            <el-table-column property="id" label="ID"/>
            <el-table-column property="vol_name" label="活动名称"/>
            <el-table-column property="duration_hour" label="时长（小时）"/>
            <el-table-column property="duration_day" label="时长（天）"/>
            <el-table-column property="participate_time" label="参与时间"/>
            <el-table-column property="vol_type" label="活动级别"/>
        </el-table>
        <!-- 其他元素... -->
    </div>
    <!-- 如果你没有学生选择面板，可以将这行注释掉 -->
    <SelectStudentPanel ref="selectStudentPanel"></SelectStudentPanel>
</template>

<!-- 此处的样式仍然可以使用，如果有特定需求可以根据需要修改 -->
<style scoped>
 /* 这里的样式保留...*/
</style>