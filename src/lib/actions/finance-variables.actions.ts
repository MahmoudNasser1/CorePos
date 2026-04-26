"use server"

import { revalidatePath } from "next/cache"
import { backendFetch } from "@/lib/api/backend-client"

export type PaymentMethodRow = {
  id: string
  code: string
  name: string
  is_active?: boolean
  sort_order?: number
  created_at?: string
}

export type OperationReasonRow = {
  id: string
  scope: string
  label: string
  is_active?: boolean
  sort_order?: number
  created_at?: string
}

export type ExpenseCategoryRow = {
  id: string
  name: string
  created_at?: string
}

export async function getPaymentMethods() {
  return backendFetch<PaymentMethodRow[]>("/finance/payment-methods", { method: "GET" })
}

export async function createPaymentMethod(input: { code: string; name: string; sortOrder?: number }) {
  const res = await backendFetch<any>("/finance/payment-methods", { method: "POST", body: input })
  revalidatePath("/dashboard/settings/variables")
  revalidatePath("/dashboard/pos")
  return res
}

export async function deletePaymentMethod(id: string) {
  const res = await backendFetch<any>(`/finance/payment-methods/${id}`, { method: "PATCH", body: {} })
  revalidatePath("/dashboard/settings/variables")
  revalidatePath("/dashboard/pos")
  return res
}

export async function getOperationReasons(scope?: string) {
  const q = scope ? `?scope=${encodeURIComponent(scope)}` : ""
  return backendFetch<OperationReasonRow[]>(`/finance/operation-reasons${q}`, { method: "GET" })
}

export async function createOperationReason(input: { scope: string; label: string; sortOrder?: number }) {
  const res = await backendFetch<any>("/finance/operation-reasons", { method: "POST", body: input })
  revalidatePath("/dashboard/settings/variables")
  return res
}

export async function deleteOperationReason(id: string) {
  const res = await backendFetch<any>(`/finance/operation-reasons/${id}`, { method: "PATCH", body: {} })
  revalidatePath("/dashboard/settings/variables")
  return res
}

export async function getExpenseCategories() {
  return backendFetch<ExpenseCategoryRow[]>("/finance/expense-categories", { method: "GET" })
}

export async function createExpenseCategory(name: string) {
  const res = await backendFetch<any>("/finance/expense-categories", { method: "POST", body: { name } })
  revalidatePath("/dashboard/settings/variables")
  revalidatePath("/dashboard/finance/expenses")
  return res
}

export async function deleteExpenseCategory(id: string) {
  const res = await backendFetch<any>(`/finance/expense-categories/${id}`, { method: "PATCH", body: {} })
  revalidatePath("/dashboard/settings/variables")
  revalidatePath("/dashboard/finance/expenses")
  return res
}
