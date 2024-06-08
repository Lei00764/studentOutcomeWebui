<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">论文填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改论文申报信息。
        </div>


        <el-form :model="paper" label-width="120px" status-icon>
            <el-form-item label="论文标题" prop="title">
                <el-input v-model="paper.title" />
            </el-form-item>

            <el-form-item label="作者" prop="author">
                <el-input v-model="paper.author" />
            </el-form-item>

            <el-form-item label="提交日期" prop="submissionDate">
                <el-date-picker v-model="paper.submissionDate" type="date" placeholder="请选择日期" />
            </el-form-item>

            <el-form-item label="论文状态" prop="situation">
                <el-select v-model="paper.situation" placeholder="请选择论文的当前状态">
                    <el-option v-for="type in paperStates" :label="type.state_name" :value="type.id" :key="type.id"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="附加信息" prop="abstract">
                <el-input type="textarea" v-model="paper.abstract" :rows="4" />
            </el-form-item>


            <el-form-item>
                <div class="operationButtons">
                    <el-button v-if="verify_status!== 2 && verify_status!== 1" type="primary" @click="onSubmit" plain class="submit-button-create">保存</el-button>
                    <el-button type="primary" @click="onSubmitToReview" plain class="submit-button-create"
                               v-if="paperId !== -1 && verify_status=== 0 || verify_status=== 3">提交审核</el-button>
                    <el-button type="primary" @click="onWithdrawReview" plain class="submit-button-create"
                               v-if="paperId !== -1 && verify_status=== 2 || verify_status=== 1 ">撤回修改</el-button>
                </div>
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
import {ElMessage, ElInput, ElDatePicker, ElForm, ElFormItem, ElButton} from "element-plus";
import api from '@/api/paper';
import router from "@/router";
import {nextTick} from "vue";

export default {
    name:'paperView',
    data() {
        return {
            paper: {
                title: '',
                author: '',
                submissionDate: '',
                abstract: '',
                situation: 1,
            },
            verify_status: 0,
            paperId: -1,




            operationLogs: [],

            paperStates: [],

        };
    },

    methods: {
        onSubmit() {
            /**
             *
             * @type Paper
             */
            let newPaper = {
                id: this.paperId,
                paper_title: this.paper.title,
                paper_author: this.paper.author,
                submission_date: new Date(this.paper.submissionDate).toISOString().split('T')[0],
                paper_situation: this.paper.situation,
                verify_status: -1,
                paper_abstract: this.paper.abstract, // 新添加的字段
            }

            if(this.paperId === -1) {
                api.editApi.submitCreate(newPaper)
                    .then((res) => {
                        this.societyId = res.json.newPaperId;
                        ElMessage.success("成功创建论文信息");
                        nextTick(async () => {
                            await router.push("/paper/" + res.json.newPaperId)
                            location.reload()
                        })

                    }).catch(error => {
                    if(error.network) return;
                    error.defaultHandler()
                })
            } else {
                api.editApi.changeRecord(newPaper)
                    .then((res) => {
                        ElMessage.success("成功保存社会服务信息")
                    }).then(() => {

                    location.reload()
                })
                    .catch(error => {
                        if(error.network) return;
                        error.defaultHandler()
                    })
            }
        },

        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                return 0;
            }
            return parsedValue;
        },

        async getRecord() {
            try {
                this.paperStates = (await api.getStates()).json.states

                if(router.currentRoute.value.params?.teamId === "new") {
                    this.paperId = -1
                } else {
                    this.paperId = parseInt(router.currentRoute.value.params.teamId)

                    let res = await api.editApi.selectStuRecordById(this.paperId)
                    let remotePaper = res.json.paper
                    this.paper.abstract = remotePaper.paper_abstract
                    this.paper.title = remotePaper.paper_title
                    this.paper.submissionDate = remotePaper.submission_date
                    this.paper.situation = remotePaper.paper_situation
                    this.paper.author = remotePaper.paper_author


                    this.operationLogs = res.json.logs
                    this.verify_status = remotePaper.verify_status
                }

            } catch (error) {
                if(error.network) return;
                error.defaultHandler()
            }
        },

        onSubmitToReview() {
            api.editApi.submitToReview(this.paperId).then(res => {
                ElMessage.success("成功提交审核")
                this.verify_status = 1;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },

        onWithdrawReview() {
            api.editApi.withdrawReview(this.paperId).then(res => {
                ElMessage.success("成功撤回审核申请")
                this.verify_status = 0;
            }).catch(error => {
                if(error.network) return;
                error.defaultHandler()
            })
        },
    },

    mounted() {
        this.getRecord();
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

.submit-button-create {
    width: 120px;
    height: 30px;
}


</style>