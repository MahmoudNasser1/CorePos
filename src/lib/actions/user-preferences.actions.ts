"use server"

import { backendFetch } from "@/lib/api/backend-client"

export async function dismissQuickStart() {
  // Persist across devices by saving on the user's profile in backend.
  await backendFetch("/admin/profile", {
    method: "PATCH",
    body: { quickStartDismissed: true },
  })
  return { ok: true }
}

