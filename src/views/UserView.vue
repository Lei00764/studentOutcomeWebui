<script setup>

import {reactive, ref} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";

const newConfirmation = ref("")
const passwordFrom = reactive({
    new_password: "",
    old_password: ""
})

const doChangePassword = () => {
    if(passwordFrom.new_password === ""){
        ElMessage.error("请输入新密码")
        return;
    }
    if(passwordFrom.old_password === ""){
        ElMessage.error("请输入旧密码")
        return;
    }
    if(passwordFrom.new_password !== newConfirmation.value){
        ElMessage.error("两次输入的新密码不匹配")
        return;
    }

    axios.post("/api/StudentInfo/updatePasswordStudent",passwordFrom).then(res => {
        ElMessageBox.alert("密码修改成功！")
        passwordFrom.new_password = "";
        passwordFrom.old_password = ""
        newConfirmation.value = ""
    }).catch(error => {
        if(error.network) return
        switch(error.errorCode){
            case 602:
                ElMessage.error("新密码不能与旧密码相同")
                break;
            case 603:
                ElMessage.error("新密码长度需要大于等于8位")
                break;
            case 604:
                ElMessage.error("旧密码错误")
                break;
            default:
                error.defaultHandler()
        }
    })
}
</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">修改密码</h1>
        <div class="helpText">
            帮助：您可以在本页面中修改登录密码。
        </div>
        <div class="passwordEditForm">
            <el-form :label-width="120" label-position="left">
                <el-form-item label="旧密码">
                    <el-input type="password" show-password v-model="passwordFrom.old_password"/>
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input type="password" show-password v-model="passwordFrom.new_password"/>
                </el-form-item>
                <el-form-item label="再次输入新密码">
                    <el-input type="password" show-password v-model="newConfirmation"/>
                </el-form-item>
            </el-form>
            <el-button type="primary" @click="doChangePassword">修改</el-button>
        </div>
    </div>
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

.passwordEditForm {
    width: 500px;
}
</style>