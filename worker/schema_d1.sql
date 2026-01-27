-- CCMail D1 数据库结构 (SQLite)
-- 邮箱验证码接收系统 - 多域名支持

-- 域名表
CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL UNIQUE,
    is_active INTEGER DEFAULT 1,  -- SQLite 使用 INTEGER 代替 BOOLEAN (1=true, 0=false)
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 邮箱别名表
CREATE TABLE IF NOT EXISTS email_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT NOT NULL,
    full_address TEXT NOT NULL UNIQUE,
    domain TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(alias, domain)  -- alias + domain 组合唯一
);

-- 邮件记录表
CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias_id INTEGER NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    verification_code TEXT,
    raw_headers TEXT,
    received_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (alias_id) REFERENCES email_aliases(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_aliases_alias ON email_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_email_aliases_full_address ON email_aliases(full_address);
CREATE INDEX IF NOT EXISTS idx_email_aliases_domain ON email_aliases(domain);
CREATE INDEX IF NOT EXISTS idx_emails_alias_id ON emails(alias_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_to_address ON emails(to_address);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- 插入默认域名
INSERT OR IGNORE INTO domains (domain, is_active) VALUES ('truspaix.com', 1);
