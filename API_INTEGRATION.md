# CCMail API 集成指南

本文档介绍如何在你的脚本或应用中集成 CCMail 临时邮箱服务。

## 快速开始

CCMail 提供 RESTful API，可以轻松集成到任何编程语言中。

**API 基础 URL**：`https://ccmail-worker.jake01mm.workers.dev`

---

## 核心流程

1. **创建临时邮箱别名**
2. **使用邮箱进行注册/验证**
3. **轮询获取验证码**
4. **（可选）删除别名**

---

## API 接口

### 1. 创建别名

**请求**
```http
POST /api/aliases
Content-Type: application/json

{
  "alias": "test123",           // 可选，不填则自动生成
  "domain": "truspaix.com",     // 可选，默认使用配置的域名
  "description": "用于注册某网站"  // 可选
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullAddress": "test123@truspaix.com"
  }
}
```

### 2. 获取最新验证码

**请求**
```http
GET /api/aliases/{alias_id}/latest-code
```

**响应**
```json
{
  "success": true,
  "data": {
    "code": "123456"  // 如果没有验证码则为 null
  }
}
```

### 3. 获取邮件列表

**请求**
```http
GET /api/aliases/{alias_id}/emails
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "from_address": "noreply@example.com",
      "subject": "验证码",
      "verification_code": "123456",
      "received_at": "2024-01-27T12:00:00Z"
    }
  ]
}
```

### 4. 删除别名

**请求**
```http
DELETE /api/aliases/{alias_id}
```

**响应**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## Python 集成示例

### 安装依赖
```bash
pip install requests
```

### 完整代码

```python
import requests
import time

class CCMailClient:
    """CCMail API 客户端"""
    
    def __init__(self, api_base="https://ccmail-worker.jake01mm.workers.dev"):
        self.api_base = api_base
    
    def create_alias(self, alias=None, description=""):
        """
        创建邮箱别名
        
        Args:
            alias: 别名（可选，不填则自动生成）
            description: 描述（可选）
        
        Returns:
            tuple: (alias_id, email_address)
        """
        data = {"description": description}
        if alias:
            data["alias"] = alias
        
        response = requests.post(f"{self.api_base}/api/aliases", json=data)
        response.raise_for_status()
        result = response.json()
        
        if not result["success"]:
            raise Exception(result.get("error", "创建别名失败"))
        
        return result["data"]["id"], result["data"]["fullAddress"]
    
    def get_latest_code(self, alias_id):
        """
        获取最新验证码
        
        Args:
            alias_id: 别名 ID
        
        Returns:
            str: 验证码，如果没有则返回 None
        """
        response = requests.get(f"{self.api_base}/api/aliases/{alias_id}/latest-code")
        response.raise_for_status()
        result = response.json()
        
        return result["data"]["code"]
    
    def wait_for_code(self, alias_id, timeout=60, interval=3):
        """
        等待验证码（轮询）
        
        Args:
            alias_id: 别名 ID
            timeout: 超时时间（秒）
            interval: 轮询间隔（秒）
        
        Returns:
            str: 验证码
        
        Raises:
            TimeoutError: 超时未收到验证码
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            code = self.get_latest_code(alias_id)
            if code:
                return code
            
            time.sleep(interval)
        
        raise TimeoutError(f"等待 {timeout} 秒后仍未收到验证码")
    
    def get_emails(self, alias_id):
        """
        获取邮件列表
        
        Args:
            alias_id: 别名 ID
        
        Returns:
            list: 邮件列表
        """
        response = requests.get(f"{self.api_base}/api/aliases/{alias_id}/emails")
        response.raise_for_status()
        result = response.json()
        
        return result["data"]
    
    def delete_alias(self, alias_id):
        """
        删除别名
        
        Args:
            alias_id: 别名 ID
        """
        response = requests.delete(f"{self.api_base}/api/aliases/{alias_id}")
        response.raise_for_status()


# 使用示例
def main():
    client = CCMailClient()
    
    # 1. 创建临时邮箱
    print("创建临时邮箱...")
    alias_id, email = client.create_alias(description="自动化测试")
    print(f"✓ 临时邮箱: {email}")
    print(f"✓ 别名 ID: {alias_id}")
    
    # 2. 使用这个邮箱进行注册
    print(f"\n使用 {email} 进行注册...")
    # your_register_function(email)
    
    # 3. 等待验证码
    print("\n等待验证码...")
    try:
        code = client.wait_for_code(alias_id, timeout=60)
        print(f"✓ 收到验证码: {code}")
    except TimeoutError as e:
        print(f"✗ {e}")
        return
    
    # 4. 查看所有邮件（可选）
    emails = client.get_emails(alias_id)
    print(f"\n共收到 {len(emails)} 封邮件")
    
    # 5. 清理
    print("\n清理临时邮箱...")
    client.delete_alias(alias_id)
    print("✓ 已删除")


if __name__ == "__main__":
    main()
```

