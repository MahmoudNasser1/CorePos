"use server"

import { getBackendSession } from "@/lib/api/user"

/** للاستدعاء من الـ client — الجلب يتم على السيرفر مع `cookies()`. */
export async function fetchBackendSessionAction() {
  return getBackendSession()
}
