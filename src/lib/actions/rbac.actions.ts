"use server"

import { backendFetch } from "@/lib/api/backend-client"
import { revalidatePath } from "next/cache"

export async function getRbacSnapshot() {
  try {
    const data = await backendFetch<any>("/admin/rbac")
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function patchRbac(input: {
  kind: "role_permissions" | "user_override"
  reason: string
  roleId?: string
  permissions?: string[]
  userId?: string
  permissionKey?: string
  effect?: string
}) {
  try {
    await backendFetch("/admin/rbac", {
      method: "PATCH",
      body: input,
    })
    revalidatePath("/dashboard/settings/rbac")
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
