<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">社会活动填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以新建、修改社会活动信息。
        </div>
        <el-form :model="social" label-width="120px" status-icon :rules="rules">

            <el-form-item label="社会活动名称" style="width: 500px" prop="name">
                <el-input v-model="social.VOL_name" />
            </el-form-item>


            <el-form-item label="日期选择器" prop="time">
                <!-- 日期选择器 -->
                <div class="demo-date-picker">
                    <div class="block">
                        <!-- <span class="demonstration">Default</span> -->
                        <el-date-picker v-model="social.participate_time" type="date" placeholder="请选择日期" />
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="social.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />

                <el-input v-model="social.duration_hour" placeholder="小时" clearable />
            </el-form-item>
            <!--详细描述-->
            <el-form-item label="详细描述" style="width: 1000px" prop="detile">
                <el-input type="textarea" v-model="social.social_detile" :rows="4" />
            </el-form-item>
            <!-- 上传佐证材料(图片) el-upload中的换行的属性用于拖拽上传-->
            <!-- action="#"  -->
            <el-form-item label="佐证材料" prop="evidence">
                <el-upload v-model:file-list="fileList" action="#" list-type="picture-card"
                    :on-preview="handlePictureCardPreview" :on-remove="handleRemove" drag mutiple>
                    <el-icon>
                        <Plus />
                    </el-icon>
                    <div class="upload-evidence-text">
                        Drop file here or <em>click to upload</em>
                    </div>
                </el-upload>

                <el-dialog v-model="evidencecheck.dialogVisible">
                    <img w-full :src="evidencecheck.dialogImageUrl" alt="Preview Image"
                        style="max-width: 100%; max-height: 100%;" />
                </el-dialog>


            </el-form-item>


            <el-form-item>
                <el-button type="primary" @click="onSubmit" plain class="submit-button-create">Create</el-button>
                <el-button class="submit-button-cancle">Cancel</el-button>
            </el-form-item>

        </el-form>

        <div class="seperate-words">
            <h1>历史填报</h1>
        </div>

        <!-- 查看历史填报记录  -->
        <el-space wrap>
            <el-card v-for="record in HistoryRecord" :key="record.volId" class="box-card" style="width: 250px">
                <template #header>
                    <div class="card-header">
                        <div class="header-left">
                            <span>{{ record.volName }}</span>
                        </div>
                        <div class="header-right">
                            <el-button class="button" text @click="editRecord(record.volId)" type="primary">修改</el-button>
                            <el-button class="button" text @click="deleteRecord(record.volId)" type="danger">删除</el-button>
                        </div>
                    </div>
                </template>
                <div class="text item">
                    <p><strong>参加时间: </strong>{{ record.participateTime }}</p>
                    <p><strong>持续时间: </strong>
                        <span v-if="record.durationDay !== 0">{{ record.durationDay }} 天 </span>
                        <span v-if="record.durationHour !== 0">{{ record.durationHour }} 小时</span>
                    </p>
                    <p><strong>审核状态: </strong>
                        <span v-if="record.auditStatus === false" style="color: red;">审核失败</span>
                        <span v-else-if="record.auditStatus === true" style="color: green;">审核通过</span>
                        <span v-else style="color: gray;">未审核</span>
                    </p>
                    <img :src="record.evidence" alt="证据图片">
                </div>
            </el-card>
        </el-space>
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
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import api from '@/api/socialWork';

export default {
    name: 'SocialWork',
    data() {
        return {
            rules: {
                name: [
                    { required: true, message: '名字不能为空', trigger: 'blur' },
                ],
                time: [
                    { required: true, message: '时间不能为空', trigger: 'blur' },
                ],
                duration: [
                    { required: true, message: '时长不能为空', trigger: 'blur' },
                ],
                detile: [
                    { required: true, message: '描述不能为空', trigger: 'blur' },
                ],
            },
            fileList: [],
            social: {
                social_name: '',
                participate_time: '',
                duration_day: '',
                duration_hour: '',
                social_detile: ''
            },
            evidencecheck: {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
            },
            HistoryRecord: [],
            operationLogs: [],
        };
    },
    methods: {
        onSubmit() {
            console.log('submit!');
            console.log(this.evidencecheck.dialogImageUrl);

            api.submitCreate({
                user_id: 2,
                social_name: this.social.social_name,
                participate_time: new Date(this.social.participate_time).toISOString().split('T')[0],
                duration_day: this.parseToInt(this.social.duration_day),
                duration_hour: this.parseToInt(this.social.duration_hour),
                evidence: this.evidencecheck.dialogImageUrl,
            })
                .then((res) => {
                    console.log(res.status);
                })
                .catch((error) => {
                    console.error('Error enrolling in training:', error);
                });

            location.reload();
        },
        handleRemove(uploadFile, uploadFiles) {
            console.log(uploadFile, uploadFiles);
        },
        handlePictureCardPreview(uploadFile) {
            this.evidencecheck.dialogImageUrl = uploadFile.url;
            this.evidencecheck.dialogVisible = true;
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
                        participateTime: record.participate_time,
                        durationDay: record.duration_day,
                        durationHour: record.duration_hour,
                        evidence: record.evidence,
                        auditStatus: record.audit_status,
                        socialName: record.social_name,
                        socialId: record.social_id,
                        socialdetile: record.social_detiles,
                    }));
                }
            } catch (err) {
                console.log('fail');
                console.log(err);
            }
        },
        deleteRecord(nowvol_id) {
            console.log('delete record');
            const vol_id = this.parseToInt(nowvol_id);
            const res = api.deleteRecord({ VOL_id: vol_id });
            console.log(res);
            console.log(res.code);
            if (res.code === 200) {
                const index = this.HistoryRecord.findIndex((record) => record.vol_id === vol_id);
                if (index !== -1) {
                    this.HistoryRecord.splice(index, 1);
                }
            }
        },
    },
    mounted() {
        this.getHistoryRecord(2);
    },
};
</script>

<style scoped>
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

.sectionTitle {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0;
}

.helpText {
    margin: 20px 0 20px 0;
    color: #999;
}

.pageTitle {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;
}

.viewWrapper {
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36, 37, 38, .05);
    border-radius: 3px;
    padding: 20px;
}

.demo-date-picker {
    display: flex;
    width: 100%;
    padding: 0;
    flex-wrap: wrap;
}

.demo-date-picker .block {
    padding: 5px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    flex: 1;
    text-align: left;
}

.demo-date-picker .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 20px;
}

.duration-input .el-input {
    --el-input-width: 220px;
}

.upload-evidence-text {
    font-size: 15px;
    margin-bottom: 10px;
    height: 18px;
}

.submit-button-create {
    width: 120px;
    height: 30px;
}

.submit-button-cancle {
    width: 120px;
    height: 30px;
}

.submit-button-cancle:hover {
    /* width: 120px;
    height: 30px; */
    background-color: red;
    color: white;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.text {
    font-size: 14px;
}

.item {
    margin-bottom: 18px;
}

.seperate-words {
    height: 50px;
    margin-left: 30px;
    margin-top: 50px;
    margin-bottom: 50px;
}
</style>
