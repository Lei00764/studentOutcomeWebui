<script setup>
import {computed, onBeforeMount, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox, ElUpload, ElDialog, ElInput, ElDatePicker, ElForm, ElFormItem, ElButton} from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
//import api from '@/api/paper'
import globalData from "@/global/global"
import router from "@/router";




</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">专利填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改专利申报信息。
        </div>


        <el-form :model="paper" label-width="120px" status-icon :rules="rules">
            <el-form-item label="专利标题" prop="title">
                <el-input v-model="paper.title" />
            </el-form-item>

            <el-form-item label="作者" prop="author">
                <el-input v-model="paper.author" />
            </el-form-item>

            <el-form-item label="提交日期" prop="submissionDate">
                <el-date-picker v-model="paper.submissionDate" type="date" placeholder="请选择日期" />
            </el-form-item>

            <el-form-item label="专利状态" prop="situation">
                <el-input v-model="paper.situation" />
            </el-form-item>

            <el-form-item label="摘要" prop="abstract">
                <el-input type="textarea" v-model="paper.abstract" :rows="4" />
            </el-form-item>

            <el-form-item label="附件上传" prop="attachments">
                <el-upload v-model:file-list="paper.attachments" action="#" list-type="picture-card"
                            :on-preview="handlePictureCardPreview" :on-remove="handleRemove" drag multiple>
                <el-icon>
                    <Plus />
                    <!-- <i class="el-icon-upload"></i> -->
                </el-icon>
                <div class="upload-text">
                    拖拽文件至此或 <em>点击上传</em>
                </div>
                </el-upload>

                <el-dialog v-model="attachmentDialogVisible">
                <img :src="attachmentDialogImageUrl" alt="附件预览" style="max-width: 100%; max-height: 100%;" />
                </el-dialog>

            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit" plain class="submit-button-create">提交</el-button>
                <el-button class="submit-button-cancel">取消</el-button>
            </el-form-item>
        </el-form>


        <h1 class="pageTitle">历史填报</h1>

        <el-space wrap>
            <el-card v-for="record in historyRecords" :key="record.paperId" class="box-card" style="width: 250px">
                <template #header>
                <div class="card-header">
                    <div class="header-left">
                    <span>{{ record.title }}</span>
                    </div>
                    <div class="header-right">
                    <el-button class="button" text @click="editRecord(record.paperId)" type="primary">修改</el-button>
                    <el-button class="button" text @click="deleteRecord(record.paperId)" type="danger">删除</el-button>
                    </div>
                </div>
                </template>
                <div class="text item">
                <p><strong>提交日期: </strong>{{ record.submissionDate }}</p>
                <p><strong>作者: </strong>{{ record.author }}</p>
                <p><strong>审核状态: </strong>
                    <span v-if="record.auditStatus === 'failed'" style="color: red;">审核失败</span>
                    <span v-else-if="record.auditStatus === 'passed'" style="color: green;">审核通过</span>
                    <span v-else style="color: gray;">未审核</span>
                </p>
                <!-- 显示附件 -->
                <el-upload
                    v-if="record.attachments.length > 0"
                    :file-list="record.attachments"
                    class="upload-list"
                    list-type="picture-card"
                >
                    <el-button size="small" type="text" icon="el-icon-view" @click="viewAttachments(record.attachments)"></el-button>
                </el-upload>
                </div>
            </el-card>
        </el-space>

    </div>

</template>

<script>

export default {

  data() {
    return {
      paper: reactive({
        title: '',
        author: '',
        submissionDate: null,
        abstract: '',
        attachments: [],
        situation: '',
      }),
      attachmentDialogVisible: false,
      attachmentDialogImageUrl: '',
      rules: {
        title: [{ required: true, message: '请填写论文标题', trigger: 'blur' }],
        author: [{ required: true, message: '请填写作者信息', trigger: 'blur' }],
        submissionDate: [{ required: true, message: '请选择提交日期', trigger: 'change' }],
        situation: [{ required: true, message: '请填写专利状态', trigger: 'blur' }],
        abstract: [{ required: true, message: '请填写摘要', trigger: 'blur' }],
      },
    };
  },
  
  methods: {
    onSubmit() {
      // 提交论文申报数据
      ElMessage.success('论文申报成功！');
    },
    handlePictureCardPreview(file) {
      // 预览附件图片
      this.attachmentDialogImageUrl = file.url;
      this.attachmentDialogVisible = true;
    },
    handleRemove(file) {
      // 移除附件
      const index = this.paper.attachments.indexOf(file);
      if (index !== -1) {
        this.paper.attachments.splice(index, 1);
      }
    },
  },
};
</script>

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

.upload-text {
  color: #999;
  font-size: 15px;
  margin-bottom: 10px;
  height: 18px;
}

.upload-text em {
  text-decoration: underline;
  cursor: pointer;
}
</style>