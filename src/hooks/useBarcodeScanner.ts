import { useEffect, useRef } from 'react'

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void
  enabled?: boolean
}

export function useBarcodeScanner({ onScan, enabled = true }: UseBarcodeScannerProps) {
  const barcodeBuffer = useRef<string>('')
  const lastKeyTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now()
      
      // If time between keys is > 50ms, it's likely manual typing, reset buffer
      if (currentTime - lastKeyTime.current > 50) {
        barcodeBuffer.current = ''
      }

      lastKeyTime.current = currentTime

      // If Enter is pressed, it's the end of the barcode sequence
      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 2) {
          const barcode = barcodeBuffer.current
          barcodeBuffer.current = ''
          onScan(barcode)
        }
        return
      }

      // Append alphanumeric keys to buffer
      // Scanning usually sends digits, but some might have prefixes/suffixes
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        barcodeBuffer.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onScan, enabled])
}
