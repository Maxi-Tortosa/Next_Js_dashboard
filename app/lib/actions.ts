'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const [date] = new Date().toISOString().split('T');
  const amountIncents = amount * 100;

  await sql`INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountIncents},${status},${date})`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
