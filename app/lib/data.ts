// 用于定义数据库的结构。
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { getDB } from './db';


// 获取利润数据
export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const db = getDB();
    const data = await db.sql<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// 获取最新发票数据
export async function fetchLatestInvoices() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const db = getDB();
    const data = await db.sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    // 将金额转换为货币格式
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// 获取卡片数据
export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const db = getDB();
    const invoiceCountPromise = db.sql`SELECT COUNT(*) as count FROM invoices`;
    const customerCountPromise = db.sql`SELECT COUNT(*) as count FROM customers`;
    const invoiceStatusPromise = db.sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0]?.count ?? '0');
    const numberOfCustomers = Number(data[1][0]?.count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0]?.paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0]?.pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

// 获取条件过滤后的发票数据
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
  
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const db = getDB();
    const invoices = await db.sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name LIKE ${`%${query}%`} OR
        customers.email LIKE ${`%${query}%`} OR
        CAST(invoices.amount AS TEXT) LIKE ${`%${query}%`} OR
        invoices.date LIKE ${`%${query}%`} OR
        invoices.status LIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}


// 获取发票页数
export async function fetchInvoicesPages(query: string) {
  try {
    const db = getDB();
    const data = await db.sql`SELECT COUNT(*) as count
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name LIKE ${`%${query}%`} OR
      customers.email LIKE ${`%${query}%`} OR
      CAST(invoices.amount AS TEXT) LIKE ${`%${query}%`} OR
      invoices.date LIKE ${`%${query}%`} OR
      invoices.status LIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0]?.count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// 获取单个发票数据
export async function fetchInvoiceById(id: string) {
  try {
    const db = getDB();
    const data = await db.sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id}
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log('Invoice:', invoice);
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// 获取所有客户数据
export async function fetchCustomers() {
  try {
    const db = getDB();
    const customers = await db.sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}


// 获取条件过滤后的客户数据
export async function fetchFilteredCustomers(query: string) {
  try {
    const db = getDB();
    const data = await db.sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name LIKE ${`%${query}%`} OR
        customers.email LIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
