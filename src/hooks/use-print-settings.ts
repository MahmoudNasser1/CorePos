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
        
        // Handle both response shapes:
        // 1. Direct array from backendFetch
        // 2. { success, data } wrapper
        const list: any[] = Array.isArray(res) 
          ? res 
          : (res?.success && Array.isArray(res?.data)) 
            ? res.data 
            : []
        
        const found = list.find((s: any) => s.documentType === documentType || s.document_type === documentType)
        if (found) {
          // Normalize snake_case keys from raw SQL to camelCase
          setSetting({
            documentType: found.documentType || found.document_type,
            paperSize: found.paperSize || found.paper_size || 'A4',
            printerName: found.printerName || found.printer_name || null,
            templateId: found.templateId || found.template_id || null,
            marginConfig: typeof found.marginConfig === 'string' ? JSON.parse(found.marginConfig) : (found.marginConfig || (typeof found.margin_config === 'string' ? JSON.parse(found.margin_config) : found.margin_config) || null),
            templateCode: found.templateCode || found.content_html || null,
          })
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
