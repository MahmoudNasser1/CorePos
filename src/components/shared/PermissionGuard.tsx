"use client"

import { ReactNode } from "react"
import { usePermissions, PermissionKey } from "@/hooks/usePermissions"

interface PermissionGuardProps {
  permission: PermissionKey | PermissionKey[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * A component that conditionally renders its children based on user permissions.
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) return null

  if (hasPermission(permission)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