---

## JavaScript/Node.js 集成示例

### 安装依赖
```bash
npm install axios
```

### 完整代码

```javascript
const axios = require('axios');

class CCMailClient {
    /**
     * CCMail API 客户端
     * @param {string} apiBase - API 基础 URL
     */
    constructor(apiBase = 'https://ccmail-worker.jake01mm.workers.dev') {
        this.apiBase = apiBase;
    }

    /**
     * 创建邮箱别名
     * @param {string|null} alias - 别名（可选）
     * @param {string} description - 描述（可选）
     * @returns {Promise<{id: number, email: string}>}
     */
    async createAlias(alias = null, description = '') {
        const data = { description };
        if (alias) data.alias = alias;
        
        const response = await axios.post(`${this.apiBase}/api/aliases`, data);
        
        if (!response.data.success) {
            throw new Error(response.data.error || '创建别名失败');
        }
        
        return {
            id: response.data.data.id,
            email: response.data.data.fullAddress
        };
    }

    /**
     * 获取最新验证码
     * @param {number} aliasId - 别名 ID
     * @returns {Promise<string|null>}
     */
    async getLatestCode(aliasId) {
        const response = await axios.get(`${this.apiBase}/api/aliases/${aliasId}/latest-code`);
        return response.data.data.code;
    }

    /**
     * 等待验证码（轮询）
     * @param {number} aliasId - 别名 ID
     * @param {number} timeout - 超时时间（毫秒）
     * @param {number} interval - 轮询间隔（毫秒）
     * @returns {Promise<string>}
     */
    async waitForCode(aliasId, timeout = 60000, interval = 3000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const code = await this.getLatestCode(aliasId);
            if (code) {
                return code;
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        throw new Error(`等待 ${timeout / 1000} 秒后仍未收到验证码`);
    }

    /**
     * 获取邮件列表
     * @param {number} aliasId - 别名 ID
     * @returns {Promise<Array>}
     */
    async getEmails(aliasId) {
        const response = await axios.get(`${this.apiBase}/api/aliases/${aliasId}/emails`);
        return response.data.data;
    }

    /**
     * 删除别名
     * @param {number} aliasId - 别名 ID
     */
    async deleteAlias(aliasId) {
        await axios.delete(`${this.apiBase}/api/aliases/${aliasId}`);
    }
}

// 使用示例
(async () => {
    const client = new CCMailClient();
    
    try {
        // 1. 创建临时邮箱
        console.log('创建临时邮箱...');
        const { id, email } = await client.createAlias(null, '自动化测试');
        console.log(`✓ 临时邮箱: ${email}`);
        console.log(`✓ 别名 ID: ${id}`);
        
        // 2. 使用这个邮箱进行注册
        console.log(`\n使用 ${email} 进行注册...`);
        // await yourRegisterFunction(email);
        
        // 3. 等待验证码
        console.log('\n等待验证码...');
        const code = await client.waitForCode(id, 60000);
        console.log(`✓ 收到验证码: ${code}`);
        
        // 4. 查看所有邮件（可选）
        const emails = await client.getEmails(id);
        console.log(`\n共收到 ${emails.length} 封邮件`);
        
        // 5. 清理
        console.log('\n清理临时邮箱...');
        await client.deleteAlias(id);
        console.log('✓ 已删除');
        
    } catch (error) {
        console.error('✗ 错误:', error.message);
    }
})();
```

