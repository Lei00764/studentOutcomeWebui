<template>
  <div>
    <h1>修改志愿活动</h1>

    <!-- 显示旧的志愿活动信息 -->
    <table>
      <tr>
        <th>旧的志愿活动信息</th>
        <th>要修改的志愿活动信息</th>
      </tr>
      <tr>
        <td>志愿者姓名: {{ oldVolunteer.vol_name }}</td>
        <td><el-input v-model="formData.vol_name"></el-input></td>
      </tr>
      <tr>
        <td>志愿者类型: {{ oldVolunteer.vol_type }}</td>
        <td><el-input v-model="formData.vol_type"></el-input></td>
      </tr>
      <tr>
        <td>参与时间: {{ oldVolunteer.participate_time }}</td>
        <td><el-input v-model="formData.participate_time"></el-input></td>
      </tr>
      <tr>
        <td>时长（天）: {{ oldVolunteer.duration_day }}</td>
        <td><el-input v-model="formData.duration_day"></el-input></td>
      </tr>
      <tr>
        <td>时长（小时）: {{ oldVolunteer.duration_hour }}</td>
        <td><el-input v-model="formData.duration_hour"></el-input></td>
      </tr>
    </table>

    <!-- 保存按钮 -->
    <el-button type="primary" @click="updateVolunteer">保存</el-button>
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