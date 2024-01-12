<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">发布通知</h1>
        <div class="helpText">
            帮助：在本页面中，您可以发布个人和系统通知。
        </div>

        <el-form @submit.native.prevent="sendNotice">
            <el-form-item label="通知类型">
                <el-radio-group v-model="notice.type">
                    <el-radio label="personal">个人通知</el-radio>
                    <el-radio label="system">系统通知</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="notice.type === 'personal'">
                <el-button @click="openSelectStudentPanel">选择学生</el-button>
                <div v-if="selectedStudent.stu_id">已选择学生：{{ selectedStudent.stu_name }} ({{ selectedStudent.stu_id }})</div>
            </el-form-item>
            <el-form-item label="通知内容">
                <el-input type="textarea" v-model="notice.content"></el-input>
            </el-form-item>
            <el-form-item label="相关链接">
                <el-input placeholder="请输入友情链接" v-model="notice.related_link"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" native-type="submit">发送通知</el-button>
            </el-form-item>
        </el-form>
    </div>
    <SelectStudentPanel ref="selectStudentPanel" />
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";
import api from "@/api/notice";
import { ElMessage, ElMessageBox, genFileId } from "element-plus";


const notice = reactive({
    type: 'personal',
    content: '',
    userId: '',
    related_link: ''
});

const selectedStudent = ref({});

watch(() => notice.type, (newType, oldType) => {
    if (newType !== oldType) {
        // 清空内容和相关链接
        notice.content = '';
        notice.related_link = '';

        selectedStudent.value = {};
    }
});


const sendNotice = async () => {
    // 如果是个人通知，确保已选择学生
    if (notice.type === 'personal' && !selectedStudent.value.stu_id) {
        ElMessage.error("请选择接收通知的学生");
        return;
    }

    // 验证通知内容是否填写
    if (!notice.content.trim()) {
        ElMessage.error("通知内容不能为空");
        return;
    }

    try {
        if (notice.type === 'personal' && selectedStudent.value.stu_id) {
            await api.sendPersonalNotice(
                selectedStudent.value.stu_id,
                notice.content
            );
        } else {
            await api.sendSystemNotice(
                notice.content,
                notice.related_link
            );
        }
        ElMessage.success("通知发送成功");
    } catch (error) {
        console.log(error);
    }
};

const selectStudentPanel = ref(null);

const openSelectStudentPanel = async () => {
    const student = await selectStudentPanel.value.selectStudent();
    if (student) {
        selectedStudent.value = student;
    }
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

.operationButtons {
    margin-bottom: 10px;
    text-align: center;
}

.sectionTitle {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0;
}

:deep(.teammateError) {
    --el-table-tr-bg-color: var(--el-color-error-light-9);
}
</style>