---

## cURL 示例

### 创建别名
```bash
curl -X POST https://ccmail-worker.jake01mm.workers.dev/api/aliases \
  -H "Content-Type: application/json" \
  -d '{"alias":"test123","description":"测试"}'
```

### 获取验证码
```bash
curl https://ccmail-worker.jake01mm.workers.dev/api/aliases/1/latest-code
```

### 删除别名
```bash
curl -X DELETE https://ccmail-worker.jake01mm.workers.dev/api/aliases/1
```

---

## 最佳实践

### 1. 错误处理
```python
try:
    alias_id, email = client.create_alias()
except requests.exceptions.RequestException as e:
    print(f"网络错误: {e}")
except Exception as e:
    print(f"创建失败: {e}")
```

### 2. 轮询策略
- **推荐间隔**：3-5 秒
- **推荐超时**：60 秒
- 不要设置太短的间隔，避免过度请求

### 3. 资源清理
```python
try:
    # 使用邮箱
    code = client.wait_for_code(alias_id)
finally:
    # 确保清理
    client.delete_alias(alias_id)
```

### 4. 并发使用
如果需要同时使用多个邮箱：
```python
import concurrent.futures

def process_with_email(index):
    client = CCMailClient()
    alias_id, email = client.create_alias(description=f"任务{index}")
    
    try:
        # 使用邮箱
        code = client.wait_for_code(alias_id)
        return code
    finally:
        client.delete_alias(alias_id)

# 并发处理
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(process_with_email, range(10)))
```

---

## 常见问题

### Q: 验证码提取支持哪些格式？

A: 支持以下格式：
- `验证码：123456`
- `Verification code: 123456`
- `Code: 123456`
- `OTP: 123456`
- 6 位纯数字（如 `123456`）

### Q: 轮询多久合适？

A: 建议：
- 间隔：3-5 秒
- 超时：60 秒
- 大多数邮件在 10-30 秒内到达

### Q: 可以同时创建多少个别名？

A: 没有硬性限制，但建议：
- 用完及时删除
- 避免创建过多闲置别名

### Q: API 有速率限制吗？

A: 目前没有严格限制，但请合理使用：
- 不要过于频繁地轮询
- 建议间隔至少 3 秒

### Q: 邮件会保存多久？

A: 
- 邮件永久保存，直到删除别名
- 删除别名会同时删除所有邮件
- 建议用完及时清理

---

## 高级用法

### 自定义验证码提取

如果默认的验证码提取不满足需求，可以获取完整邮件内容自己解析：

```python
def extract_custom_code(email_body):
    # 自定义提取逻辑
    import re
    match = re.search(r'您的验证码是：(\d{6})', email_body)
    return match.group(1) if match else None

# 获取邮件列表
emails = client.get_emails(alias_id)
if emails:
    latest_email = emails[0]
    # 获取完整邮件内容
    response = requests.get(f"{client.api_base}/api/emails/{latest_email['id']}")
    email_detail = response.json()["data"]
    
    # 自定义提取
    code = extract_custom_code(email_detail["body_text"])
```

### Webhook 通知（未来功能）

目前需要轮询，未来可能支持 Webhook 推送。

---

## 技术支持

- **GitHub**: https://github.com/jake01mm/Ccmail
- **Issues**: https://github.com/jake01mm/Ccmail/issues

---

## 许可证

MIT License
