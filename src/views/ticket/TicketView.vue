<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">查看工单信息</h1>
        <div class="helpText">
            帮助：在本页面中，您可以查看工单信息。
        </div>

        <div class="ticket-info">
            <h2>{{ title }}</h2>
            <p>ID: {{ ticketId }}</p>
            <p>内容: {{ content }}</p>
            <p>状态: {{ ticket_status }}</p>
        </div>

        <div class="chat-content">
            <div v-for="(item, index) in ticketContentList.data" :key="index">
                <!-- 管理员消息 -->
                <div class="word admin" v-if="item.sender_type === 'admin'">
                    <img src="/webstatic/admin.png">
                    <div class="info">
                        <p class="time">管理员 {{ formatDateTime(item.send_time) }}</p>
                        <div class="info-content">{{ item.content }}</div>
                    </div>
                </div>
                <!-- 学生消息 -->
                <div class="word student" v-else>
                    <div class="info">
                        <p class="time">学生 {{ formatDateTime(item.send_time) }}</p>
                        <div class="info-content">{{ item.content }}</div>
                    </div>
                    <img src="/webstatic/user.png">
                </div>
            </div>
        </div>
        <div class="input-container">
            <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容"></el-input>
            <el-button type="primary" size="small" @click="replyTicket">回复</el-button>
        </div>
    </div>
</template>


<script setup>
import api from '@/api/ticket.js';
import router from "@/router";
import { useRoute } from "vue-router";
import { computed, reactive, ref, watch, h, onBeforeMount } from "vue";
import { ElMessage, ElMessageBox, genFileId } from "element-plus";
import UserInfoCard from "@/components/UserInfoCard.vue";

const routerWatchable = useRoute()

let ticketId = 0;

if (router.currentRoute.value.params?.ticketId)
    ticketId = parseInt(router.currentRoute.value.params?.ticketId)

watch(routerWatchable, (old, newRoute) => {
    if (router.currentRoute.value.params?.ticketId)
        ticketId = parseInt(router.currentRoute.value.params?.ticketId)
    if (typeof (newRoute.params.ticketId) !== "undefined")
        reloadPage();
})

const reloadPage = () => {
    api.getTicketInfo(ticketId).then(res => {
        title.value = res.data.data.ticket.title
        content.value = res.data.data.ticket.content
        ticket_status.value = res.data.data.ticket.status
    })

    api.getTicketContentList(ticketId).then(res => {
        ticketContentList.data = res.data.data.ticketContents;
    })
}

onBeforeMount(() => {
    reloadPage()
})

const title = ref("")
const content = ref("")
const ticket_status = ref("")
const ticketContentList = reactive({ data: [] });

const replyContent = ref("")

const replyTicket = () => {
    if (!replyContent.value.trim()) {
        ElMessage.warning("回复内容不能为空");
        return;
    }

    api.replyTicket(ticketId, replyContent.value).then(res => {
        ElMessage.success("回复成功");

        // 创建一个临时的按钮来移除焦点
        const tempButton = document.createElement("button");
        tempButton.style.position = "absolute";
        tempButton.style.opacity = "0";
        document.body.appendChild(tempButton);
        tempButton.focus();
        document.body.removeChild(tempButton);

        reloadPage();
    })
}

const formatDateTime = (isoString) => {
    return isoString.replace('T', ' ').slice(0, 19);
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

.ticket-info {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ticket-info h2,
.ticket-info p {
    margin: 10px 0;
}

.ticket-info h2 {
    /* 标题样式 */
    font-size: 1.5em;
    color: #333;
}

.ticket-info p {
    /* 内容样式 */
    font-size: 1.2em;
    color: #666;
}

.chat-content {
    width: 100%;
    padding: 20px;
}

.word {
    display: flex;
    margin-bottom: 20px;

    img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    .info {
        margin-left: 10px;

        .time {
            font-size: 12px;
            color: rgba(51, 51, 51, 0.8);
            margin: 0;
            height: 20px;
            line-height: 20px;
            margin-top: -5px;
        }

        .info-content {
            padding: 10px;
            font-size: 14px;
            background: #fff;
            position: relative;
            margin-top: 8px;
        }

        .info-content::before {
            position: absolute;
            left: -8px;
            top: 8px;
            content: '';
            border-right: 10px solid #FFF;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
        }
    }
}

.word.student {
    display: flex;
    justify-content: flex-end;

    margin-right: 40px;
}

.admin .info-content {
    background: #A3C3F6;
}

.student .info-content {
    background: #F6D8A3;
}


.input-container {
    display: flex;
    /* 启用 Flexbox */
    align-items: center;
    /* 垂直居中 */
    gap: 10px;
    /* 输入框和按钮之间的间隔 */
    margin-top: 20px;
    /* 与上方内容的间隔 */
}

.el-input,
.el-textarea__inner {
    flex-grow: 1;
    /* 输入框占据剩余空间 */
    height: 40px;
    /* 设置输入框高度 */
    border-radius: 4px;
    /* 可选的圆角 */
}

.el-button {
    flex-shrink: 0;
    /* 防止按钮缩小 */
    height: 40px;
    /* 设置按钮高度与输入框一致 */
    border-radius: 4px;
    /* 可选的圆角 */
    padding: 0 15px;
    /* 按钮内边距，根据按钮文本长度调整 */
}
</style>