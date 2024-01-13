<script setup>

import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import {ref} from "vue";
import SelectStudentPanel from "@/components/SelectStudentPanel.vue";
import router from "@/router";
import api from "@/api/login"

const selectStudentPanel = ref();
const editing = ref();
const selectedStudent = ref({});
const queryFormReal = ref({
    stu_id: '',
    stu_name: '',
    user_id: -1,
    grade: ""
})

const selectStudent = () => {
    selectStudentPanel.value.selectStudent().then((ans)=>{
        console.log(ans);
        selectedStudent.value = ans;
        queryFormReal.value.stu_id = ans.stu_id;
        queryFormReal.value.user_id = ans.user_id;
        queryFormReal.value.stu_name = ans.stu_name;
        queryFormReal.value.grade = ans.grade;
    }).catch((error)=>{
        ElMessage.info("取消选择学生")
    })
}

const onModeChange = () =>{
    queryFormReal.value =  {
        stu_id: '',
        stu_name: '',
        user_id: -1,
        grade: ""
    }
    selectedStudent.value = {};
    console.log(111)
}

const save = async () => {
    if(queryFormReal.value.stu_id === "" || queryFormReal.value.stu_name === "")
        ElMessage.error("请输入学号和姓名。")

    if(editing.value && queryFormReal.value.stu_id !== selectedStudent.value.stu_id){
        try{
            await ElMessageBox.confirm("你修改了学生的学号，这可能导致用户无法登录，确认继续？",                {
                type: 'warning'
            })
        }catch(e){
            return;
        }
    }


    api.modifyStudent(
        queryFormReal.value.user_id,
        queryFormReal.value.stu_name,
        queryFormReal.value.stu_id,
        queryFormReal.value.grade
    ).then(res => {
        if(editing.value) {
            ElMessage.success("用户信息已修改。")
            selectedStudent.value.stu_name = queryFormReal.value.stu_name;
            selectedStudent.value.grade = queryFormReal.value.grade;
            selectedStudent.value.stu_id = queryFormReal.value.stu_id;
        } else {
            ElMessageBox.alert("用户已经创建，可以用学号作为密码登录。")
            queryFormReal.value =  {
                stu_id: '',
                stu_name: '',
                user_id: -1,
                grade: ""
            }

        }

    }).catch(error => {
        if(error.network) return
        switch (error.errorCode){
            case 665:
                ElMessage.error("请输入学号和姓名。")
                return;
            case 666:
                ElMessage.error("已有用户有这个学号了。")
                return;
        }
        error.defaultHandler()
    })
}

const resetPassword = () => {
    ElMessageBox.confirm(`确认要重置用户${queryFormReal.value.stu_name}的密码吗？重置后，该用户需要使用学号作为密码登录。`, "重置密码",
        {
            type: 'warning'
        }).then(()=>{
        api.resetStudentPassword(queryFormReal.value.user_id).then(res => {
            ElMessage.success("该用户的密码已重置 ")

        }).catch(error => {
            if(error.network) return

            error.defaultHandler()
        })
    })
}
</script>

<template>
    <div class="viewWrapper">
    <span>
    </span>
        <h1 class="pageTitle">管理用户</h1>
        <div class="helpText">
            帮助：您可以在本页修改、添加用户的基本信息与重置用户的登录密码。重置后的密码为学号。
        </div>
        <el-form  :inline="true" class="queryForm">
            <el-form-item label="操作模式">
                <el-switch
                    @change="onModeChange"
                    v-model="editing"
                    class="mb-2"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #13ce66"
                    active-text="修改用户"
                    inactive-text="新建用户"
                />
            </el-form-item>
        </el-form>

        <div class="queryForm" v-if="editing">
            <el-form :inline="true">
                <el-form-item label="学号" v-if="selectedStudent.user_id">
                    {{ selectedStudent.stu_id }}
                </el-form-item>
                <el-form-item label="姓名" v-if="selectedStudent.user_id">
                    {{ selectedStudent.stu_name }}
                </el-form-item>
                <el-form-item>
                    <el-button v-if="editing" @click="selectStudent">选择学生</el-button>
                </el-form-item>
            </el-form>

        </div>

        <el-form v-if="selectedStudent.user_id || !editing" label-width="50px" style="width: 500px" label-position="left">
            <el-form-item label="ID">
                <el-text>
                    {{ editing ? queryFormReal.user_id : "自动生成"}}
                </el-text>
            </el-form-item>
            <el-form-item label="学号">
                <el-input v-model="queryFormReal.stu_id"></el-input>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="queryFormReal.stu_name"></el-input>
            </el-form-item>
            <el-form-item label="年级">
                <el-input v-model="queryFormReal.grade"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="resetPassword" type="danger" v-if="editing">重置密码</el-button>
                <el-button @click="save" type="primary">{{ editing ? "保存" : "创建用户"}}</el-button>
            </el-form-item>
        </el-form>


    </div>

    <SelectStudentPanel ref="selectStudentPanel"></SelectStudentPanel>
</template>

<style scoped>
.viewWrapper{
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36,37,38,.05);
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

:deep(.queryForm) .el-input, :deep(.queryForm) .el-select {
    --el-input-width: 220px;
}


</style>