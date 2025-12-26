-- D1 数据库种子数据
-- 注意：密码需要预先使用 bcrypt 加密
-- 可以使用 Node.js: bcrypt.hash('123456', 10)

-- 插入用户数据
-- 密码 '123456' 的 bcrypt hash (rounds=10): $2b$10$...
-- 实际使用时需要替换为真实的 hash 值
INSERT OR IGNORE INTO users (id, name, email, password) VALUES
('410544b2-4001-4271-9855-fec4b6a6442a', 'User', 'user@nextmail.com', '$2b$10$YourBcryptHashHere');

-- 插入客户数据
INSERT OR IGNORE INTO customers (id, name, email, image_url) VALUES
('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 'Evil Rabbit', 'evil@rabbit.com', '/customers/evil-rabbit.png'),
('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Delba de Oliveira', 'delba@oliveira.com', '/customers/delba-de-oliveira.png'),
('3958dc9e-742f-4377-85e9-fec4b6a6442a', 'Lee Robinson', 'lee@robinson.com', '/customers/lee-robinson.png'),
('76d65c26-f784-44a2-ac19-586678f7c2f2', 'Michael Novotny', 'michael@novotny.com', '/customers/michael-novotny.png'),
('CC27C14A-0ACF-4F4A-A6C9-D45682C144B9', 'Amy Burns', 'amy@burns.com', '/customers/amy-burns.png'),
('13D07535-C59E-4157-A011-F8D2EF4E0CBB', 'Balazs Orban', 'balazs@orban.com', '/customers/balazs-orban.png');

-- 插入发票数据（示例，需要根据实际数据调整）
-- INSERT OR IGNORE INTO invoices (id, customer_id, amount, status, date) VALUES
-- ('invoice-id-1', 'customer-id-1', 2000, 'pending', '2024-01-15');

-- 插入收入数据（示例）
-- INSERT OR IGNORE INTO revenue (month, revenue) VALUES
-- ('2024-01', 5000),
-- ('2024-02', 6000);
