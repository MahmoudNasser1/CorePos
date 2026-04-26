"use server"

import { platformAdminApi } from "@/lib/api/platform-admin"

export async function getPlatformAdminOverview() {
  try {
    return await platformAdminApi.getOverview()
  } catch {
    return null
  }
}

