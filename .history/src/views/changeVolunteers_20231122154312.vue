<template>
    <div>
      <h1>修改志愿活动</h1>
      <el-table :data="volunteers" style="width: 100%">
        <el-table-column prop="vol_name" label="志愿者姓名"></el-table-column>
        <el-table-column prop="vol_type" label="志愿者类型"></el-table-column>
        <el-table-column prop="participate_time" label="参与时间"></el-table-column>
        <el-table-column prop="duration_day" label="时长（天）"></el-table-column>
        <el-table-column prop="duration_hour" label="时长（小时）"></el-table-column>
        <el-table-column prop="audit_status" label="审核状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.audit_status" type="success">已通过</el-tag>
            <el-tag v-else type="danger">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" @click="editVolunteer(scope.row)">编辑</el-button>
            <el-button type="danger" @click="deleteVolunteer(scope.row.vol_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        volunteers: [],
      };
    },
    mounted() {
      this.fetchVolunteers();
    },
    methods: {
      fetchVolunteers() {
        axios.get('/api/volunteers') // 请替换为实际的 API 接口地址
          .then(response => {
            this.volunteers = response.data.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      editVolunteer(volunteer) {
        // 根据需要进行编辑逻辑
        console.log('编辑志愿者:', volunteer);
      },
      deleteVolunteer(volunteerId) {
        // 根据需要进行删除逻辑
        console.log('删除志愿者:', volunteerId);
      },
    },
  };
  </script>