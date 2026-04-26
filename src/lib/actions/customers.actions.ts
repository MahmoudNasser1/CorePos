"use server"

import { contactsApi, type ContactInput } from "@/lib/api/contacts"
import { revalidatePath } from "next/cache"
import { BackendApiError } from "@/lib/api/backend-client"

function normalizeContactBody(data: {
  name: string
  phone?: string
  address?: string
  email?: string
  taxNumber?: string
}) {
  return {
    name: data.name,
    phone: data.phone,
    address: data.address,
    email: data.email,
    taxNumber: data.taxNumber,
  }
}

export async function getCustomers() {
  try {
    const res: any = await contactsApi.listCustomers(undefined, 200)
    return Array.isArray(res) ? res : (res?.items ?? [])
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return []
  }
}

export async function getSuppliers() {
  try {
    const res: any = await contactsApi.listSuppliers(undefined, 200)
    return Array.isArray(res) ? res : (res?.items ?? [])
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    return (await contactsApi.getCustomer(id)) as Record<string, unknown> | null
  } catch (e) {
    if (e instanceof BackendApiError && (e.status === 404 || e.status === 400)) return null
    console.error("getCustomerById", e)
    return null
  }
}

export async function getSupplierById(id: string) {
  try {
    return (await contactsApi.getSupplier(id)) as Record<string, unknown> | null
  } catch (e) {
    if (e instanceof BackendApiError && (e.status === 404 || e.status === 400)) return null
    console.error("getSupplierById", e)
    return null
  }
}

export async function getCustomerStatement(customerId: string) {
  // Note: Statement logic requires cross-referencing invoices and payments.
  // For now, returning an empty array to prevent crashes until backend provides a unified statement endpoint.
  return []
}

export const getPartnerStatement = getCustomerStatement

export async function saveCustomer(customerData: ContactInput) {
  await contactsApi.createCustomer(
    normalizeContactBody(customerData as { name: string; phone?: string; address?: string; email?: string; taxNumber?: string }),
  )
  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function saveSupplier(supplierData: ContactInput) {
  await contactsApi.createSupplier(
    normalizeContactBody(supplierData as { name: string; phone?: string; address?: string; email?: string; taxNumber?: string }),
  )
  revalidatePath("/dashboard/suppliers")
  return { success: true }
}

export async function updateCustomerRecord(
  id: string,
  data: { name: string; phone?: string; address?: string; email?: string; taxNumber?: string },
) {
  await contactsApi.updateCustomer(id, normalizeContactBody(data))
  revalidatePath("/dashboard/customers")
  revalidatePath(`/dashboard/customers/${id}`)
  return { success: true }
}

export async function updateSupplierRecord(
  id: string,
  data: { name: string; phone?: string; address?: string; email?: string; taxNumber?: string },
) {
  await contactsApi.updateSupplier(id, normalizeContactBody(data))
  revalidatePath("/dashboard/suppliers")
  revalidatePath(`/dashboard/suppliers/${id}`)
  return { success: true }
}

/** إخفاء من القائمة (تعطيل) — لا حذف فيزيائي */
export async function deactivateCustomerRecord(id: string) {
  await contactsApi.updateCustomer(id, { isActive: false })
  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function deactivateSupplierRecord(id: string) {
  await contactsApi.updateSupplier(id, { isActive: false })
  revalidatePath("/dashboard/suppliers")
  return { success: true }
}
