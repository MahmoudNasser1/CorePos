"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"
import { setActiveCompanyCurrency, resetActiveCompanyCurrency } from "@/lib/active-company-currency"

export function SessionSync() {
  const { setProfile, setCompany, setUser, setAuth } = useAuthStore()

  useEffect(() => {
    async function syncSession() {
      try {
        const session = await fetchBackendSessionAction()
        if (session) {
          setAuth({
            user: session.user as any,
            profile: session.profile as any,
            subscription: (session as any).subscription ?? null,
            permissions: (session as any).permissions ?? [],
            isLoading: false,
          })

          if (session.company) {
            setCompany(session.company as any)
            setActiveCompanyCurrency(session.company.currency)
          } else {
            setCompany(null)
            resetActiveCompanyCurrency()
          }
        } else {
          setCompany(null)
          resetActiveCompanyCurrency()
          setAuth({ isLoading: false })
        }
      } catch (error) {
        console.error("❌ Failed to sync session:", error)
        resetActiveCompanyCurrency()
        setAuth({ isLoading: false })
      }
    }

    syncSession()
  }, [])

  return null
}
