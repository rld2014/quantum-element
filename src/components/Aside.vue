<template>
  <el-scrollbar>
    <el-menu :default-active="route.path" :router="true" :collapse="isCollapsed">
      <el-menu-item index="/Home">
        <el-icon>
          <House />
        </el-icon>
        <template #title> <span>欢迎</span></template>
      </el-menu-item>
      <el-menu-item index="/ManualMode">
        <el-icon>
          <Pointer />
        </el-icon>
        <template #title> <span>手动模式</span></template>
      </el-menu-item>
      <el-menu-item index="/SpectrumMeter">
        <el-icon>
          <Camera />
        </el-icon>
        <template #title> <span>摄谱模式</span></template>
      </el-menu-item>
      <el-menu-item index="/Settings">
        <el-icon>
          <Setting />
        </el-icon>
        <template #title> <span>设置</span></template>
      </el-menu-item>
      <el-menu-item index="/About">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <template #title> <span>关于</span></template>
      </el-menu-item>
      <el-menu-item @click.stop="toggleCollapse">
        <el-icon v-if="!isCollapsed">
          <ArrowLeft />
        </el-icon>
        <el-icon v-if="isCollapsed">
          <ArrowRight />
        </el-icon>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import { House, Pointer, Camera, Setting, InfoFilled,ArrowLeft,ArrowRight } from "@element-plus/icons-vue";
import router from "@/router/";
import { ref } from "vue";
const route = useRoute();
const isCollapsed = ref(false)
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>
<style>
.el-scrollbar {
  border-width: 0;
}
</style>