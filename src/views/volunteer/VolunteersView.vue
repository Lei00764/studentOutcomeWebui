<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">志愿服务填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以填报志愿服务信息。
        </div>
        <el-form :model="volunteers" label-width="120px" status-icon :rules="rules">

            <el-form-item label="志愿服务名称" style="width: 500px" prop="name">
                <el-input v-model="volunteers.VOL_name" />
            </el-form-item>

            <el-form-item label="日期选择器" prop="time">
                <div class="demo-date-picker">
                    <div class="block">
                        <el-date-picker v-model="volunteers.participate_time" type="date" placeholder="请选择日期" />
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="时长" class="duration-input" prop="duration">
                <el-input v-model="volunteers.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />
                <el-input v-model="volunteers.duration_hour" placeholder="小时" clearable />
            </el-form-item>

            <el-form-item label="志愿服务类型" prop="volType">
                <el-select v-model="volunteers.vol_type" placeholder="请选择">
                    <el-option label="校级" value="校级"></el-option>
                    <el-option label="市级" value="市级"></el-option>
                    <el-option label="省级" value="省级"></el-option>
                    <el-option label="国家级" value="国家级"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="详细描述" prop="volDetails">
                <el-input v-model="volunteers.vol_detail" type="textarea" :rows="4" placeholder="请输入详细描述"></el-input>
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

        <div class="seperate-words">
            <h1>历史填报</h1>
        </div>

        <el-space wrap>
            <el-card v-for="record in HistoryRecord" :key="record.volId" class="box-card"
                style="min-width: 250px; min-height: 300px;">
                <template #header>
                    <div class="card-header">
                        <div class="header-left">
                            <span>{{ record.volName }}</span>
                        </div>
                    </div>
                </template>
                <div class="text item">
                    <p><strong>参加时间: </strong>{{ record.participateTime }}</p>
                    <p><strong>持续时间: </strong>
                        <span v-if="record.durationDay !== 0">{{ record.durationDay }} 天 </span>
                        <span v-if="record.durationHour !== 0">{{ record.durationHour }} 小时</span>
                    </p>
                    <p><strong>志愿类型: </strong>
                        <span v-if="record.volType === null" style="color: gray;">未审核</span>
                        <span v-else style="color: cyan;">{{ record.volType }}</span>
                    </p>
                    <p><strong>审核状态: </strong>
                        <span v-if="record.auditStatus === 'false'" style="color: red;">审核失败</span>
                        <span v-else-if="record.auditStatus === 'true'" style="color: green;">审核通过</span>
                        <span v-else style="color: gray;">未审核</span>
                    </p>
                    <p><strong>ID: </strong>{{ record.volId }}</p>
                    <p><strong>证据图片: </strong><img :src="record.evidence" alt="证据图片"></p>
                </div>
                <div class="card-footer">
                    <el-button class="button" text @click="editRecord(record.volId)" type="primary">修改</el-button>
                    <el-button class="button" text @click="deleteRecord(record.volId)" type="danger">删除</el-button>
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
import api from '@/api/volunteers';
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
            volunteers: {
                VOL_name: '',
                participate_time: '',
                duration_day: '',
                duration_hour: '',
                vol_type: '',      
                vol_detail: '',   
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
                VOL_name: this.volunteers.VOL_name,
                participate_time: new Date(this.volunteers.participate_time).toISOString().split('T')[0],
                duration_day: this.parseToInt(this.volunteers.duration_day),
                duration_hour: this.parseToInt(this.volunteers.duration_hour),
                evidence: this.evidenceCheck.dialogImageUrl,
                vol_type: this.volunteers.vol_type,
                vol_detail: this.volunteers.vol_detail, // 新添加的字段
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
                console.log(res.data); // 假设状态码在 'code' 属性中
                console.log('success');
                this.HistoryRecord = res.data.data.volunteerInfo.map((record) => ({
                    participateTime: record.participate_time,
                    durationDay: record.duration_day,
                    durationHour: record.duration_hour,
                    evidence: record.vol_detail, // 假设 'evidence' 对应 'vol_detail'
                    auditStatus: record.verify_status ? 'verified' : 'unverified',
                    volName: record.vol_name,
                    volDetails: record.vol_detail, // 修复拼写错误 'vol_detiles' 为 'vol_detail'
                    volId: record.id,
                    volType: record.vol_type, // 添加 vol_type
                }));
                // console.log(this.HistoryRecord);
            } catch (err) {
                console.log('fail');
                console.log(err);
            }
        },

        editRecord(volId) {
            console.log(volId);
            this.$router.push({ name: 'changeVolunteers', params: { id: volId } });
        },

        deleteRecord(nowvol_id) {
            console.log(nowvol_id);
            console.log('delete record');
            const vol_id = this.parseToInt(nowvol_id);

            // 注意这里使用的是箭头函数
            const res = api.deleteRecord({ vol_id: vol_id });
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
