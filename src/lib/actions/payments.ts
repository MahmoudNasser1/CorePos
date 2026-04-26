"use server"

import { revalidatePath } from "next/cache"
import { createPaymentViaBackend } from "@/lib/api/payments"
import { BackendApiError } from "@/lib/api/backend-client"
import { backendFetch } from "@/lib/api/backend-client"
import { getBackendSession } from "@/lib/api/user"

export async function getTreasuryTransactions(filters?: {
  treasury_id?: string
  from?: string
  to?: string
}) {
  // Backend currently supports latest treasury transactions (optional limit).
  void filters
  const res = await backendFetch<{ items: any[] }>('/finance/treasury/transactions', { method: 'GET' })
  return res?.items || []
}

export async function getTreasuries() {
  return backendFetch<any[]>('/finance/treasury', { method: 'GET' })
}

export async function createPayment(paymentData: any) {
  try {
    const session = await getBackendSession()
    const createdBy =
      paymentData.created_by ??
      paymentData.createdBy ??
      session?.user?.id ??
      null
    if (!createdBy) {
      return { success: false, error: 'يجب تسجيل الدخول لتسجيل السند' }
    }

    const companyId =
      paymentData.companyId ??
      session?.user?.companyId ??
      session?.profile?.company_id ??
      null
    if (!companyId) {
      return { success: false, error: 'تعذر تحديد الشركة من الجلسة' }
    }

    const normalizedMethod =
      (paymentData.method as string | undefined) ??
      (paymentData.payment_method === 'bank_transfer' ? 'bank' : paymentData.payment_method)

    const result = await createPaymentViaBackend({
      companyId,
      treasuryId: paymentData.treasury_id ?? paymentData.treasuryId,
      amount: Number(paymentData.amount),
      method: (normalizedMethod ?? 'cash') as 'cash' | 'card' | 'bank',
      notes: paymentData.notes,
      invoiceId: paymentData.invoice_id ?? paymentData.invoiceId,
      customerId: paymentData.customer_id ?? paymentData.customerId,
      supplierId: paymentData.supplier_id ?? paymentData.supplierId,
      createdBy,
    })

    revalidatePath('/dashboard/finance/treasury')
    revalidatePath('/dashboard/customers')
    revalidatePath('/dashboard/suppliers')
    return { success: result.success, id: result.id }
  } catch (error) {
    if (error instanceof BackendApiError) {
      return { success: false, error: error.message, code: error.code }
    }
    console.error('Backend payment receipt error:', error)
    return { success: false, error: 'فشل تسجيل سند القبض عبر الخادم الجديد' }
  }
}

export async function getExpenseCategories() {
  return backendFetch<any[]>('/finance/expense-categories', { method: 'GET' })
}

export async function createExpense(expenseData: any) {
  const res = await backendFetch<any>('/finance/expenses', {
    method: 'POST',
    body: {
      treasuryId: expenseData.treasury_id ?? expenseData.treasuryId,
      branchId: expenseData.branch_id ?? expenseData.branchId,
      categoryId: expenseData.category_id ?? expenseData.categoryId,
      amount: Number(expenseData.amount || 0),
      notes: expenseData.notes,
      createdBy: expenseData.created_by ?? expenseData.createdBy,
    },
  })
  revalidatePath('/dashboard/finance/expenses')
  revalidatePath('/dashboard/finance/treasury')
  return res
}

export async function getExpenses() {
  return backendFetch<any[]>('/finance/expenses', { method: 'GET' })
}
