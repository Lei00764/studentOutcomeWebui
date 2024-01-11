<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">工单填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报工单。
        </div>
        <el-button type="primary" @click="getNewTicket">填写工单</el-button>

        <el-table :data="ticketList.data">
            <el-table-column property="ticket_id" label="ID">
            </el-table-column>
            <el-table-column property="title" label="title">
            </el-table-column>
            <el-table-column property="content" label="content">
            </el-table-column>
            <el-table-column property="status" label="status">
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="goViewTicket(scope.row)">查看</el-button>
                    <el-button link type="primary" size="small" @click="closeTicket(scope.row)">关闭</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>


<script setup>
import { reactive, onBeforeMount } from "vue";
import api from '@/api/ticket.js';
import router from "@/router";


const ticketList = reactive({ data: [] });

onBeforeMount(() => {
    getTicketList()
})

const getNewTicket = () => {

}

const getTicketList = () => {
    api.getTicketList().then(res => {
        ticketList.data = res.data.data.tickets;
    })

}

const goViewTicket = (row) => {
    router.push("/ticket/view/" + row.ticket_id)
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