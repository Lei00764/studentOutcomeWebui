<template>
  <div>
    <div class="viewWrapper">
    <h1>修改志愿活动</h1>

    <!-- 旧的志愿活动信息卡片 -->
    <el-card class="card">
      <h2 slot="header">旧的志愿活动信息</h2>
      <div>
        <p>志愿者姓名: {{ oldVolunteer.vol_name }}</p>
        <p>志愿者类型: {{ oldVolunteer.vol_type }}</p>
        <p>参与时间: {{ oldVolunteer.participate_time }}</p>
        <p>时长（天）: {{ oldVolunteer.duration_day }}</p>
        <p>时长（小时）: {{ oldVolunteer.duration_hour }}</p>
        <p>审核状态: {{ oldVolunteer.audit_status }}</p>
      </div>
    </el-card>

    <!-- 间隔一些间距 -->
    <div class="spacer"></div>

    <!-- 修改框卡片 -->
    <el-card class="card">
      <h2 slot="header">要修改的志愿活动信息</h2>
      <el-form ref="form" :model="formData" label-width="120px">
        <el-form-item label="志愿者姓名">
          <el-input v-model="formData.vol_name"></el-input>
        </el-form-item>
        <el-form-item label="志愿者类型">
          <el-input v-model="formData.vol_type"></el-input>
        </el-form-item>
        <el-form-item label="参与时间">
          <el-input v-model="formData.participate_time"></el-input>
        </el-form-item>
        <el-form-item label="时长（天）">
          <el-input v-model="formData.duration_day"></el-input>
        </el-form-item>
        <el-form-item label="时长（小时）">
          <el-input v-model="formData.duration_hour"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateVolunteer">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      oldVolunteer: {},
      formData: {
        vol_name: '',
        vol_type: '',
        participate_time: '',
        duration_day: 0,
        duration_hour: 0,
        audit_status: false,
      },
    };
  },
  mounted() {
    this.fetchVolunteer();
  },
  methods: {
    fetchVolunteer() {
      // 根据需要获取特定志愿活动的信息
      const volunteerId = 0; // 请将其替换为实际的志愿活动ID
      axios.get(`http://127.0.0.1:4523/m2/3206870-0-default/118198285/${volunteerId}`) // 请替换为实际的 API 接口地址
        .then(response => {
          const volunteer = response.data.data;
          this.oldVolunteer = {
            vol_name: volunteer.vol_name,
            vol_type: volunteer.vol_type,
            participate_time: volunteer.participate_time,
            duration_day: volunteer.duration_day,
            duration_hour: volunteer.duration_hour,
            audit_status: volunteer.audit_status,
          };
          this.formData = { ...this.oldVolunteer };
        })
        .catch(error => {
          console.error(error);
        });
    },
    updateVolunteer() {
      // 根据需要执行更新志愿活动的逻辑
      const volunteerId = 0; // 请将其替换为实际的志愿活动ID
      axios.put(`http://127.0.0.1:4523/m2/3206870-0-default/118198285/${volunteerId}`, this.formData) // 请替换为实际的 API 接口地址
        .then(response => {
          console.log('志愿活动已成功更新');
          // 执行成功后的操作，例如跳转到列表页面或显示成功消息
        })
        .catch(error => {
          console.error(error);
          // 处理更新失败的情况，例如显示错误消息
        });
    },
  },
};
</script>

<style scoped>
.card {
  margin-bottom: 20px; /* 添加卡片之间的间隔 */
  max-width: 400px; /* 调整卡片的宽度 */
}

.spacer {
  height: 20px; /* 设置间隔高度 */
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
</style>