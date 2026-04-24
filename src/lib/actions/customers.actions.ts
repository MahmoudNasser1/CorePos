"use server"

import { contactsApi } from "@/lib/api/contacts"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
  try {
    const res = await contactsApi.getCustomers()
    return res?.items || []
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return []
  }
}

export async function getSuppliers() {
  try {
    const res = await contactsApi.getSuppliers()
    return res?.items || []
  } catch (error) {
    console.error('Failed to fetch suppliers:', error)
    return []
  }
}

export async function getCustomerById(id: string) {
  // Temporary fallback until backend has specific ById endpoint
  const customers = await getCustomers()
  return customers.find((c: any) => c.id === id)
}

export async function getSupplierById(id: string) {
  const suppliers = await getSuppliers()
  return suppliers.find((s: any) => s.id === id)
}

export async function getCustomerStatement(customerId: string) {
  // Note: Statement logic requires cross-referencing invoices and payments.
  // For now, returning an empty array to prevent crashes until backend provides a unified statement endpoint.
  return []
}

export const getPartnerById = getCustomerById
export const getPartnerStatement = getCustomerStatement

export async function saveCustomer(customerData: any) {
  await contactsApi.createCustomer(customerData)
  revalidatePath('/dashboard/customers')
  return { success: true }
}

export async function saveSupplier(supplierData: any) {
  await contactsApi.createSupplier(supplierData)
  revalidatePath('/dashboard/suppliers')
  return { success: true }
}
