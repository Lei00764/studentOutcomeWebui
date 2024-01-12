<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">工单填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报工单。
        </div>
        <el-button type="primary" @click="toggleModal">填写工单</el-button>

        <el-table :data="ticketList.data">
            <el-table-column property="ticket_id" label="ID">
            </el-table-column>
            <el-table-column property="ticket_type" label="ticket_type">
            </el-table-column>
            <el-table-column property="title" label="title">
            </el-table-column>
            <el-table-column property="content" label="content">
            </el-table-column>
            <el-table-column property="status" label="status">
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
        <el-dialog v-model="showModal" title="填报工单">
            <el-form :model="ticketForm" label-width="80px">
                <el-form-item label="工单类型">
                    <el-select v-model="ticketForm.formType" placeholder="请选择工单类型">
                        <el-option label="竞赛相关" value="competition"></el-option>
                        <el-option label="论文相关" value="paper"></el-option>
                        <el-option label="专利相关" value="patent"></el-option>
                        <el-option label="志愿相关" value="volunteer"></el-option>
                        <el-option label="社会活动相关" value="socity"></el-option>
                        <el-option label="其他" value="other"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标题">
                    <el-input v-model="ticketForm.formTitle"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input type="textarea" v-model="ticketForm.formContent"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showModal = false">取消</el-button>
                <el-button type="primary" @click="submitForm">提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>


<script setup>
import { ref, reactive, onBeforeMount } from "vue";
import api from '@/api/ticket.js';
import router from "@/router";
import { ElMessage, ElMessageBox } from 'element-plus';


const ticketList = reactive({ data: [] });

const showModal = ref(false);  // 是否显示填报工单的弹窗
const ticketForm = reactive({
    formType: '',
    formTitle: '',
    formContent: ''
});

const toggleModal = () => {
    showModal.value = !showModal.value;
};


const submitForm = () => {
    console.log('提交的数据:', ticketForm);

    // 调用后端接口
    api.createTicket(ticketForm.formType, ticketForm.formTitle, ticketForm.formContent).then(res => {
        // console.log(res);
        showModal.value = false;

        // 清空表单
        ticketForm.formType = '';
        ticketForm.formTitle = '';
        ticketForm.formContent = '';

        getTicketList();
    })
};

onBeforeMount(() => {
    getTicketList()
})

const getTicketList = () => {
    api.getTicketList().then(res => {
        ticketList.data = res.data.data.tickets;
    })

}

const goViewTicket = (row) => {
    router.push("/ticket/view/" + row.ticket_id)
}

const closeTicket = (row) => {
    ElMessageBox.confirm('您确定要关闭这个工单吗?', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        api.closeTicket(row.ticket_id).then(res => {
            getTicketList();
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