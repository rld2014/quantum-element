<script>
export default {
  name: "WindowCtrl",
  methods: {
    closeWindow: function () {
      window.window_control.toClose();
    },
    minimizeWindow: function () {
      window.window_control.toMinimize();
    },
    maximizeWindow: function () {
      window.window_control.toMaximize();
    },
    unFocus: function (event) {
      console.log('bluring button')
      event.target.blur();
        event.target.parentNode.blur();
    },
  },
};
</script>
<template>
  <el-button-group style="margin-left:auto">
    <el-button
      class="minimize-btn"
      icon="Minus"
      v-on:click="minimizeWindow()"
      @focus="unFocus($event)"
    ></el-button>
    <el-button
      class="maximize-btn"
      icon="FullScreen"
      v-on:click="maximizeWindow()"
      @focus="unFocus($event)"
      style="margin-left: 0"
    ></el-button>
    <el-button
      class="window-close-btn"
      icon="Close"
      v-on:click="closeWindow()"
      @focus="unFocus($event)"
      style="margin-left: 0"
    ></el-button>
  </el-button-group>
</template>
<style>
.minimize-btn,
.maximize-btn,
.window-close-btn {
  align-self: flex-end;
  width: 40px;
  height: 25px;
  margin: 0;
  padding: 0;
  border-radius: 0;
  border-width: 0;
  z-index: 10;
  -webkit-app-region: no-drag;
  margin-left: 0;
}
.window-close-btn:hover{
  background-color: var(--el-color-danger-light-3);
  color: var(--el-text-color-primary);
}
</style>

