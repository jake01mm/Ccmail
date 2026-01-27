#!/bin/bash

# Cloudflare D1 快速设置脚本

echo "🚀 开始设置 Cloudflare D1 数据库..."
echo ""

# 步骤 1: 创建 D1 数据库
echo "📦 步骤 1/3: 创建 D1 数据库..."
npx wrangler d1 create ccmail-db

echo ""
echo "⚠️  重要：请将上面输出的 database_id 复制到 wrangler.toml 文件中！"
echo ""
read -p "已经复制 database_id 到 wrangler.toml 了吗？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ 请先更新 wrangler.toml，然后重新运行此脚本"
    exit 1
fi

# 步骤 2: 初始化数据库结构
echo ""
echo "📋 步骤 2/3: 初始化数据库结构..."
npx wrangler d1 execute ccmail-db --file=schema_d1.sql

# 步骤 3: 验证数据库
echo ""
echo "✅ 步骤 3/3: 验证数据库..."
npx wrangler d1 execute ccmail-db --command="SELECT name FROM sqlite_master WHERE type='table'"

echo ""
echo "🎉 D1 数据库设置完成！"
echo ""
echo "下一步："
echo "1. 运行 'npm run dev' 进行本地测试"
echo "2. 运行 'npm run deploy' 部署到生产环境"
echo ""
