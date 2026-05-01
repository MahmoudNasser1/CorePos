"use client"

import { useAuthStore } from "@/stores/authStore"
import { useMemo } from "react"

export type PermissionKey = 
  | 'inventory.read'
  | 'inventory.write'
  | 'sales.read'
  | 'sales.write'
  | 'sales.void'
  | 'sales.discount'
  | 'purchases.read'
  | 'purchases.write'
  | 'finance.read'
  | 'finance.write'
  | 'reports.read'
  | 'reports.view_costs'
  | 'contacts.read'
  | 'contacts.write'
  | 'admin.users.read'
  | 'admin.users.manage'
  | 'admin.roles.manage'
  | 'admin.settings.read'
  | 'admin.settings.manage'
  | 'admin.audit.read'
  | 'pos.execute'
  | 'branches.manage'
  | 'warehouses.manage'
  | 'billing.read'
  | 'platform.companies.manage'
  | 'platform.users.manage'
  | 'platform.ops.execute'

export function usePermissions() {
  const { permissions, profile, isLoading } = useAuthStore()

  const isSuperUser = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'platform_admin'
  const isOwner = profile?.role === 'owner'

  const checkPermission = useMemo(() => {
    return (key: PermissionKey | PermissionKey[]) => {
      if (isLoading) return false
      if (isSuperUser) return true
      
      const keys = Array.isArray(key) ? key : [key]
      return keys.some(k => permissions.includes(k))
    }
  }, [permissions, isOwner, isLoading])

  return {
    permissions,
    hasPermission: checkPermission,
    isOwner,
    isLoading
  }
}
