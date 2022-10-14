<template>
  <el-header class="titlebar-container" height="25px" style="background-color: var(--el-color-primary-light-8)">
    <img src="../assets/logo_trans_32.png">
    <el-menu default-active="activeIndex" class="el-menu-demo" mode="horizontal" menu-trigger="hover" :ellipsis="false">
      <ToolbarMenuItems>
      </ToolbarMenuItems>
    </el-menu>
    <el-row style="display:flex;align-self=center">{{this.title}}</el-row>
    <WindowCtrl />
  </el-header>
</template>
<style>
.titlebar-container {
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  height:32px !important ; 
  padding: 0;
  height: auto;
}

.WindowCtrl {
  display: flex;
  margin-left: auto;
}

.el-row {
  margin-left: auto;
  margin-right: auto;
  align-self: center;
  justify-self: center;
  text-align: end;
  font-size: 12px;
}

.el-menu {
  -webkit-app-region: no-drag;
  border-width: 0;
}
</style>
<script>
import WindowCtrl from "@/components/WindowCtrl.vue";
import ToolbarMenuItems from "@/components/ToolbarMenuItems.vue";
export default {
  name: "Titlebar",
  components: { WindowCtrl, ToolbarMenuItems },
  data() {
    return {
      title: "中子星-实验辅助系统",
    };
  },
};
</script>