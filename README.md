# 🚀 飞书2ALL - 一键文档转换插件

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/yourusername/cloud-file-converter)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-red.svg)](https://chrome.google.com/webstore)

> 将飞书、Notion、语雀等文档一键转换为各大平台的格式，支持公众号、小红书、知乎、掘金等多个平台。

## ✨ 新功能亮点 (v1.3.0)

### 🎯 一键自动转换
- **智能获取**：点击插件图标自动获取当前页面URL
- **自动识别**：智能识别飞书、Notion、语雀、Google Docs等平台
- **自动转换**：无需手动输入，一键完成整个转换流程

### 🔍 智能URL检测
- **实时检测**：输入URL时实时显示平台类型和图标
- **自动清理**：自动移除跟踪参数，保持URL简洁
- **友好提示**：动态占位符和平台指示器

## 🎯 支持平台

### 📄 输入源
- **飞书文档** - `*.feishu.cn/wiki/*`, `*.feishu.cn/docx/*`
- **Notion** - `*.notion.so/*`
- **语雀** - `*.yuque.com/*`
- **Google Docs** - `docs.google.com/document/*`

### 🎨 输出格式
- **微信公众号** - 适配公众号编辑器样式
- **小红书** - 图文卡片格式
- **知乎专栏** - 知乎编辑器格式
- **稀土掘金** - Markdown格式
- **人人都是产品经理** - 富文本格式
- **CSDN博客** - 博客编辑器格式
- **知识星球** - 富文本格式

## 🚀 使用方法

### 方法一：一键自动转换（推荐）
1. 打开任意支持的文档页面（如飞书文档）
2. 点击浏览器工具栏中的插件图标
3. 插件会自动：
   - 获取当前页面URL
   - 打开转换界面
   - 自动填入URL到输入框
   - 自动开始转换

### 方法二：手动输入
1. 点击插件图标打开转换界面
2. 手动粘贴文档链接到输入框
3. 点击"开始转换"按钮

## 🎨 界面特性

### 智能输入框
- **动态占位符**：根据检测结果显示不同提示文字
- **平台图标**：显示对应平台的emoji图标
- **实时验证**：自动验证URL格式和有效性
- **清理功能**：自动移除跟踪参数

### 用户体验
- **即时反馈**：输入URL时立即显示检测结果
- **错误提示**：无效URL会显示友好的错误信息
- **防重复点击**：避免频繁操作导致的问题

## 🛠 技术实现

### 核心功能
- **URL检测算法**：使用正则表达式精确匹配各平台URL格式
- **自动填充机制**：通过URL参数传递，实现页面间数据传递
- **智能转换**：根据检测到的平台类型自动选择转换方式

### 权限配置
- `tabs` - 获取当前标签页信息
- `activeTab` - 访问当前活跃标签页
- `scripting` - 注入脚本到目标页面
- `clipboardWrite/Read` - 剪贴板操作

## 📦 安装方法

### Chrome 扩展商店（推荐）
1. 访问 [Chrome 扩展商店](https://chrome.google.com/webstore)
2. 搜索"飞书2ALL"
3. 点击"添加至Chrome"

### 手动安装
1. 下载最新版本的 `dist` 文件夹
2. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 文件夹

## 🔧 开发指南

### 环境要求
- Node.js 16+
- npm 或 yarn

### 本地开发
```bash
# 克隆项目
git clone https://github.com/yourusername/cloud-file-converter.git
cd cloud-file-converter

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### 项目结构
```
cloud-file-converter/
├── src/
│   ├── components/          # Vue组件
│   │   ├── DocumentInput/   # 文档输入组件
│   │   ├── PreviewPanel/    # 预览面板
│   │   └── XhsPanel/        # 小红书面板
│   ├── services/            # 服务层
│   │   ├── api/            # API接口
│   │   └── converters/     # 转换器
│   ├── utils/              # 工具函数
│   │   └── url-detector.js # URL检测工具
│   ├── views/              # 页面视图
│   ├── background.js       # 后台脚本
│   └── App.vue            # 主应用
├── public/
│   ├── manifest.json      # 扩展清单
│   ├── background.js      # 后台脚本（生产版）
│   └── logo.png          # 图标
└── dist/                  # 构建输出
```

## 📋 使用场景

### 场景1：飞书文档转公众号
1. 在飞书中打开要转换的文档
2. 点击插件图标
3. 自动转换完成后，选择"公众号"格式
4. 一键复制到微信公众号编辑器

### 场景2：Notion笔记转知乎
1. 在Notion中打开笔记页面
2. 点击插件图标
3. 转换完成后选择"知乎"格式
4. 直接发布到知乎专栏

### 场景3：语雀文档转小红书
1. 在语雀中打开文档
2. 点击插件图标
3. 选择"图文"标签页
4. 生成小红书风格的图文内容

## 🔍 故障排除

### 常见问题

**Q: 点击插件图标没有自动填入URL？**
A: 请确保：
- 当前页面是支持的文档平台
- 插件有足够的权限
- 页面已完全加载

**Q: 检测不到文档平台？**
A: 请检查：
- URL格式是否正确
- 是否为分享链接而非编辑链接
- 尝试手动输入URL

**Q: 转换失败？**
A: 可能原因：
- 文档权限不足（需要公开或有访问权限）
- 网络连接问题
- 文档内容格式不支持

## 📝 更新日志

### v1.3.0 (2025-09-16)
- ✨ 新增一键自动转换功能
- 🎯 智能URL检测和平台识别
- 🔄 自动填充和转换流程
- 🎨 优化用户界面体验
- 🛡️ 添加防滥用机制

### v1.2.0
- 📄 支持多种文档平台
- 🎨 小红书图文转换
- 🔧 优化转换算法

### v1.1.0
- 🚀 基础转换功能
- 📝 支持主流平台格式

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢所有贡献者的支持
- 感谢用户的反馈和建议
- 特别感谢开源社区的帮助

## 📞 联系我们

- 📧 邮箱：your-email@example.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/yourusername/cloud-file-converter/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/yourusername/cloud-file-converter/discussions)

---

**享受更便捷的文档转换体验！** 🚀