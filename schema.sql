-- CCMail 数据库结构
-- 邮箱验证码接收系统

-- 邮箱别名表
CREATE TABLE IF NOT EXISTS email_aliases (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(100) NOT NULL UNIQUE,  -- 邮箱别名 (如 test123)
    full_address VARCHAR(200) NOT NULL,  -- 完整邮箱 (如 test123@truspaix.com)
    description TEXT,                     -- 备注说明
    is_active BOOLEAN DEFAULT TRUE,       -- 是否启用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邮件记录表
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    alias_id INTEGER REFERENCES email_aliases(id) ON DELETE CASCADE,
    from_address VARCHAR(255) NOT NULL,   -- 发件人
    to_address VARCHAR(255) NOT NULL,     -- 收件人
    subject TEXT,                          -- 主题
    body_text TEXT,                        -- 纯文本内容
    body_html TEXT,                        -- HTML内容
    verification_code VARCHAR(50),         -- 提取的验证码
    raw_headers TEXT,                      -- 原始邮件头
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_aliases_alias ON email_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_email_aliases_full_address ON email_aliases(full_address);
CREATE INDEX IF NOT EXISTS idx_emails_alias_id ON emails(alias_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_to_address ON emails(to_address);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_email_aliases_updated_at ON email_aliases;
CREATE TRIGGER update_email_aliases_updated_at
    BEFORE UPDATE ON email_aliases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
