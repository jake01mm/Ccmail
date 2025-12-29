# 快速配置检查清单

## ✅ DNS 配置（必须完成）

### 在 Cloudflare Dashboard 中配置：

1. **SPF 记录**
   - 位置：DNS → Records → Add record
   - 类型：TXT
   - 名称：`@`
   - 内容：`v=spf1 include:_spf.mx.cloudflare.net ~all`
   - Proxy：DNS only（灰色云朵）

2. **DMARC 记录**
   - 位置：DNS → Records → Add record
   - 类型：TXT
   - 名称：`_dmarc`
   - 内容：`v=DMARC1; p=none; rua=mailto:dmarc@你的域名.com`
   - Proxy：DNS only（灰色云朵）

3. **DKIM 记录**
   - 位置：Email → Email Routing → 你的域名 → Authenticate
   - Cloudflare 会自动生成，按照提示添加即可

### 验证配置：

访问 https://www.mail-tester.com/ 发送测试邮件，目标评分：**8-10 分**

---

## ✅ 别名生成优化（已完成）

别名生成器已优化，现在会生成更真实的邮箱格式：

**优化前：**
- `user_l1lb71@truspaix.com` ❌ 明显是临时邮箱

**优化后：**
- `john.wang2024@truspaix.com` ✅ 看起来像真实邮箱
- `alice.li123@truspaix.com` ✅ 真实姓名格式
- `mike.chen@truspaix.com` ✅ 无数字版本
- `sarah_zhang45@truspaix.com` ✅ 下划线格式
- `david.smith99@truspaix.com` ✅ 英文姓名

### 支持的格式：

1. `firstname.surname + 数字`
2. `firstname + 数字 + surname`
3. `firstname.surname`（无数字）
4. `firstname + 首字母 + surname`
5. `首字母.surname + 数字`
6. `firstname_下划线_surname + 数字`
7. `firstname + 年份`
8. `firstname + 月份年份`
9. `surname.firstname + 数字`
10. `首字母组合 + 数字`

### 姓名库：

- **英文名**：40+ 常见英文名
- **中文姓氏**：20+ 常见中文姓氏
- **其他**：日韩姓氏、其他常见姓氏

---

## 📋 配置步骤总结

### 第一步：配置 DNS 记录（约 5 分钟）

1. 登录 Cloudflare Dashboard
2. 选择你的域名
3. 进入 DNS → Records
4. 添加 SPF 记录（见上方）
5. 添加 DMARC 记录（见上方）
6. 配置 DKIM（通过 Email Routing）

### 第二步：验证配置（约 2 分钟）

1. 访问 https://www.mail-tester.com/
2. 获取测试邮箱
3. 从你的域名发送测试邮件
4. 查看评分（目标：8-10 分）

### 第三步：使用优化后的别名生成器

1. 打开 CCMail 界面
2. 点击 "Random" 按钮生成别名
3. 选择域名
4. 创建别名

---

## 🎯 最佳实践

### 创建别名时：

✅ **推荐做法：**
- 使用 "Random" 按钮生成真实格式的别名
- 为不同平台使用不同的别名
- 使用描述字段记录用途（如 "GitHub注册"）

❌ **避免做法：**
- 手动输入明显的临时邮箱格式（如 `test123`, `temp456`）
- 所有平台使用同一个别名
- 短时间内创建大量别名

### 域名选择：

✅ **推荐：**
- 使用看起来像个人/公司域名的域名
- 避免包含 `mail`, `temp`, `alias` 等关键词
- 使用较短的、易记的域名

❌ **避免：**
- 明显是临时邮箱服务的域名
- 已被列入黑名单的域名

---

## 🔍 检查清单

配置完成后，请确认：

- [ ] SPF 记录已添加并生效
- [ ] DMARC 记录已添加并生效
- [ ] DKIM 记录已配置（通过 Email Routing）
- [ ] Mail Tester 评分 ≥ 8 分
- [ ] 别名生成器正常工作
- [ ] 可以成功创建别名
- [ ] 可以接收测试邮件

---

## 📚 相关文档

- **DNS_CONFIGURATION.md** - 详细的 DNS 配置指南
- **ANTI_BLOCK_GUIDE.md** - 避免被封禁的完整指南
- **MULTI_DOMAIN_SETUP.md** - 多域名配置指南

---

## ⚠️ 重要提示

1. **DNS 记录生效时间**：通常几分钟到几小时，最长可能需要 24-48 小时
2. **Proxy 状态**：邮件相关记录必须使用 DNS only（灰色云朵），不能使用代理
3. **测试建议**：配置完成后先发送测试邮件验证，确认无误后再正式使用
4. **定期检查**：建议每月检查一次域名信誉和黑名单状态

---

## 🆘 遇到问题？

1. **DNS 记录不生效**：等待 24-48 小时，或检查记录是否正确
2. **Mail Tester 评分低**：检查是否所有记录都已正确配置
3. **仍然被封禁**：查看 ANTI_BLOCK_GUIDE.md 了解更多解决方案

