"use client"

import { useAuthStore } from "@/stores/authStore"
import { useState, useEffect } from "react"

export function DashboardCompanyContext() {
  const { profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="sr-only" aria-hidden>
      {profile?.company_id || "no-company"}
    </div>
  )
}
