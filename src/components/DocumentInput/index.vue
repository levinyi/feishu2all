<template>
  <div class="input-section">
    <div class="url-input-wrapper">
      <el-input
        v-model="inputUrl"
        :placeholder="urlPlaceholder"
        class="input-with-select"
        @keyup.enter="handleParse"
        @input="handleUrlChange"
      >
        <template #prefix v-if="detectedPlatform">
          <span class="platform-icon">{{ detectedPlatform.icon }}</span>
        </template>
      </el-input>
      <div v-if="detectedPlatform" class="platform-indicator">
        检测到: {{ detectedPlatform.name }}
      </div>
    </div>
    <el-button type="primary" :loading="loading" @click="handleParse">
      {{ loading ? "解析中..." : "开始转换" }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { analytics } from "@/utils/analytics";
import { authService } from "@/services/auth";
import { detectDocumentPlatform, cleanUrl, isValidUrl } from "@/utils/url-detector";

const props = defineProps({
  modelValue: String,
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue", "parse", "type-change"]);

const inputUrl = ref(props.modelValue);
const documentType = ref("feishu");
const lastClickTime = ref(0);
const clickCount = ref(0);
const clickResetTimer = ref(null);
const detectedPlatform = ref(null);

// 动态占位符
const urlPlaceholder = computed(() => {
  if (detectedPlatform.value) {
    return `已检测到${detectedPlatform.value.name}链接`;
  }
  return "输入文档分享链接（支持飞书、Notion、语雀等）";
});

// URL变化处理
const handleUrlChange = (value) => {
  if (value) {
    const platform = detectDocumentPlatform(value);
    detectedPlatform.value = platform;
    
    if (platform) {
      // 清理URL
      const cleanedUrl = cleanUrl(value);
      if (cleanedUrl !== value) {
        inputUrl.value = cleanedUrl;
      }
    }
  } else {
    detectedPlatform.value = null;
  }
};

watch(inputUrl, (newValue) => {
  emit("update:modelValue", newValue);
});

// const handleParse = () => {
//   emit("parse", {
//     url: inputUrl.value,
//     type: documentType.value,
//   });
// };
const handleParse = async () => {
  // 验证URL
  if (!inputUrl.value) {
    ElMessage.warning("请输入文档链接");
    return;
  }
  
  if (!isValidUrl(inputUrl.value)) {
    ElMessage.warning("请输入有效的文档链接");
    return;
  }

  const now = Date.now();

  // 检查点击间隔（1秒限制）
  if (now - lastClickTime.value < 1000) {
    ElMessage.warning("请稍后再试，点击太频繁了");
    return;
  }

  // 检查每分钟点击次数（10次限制）
  if (clickCount.value >= 10) {
    ElMessage.warning("你的操作太频繁了，请稍后再试");
    return;
  }

  // 更新点击时间和次数
  lastClickTime.value = now;
  clickCount.value++;

  // 第一次点击时启动重置计时器
  if (clickCount.value === 1) {
    clickResetTimer.value = setTimeout(() => {
      clickCount.value = 0;
    }, 60000);
  }

  // 确定文档类型
  const platform = detectDocumentPlatform(inputUrl.value);
  const docType = platform ? platform.platform : 'feishu';

  emit("parse", {
    url: inputUrl.value,
    type: docType,
  });
  
  // 埋点
  analytics.sendEvent("start_convert", {
    button_name: "开始转换",
    document_url: inputUrl.value || "",
    platform: platform?.name || "未知",
    timestamp: new Date().toISOString(),
  });
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (clickResetTimer.value) {
    clearTimeout(clickResetTimer.value);
  }
});
</script>

<style scoped lang="scss">
.input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex: 1 1 500px;

  .url-input-wrapper {
    flex: 1;
    position: relative;
    
    .input-with-select {
      width: 100%;
    }
    
    .platform-indicator {
      position: absolute;
      top: -20px;
      left: 0;
      font-size: 12px;
      color: #67c23a;
      font-weight: 500;
    }
  }
  
  .platform-icon {
    margin-right: 5px;
    font-size: 16px;
  }
}
</style>
