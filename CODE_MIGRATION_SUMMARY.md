# 代码迁移总结

## ✅ 已完成的迁移

### 1. 核心文件更新

- ✅ `auth.ts` - 更新为使用 D1 适配器
- ✅ `app/lib/action.ts` - 所有 Server Actions 更新为使用 D1
- ✅ `app/lib/data.ts` - 所有数据查询函数更新为使用 D1
- ✅ `app/seed/route.ts` - 种子数据脚本更新为使用 D1

### 2. 主要变更

#### SQL 语法转换
- `ILIKE` → `LIKE` (SQLite 的 LIKE 默认不区分大小写)
- `::text` → `CAST(... AS TEXT)` 或移除（SQLite 自动类型转换）
- `ON CONFLICT (id) DO NOTHING` → `INSERT OR IGNORE` (SQLite 语法)
- `COUNT(*)` 结果访问：`data[0].count` → `data[0]?.count`

#### API 变更
- `postgres` 库 → `getD1Client()` 适配器
- 直接 await 查询 → 需要调用 `.run()` 或 `.all()` 方法
- 查询结果结构略有不同（D1 返回 `{ results: [...] }`）

### 3. 数据库访问模式

所有文件现在使用统一的模式：

```typescript
import { getDB } from '@/app/lib/db';

// 在函数中
const db = getDB();
const results = await db.sql`SELECT * FROM table WHERE id = ${id}`;
```

## ⚠️ 注意事项

### 1. 环境变量

D1 数据库通过 `env.DB` 访问，不是环境变量。在 Cloudflare Workers 中：
- `env` 对象通过函数参数传递
- OpenNext 会自动处理 `env` 的传递
- 本地开发需要使用 `wrangler dev`

### 2. 表结构

表结构应该通过迁移文件创建：
```bash
npx wrangler d1 execute nextjs-dashboard-db --file=./migrations/0001_initial_schema.sql
```

不要在代码中创建表（seed 文件只插入数据）。

### 3. 类型安全

D1 适配器保持了类型安全，但需要注意：
- 查询结果可能需要额外的类型断言
- 某些 PostgreSQL 特定的类型可能需要调整

### 4. 测试

迁移后需要测试：
- ✅ 用户认证流程
- ✅ 发票 CRUD 操作
- ✅ 数据查询和过滤
- ✅ 分页功能

## 🔄 下一步

1. **创建 D1 数据库**
   ```bash
   npx wrangler d1 create nextjs-dashboard-db
   ```

2. **更新 wrangler.toml**
   - 将得到的 `database_id` 填入配置

3. **运行迁移**
   ```bash
   npx wrangler d1 execute nextjs-dashboard-db --file=./migrations/0001_initial_schema.sql
   ```

4. **运行种子数据**（可选）
   - 访问 `/seed` 路由或手动插入数据

5. **测试部署**
   ```bash
   npm run deploy
   ```

## 📝 需要手动检查的地方

1. **查询结果访问**
   - 检查所有 `data[0]` 访问是否添加了可选链 `data[0]?`
   - 确保处理空结果的情况

2. **错误处理**
   - D1 的错误可能与 PostgreSQL 不同
   - 确保错误处理逻辑正确

3. **性能优化**
   - D1 有并发限制
   - 考虑添加缓存或优化查询

## 🐛 已知问题

1. **getDB() 在 NextAuth 中的访问**
   - NextAuth 配置可能需要特殊处理来获取 `env.DB`
   - 可能需要通过 NextAuth 的配置选项传递

2. **本地开发**
   - 需要使用 `wrangler dev` 来模拟 Workers 环境
   - 或者设置全局变量来模拟 D1

## 📚 相关文档

- [D1_MIGRATION.md](./D1_MIGRATION.md) - 完整迁移指南
- [DEPLOY.md](./DEPLOY.md) - 部署指南
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
