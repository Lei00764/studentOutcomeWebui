<template>
     <div class="viewWrapper">
        <h1 class="pageTitle">志愿服务填报</h1>
        <div class="helpText">
            帮助：在本页面中，您可以修改志愿填报信息。
        </div>
    <el-form :model="volunteers" label-width="120px" status-icon :rules="rules">

        <el-form-item label="志愿服务名称" style="width: 500px" prop="name">
            <el-input v-model="volunteers.VOL_name" />
        </el-form-item>


        <el-form-item label="日期选择器" prop="time">
            <!-- 日期选择器 -->
            <div class="demo-date-picker">
                <div class="block">
                    <!-- <span class="demonstration">Default</span> -->
                    <el-date-picker v-model="volunteers.participate_time" type="date" placeholder="请选择日期" />
                </div>
            </div>
        </el-form-item>

        <el-form-item label="时长" class="duration-input" prop="duration">
            <el-input v-model="volunteers.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />

            <el-input v-model="volunteers.duration_hour" placeholder="小时" clearable />
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

    <!-- 查看历史填报记录 暂时未做分页处理 -->

    <el-space wrap>
    <el-card v-for="record in HistoryRecord" :key="record.vol_id" class="box-card" style="width: 250px">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>{{ record.vol_name }}</span>
          </div>
          <div class="header-right">
            <el-button class="button" text @click="editRecord(record.vol_id)" type="primary">修改</el-button>
            <el-button class="button" text @click="deleteRecord(record.vol_id)" type="danger">删除</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <p><strong>参加时间: </strong>{{ record.participate_time }}</p>
        <p><strong>持续时间: </strong>
          <span v-if="record.duration_day !== 0">{{ record.duration_day }} 天 </span>
          <span v-if="record.duration_hour !== 0">{{ record.duration_hour }} 小时</span>
        </p>
        <p><strong>志愿类型: </strong>
          <span v-if="record.vol_type === 'null'" style="color: gray;">未审核</span>
          <span v-else style="color: cyan;">{{ record.vol_type }}</span>
        </p>
        <p><strong>审核状态: </strong>
          <span v-if="record.audit_status === false" style="color: red;">审核失败</span>
          <span v-else-if="record.audit_status === true" style="color: green;">审核通过</span>
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
            <el-timeline-item
                v-for="(activity, index) in operationLogs"
                :key="index"
                :timestamp="activity.time"
            >
                {{ activity.msg }}
            </el-timeline-item>
        </el-timeline>
</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import axios from "axios";
import { submit_create, get_record, delete_record } from '../../src/api/volunteers-api';
import { useRouter } from 'vue-router';
//表单校验
const router = useRouter();
const rules = ref({
    name: [
        {required: true, message: '名字不能为空', trigger: 'blur'},
        // {max: 30, message: '名称最长不能超过30个字', trigger: 'blur'},
    ],

    time: [
        {required: true, message: '时间不能为空', trigger: 'blur'},
    ],

    duration: [
        {required: true, message: "时长不能为空", trigger: 'blur'},
    ],

})

// 佐证材料部分的数据结构
const fileList = ref([]);

// Do not use the same name with ref
//使用的时候要加ref()
const volunteers = ref({
    VOL_name: '',
    participate_time: '',
    duration_day: '',
    duration_hour: '',
});



// 上传数据给后端
const onSubmit = () => {
    console.log('submit!');
    // 等待修改为合适的user_id
    console.log(evidencecheck.dialogImageUrl);

    submit_create({
        user_id: 2,
        VOL_name: volunteers.value.VOL_name,
        participate_time: new Date(volunteers.value.participate_time).toISOString().split('T')[0],
        // participate_time: dateString,
        duration_day: parseToInt(volunteers.value.duration_day),
        duration_hour: parseToInt(volunteers.value.duration_hour),
        evidence: evidencecheck.dialogImageUrl,
    })
        .then((res) => {
            console.log(res.status);

        })
        .catch((error) => {
            console.error('Error enrolling in training:', error);
        });

    location.reload();
};

// 佐证材料预览的数据结构
const evidencecheck = {
    dialogImageUrl: '',
    dialogVisible: false,
    disabled: false,
};

// 佐证材料的处理函数
const handleRemove = (uploadFile, uploadFiles) => {
    console.log(uploadFile, uploadFiles);
};

const handlePictureCardPreview = (uploadFile) => {
    evidencecheck.dialogImageUrl = uploadFile.url;
    evidencecheck.dialogVisible = true;
};

// 上传时把字符串转为整数
function parseToInt(value) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        // Handle the case where parsing failed, e.g., return a default value or throw an error.
        // For simplicity, let's return 0 as the default value.
        return 0;
    }
    return parsedValue;
}

//接收填写记录
const HistoryRecord = ref([]);

async function getHistoryRecord(value) {
  const userid = parseToInt(value);
  try {
    const res = await get_record({ user_id: userid });
    console.log(res.status);
    if (res.status === 200) {
      console.log("success");
      HistoryRecord.value = res.data.data.map(record => ({
        userId: record.user_id,
        participateTime: record.participate_time,
        durationDay: record.duration_day,
        durationHour: record.duration_hour,
        evidence: record.evidence,
        auditStatus: record.audit_status,
        volName: record.vol_name,
        volId: record.vol_id,
        volType: record.vol_type
      }));
      console.log(res.data);
      console.log(HistoryRecord.value);
    }
  } catch (err) {
    console.log("fail");
    console.log(err);
  }
}
//修改记录
function editRecord(volId) {
    console.log(volId);
    router.push({ name: 'changeVolunteers' });

}

//删除记录
function deleteRecord(nowvol_id) {
    console.log("delete record");
    const vol_id = parseToInt(nowvol_id);
    const res = delete_record({ VOL_id: vol_id });
    console.log(res);
    console.log(res.code);
    //location.reload(); // 重新加载整个页面
    if (res.code === 200) {
        // 找到要删除的记录在 HistoryRecord 中的索引
        const index = HistoryRecord.findIndex(record => record.vol_id === vol_id);
        consle.log(index)
        if (index !== -1) {
            // 从 HistoryRecord 中删除记录
            this.HistoryRecord.splice(index, 1);
        }
    }
}

onMounted(() => {
    //?等待改为当前user_id
    getHistoryRecord(2);
});



</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
}

.header-left {
  margin-right: 10px; /* 根据需要调整左侧元素的右边距 */
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
.viewWrapper{
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36,37,38,.05);
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
