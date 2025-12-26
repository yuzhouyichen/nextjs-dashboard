import bcrypt from 'bcrypt';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { getDB } from '../lib/db';

async function seedUsers() {
  const db = getDB();
  
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.sql`
        INSERT OR IGNORE INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      `.run();
      return { id: user.id };
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  const db = getDB();

  const insertedInvoices = await Promise.all(
    invoices.map(
      async (invoice) => {
        await db.sql`
          INSERT OR IGNORE INTO invoices (id, customer_id, amount, status, date)
          VALUES (${invoice.id}, ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        `.run();
        return { id: invoice.id };
      },
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  const db = getDB();

  const insertedCustomers = await Promise.all(
    customers.map(
      async (customer) => {
        await db.sql`
          INSERT OR IGNORE INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        `.run();
        return { id: customer.id };
      },
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  const db = getDB();

  const insertedRevenue = await Promise.all(
    revenue.map(
      async (rev) => {
        await db.sql`
          INSERT OR IGNORE INTO revenue (month, revenue)
          VALUES (${rev.month}, ${rev.revenue})
        `.run();
        return { month: rev.month };
      },
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    // 注意：表结构应该通过迁移文件创建，这里只插入数据
    // 确保先运行迁移：npx wrangler d1 execute nextjs-dashboard-db --file=./migrations/0001_initial_schema.sql
    
    await Promise.all([
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
