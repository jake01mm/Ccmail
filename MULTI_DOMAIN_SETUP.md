# 多域名支持设置指南

## 概述

CCMail 现在支持多个域名！你可以在同一个系统中管理多个域名的邮箱别名。

## 设置步骤

### 1. 数据库迁移

首先，需要在数据库中运行迁移脚本来添加多域名支持：

```bash
# 连接到你的数据库（Neon/PostgreSQL）
psql <your-database-url>

# 或者使用你喜欢的数据库客户端
# 然后执行 schema_multi_domain.sql 文件中的 SQL 语句
```

迁移脚本会：
- 创建 `domains` 表来存储所有域名
- 为 `email_aliases` 表添加 `domain` 字段
- 从现有的 `full_address` 中提取域名
- 更新唯一约束，使 `alias + domain` 组合唯一（而不是仅 alias 唯一）

### 2. 在 Cloudflare 中配置多个域名

在 Cloudflare Dashboard 中，你需要为每个域名配置 Email Routing：

1. 进入 **Email Routing** → **Routes**
2. 为每个新域名添加路由规则
3. 确保每个域名的路由都指向同一个 Worker（`ccmail-worker`）

### 3. 使用多域名功能

#### 添加新域名

1. 打开 CCMail 界面
2. 点击 **"Manage Domains"** 按钮
3. 在弹出窗口中输入新域名（如 `example.com`）
4. 点击 **"Add Domain"**

#### 创建别名时选择域名

1. 在创建别名时，会看到一个域名选择下拉框
2. 选择要使用的域名
3. 输入别名和描述
4. 点击 **"Create"**

#### 查看和管理域名

- 点击 **"Manage Domains"** 查看所有已添加的域名
- 每个域名会显示其别名数量
- 可以删除不需要的域名（不会删除已存在的别名）

## 功能特性

✅ **多域名支持**：可以在不同域名下创建相同名称的别名  
✅ **自动域名添加**：创建别名时如果域名不存在会自动添加  
✅ **域名管理界面**：可视化管理所有域名  
✅ **向后兼容**：现有别名会自动迁移到新系统  

## 注意事项

1. **域名格式验证**：系统会验证域名格式，确保输入正确
2. **唯一性约束**：同一域名下不能有重复的别名，但不同域名可以有相同的别名
3. **邮件路由**：确保在 Cloudflare 中为每个域名配置了正确的邮件路由
4. **数据库迁移**：迁移是一次性操作，运行后现有数据会自动适配

## API 端点

新增的域名管理 API：

- `GET /api/domains` - 获取所有域名
- `POST /api/domains` - 添加新域名
- `DELETE /api/domains/:id` - 删除域名

## 示例

### 添加域名
```bash
curl -X POST https://your-worker.workers.dev/api/domains \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### 创建别名（指定域名）
```bash
curl -X POST https://your-worker.workers.dev/api/aliases \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "test123",
    "domain": "example.com",
    "description": "Test alias"
  }'
```

## 故障排除

**问题：域名已存在但无法创建别名**
- 检查域名是否在 `domains` 表中且 `is_active = TRUE`

**问题：邮件无法接收**
- 确认在 Cloudflare Email Routing 中配置了该域名的路由
- 检查 Worker 的触发事件中是否包含该域名

**问题：迁移后现有别名无法使用**
- 运行迁移脚本后，检查 `email_aliases` 表的 `domain` 字段是否已填充
- 如果为空，手动运行：`UPDATE email_aliases SET domain = SUBSTRING(full_address FROM '@(.+)$') WHERE domain IS NULL;`

