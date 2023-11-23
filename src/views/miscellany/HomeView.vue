<script setup>

import {ElTable} from "element-plus";
</script>

<template>
    <div class="viewWrapper">
    <span>
    </span>
        <h1 class="pageTitle">首页</h1>
        <div class="helpText">
            帮助：请在侧边栏中选择您需要的功能。
        </div>

    </div>
</template>

<style scoped>
.viewWrapper{
    position: relative;
    width: 85%;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 3px 3px rgba(36,37,38,.05);
    border-radius: 3px;
    padding: 20px;
}

.pageTitle {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;
}

.helpText {
    margin: 20px 0 20px 0;
    color: #999;
}
</style>