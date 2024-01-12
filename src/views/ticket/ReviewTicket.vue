<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">工单审批</h1>
        <div class="helpText">
            帮助：在本页面中，您可以审批学生提交的工单。
        </div>

        <el-table :data="ticketList.data">
            <el-table-column property="ticket_id" label="编号">
            </el-table-column>
            <el-table-column property="studentInfo.stu_id" label="学号">
            </el-table-column>
            <el-table-column property="studentInfo.stu_name" label="学生姓名">
            </el-table-column>
            <el-table-column property="ticket_type" label="工单类型">
            </el-table-column>
            <el-table-column property="title" label="标题">
            </el-table-column>
            <el-table-column property="content" label="内容">
            </el-table-column>
            <el-table-column property="status" label="状态">
                <template #default="scope">
                    <span
                        :class="{ 'status-open': scope.row.status === 'OPEN', 'status-close': scope.row.status === 'CLOSE' }">
                        {{ scope.row.status }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="goViewTicket(scope.row)">查看</el-button>
                    <el-button link type="primary" size="small" @click="closeTicket(scope.row)"
                        :disabled="scope.row.status === 'CLOSE'">关闭</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>


<script setup>
import { ref, reactive, onBeforeMount } from "vue";
import api from '@/api/ticket.js';
import apiStudent from '@/api/login.js';
import router from "@/router";
import { ElMessage, ElMessageBox } from 'element-plus';

const ticketList = reactive({ data: [] });


onBeforeMount(() => {
    getAllTicketList()
})

const getAllTicketList = async () => {
    try {
        const response = await api.getAllTicketList();
        const ticketsWithStudentInfo = await Promise.all(
            response.data.data.tickets.map(async (ticket) => {
                const studentResponse = await apiStudent.getStudentInfo(ticket.user_id);
                return { ...ticket, studentInfo: studentResponse.data.data.StudentInfo };
            })
        );
        ticketList.data = ticketsWithStudentInfo;
    } catch (error) {
        console.error("获取工单列表或学生信息失败:", error);
    }
};


const goViewTicket = (row) => {
    router.push("/ticket/viewAdmin/" + row.ticket_id)
}

const closeTicket = (row) => {
    ElMessageBox.confirm('您确定要关闭这个工单吗?', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        api.closeTicket(row.ticket_id).then(res => {
            getAllTicketList();
            ElMessage({
                type: 'success',
                message: '已关闭该工单',
            })
        })
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '操作已取消',
        })
    });
};
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

.status-open {
    padding: 4px 10px;
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 12px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
    font-size: 0.9em;
    font-weight: 600;
}

.status-close {
    padding: 4px 10px;
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 12px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
    font-size: 0.9em;
    font-weight: 600;
}
</style>