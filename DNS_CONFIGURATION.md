# Cloudflare DNS 配置指南

## 概述

为了提升邮件发送质量和避免被识别为临时邮箱服务，需要配置以下 DNS 记录：
- **SPF** (Sender Policy Framework) - 验证发件人身份
- **DKIM** (DomainKeys Identified Mail) - 邮件签名验证
- **DMARC** (Domain-based Message Authentication) - 邮件认证策略

## 配置步骤

### 1. 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 选择你的域名

在左侧菜单选择你的域名（如 `truspaix.com`）

### 3. 进入 DNS 设置

点击左侧菜单的 **"DNS"** → **"Records"**

---

## SPF 记录配置

### 步骤：

1. 点击 **"Add record"** 按钮
2. 选择记录类型：**TXT**
3. 填写以下信息：

```
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net ~all
TTL: Auto
Proxy status: DNS only (灰色云朵)
```

4. 点击 **"Save"**

### 说明：
- `@` 表示根域名
- `include:_spf.mx.cloudflare.net` 包含 Cloudflare 的邮件服务器
- `~all` 表示软失败（其他服务器发送的邮件会被标记但不会拒绝）

---

## DMARC 记录配置

### 步骤：

1. 点击 **"Add record"** 按钮
2. 选择记录类型：**TXT**
3. 填写以下信息：

```
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:dmarc@truspaix.com
TTL: Auto
Proxy status: DNS only (灰色云朵)
```

**注意：** 将 `dmarc@truspaix.com` 替换为你的实际邮箱地址

4. 点击 **"Save"**

### 说明：
- `p=none` 表示监控模式（不拒绝未通过验证的邮件）
- `rua=mailto:...` 指定接收 DMARC 报告的邮箱
- 建议先用 `p=none` 测试，确认无误后可以改为 `p=quarantine` 或 `p=reject`

---

## DKIM 记录配置

### 自动配置（推荐）：

DKIM 记录由 Cloudflare Email Routing 自动生成和管理。

### 步骤：

1. 进入 **"Email"** → **"Email Routing"**
2. 选择你的域名
3. 点击 **"Authenticate"** 或 **"DNS Settings"**
4. Cloudflare 会自动显示需要添加的 DKIM 记录
5. 按照提示添加记录（通常会自动添加）

### 手动配置（如果需要）：

如果 Cloudflare 没有自动添加，可以手动添加：

1. 在 Email Routing 设置中查看 DKIM 密钥
2. 添加 TXT 记录：

```
Name: cloudflare._domainkey
Content: [从 Cloudflare Email Routing 中复制]
TTL: Auto
Proxy status: DNS only (灰色云朵)
```

---

## 验证配置

### 方法 1：使用 Mail Tester

1. 访问：https://www.mail-tester.com/
2. 获取测试邮箱地址
3. 从你的域名发送一封测试邮件到该地址
4. 查看评分（目标：8-10 分）

### 方法 2：使用 MXToolbox

1. 访问：https://mxtoolbox.com/spf.aspx
2. 输入你的域名
3. 检查 SPF 记录是否正确

### 方法 3：使用 DMARC Analyzer

1. 访问：https://www.learndmarc.com/
2. 输入你的域名
3. 检查 DMARC 配置

---

## 完整 DNS 记录示例

假设你的域名是 `truspaix.com`，完整的记录应该是：

```
类型    名称        内容
----    ----        ----
TXT     @           v=spf1 include:_spf.mx.cloudflare.net ~all
TXT     _dmarc      v=DMARC1; p=none; rua=mailto:dmarc@truspaix.com
TXT     cloudflare._domainkey  [由 Cloudflare 自动生成]
MX      @           route1.mx.cloudflare.net (优先级 1)
MX      @           route2.mx.cloudflare.net (优先级 2)
```

**注意：** MX 记录通常由 Cloudflare Email Routing 自动配置，无需手动添加。

---

## 配置检查清单

- [ ] SPF 记录已添加（`@` 的 TXT 记录）
- [ ] DMARC 记录已添加（`_dmarc` 的 TXT 记录）
- [ ] DKIM 记录已配置（通过 Email Routing）
- [ ] MX 记录已配置（通过 Email Routing）
- [ ] 所有记录的 Proxy 状态为 **DNS only**（灰色云朵）
- [ ] 使用 Mail Tester 验证配置（评分 ≥ 8）

---

## 常见问题

### Q: 为什么 Proxy 状态要设置为 DNS only？

A: 邮件相关的 DNS 记录（SPF、DKIM、DMARC、MX）必须使用 DNS only 模式，不能使用代理（橙色云朵），否则会影响邮件传递。

### Q: 配置后多久生效？

A: DNS 记录通常在几分钟到几小时内生效，最长可能需要 24-48 小时。

### Q: DMARC 的 `p` 参数应该设置为什么？

A: 
- `p=none` - 监控模式，适合初期测试
- `p=quarantine` - 隔离未通过验证的邮件
- `p=reject` - 拒绝未通过验证的邮件（最严格）

建议先用 `p=none` 测试，确认一切正常后再逐步提高。

### Q: 如何知道配置是否成功？

A: 使用 Mail Tester 发送测试邮件，如果评分达到 8-10 分，说明配置成功。

---

## 下一步

配置完成后：
1. 等待 DNS 记录生效（通常几分钟）
2. 使用 Mail Tester 验证配置
3. 开始使用改进后的别名生成器创建更真实的邮箱地址
4. 定期检查域名信誉和黑名单状态

