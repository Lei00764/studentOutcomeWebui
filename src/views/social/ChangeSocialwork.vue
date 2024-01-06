<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">社会服务修改</h1>
        <div class="helpText">
            帮助：在本页面中，您可以修改社会服务信息。
        </div>
        <el-form :model="socialworks" label-width="120px" status-icon :rules="rules">

            <el-form-item label="社会服务名称" style="width: 500px" prop="name">
                <el-input v-model="socialworks.social_name" />
            </el-form-item>

            <el-form-item label="日期选择器" prop="time">
                <div class="demo-date-picker">
                    <div class="block">
                        <el-date-picker v-model="socialworks.participate_time" type="date" placeholder="请选择日期" />
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="socialworks.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />
                <el-input v-model="socialworks.duration_hour" placeholder="小时" clearable />
            </el-form-item>

            <el-form-item label="社会服务类型" prop="socialType">
                <el-select v-model="socialworks.social_type" placeholder="请选择">
                    <el-option label="校级" value="校级"></el-option>
                    <el-option label="市级" value="市级"></el-option>
                    <el-option label="省级" value="省级"></el-option>
                    <el-option label="国家级" value="国家级"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="详细描述" prop="socialDetails">
                <el-input v-model="socialworks.social_detail" type="textarea" :rows="4" placeholder="请输入详细描述"></el-input>
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
import { Plus } from '@element-plus/icons-vue';
import api from '@/api/socialWork';
export default {

    data() {
        return {
            socialId: null,
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
            socialworks: {
                social_name: '',
                participate_time: '',
                duration_day: '',
                duration_hour: '',
            },
            operationLogs: [],
            fileList: [],
            evidenceCheck: {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
            },
        };
    },
    methods: {
        getsocialunteerIdFromRoute() {
            this.socialId = this.$route.params.id;
            // 使用 this.socialId 来访问传递过来的 socialId
        },
        onSubmit() {
            console.log('submit!');
            console.log(this.evidenceCheck.dialogImageUrl);

            api.submitCreate({
                social_name: this.socialworks.social_name,
                participate_time: new Date(this.socialworks.participate_time).toISOString().split('T')[0],
                duration_day: this.parseToInt(this.socialworks.duration_day),
                duration_hour: this.parseToInt(this.socialworks.duration_hour),
                evidence: this.evidenceCheck.dialogImageUrl,
                social_type: this.socialworks.social_type,
                social_detail: this.socialworks.social_detail, // 新添加的字段
                social_id: this.socialId
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
    },
    created() {
        this.getsocialunteerIdFromRoute();
        // 在这里可以进行其他初始化操作
    },
};
</script>


<style scoped>
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
</style>
