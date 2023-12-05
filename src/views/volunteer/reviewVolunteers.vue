<template>
    <div class="viewWrapper">
        <h1 class="pageTitle">审核页面</h1>
        <div class="helpText">
            帮助：在本页面中，您可以审核填报信息。
        </div>

        <el-table :data="auditData" style="width: 100%">
            <el-table-column prop="volName" label="名称"></el-table-column>
            <el-table-column prop="auditStatus" label="状态"></el-table-column>
            <el-table-column label="操作">
                <el-button type="primary" size="small" @click="approve(scope.row.userId)">通过</el-button>
                <el-button type="danger" size="small" @click="reject(scope.row.userId)">拒绝</el-button>
            </el-table-column>
        </el-table>
    </div>
</template>
  
<script>
import api from '@/api/volunteers';

export default {
    data() {
        return {
            auditData: [],
            userid: 123,
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
        approve(userId) {
            // 处理通过操作
            console.log('通过审核，用户ID:', userId);
        },
        reject(userId) {
            // 处理拒绝操作
            console.log('拒绝审核，用户ID:', userId);
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
</style>