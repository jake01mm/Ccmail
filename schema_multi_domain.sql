-- CCMail 多域名支持 - 数据库迁移脚本
-- 在现有数据库上运行此脚本以添加多域名支持

-- 1. 添加域名表
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,  -- 域名 (如 truspaix.com)
    is_active BOOLEAN DEFAULT TRUE,       -- 是否启用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 为 email_aliases 表添加 domain 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_aliases' AND column_name = 'domain'
    ) THEN
        ALTER TABLE email_aliases ADD COLUMN domain VARCHAR(255);
    END IF;
END $$;

-- 3. 从 full_address 中提取域名并填充 domain 字段
UPDATE email_aliases 
SET domain = SUBSTRING(full_address FROM '@(.+)$')
WHERE domain IS NULL;

-- 4. 将现有域名添加到 domains 表
INSERT INTO domains (domain, is_active)
SELECT DISTINCT domain, TRUE
FROM email_aliases
WHERE domain IS NOT NULL
ON CONFLICT (domain) DO NOTHING;

-- 5. 修改 email_aliases 表，使 alias 和 domain 组合唯一（而不是 alias 单独唯一）
-- 首先删除旧的唯一约束（如果存在）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'email_aliases_alias_key'
    ) THEN
        ALTER TABLE email_aliases DROP CONSTRAINT email_aliases_alias_key;
    END IF;
END $$;

-- 添加新的唯一约束：alias + domain 组合唯一
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'email_aliases_alias_domain_key'
    ) THEN
        ALTER TABLE email_aliases 
        ADD CONSTRAINT email_aliases_alias_domain_key UNIQUE (alias, domain);
    END IF;
END $$;

-- 6. 添加索引
CREATE INDEX IF NOT EXISTS idx_email_aliases_domain ON email_aliases(domain);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- 7. 更新时间触发器（为 domains 表）
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at
    BEFORE UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

