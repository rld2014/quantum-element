<template>
  <el-menu class="navigatorMenu" :default-active="route.path" :router="true" :collapse="isCollapsed"
    collapse-transition>
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
  </el-menu>
  <el-button class="collapseButton" @click.prevent="toggleMenuCollapse" style="width:100%; border:0;border-radius: 0;">
    <div v-if="!isCollapsed">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      <span>折叠</span>
    </div>
    <el-icon v-else>
      <ArrowRight />
    </el-icon>
  </el-button>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import {
  House,
  Pointer,
  Camera,
  Setting,
  InfoFilled,
  ArrowLeft,
  ArrowRight
} from "@element-plus/icons-vue";
import { ref } from "vue";
const route = useRoute();
const isCollapsed = ref(false)
function toggleMenuCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>
<style scoped>
.el-scrollbar {
  border-width: 0;
}

.navigatorMenu:not(.el-menu--collapse) {
  width: 150px;
}

.collapseButton {
  height: 56px;
  justify-content: left;
  padding: 0px 20px;
}

.collapseButton .el-icon {
  height: 15.75px !important;
  margin-right:5px
}
</style>