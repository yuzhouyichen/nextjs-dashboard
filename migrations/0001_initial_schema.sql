-- D1 数据库迁移文件
-- 创建初始数据库结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- 发票表
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'paid')),
  date TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 收入表
CREATE TABLE IF NOT EXISTS revenue (
  month TEXT PRIMARY KEY,
  revenue INTEGER NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
