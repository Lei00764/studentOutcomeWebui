<template>
  <br>
  <br>
  <br>
  <el-form :model="volunteers" label-width="120px">
      <el-form-item label="志愿服务名称" style="width: 500px">
          <el-input v-model="volunteers.VOL_name" />
      </el-form-item>

      <el-form-item label="日期选择器">
          <!-- 日期选择器 -->
          <div class="demo-date-picker">
              <div class="block">
                  <!-- <span class="demonstration">Default</span> -->
                  <el-date-picker v-model="volunteers.participate_time" type="date" placeholder="请选择日期" />
              </div>
          </div>
      </el-form-item>

      <el-form-item label="时长" class="duration-input">
          <el-input v-model="volunteers.duration_day" placeholder="天数" style="margin-right: 50px;" clearable />

          <el-input v-model="volunteers.duration_hour" placeholder="小时" clearable />
      </el-form-item>

      <!-- 上传佐证材料(图片) el-upload中的换行的属性用于拖拽上传-->
      <!-- action="#"  -->
      <el-form-item label="佐证材料">
          <el-upload list-type="picture-card" :auto-upload="false" class="upload-demo" drag
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple
              :model="fileList">

              <el-icon>
                  <Plus />
              </el-icon>

              <div class="upload-evidence-text">
                  Drop file here or <em>click to upload</em>
              </div>

              <template #file="{ file }">
                  <div v-if="file.url !== '' && file.name !== ''">
                      <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                      <span class="el-upload-list__item-actions">
                          <!-- 查看上传的图片 -->
                          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                              <el-icon><zoom-in /></el-icon>
                          </span>
                          <!-- 下载上传的图片 -->
                          <span v-if="!evidencecheck.disabled" class="el-upload-list__item-delete"
                              @click="handleDownload(file)">
                              <el-icon>
                                  <Download />
                              </el-icon>
                          </span>
                          <!-- 删除上传的图片 -->
                          <span v-if="!evidencecheck.disabled" class="el-upload-list__item-delete"
                              @click="handleRemove(file)">
                              <el-icon>
                                  <Delete />
                              </el-icon>
                          </span>
                      </span>
                  </div>
              </template>
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
</template>

<script setup>
import { ref } from 'vue';
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import { submit_create } from '../../src/api/volunteers-api';
// import { removeClass } from 'element-plus/es/utils';

const evidencecheck = {
  dialogImageUrl: '',
  dialogVisible: false,
  disabled: false,
};

const volunteers = {
  VOL_name: '',
  participate_time: '',
  duration_day: '',
  duration_hour: '',
  // region: '',
  // date1: '',
  // date2: '',
  // delivery: false,
  // type: [],
  // resource: '',
  // desc: '',
};

const onSubmit = () => {
  console.log('submit!');
  //? 等待修改为合适的user_id

  console.log(new Date(volunteers.participate_time).toISOString().split('T')[0]);
  console.log(evidencecheck.dialogImageUrl);
  console.log(fileList.value);
  submit_create({
    user_id: 1,
    VOL_name: volunteers.VOL_name,
    participate_time: new Date(volunteers.participate_time).toISOString().split('T')[0],
    duration_day: parseToInt(volunteers.duration_day),
    duration_hour: parseToInt(volunteers.duration_hour),
    evidence: evidencecheck.dialogImageUrl,
  })
    .then((res) => {
      console.log(res.status);
    })
    .catch((error) => {
      console.error('Error enrolling in training:', error);
    });
};

const fileList = ref([]);
// 处理图片上传
const handleRemove = (file) => {
  console.log(file);
  console.log(fileList.value);
  const index = fileList.value.findIndex(item => item === file);

  if (index !== -1) {
    // 从 fileList 中移除该文件
    fileList.value.splice(index, 1);
    console.log('File removed from fileList:', file);

    // 在这里你可以执行其他你需要的操作
  } else {
    console.log('File not found in fileList:', file);
  }
  file.url.value = '';
  file.name.value = '';
};

const handlePictureCardPreview = (file) => {
  evidencecheck.dialogImageUrl = file.url;
  evidencecheck.dialogVisible = true;
};

const handleDownload = (file) => {
  console.log(file);
  const imageURL = file.url; // 假设 file 对象包含了图片的 URL

  if (imageURL) {
    // 创建一个隐藏的下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    downloadLink.download = 'download_image.jpg'; // 设置下载的文件名

    // 触发链接的点击事件以启动下载操作
    downloadLink.click();
    console.log("download finish");
  } else {
    console.log('无法下载，URL 不存在。');
  }
};

function parseToInt(value) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    // Handle the case where parsing failed, e.g., return a default value or throw an error.
    // For simplicity, let's return 0 as the default value.
    return 0;
  }
  return parsedValue;
}

</script>

<style scoped>
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
  font-size: 7px;
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
</style>
