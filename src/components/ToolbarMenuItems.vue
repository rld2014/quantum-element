<template>
  <el-sub-menu class="FileMenu" index="0">
    <template #title>
      <span>文件</span>
    </template></el-sub-menu
  >
  <el-sub-menu class="EditMenu" index="1"
    ><template #title>
      <span>编辑</span>
    </template></el-sub-menu
  >
  <el-sub-menu class="OptionsMenu" index="2">
    <template #title>
      <span>选项</span>
    </template></el-sub-menu
  >
</template>
<script>
export default {
  name: "ToolbarMenuItems",
};
</script>
<style>
.Filemenu,
.Editmenu,
.OptionsMenu {
  border-radius: 0;
  border-width: 0;
  border: 0;
  -webkit-app-region: no-drag;
}
</style>