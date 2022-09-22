<template>
  <el-scrollbar>
    <el-menu :default-active="route.path" :router="true">
      <el-menu-item index="/Home">
        <el-icon><House /></el-icon>
        <template #title> <span>欢迎</span></template>
      </el-menu-item>
      <el-menu-item index="/ManualMode">
        <el-icon><Pointer /></el-icon>
        <template #title> <span>手动模式</span></template>
      </el-menu-item>
      <el-menu-item index="/SpectrumMeter">
        <el-icon><Camera /></el-icon>
        <template #title> <span>摄谱模式</span></template>
      </el-menu-item>
      <el-menu-item index="/Settings">
        <el-icon><Setting /></el-icon>
        <template #title> <span>设置</span></template>
      </el-menu-item>
      <el-menu-item index="/About">
        <el-icon><InfoFilled /></el-icon>
        <template #title> <span>关于</span></template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>
<script setup>
import { useRoute } from "vue-router";
import { House,Pointer,Camera,Setting,InfoFilled } from "@element-plus/icons-vue";
import router from "@/router/index.ts";
const route = useRoute();
</script>
<style>
.el-scrollbar {
  border-width: 0;
}
</style>