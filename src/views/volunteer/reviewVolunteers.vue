<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核页面</h1>
        <div class="helpText">
            帮助：在本页面中，您可以审核填报信息。
        </div>

        <el-table :data="auditData" style="width: 100%" @row-click="handleRowClick">
            <el-table-column prop="volName" label="名称"></el-table-column>
            <el-table-column prop="auditStatus" label="状态"></el-table-column>
            <el-table-column label="操作">
                <el-button type="primary" size="small" @click="approve(scope.row.userId)">通过</el-button>
                <el-button type="danger" size="small" @click="reject(scope.row.userId)">拒绝</el-button>
            </el-table-column>
        </el-table>
    </div>
    <div class="card">
        <el-card title="相关信息" v-show="showDialog">
            <!-- 在卡片中展示相关信息 -->
            <p>名称: {{ selectedRow ? selectedRow.volName : '' }}</p>
            <p>状态: {{ selectedRow ? selectedRow.auditStatus : '' }}</p>
            <el-button type="danger" size="small" @click="scape()">退出</el-button>
            <!-- 其他信息... -->
        </el-card>
    </div>
</template>
  
<script>
import api from '@/api/volunteers';

export default {
    data() {
        return {
            auditData: [],
            userid: 123,
            showDialog: false, // 控制卡片显示与隐藏的数据属性
            selectedRow: null // 存储选中的行数据
        };
    },
    methods: {
        parseToInt(value) {
            const parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) {
                // 处理解析失败的情况，例如返回默认值或抛出错误。
                // 为简单起见，我们将默认值设为0。
                return 0;
            }
            return parsedValue;
        },
        handleRowClick(row) {
            this.selectedRow = row;
            this.showDialog = true;
            this.$nextTick(() => {
                // 在下一次 DOM 更新后访问 selectedRow 的属性
                console.log(this.selectedRow.volName);
            });
        },
        approve(userId) {
            // 通过按钮点击事件处理逻辑
            // 可以使用 userId 进行处理
            // ...
        },
        reject(userId) {
            // 拒绝按钮点击事件处理逻辑
            // 可以使用 userId 进行处理
            // ...
        },
        scape() {
            this.showDialog = false;
        },
        async getHistoryRecord(value) {
            const userid = this.parseToInt(value);
            try {
                const res = await api.getRecord({ user_id: userid });
                console.log(res.status);
                if (res.status === 200) {
                    console.log("success");
                    console.log(res.data)
                    this.auditData = res.data.data.map(record => ({
                        volName: record.vol_name,
                        auditStatus: record.audit_status
                    }));
                    console.log(this.auditData);
                }
            } catch (err) {
                console.log("fail");
                console.log(err);
            }
        },
    },
    created() {
        this.getHistoryRecord('123'); // 在组件创建时获取数据
    },
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
</style>