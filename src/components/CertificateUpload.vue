<script setup>

import {ref, watch} from "vue";
import {ElMessage, genFileId} from "element-plus";
import api from "@/api/image"

const certificationPictures = ref([])
const isCertImageChanged = ref(false)

const props = defineProps(['recordId', 'recordType'])
const certUrl = defineModel('certUrl')
const emit = defineEmits(['imageChanged'])

// upload 的图片超过上限，把原来的图片换掉
const elUploadImg = ref()
const swapImg = (newFileList) => {
    elUploadImg.value.clearFiles()
    let file = newFileList[0]
    file.uid = genFileId()
    console.log(file)
    elUploadImg.value.handleStart(file)
}
let certFile = null
const onImgUpload = (file)=> {
    certFile = file
    isCertImageChanged.value = true
    emit("imageChanged")
}

// 可以判断需不需要上传图片，不用加其他判断了
const uploadImg = async () => {
    console.log(certFile)
    if (!certFile && !isCertImageChanged.value)
        return;

    // 这时候需要清除图片
    if (!certFile && isCertImageChanged.value){
        try {
            let res = await api.uploadImage(props.recordId, props.recordType, null);
            ElMessage.success("证书清除成功")
        }catch(error){
            if (error.network) return
            error.defaultHandler()
        }
        return
    }


    try {
        let res = await api.uploadImage(props.recordId, props.recordType, certFile.raw);

        ElMessage.success("证书上传成功")
    }catch(error){
        if (error.network) return
        switch (error.errorCode){
            case 611:
                ElMessage.error("证书上传失败，请重试")
                return;
        }
        error.defaultHandler()
    }
}

const revertChange = () => {
    isCertImageChanged.value = false
    elUploadImg.value.clearFiles()
}

const onClearOriginalCertImage = () => {
    certUrl.value = ""
    isCertImageChanged.value = true
    emit("imageChanged")
}

defineExpose({uploadImg, revertChange})
watch(certUrl, (c) => {
    console.log(c, "ddddd")
})

</script>

<template>
    <el-upload action="" :file-list="certificationPictures" accept=".jpg, .jpeg, .png"
               :auto-upload="false" list-type="picture" :limit="1" :on-exceed="swapImg"
               ref="elUploadImg" :on-change="onImgUpload">
        <el-button type="primary">点击选择</el-button>
        <el-text>&nbsp允许.jpg/.png图片</el-text>
        <template #tip>
            <div v-if="!isCertImageChanged && certUrl">
                <el-image style="max-width: 800px; height: 100px; margin-top:10px; width: auto"
                          fit="contain" :src="certUrl" :preview-src-list="[certUrl]"/>
                <el-button link @click="onClearOriginalCertImage">清除</el-button>
            </div>

        </template>
    </el-upload>
</template>

<style scoped>

</style>