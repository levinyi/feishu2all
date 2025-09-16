#!/bin/bash

# 推送到GitHub的脚本
# 使用方法：
# 1. 先在GitHub上创建仓库 (例如: https://github.com/levinyi/feishu2all)
# 2. 将下面的URL替换为你的仓库地址
# 3. 运行此脚本

echo "🚀 准备推送 飞书2ALL v1.3.0 到GitHub..."

# 替换为你的GitHub仓库地址
REPO_URL="https://github.com/levinyi/feishu2all.git"

echo "📋 当前git状态："
git status

echo "📝 添加远程仓库..."
git remote add origin $REPO_URL

echo "🔄 推送到GitHub..."
git branch -M main
git push -u origin main

echo "✅ 推送完成！"
echo "🌐 访问你的仓库: ${REPO_URL%%.git}"

# 显示仓库信息
echo ""
echo "📊 仓库统计："
echo "- 提交数: $(git rev-list --count HEAD)"
echo "- 文件数: $(git ls-files | wc -l)"
echo "- 分支: $(git branch --show-current)"
echo "- 最新提交: $(git log -1 --pretty=format:'%h - %s (%cr)')"