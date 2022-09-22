<template>
  <el-container style="flex-flow: row; height: 100%">
    <el-container class="VideoContainer">
      <el-container class="videoView">
        <VideoControl />
      </el-container>
    </el-container>
    <el-main class="FormContainer">
      <DataForm />
    </el-main>
  </el-container>
</template>
<script setup>
import DataForm from "@/components/DataForm.vue";
import VideoControl from '@/components/VideoControl.vue'
</script>
<style scoped>
.VideoContainer {
  flex-flow: column;
  width: 50%;
  height: 100%;
  bottom: 45px;
  border-width: 3px;
  margin-bottom: 40px;
  border-right: 1px solid var(--el-border-color);
}
.videoView {
  display: flex;
  background-color: var(--el-color-primary-light-7);
  height: 60%;
  margin: 10px;
}
.videoControl {
  height: 30%;
  margin-left: 15px;
  margin-right: 15px;
}
.FormContainer {
  width:40%;
  margin-right:10px ;
}
</style>