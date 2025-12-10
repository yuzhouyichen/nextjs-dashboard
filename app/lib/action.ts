'use server';

import { z } from 'zod';    
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, {});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(
        {
            invalid_type_error: 'Please select a customer.',
        }
    ),
    amount: z.coerce.number()
            .gt(0, { message: 'Please enter an amount greater than 0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
  });

// 创建发票的表单数据类型，不包含 id 和 date 字段。
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// 状态类型，包含错误信息和消息。
export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

  export async function createInvoice(prevState: State, formData: FormData)  {

    // 验证表单数据，如果验证失败，返回错误信息。
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

      console.log('validatedFields', validatedFields);
      
      // 如果验证失败，返回错误信息。
      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }
      // 如果验证成功，获取表单数据。
      const {customerId, amount, status} = validatedFields.data;
      
      const amountInCents = amount * 100;
      const date = new Date().toISOString().split('T')[0];
      
      try {
        await sql`
                    INSERT INTO invoices (customer_id, amount, status, date)
                    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
                `;
      } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Create Invoice.' };
      }
      
      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
}


const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }
    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
                    UPDATE invoices
                    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
                    WHERE id = ${id}
                `;
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
    // Calling revalidatePath to clear the client cache and make a new server request.
    revalidatePath('/dashboard/invoices');
    // Calling redirect to redirect the user to the invoice's page.
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

    throw new Error('Failed to Delete Invoice');


    await sql`DELETE FROM invoices WHERE id = ${id}`;
    // Since this action is being called in the /dashboard/invoices path, 
    // you don't need to call redirect. Calling revalidatePath will trigger a new server request and re-render the table.
    revalidatePath('/dashboard/invoices');
}