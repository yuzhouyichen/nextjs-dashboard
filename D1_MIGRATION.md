# 迁移到 Cloudflare D1 数据库指南

## 📋 概述

本指南将帮助你从 PostgreSQL 迁移到 Cloudflare D1（SQLite）数据库。

## 🎯 为什么选择 D1？

- ✅ **原生集成**：与 Cloudflare Workers 完美集成
- ✅ **零配置**：无需外部数据库连接
- ✅ **免费额度**：每天 100,000 次读取，1,000 次写入
- ✅ **全球分布**：数据自动复制到边缘
- ✅ **简单易用**：SQLite 语法，学习成本低

## 🚀 快速开始

### 1. 创建 D1 数据库

```bash
# 创建生产数据库
npx wrangler d1 create nextjs-dashboard-db

# 创建本地开发数据库
npx wrangler d1 create nextjs-dashboard-db --local
```

执行后会得到：
- `database_id`: 用于 `wrangler.toml` 配置
- `database_name`: 数据库名称

### 2. 更新 wrangler.toml

将得到的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "nextjs-dashboard-db"
database_id = "your-database-id-here"  # 替换这里
```

### 3. 运行数据库迁移

```bash
# 运行迁移到生产数据库
npx wrangler d1 execute nextjs-dashboard-db --file=./migrations/0001_initial_schema.sql

# 运行迁移到本地数据库（用于开发）
npx wrangler d1 execute nextjs-dashboard-db --local --file=./migrations/0001_initial_schema.sql
```

### 4. 安装依赖

```bash
npm install
```

### 5. 更新代码

所有使用 `postgres` 的文件需要更新为使用 D1 适配器。主要文件：

- `auth.ts` - 用户认证
- `app/lib/action.ts` - Server Actions
- `app/lib/data.ts` - 数据查询
- `app/seed/route.ts` - 数据种子

## 📝 代码迁移示例

### 之前（PostgreSQL）

```typescript
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL!, {});

const users = await sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
```

### 之后（D1）

```typescript
import { getD1Client } from '@/app/lib/d1-adapter';

// 在 Server Component 或 Server Action 中
// 需要从 context 获取 DB（通过 env）
const db = getD1Client(env.DB);
const users = await db.sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
```

## 🔄 主要差异

### 1. SQL 语法差异

| PostgreSQL | D1 (SQLite) | 说明 |
|-----------|-------------|------|
| `ILIKE` | `LIKE` | SQLite 的 LIKE 默认不区分大小写 |
| `::text` | (移除) | SQLite 不需要显式类型转换 |
| `UUID` | `TEXT` | SQLite 使用 TEXT 存储 UUID |
| `uuid_generate_v4()` | `(lower(hex(randomblob(4))) || ...)` | 自定义 UUID 生成 |

### 2. API 差异

D1 使用不同的 API，但我们已经创建了适配器来模拟 `postgres` 的语法。

### 3. 类型差异

- PostgreSQL 的 `UUID` → SQLite 的 `TEXT`
- PostgreSQL 的 `VARCHAR(n)` → SQLite 的 `TEXT`
- PostgreSQL 的 `INT` → SQLite 的 `INTEGER`

## 📦 迁移步骤详解

### 步骤 1: 更新 auth.ts

```typescript
// auth.ts
import { getD1Client } from '@/app/lib/d1-adapter';

// 在 authorize 函数中
// 需要从 context 获取 DB
export async function authorize(credentials, env: { DB: D1Database }) {
  const db = getD1Client(env.DB);
  const user = await db.sql<User[]>`SELECT * FROM users WHERE email = ${email}`.first();
  // ...
}
```

### 步骤 2: 更新 Server Actions

在 Server Actions 中，需要通过某种方式获取 `env.DB`。这取决于你的部署方式。

### 步骤 3: 更新数据查询

所有 `app/lib/data.ts` 中的查询需要更新为使用 D1 客户端。

### 步骤 4: 更新种子数据

`app/seed/route.ts` 需要更新为使用 D1 客户端。

## 🛠️ 开发工作流

### 本地开发

```bash
# 启动本地 D1 数据库
npx wrangler d1 execute nextjs-dashboard-db --local --file=./migrations/0001_initial_schema.sql

# 运行本地开发服务器（需要配置获取 env.DB）
npm run dev
```

### 数据管理

```bash
# 查看数据库信息
npx wrangler d1 info nextjs-dashboard-db

# 执行 SQL 查询
npx wrangler d1 execute nextjs-dashboard-db --command "SELECT * FROM users"

# 导出数据
npx wrangler d1 export nextjs-dashboard-db --output=./backup.sql

# 导入数据
npx wrangler d1 execute nextjs-dashboard-db --file=./backup.sql
```

## ⚠️ 注意事项

### 1. 环境变量

D1 数据库通过 `env.DB` 访问，不是环境变量。在 Cloudflare Workers 中，`env` 对象通过函数参数传递。

### 2. 事务支持

D1 支持事务，但语法略有不同。适配器提供了简化的 `begin` 方法。

### 3. 并发限制

D1 有并发限制，但通常足够使用。如果遇到问题，考虑：
- 使用连接池（D1 自动管理）
- 优化查询
- 使用缓存

### 4. 数据迁移

如果已有 PostgreSQL 数据，需要：
1. 导出 PostgreSQL 数据
2. 转换为 SQLite 格式
3. 导入到 D1

## 🔍 故障排除

### 问题：数据库未找到

```bash
# 检查数据库是否存在
npx wrangler d1 list

# 确认 wrangler.toml 中的 database_id 正确
```

### 问题：迁移失败

```bash
# 检查 SQL 语法
npx wrangler d1 execute nextjs-dashboard-db --local --command "SELECT 1"

# 查看详细错误
npx wrangler d1 execute nextjs-dashboard-db --local --file=./migrations/0001_initial_schema.sql --verbose
```

### 问题：查询返回空结果

- 检查数据是否已导入
- 确认查询语法正确
- 使用 `wrangler d1 execute` 直接查询验证

## 📚 相关资源

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [D1 API 参考](https://developers.cloudflare.com/d1/platform/client-api/)
- [SQLite 文档](https://www.sqlite.org/docs.html)

## 🎉 完成迁移后

迁移完成后，你可以：
- ✅ 移除 `POSTGRES_URL` 环境变量
- ✅ 移除 `postgres` 依赖（可选）
- ✅ 享受 D1 的原生集成和性能优势
