<template>
  <el-main class="WelcomeContent" direction="virtical">
    <img class="Logo" src="@/assets/中子星logo.svg" alt="LOGO" />
    <div class="words">
      <h1>欢迎!</h1>
      <p>中子星-实验辅助系统</p>
    </div>
  </el-main>
</template>
  <script>
export default {
  name: "Home",
};
</script>
  <style scoped>
h1,
p {
  display: flex;
  align-content: center;
  justify-content: center;
}
.WelcomeContent {
  display: flex;
  height: 100%;
  flex-flow: column;
  align-content: center;
  justify-content: center;
  text-align: center;
  background-color: var(--el-bg-color);
}
img {
  display: flex;
  height: 50%;
  margin: 0%;
}
h1 {
  font-size: 4rem;
  margin: 0%;
}
.words {
  display: flex;
  flex-flow: column;
  height: 50%;
}
</style>