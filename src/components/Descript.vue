<template>
  <el-tooltip content="说明文档" placement="left-start">
    <a
      class="icon-link"
      href="https://whjlnspmd6.feishu.cn/wiki/T3U1wjm5fiy1wDkLvGncumIdnch?from=from_copylink"
      target="_blank"
    >
      <img :src="qaImg" alt="说明文档" class="qa-img" />
    </a>
  </el-tooltip>
</template>

<script setup>
import qaImg from "@/assets/qa.svg";
</script>

<style>
.icon-link {
  color: var(--el-text-color-primary);
}
.qa-img {
  width: 28px;
  height: 28px;
}
</style>
