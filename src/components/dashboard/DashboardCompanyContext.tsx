"use client"

import { useAuthStore } from "@/stores/authStore"

export function DashboardCompanyContext() {
  const { profile } = useAuthStore()

  return (
    <div className="sr-only" aria-hidden>
      {profile?.company_id || "no-company"}
    </div>
  )
}
