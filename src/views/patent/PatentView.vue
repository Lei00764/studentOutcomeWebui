<script setup>
import { computed, onBeforeMount, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, ElUpload, ElDialog, ElInput, ElDatePicker, ElForm, ElFormItem, ElButton } from "element-plus";
import { ref } from 'vue'
import { ElTable } from 'element-plus'
//import api from '@/api/patent'
import globalData from "@/global/global"
import router from "@/router";

</script>

<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">专利填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改专利申报信息。
        </div>


        <el-form :model="patent" label-width="120px" status-icon :rules="rules">
            <el-form-item label="专利标题" prop="title">
                <el-input v-model="patent.title" />
            </el-form-item>

            <el-form-item label="作者" prop="author">
                <el-input v-model="patent.author" />
            </el-form-item>

            <el-form-item label="提交日期" prop="submissionDate">
                <el-date-picker v-model="patent.submissionDate" type="date" placeholder="请选择日期" />
            </el-form-item>
            
            <el-form-item label="专利状态" prop="situation">
                <el-select v-model="patent.situation" placeholder="请选择专利状态">
                    <el-option label="状态1" value="status1"></el-option>
                    <el-option label="状态2" value="status2"></el-option>
                    <el-option label="状态3" value="status3"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="摘要" prop="abstract">
                <el-input type="textarea" v-model="patent.abstract" :rows="4" />
            </el-form-item>

            <el-form-item label="附件上传" prop="evidence">
                <el-upload v-model:file-list="fileList" action="#" list-type="picture-card"
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
        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in operationLogs" :key="index" :timestamp="activity.time">
                {{ activity.msg }}
            </el-timeline-item>
        </el-timeline>

    </div>

</template>

<script>

import api from '@/api/patent';

export default {

    data() {
        return {
            patent: {
                title: '',
                author: '',
                submissionDate: '',
                abstract: '',
                situation: ''
            },

            rules: {
                title: [{ required: true, message: '请填写专利标题', trigger: 'blur' }],
                author: [{ required: true, message: '请填写作者信息', trigger: 'blur' }],
                submissionDate: [{ required: true, message: '请选择提交日期', trigger: 'change' }],
                situation: [{ required: true, message: '请填写专利状态', trigger: 'blur' }],
                abstract: [{ required: true, message: '请填写摘要', trigger: 'blur' }],
            },

            evidencecheck: {
                attachmentdialogImageUrl: '',
                attachmentDialogVisible: false,
                disabled: false,
            },

            HistoryRecord: [],

            operationLogs: [],

            fileList: [],

        };
    },

    methods: {
        onSubmit() {
            // 提交论文申报日志
            console.log('submit!');
            console.log(this.evidencecheck.attachmentdialogImageUrl);

            api.submitCreate({
                //左边是api中获取的变量，右边是paper中自己设定的变量
                user_id: 2,
                patent_title: this.patent.title,
                patent_author: this.patent.author,
                submissionDate: new Date(this.patent.submissionDate).toISOString().split('T')[0],
                evidence: this.evidencecheck.attachmentdialogImageUrl,
            })

                .then((res) => {
                    console.log(res.status);
                })
                .catch((error) => {
                    console.error('Error enrolling in training:', error);
                });

            location.reload();
        },

        handlePictureCardPreview(uploadFile) {
            // 预览附件图片
            this.attachmentDialogImageUrl = uploadFile.url;
            this.attachmentDialogVisible = true;
        },

        handleRemove(uploadFile, uploadFiles) {
            console.log(uploadFile, uploadFiles);
        },

        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                return 0;
            }
            return parsedValue;
        },

        async getHistoryRecord(value) {
            const userid = this.parseToInt(value);
            try {
                const res = await api.getRecord({ user_id: userid });
                if (res.status === 200) {
                    console.log('success');
                    this.HistoryRecord = res.data.data.map((record) => ({
                        //右边是apifox变量，左边是自己设的变量(和上文的函数要相对应)
                        submissionDate: record.submissionDate,
                        author: record.patent_author,
                        title: record.patent_title,
                        evidence: record.evidence,
                        auditStatus: record.patent_situation,
                        patentId: record.patent_id,
                        abstract: record.patent_abstract,
                    }));
                }
            } catch (err) {
                console.log('fail');
                console.log(err);
            }
        },

        editRecord(patentId) {
            console.log(patentId);
            this.$router.push({ name: 'ChangePatentwork', params: { id: patentId } });
        },

        deleteRecord(nowpatent_id) {
            console.log(nowpatent_id);
            console.log('delete record');
            const patent_id = this.parseToInt(nowpatent_id);

            // Using an arrow function for the API call
            const res = api.deleteRecord({ patent_id: patent_id });
            res.then(() => {
                console.log("成功了"); // "Success"
            }).catch(() => {
                console.log("错误了"); // "Error"
            });

            // Asynchronous operation, this line will execute before the Promise settles
            console.log(res);
        },

    },

    mounted() {
        this.getHistoryRecord(2);
    },

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

.sectionTitle {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0;
}

.box-card {
    width: 250px;
    height: 300px;
}

.card-header {
    display: flex;
    justify-content: space-between;
}

.header-left {
    margin-right: 10px;
    /* 根据需要调整左侧元素的右边距 */
}

.text {
    font-size: 14px;
}

.item {
    margin-bottom: 18px;
}

.submit-button-create {
    width: 120px;
    height: 30px;
}

.submit-button-cancel {
    width: 120px;
    height: 30px;
}

.submit-button-cancel:hover {
    /* width: 120px;
    height: 30px; */
    background-color: red;
    color: white;
}
</style>