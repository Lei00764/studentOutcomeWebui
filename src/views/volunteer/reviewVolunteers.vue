<template>
    <div class="viewWrapper">
      <h1 class="pageTitle">审核页面</h1>
      <div class="helpText">
        帮助：在本页面中，您可以审核填报信息。
      </div>
  
      <div v-for="item in displayedAuditData" :key="item.volId">
        <el-card class="card">
          <el-card-header>
            <p>名称: {{ item.volName }}</p>
            <p>状态: {{ item.auditStatus }}</p>
          </el-card-header>
          <el-card-body>
            <p>参与时间: {{ item.participateTime }}</p>
            <p>志愿者详情: {{ item.volDetails }}</p>
            <p>审核状态: {{ item.auditStatus }}</p>
            <p>持续时间: {{ item.durationDay }}天 {{ item.durationHour }}小时</p>
            <p>审核证据: {{ item.evidence }}</p>
          </el-card-body>
          <el-card-footer>
            <el-button type="primary" size="small" @click="approve(item.volId)">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="reject(item.volId)">
              拒绝
            </el-button>
          </el-card-footer>
        </el-card>
      </div>
  
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="1"
          :total="auditData.length"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>
  </template>
  
  <script>
  import api from '@/api/volunteers';
  
  export default {
    data() {
      return {
        auditData: [],
        displayedAuditData: [],
        currentPage: 1,
      };
    },
  
    methods: {
      async getHistoryRecord() {
        try {
          const res = await api.getRecord();
          console.log(res.status);
          if (res.status === 200) {
            console.log("success");
            console.log(res.data);
            this.auditData = res.data.data.map(record => ({
              volId: record.vol_id,
              volName: record.vol_name,
              auditStatus: record.audit_status,
              participateTime: record.participate_time,
              volDetails: record.vol_details,
              durationDay: record.duration_day,
              durationHour: record.duration_hour,
              evidence: record.evidence,
            }));
            console.log(this.auditData);
            this.updateDisplayedData();
          }
        } catch (err) {
          console.log("fail");
          console.log(err);
        }
      },
  
      updateDisplayedData() {
        const startIndex = (this.currentPage - 1);
        const endIndex = startIndex + 1;
        this.displayedAuditData = this.auditData.slice(startIndex, endIndex);
      },
  
      handlePageChange(page) {
        this.currentPage = page;
        this.updateDisplayedData();
      },
  
      approve(volId) {
        // 通过按钮点击事件处理逻辑
        // 可以使用 volId 进行处理
        // ...
      },
  
      reject(volId) {
        // 拒绝按钮点击事件处理逻辑
        // 可以使用 volId 进行处理
        // ...
      },
    },
  
    created() {
      this.getHistoryRecord();
    }
  };
  </script>
  
  <style scoped>
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
    box-shadow: 0 3px 3px rgba(36, 37, 38, 0.05);
    border-radius: 3px;
    padding: 20px;
  }
  
  .card {
    width: 480px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  </style>