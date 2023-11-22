<template>
  <div>
    <h1>修改志愿活动</h1>

    <!-- 旧的志愿活动信息卡片 -->
    <el-card>
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

    <!-- 修改框卡片 -->
    <el-card>
      <h2 slot="header">要修改的志愿活动信息</h2>
      <el-form ref="form" :model="formData" label-width="120px" style="max-width: 600px; margin-bottom: 20px;">
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
</template>