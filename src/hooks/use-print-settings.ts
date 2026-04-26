"use client"

import { useEffect, useState } from 'react'
import { getPrintSettings } from '@/lib/actions/settings.actions'

interface PrintSetting {
  documentType: string
  paperSize: string
  printerName: string | null
  templateId: string | null
  marginConfig: any
  templateCode?: string | null
}

export function usePrintSettings(documentType: string) {
  const [setting, setSetting] = useState<PrintSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res: any = await getPrintSettings()
        if (res?.success && Array.isArray(res?.data)) {
          const found = res.data.find((s: any) => s.documentType === documentType)
          if (found) setSetting(found)
        }
      } catch (err) {
        console.error('Failed to fetch print settings', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [documentType])

  return { setting, isLoading }
}
