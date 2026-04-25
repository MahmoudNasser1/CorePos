"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"

export function SessionSync() {
  const { setProfile, setCompany, setUser, setAuth } = useAuthStore()

  useEffect(() => {
    async function syncSession() {
      try {
        const session = await fetchBackendSessionAction()
        if (session) {
          // Populate the store
          setAuth({
            user: session.user as any,
            profile: session.profile as any,
            isLoading: false
          })
          
          // Also set specific fields if needed
          if (session.profile?.company_id) {
            // In a real app we might fetch the full company object here
            setCompany({ id: session.profile.company_id, name: "تحميل..." } as any)
          }
        } else {
          setAuth({ isLoading: false })
        }
      } catch (error) {
        console.error("❌ Failed to sync session:", error)
        setAuth({ isLoading: false })
      }
    }

    syncSession()
  }, [])

  return null // This component doesn't render anything
}
