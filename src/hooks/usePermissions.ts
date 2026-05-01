"use client"

import { useAuthStore } from "@/stores/authStore"
import { useMemo } from "react"

export type PermissionKey = 
  | 'inventory.read'
  | 'inventory.write'
  | 'sales.read'
  | 'sales.write'
  | 'finance.read'
  | 'finance.write'
  | 'reports.read'
  | 'reports.view_costs'
  | 'admin.users.manage'
  | 'admin.roles.manage'
  | 'admin.settings.manage'
  | 'admin.audit.read'
  | 'pos.execute'
  | 'branches.manage'
  | 'warehouses.manage'
  | 'billing.read'

export function usePermissions() {
  const { permissions, profile, isLoading } = useAuthStore()

  const isOwner = profile?.role === 'owner'

  const checkPermission = useMemo(() => {
    return (key: PermissionKey | PermissionKey[]) => {
      if (isLoading) return false
      if (isOwner) return true
      
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
