<template>
  <div class="viewWrapper">
    <h1>修改志愿活动</h1>
    <div class="helpText">
      帮助：在本页面中，您可以新建、修改志愿填报信息。
    </div>

    <!-- 旧的志愿活动信息卡片 -->
    <el-card class="card">
      <h2 slot="header">旧的志愿活动信息</h2>
      <div>
        <p>志愿者姓名: {{ oldVolunteer.vol_name }}</p>
        <p>志愿者类型: {{ oldVolunteer.vol_type }}</p>
        <p>参与时间: {{ oldVolunteer.participate_time }}</p>
        <p>时长（天）: {{ oldVolunteer.duration_day }}</p>
        <p>时长（小时）: {{ oldVolunteer.duration_hour }}</p>

      </div>
    </el-card>

    <!-- 间隔一些间距 -->
    <div class="spacer"></div>

    <!-- 修改框卡片 -->
    <el-card class="card">
      <el-form :model="volunteers" label-width="120px" :rules="rules">
        <el-form-item label="志愿服务名称" prop="name">
          <el-input v-model="volunteers.vol_name" />
        </el-form-item>

        <el-form-item label="日期选择器" prop="time">
          <!-- 日期选择器 -->
          <div class="demo-date-picker">
            <div class="block">
              <el-date-picker
                v-model="volunteers.participate_time"
                type="date"
                placeholder="请选择日期"
              />
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
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            drag
            multiple
          >
            <el-icon>
              <i class="el-icon-plus"></i>
            </el-icon>
            <div class="upload-evidence-text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>

          <el-dialog v-model="evidencecheck.dialogVisible">
            <img :src="evidencecheck.dialogImageUrl" alt="Preview Image" style="max-width: 100%; max-height: 100%;" />
          </el-dialog>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit" plain class="submit-button-create">Create</el-button>
          <el-button class="submit-button-cancle">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      oldVolunteer: {},
      volunteers: {
        vol_name: '',
        participate_time: '',
        duration_day: 0,
        duration_hour: 0,
      },
      fileList: [],
      evidencecheck: {
        dialogVisible: false,
        dialogImageUrl: '',
      },
      rules: {
        // 定义表单校验规则
        name: [{ required: true, message: '请输入志愿服务名称', trigger: 'blur' }],
        time: [{ required: true, message: '请选择日期', trigger: 'change' }],
        duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
        evidence: [{ required: true, message: '请上传佐证材料', trigger: 'change' }],
      },
    };
  },
  mounted() {
    this.fetchVolunteer();
  },
  methods: {
    fetchVolunteer() {
      // 根据需要获取特定志愿活动的信息
      const volunteerId =this.$route.params.id;
      axios.get(`/api/volunteers/${volunteerId}`)
        .then(response => {
          this.oldVolunteer = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    },
    handlePictureCardPreview(file) {
      this.evidencecheck.dialogImageUrl = file.url;
      this.evidencecheck.dialogVisible = true;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    onSubmit() {
      this.$refs['volunteers'].validate(valid => {
        if (valid) {
          // 表单校验通过，可以进行提交操作
          this.submitForm();
        }
      });
    },
    submitForm() {
      // 提交表单数据到后端
      const volunteerId = this.$route.params.id;
      axios.put(`/api/volunteers/${volunteerId}`, this.volunteers)
        .then(response => {
          // 处理成功响应
        })
        .catch(error => {
          // 处理错误响应
        });
    },
  },
};
</script>

<style>
.viewWrapper {
  padding: 20px;
}

.helpText {
  margin-bottom: 20px;
}

.card {
  margin-bottom: 20px;
}

.spacer {
  height: 20px;
}

.duration-input {
  display: flex;
  align-items: center;
}

.upload-evidence-text {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.submit-button-create {
  margin-right: 10px;
}

.submit-button-cancle {
  margin-left: 10px;
}
</style>