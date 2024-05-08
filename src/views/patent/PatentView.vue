<template>
    <div class="viewWrapper">
        <h1 class="pageTitle"> {{ patentId === -1? "新增": "修改" }}专利信息</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改专利申报信息。请先保存再提交审核。
        </div>


        <el-form :model="patent" label-width="120px" status-icon :rules="rules" :disabled="verify_status === 2 || verify_status === 1">
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
                    <el-option v-for="state in patentStates" :label="state.state_name" :value="state.id" :key="state.id"></el-option>

                </el-select>
            </el-form-item>

            <el-form-item label="摘要" prop="abstract">
                <el-input type="textarea" v-model="patent.abstract" :rows="4" />
            </el-form-item>

            <el-upload style="margin-left: 10%;margin-bottom: 2%;" v-model:file-list="fileList" :before-upload="beforeUpload"
                       list-type="picture-card" :on-remove="handleRemove" drag multiple>
                <i class="el-icon-upload"></i>
                <div class="upload-text">拖拽文件至此，或点击上传</div>
            </el-upload>


        </el-form>
        <el-form label-width="120px">
            <el-form-item>
                <el-button v-if="verify_status!== 2 && verify_status!== 1" type="primary" @click="onSubmit" plain class="submit-button-create">保存</el-button>
                <el-button type="primary" @click="onSubmitToReview" plain class="submit-button-create"
                           v-if="patentId !== -1 && verify_status=== 0 || verify_status=== 3">提交审核</el-button>
                <el-button type="primary" @click="onWithdrawReview" plain class="submit-button-create"
                           v-if="patentId !== -1 && verify_status=== 2 || verify_status=== 1 ">撤回修改</el-button>
            </el-form-item>
        </el-form>

        <el-col>
            <p class="sectionTitle">操作日志</p>
        </el-col>
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in operationLogs" :key="index" :timestamp="activity.operation_time">
                {{ activity.operation_text }}
            </el-timeline-item>
        </el-timeline>

    </div>

</template>

<script>

import api from '@/api/patent';
import test from '@/api/competition'
import {ElUpload, ElInput, ElDatePicker, ElForm, ElFormItem, ElButton, ElMessage} from "element-plus";
import router from "@/router";
export default {

    data() {
        return {
            patentId: -1,
            patent: {
                title: '',
                author: '',
                submissionDate: '',
                abstract: '',
                situation: 0
            },
            verify_status: 0,

            /**
             * @type PatentState[]
             */
            patentStates: [],

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

            /**
             * @type PatentOperationLog[]
             */
            operationLogs: [],

            fileList: [],

        };
    },

    methods: {
        beforeUpload(file) {
            test.uploadImage('123',file)
            // 阻止默认的上传行为
            file.url = URL.createObjectURL(file.raw)
            // 返回 false 来阻止默认的上传行为
            return false
        },

        onSubmit() {
            // 提交论文申报日志
            console.log('submit!');
            console.log(this.evidencecheck.attachmentdialogImageUrl);
            /**
             * @type Patent
             */
            let newPatent = {
                //左边是api中获取的变量，右边是paper中自己设定的变量
                patent_abstract: this.patent.abstract,
                submission_date: new Date(this.patent.submissionDate).toISOString().split('T')[0],
                attachments:  "", // this.evidencecheck.attachmentdialogImageUrl,
                patent_author: this.patent.author,
                patent_title: this.patent.title,
                id: this.patentId,
                patent_situation: this.patent.situation,
                verify_status: -1
            }

            if(this.patentId === -1) {
                api.submitCreate(newPatent)
                    .then((res) => {
                        ElMessage.success("成功创建专利信息");
                        router.push("/patentDetail/" + res.json.newPatentId)
                    }).catch(error => {
                    if(error.network) return;
                    error.defaultHandler()
                })
            } else {
                api.changeRecord(newPatent)
                    .then((res) => {
                        ElMessage.success("成功保存专利信息")
                    }).catch(error => {
                    if(error.network) return;
                    error.defaultHandler()
                })
            }




        },

        onSubmitToReview() {
            api.submitToReview(this.patentId).then(res => {
                ElMessage.success("成功提交审核")
                this.verify_status = 1;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        onWithdrawReview() {
            api.withdrawReview(this.patentId).then(res => {
                ElMessage.success("成功撤回审核申请")
                this.verify_status = 0;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        handlePictureCardPreview(uploadFile) {
            // 预览附件图片
            this.attachmentDialogImageUrl = uploadFile.url;
            this.attachmentDialogVisible = true;
        },

        handleRemove(uploadFile, uploadFiles) {
            this.fileList=[]
            console.log(uploadFile, uploadFiles);
        },

        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                return 0;
            }
            return parsedValue;
        },

        reload() {
            api.getStates().then(res => {
                this.patentStates = res.json.states
                this.patent.situation = res.json.states[0].id
            }).then(() => {

                if(router.currentRoute.value.params?.teamId === "new") {
                    this.patentId = -1
                } else {
                    this.patentId = parseInt(router.currentRoute.value.params.teamId)
                    return api.selectStuRecordById(this.patentId).then(res => {
                        let remotePatent = res.json.patent
                        this.patent.title = remotePatent.patent_title
                        this.patent.abstract = remotePatent.patent_abstract
                        this.patent.situation = remotePatent.patent_situation
                        this.patent.author = remotePatent.patent_author
                        this.patent.submissionDate = remotePatent.submission_date
                        this.verify_status = remotePatent.verify_status

                        this.operationLogs = res.json.logs

                    })

                }

            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        }

    },


    mounted() {
        this.reload()
    },

    watch: {
        $route(newRoute) {
            if(!newRoute.path.startsWith("/patentDetail"))
                return

            if(router.currentRoute.value.params?.teamId !== this.patentId) {
                this.reload()
            }
        }
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