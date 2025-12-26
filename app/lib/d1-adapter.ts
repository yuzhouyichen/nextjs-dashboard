/**
 * D1 数据库适配器
 * 提供与 postgres 库类似的 API，适配 Cloudflare D1
 * 
 * 使用方法：
 * import { getD1Client } from '@/app/lib/d1-adapter';
 * const db = getD1Client(env.DB);
 * const users = await db.sql`SELECT * FROM users WHERE email = ${email}`;
 */

// D1 数据库类型定义
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  success: boolean;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
    last_row_id: number;
    changed_db: boolean;
    changes: number;
  };
  results?: T[];
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// 查询构建器类
class D1Query {
  private stmt: D1PreparedStatement;
  private query: string;

  constructor(stmt: D1PreparedStatement, query: string) {
    this.stmt = stmt;
    this.query = query;
  }

  // 执行查询并返回所有结果
  async all<T = unknown>(): Promise<T[]> {
    const result = await this.stmt.all<T>();
    return result.results || [];
  }

  // 执行查询并返回第一个结果
  async first<T = unknown>(): Promise<T | null> {
    return await this.stmt.first<T>();
  }

  // 执行查询（用于 INSERT, UPDATE, DELETE）
  async run(): Promise<D1Result> {
    return await this.stmt.run();
  }

  // 返回原始数据数组
  async raw<T = unknown>(): Promise<T[]> {
    return await this.stmt.raw<T>();
  }
}

// 创建 D1 客户端，模拟 postgres 的 API
export function getD1Client(db: D1Database) {
  // 模板字符串函数，用于处理 SQL 查询
  function sql<T = unknown>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): D1Query & Promise<T[]> {
    // 构建 SQL 查询字符串，将参数替换为 ?
    let query = strings[0];
    const params: unknown[] = [];

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      query += '?' + strings[i + 1];
      params.push(value);
    }

    // 准备语句
    let stmt = db.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const queryObj = new D1Query(stmt, query);

    // 创建一个同时是对象和 Promise 的对象
    // 这样可以支持两种用法：
    // 1. await db.sql`SELECT * FROM users` (直接 await)
    // 2. const result = await db.sql`SELECT * FROM users`.all() (调用方法)
    return Object.assign(queryObj, {
      // 支持直接 await（返回数组）
      async then<TResult = T[]>(
        onfulfilled?: (value: T[]) => TResult | PromiseLike<TResult>
      ): Promise<TResult> {
        const results = await queryObj.all<T>();
        return onfulfilled ? onfulfilled(results) : (results as unknown as TResult);
      },
      catch<TResult = never>(
        onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>
      ): Promise<T[] | TResult> {
        return Promise.resolve([]).catch(onrejected);
      },
    }) as D1Query & Promise<T[]>;
  }

  // 支持事务（简化版）
  async begin<T>(
    callback: (sql: typeof sql) => Promise<T>
  ): Promise<T> {
    // D1 支持事务，但需要手动管理
    // 这里简化处理，实际使用时可能需要更复杂的实现
    return await callback(sql);
  }

  return { sql, begin: sql.begin || (async (cb: any) => await cb(sql)) };
}

// 辅助函数：将 PostgreSQL 的 ILIKE 转换为 SQLite 的 LIKE
// SQLite 的 LIKE 默认不区分大小写，所以可以直接替换
export function convertPostgresToSQLite(query: string): string {
  return query
    .replace(/ILIKE/gi, 'LIKE')  // ILIKE -> LIKE
    .replace(/::text/gi, '')     // 移除类型转换
    .replace(/::integer/gi, '')  // 移除类型转换
    .replace(/uuid_generate_v4\(\)/gi, "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"); // UUID 生成
}
