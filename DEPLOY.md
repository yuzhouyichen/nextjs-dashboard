# Cloudflare Workers + OpenNext 部署指南

## 📋 前置准备

1. **Cloudflare 账户**
   - 访问 [cloudflare.com](https://cloudflare.com) 注册账户（免费版即可）

2. **环境变量准备**
   - `NEXTAUTH_URL`: 部署后的 Workers URL
   - `NEXTAUTH_SECRET`: 至少 32 字符的随机字符串
   - **D1 数据库**：通过 `wrangler.toml` 配置，无需连接字符串

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地开发环境（可选）

```bash
# 复制环境变量示例文件
cp .dev.vars.example .dev.vars

# 编辑 .dev.vars 填入你的本地环境变量
```

### 3. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器，完成 Cloudflare 账户登录。

### 4. 设置生产环境变量

使用 Wrangler CLI 设置敏感环境变量：

```bash
# 设置 NextAuth URL（部署后替换为实际 URL）
npx wrangler secret put NEXTAUTH_URL

# 设置 NextAuth Secret（至少 32 字符）
npx wrangler secret put NEXTAUTH_SECRET

# 注意：如果使用 D1 数据库，不需要设置 POSTGRES_URL
# D1 数据库在 wrangler.toml 中配置
```

**注意**：每次运行 `wrangler secret put` 时，会提示你输入值。这些值会被加密存储，不会出现在配置文件中。

### 5. 构建和部署

#### 方式一：一键部署（推荐）

```bash
npm run deploy
```

#### 方式二：分步执行

```bash
# 1. 构建 Next.js 应用
npm run build

# 2. 使用 OpenNext 适配器构建
npm run opennext:build

# 3. 部署到 Cloudflare Workers
npx wrangler deploy
```

### 6. 部署预览环境（可选）

```bash
npm run deploy:preview
```

## 🔧 配置说明

### wrangler.toml

主要配置文件，包含：
- Worker 名称
- 兼容性设置
- 环境变量（非敏感）

### 环境变量

**敏感变量**（使用 `wrangler secret put` 设置）：
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

**D1 数据库**（在 `wrangler.toml` 中配置）：
- 通过 `[[d1_databases]]` 配置
- 通过 `env.DB` 在代码中访问

**非敏感变量**（可在 `wrangler.toml` 中设置）：
- `NODE_ENV`

## 📝 常用命令

```bash
# 本地开发（使用 Cloudflare Workers 模拟环境）
npm run cf:dev

# 查看部署的 Worker
npx wrangler deployments list

# 查看 Worker 日志
npx wrangler tail

# 删除 Worker
npx wrangler delete
```

## ⚠️ 注意事项

### 1. bcrypt 兼容性

如果遇到 `bcrypt` 原生模块问题，可以考虑：
- 使用 `bcryptjs` 替代（纯 JavaScript 实现）
- 确保 `wrangler.toml` 中设置了 `compatibility_flags = ["nodejs_compat"]`

### 2. PostgreSQL 连接

确保：
- 数据库允许 Cloudflare IP 访问
- 连接字符串格式正确
- 考虑使用 Neon、Supabase 等 Edge 兼容的数据库服务

### 3. NextAuth 配置

- `NEXTAUTH_URL` 必须设置为部署后的实际 URL
- `NEXTAUTH_SECRET` 必须足够长（至少 32 字符）
- 部署后检查会话是否正常工作

### 4. 环境变量更新

更新环境变量后，需要重新部署：

```bash
# 更新环境变量
npx wrangler secret put VARIABLE_NAME

# 重新部署
npm run deploy
```

## 🐛 故障排除

### 问题：部署失败

1. 检查 `wrangler.toml` 配置是否正确
2. 确认所有依赖已安装：`npm install`
3. 查看构建日志：`npm run build`

### 问题：环境变量未加载

1. 确认使用 `wrangler secret put` 设置了变量
2. 检查变量名是否正确
3. 重新部署应用

### 问题：D1 数据库连接失败

1. 检查 `wrangler.toml` 中的 D1 配置
2. 确认数据库已创建：`npx wrangler d1 list`
3. 确认迁移已运行：`npx wrangler d1 execute nextjs-dashboard-db --file=./migrations/0001_initial_schema.sql`
4. 查看 D1 文档了解详细信息

### 问题：NextAuth 会话问题

1. 确认 `NEXTAUTH_URL` 设置为正确的 Workers URL
2. 检查 `NEXTAUTH_SECRET` 是否已设置
3. 查看浏览器控制台和服务器日志

## 📚 相关资源

- [OpenNext Cloudflare 文档](https://opennext.js.org/cloudflare)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 🔄 更新部署

代码更新后，重新运行：

```bash
npm run deploy
```

或者使用 CI/CD 自动部署（推荐）。
