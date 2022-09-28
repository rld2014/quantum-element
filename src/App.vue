<template>
  <el-container
    class="layout-container-demo"
    style="height: 100%; margin: 0; padding: 0%"
  >
    <Titlebar />
    <el-container style="height: 100%" direction="horizontal">
      <el-aside width="200px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <router-view class="content" />
      </el-main>
    </el-container>
    <el-footer class="main_footer"> </el-footer>
  </el-container>
</template>

<script setup>
import { ref } from "vue";
import { Menu as IconMenu, Message, Setting } from "@element-plus/icons-vue";
import Aside from "@/components/Aside.vue";
import Titlebar from "@/components/Titlebar.vue";
document.querySelector("html").setAttribute("class", "dark");
const body = document.querySelector("body");
body.setAttribute("style", "margin:0;overflow:hidden");
</script>

<style>
  html, body {
    height: 100%;
}
.el-container {
  background-color: var(--el-bg-color);
}
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo {
  margin: 0;
  padding: 0;
  vertical-align: baseline;
  box-sizing: border-box;
}
#app,
.el-table .content {
  margin: 0;
  padding: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  background-color: var(--el-bg-color);
  height: 100%;
  user-select: none;
}

.main_footer {
  /* position: absolute; */
  position:sticky;
  bottom: 0;
  height: 20px;
  margin-top: auto;
  background-color: var(--el-color-primary);
  z-index: 114514;
}
</style>
