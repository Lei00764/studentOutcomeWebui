<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">社会服务填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报社会服务信息。
        </div>
        <el-form :model="socialwork" label-width="120px" status-icon :rules="rules">

            <el-form-item label="社会服务名称" style="width: 500px" prop="name">
                <el-input v-model="socialwork.social_name" />
            </el-form-item>

            <el-form-item label="日期选择器" prop="time">
                <div class="demo-date-picker">
                    <div class="block">
                        <el-date-picker v-model="socialwork.participate_time" type="date" placeholder="请选择日期" />
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="socialwork.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />
                <el-input v-model="socialwork.duration_hour" placeholder="小时" clearable />
            </el-form-item>

            <el-form-item label="社会服务类型" prop="socialType">
                <el-select v-model="socialwork.social_type" placeholder="请选择">
                    <el-option label="校级" value="校级"></el-option>
                    <el-option label="市级" value="市级"></el-option>
                    <el-option label="省级" value="省级"></el-option>
                    <el-option label="国家级" value="国家级"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="详细描述" prop="socialDetails">
                <el-input v-model="socialwork.social_detail" type="textarea" :rows="4" placeholder="请输入详细描述"></el-input>
            </el-form-item>

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

                <el-dialog v-model="evidenceCheck.dialogVisible">
                    <img w-full :src="evidenceCheck.dialogImageUrl" alt="Preview Image"
                        style="max-width: 100%; max-height: 100%;" />
                </el-dialog>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit" plain class="submit-button-create">Create</el-button>
                <el-button class="submit-button-cancle">Cancel</el-button>
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
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import api from '@/api/socialWork';
export default {

    data() {
        return {
            rules: {
                name: [
                    { required: true, message: '名字不能为空', trigger: 'blur' },
                    // { max: 30, message: '名称最长不能超过30个字', trigger: 'blur' },
                ],
                time: [
                    { required: true, message: '时间不能为空', trigger: 'blur' },
                ],
                duration: [
                    { required: true, message: '时长不能为空', trigger: 'blur' },
                ],
            },
            socialwork: {
                social_name: '',
                participate_time: '',
                duration_day: '',
                duration_hour: '',
                social_type: '',      // 补充
                social_detail: '',    // 补充
            },
            operationLogs: [],
            fileList: [],
            evidenceCheck: {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
            },
            HistoryRecord: [],
        };
    },
    methods: {
        onSubmit() {
            console.log('submit!');
            console.log(this.evidenceCheck.dialogImageUrl);

            api.submitCreate({
                social_name: this.socialwork.social_name,
                participate_time: new Date(this.socialwork.participate_time).toISOString().split('T')[0],
                duration_day: this.parseToInt(this.socialwork.duration_day),
                duration_hour: this.parseToInt(this.socialwork.duration_hour),
                evidence: this.evidenceCheck.dialogImageUrl,
                social_type: this.socialwork.social_type,
                social_detail: this.socialwork.social_detail, // 新添加的字段
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
            this.evidenceCheck.dialogImageUrl = uploadFile.url;
            this.evidenceCheck.dialogVisible = true;
        },
        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                return 0;
            }
            return parsedValue;
        },
        async getHistoryRecord() {
            try {
                // 将 value 转换为 JSON 格式的对象
                const res = await api.getRecord();
                console.log(res.data); 
                console.log('success');
                this.HistoryRecord = res.data.data.map((record) => ({
                    participateTime: record.participate_time,
                    durationDay: record.duration_day,
                    durationHour: record.duration_hour,
                    evidence: record.social_detail, // 假设 'evidence' 对应 'social_detail'
                    auditStatus: record.verify_status ? 'verified' : 'unverified',
                    socialName: record.social_name,
                    socialDetails: record.social_detail, // 修复拼写错误 'social_detiles' 为 'social_detail'
                    socialId: record.social_id,
                    socialType: record.social_type, // 添加 social_type
                }));
                // console.log(this.HistoryRecord);
            } catch (err) {
                console.log('fail');
                console.log(err);
            }
        },

        editRecord(socialId) {
            console.log(socialId);
            this.$router.push({ name: 'changeSocialworks', params: { id: socialId } });
        },

        deleteRecord(nowsocial_id) {
            console.log(nowsocial_id);
            console.log('delete record');
            const social_id = this.parseToInt(nowsocial_id);

            // 注意这里使用的是箭头函数
            const res = api.deleteRecord({ social_id: social_id });
            res.then(() => {
                console.log("成功了");
            }).catch(() => {
                console.log("错误了");
            });

            // 由于是异步操作，下面这行代码会在 Promise 完成之前执行
            console.log(res);
        },

    },
    mounted() {
        this.getHistoryRecord();
    },
};
</script>


<style scoped>
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

.box-card {
    width: 300px;
    margin-bottom: 30px;
}

.seperate-words {
    height: 50px;
    margin-left: 30px;
    margin-top: 50px;
    margin-bottom: 50px;
}
</style>
