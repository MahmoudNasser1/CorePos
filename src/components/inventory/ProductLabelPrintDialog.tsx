"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Barcode from "react-barcode"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Minus, Plus, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePrintSettings } from "@/hooks/use-print-settings"

export interface ProductLabelPrintPayload {
  productId: string
  productName: string
  barcode: string
  salesPrice: number
  sku?: string | null
  categoryName?: string | null
  unitName?: string | null
}

interface ProductLabelPrintDialogProps extends ProductLabelPrintPayload {
  trigger?: React.ReactNode
  /** عند تمريره مع `onOpenChange` يُفتح الحوار من الخارج (مثلاً من قائمة الجدول) دون `DialogTrigger`. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function ProductLabelPrintDialog({
  productId,
  productName,
  barcode,
  salesPrice,
  sku,
  categoryName,
  unitName,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProductLabelPrintDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    controlledOnOpenChange?.(next)
    if (!isControlled) setInternalOpen(next)
  }
  const [quantity, setQuantity] = useState(1)
  const [symbolType, setSymbolType] = useState<"qr" | "barcode">("qr")
  const [showPrice, setShowPrice] = useState(true)
  const [showCategory, setShowCategory] = useState(true)
  const [showUnit, setShowUnit] = useState(true)
  const [showSku, setShowSku] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const barcodeRef = useRef<HTMLDivElement>(null)

  const { setting, isLoading: isSettingsLoading } = usePrintSettings('barcode_label')
  const margins = useMemo(() => {
    if (!setting?.marginConfig) return null
    try {
      return typeof setting.marginConfig === 'string' 
        ? JSON.parse(setting.marginConfig) 
        : setting.marginConfig
    } catch {
      return null
    }
  }, [setting?.marginConfig])

  useEffect(() => {
    if (margins) {
      if (margins.symbolType) setSymbolType(margins.symbolType)
      if (margins.showPrice !== undefined) setShowPrice(margins.showPrice)
      if (margins.showCategory !== undefined) setShowCategory(margins.showCategory)
      if (margins.showUnit !== undefined) setShowUnit(margins.showUnit)
      if (margins.showSku !== undefined) setShowSku(margins.showSku)
    }
  }, [margins])

  const scanPayload = useMemo(() => {
    const t = (sku ?? "").trim() || (barcode ?? "").trim()
    if (t) return t
    return `pos-sahl:product:${productId}`
  }, [sku, barcode, productId])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    QRCode.toDataURL(scanPayload, { width: 220, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, scanPayload])

  const barcodeValue = (barcode || scanPayload || "000000000000").slice(0, 48)

  const handlePrint = useCallback(() => {
    const paperSize = setting?.paperSize || '50x30mm'
    
    // Simple parser for CSS size
    let cssSize = paperSize
    if (paperSize === '50x30mm') cssSize = '50mm 30mm'
    else if (paperSize === '40x20mm') cssSize = '40mm 20mm'
    else if (paperSize === 'A4') cssSize = 'A4'
    else if (paperSize === '80mm') cssSize = '80mm 200mm' // Continuous
    else if (paperSize === 'custom' && margins?.customWidth && margins?.customHeight) {
      cssSize = `${margins.customWidth}mm ${margins.customHeight}mm`
    }
    
    const svgHtml =
      symbolType === "barcode"
        ? barcodeRef.current?.querySelector(".barcode-svg-wrapper")?.innerHTML ?? ""
        : ""

    const qrImg =
      symbolType === "qr" && qrDataUrl
        ? `<img class="qr" src="${qrDataUrl}" alt="" width="100" height="100" />`
        : symbolType === "qr"
          ? `<div class="qr-fallback">تعذّر توليد QR</div>`
          : ""

    const codeBlock =
      symbolType === "qr"
        ? qrImg
        : `<div class="barcode-wrap">${svgHtml}</div>`

    // Template logic
    let labelInner = ""
    if (setting?.templateCode) {
      labelInner = setting.templateCode
        .replace(/\{\{name\}\}/g, escapeHtml(productName))
        .replace(/\{\{price\}\}/g, escapeHtml(formatCurrency(salesPrice)))
        .replace(/\{\{barcode\}\}/g, escapeHtml(barcode || sku || ""))
        .replace(/\{\{sku\}\}/g, escapeHtml(sku || ""))
        .replace(/\{\{category\}\}/g, escapeHtml(categoryName || ""))
        .replace(/\{\{unit\}\}/g, escapeHtml(unitName || ""))
        .replace(/\{\{qr\}\}/g, qrImg)
        .replace(/\{\{barcode_svg\}\}/g, svgHtml)
        .replace(/\{\{code\}\}/g, codeBlock)
    } else {
      const metaLines: string[] = []
      if (showSku && (sku ?? "").trim()) {
        metaLines.push(`<div class="meta"><span class="k">رمز الصنف</span> ${escapeHtml((sku ?? "").trim())}</div>`)
      }
      if (showCategory && (categoryName ?? "").trim()) {
        metaLines.push(`<div class="meta"><span class="k">التصنيف</span> ${escapeHtml((categoryName ?? "").trim())}</div>`)
      }
      if (showUnit && (unitName ?? "").trim()) {
        metaLines.push(`<div class="meta"><span class="k">الوحدة</span> ${escapeHtml((unitName ?? "").trim())}</div>`)
      }
      const priceLine = showPrice
        ? `<div class="price">${escapeHtml(formatCurrency(salesPrice))}</div>`
        : ""

      labelInner = `
        <div class="label">
          <div class="title">${escapeHtml(productName)}</div>
          <div class="meta-container">${metaLines.join("")}</div>
          <div class="code">${codeBlock}</div>
          ${(barcode || sku) ? `<div class="bc-text">${escapeHtml((barcode || sku || "").trim())}</div>` : ""}
          ${priceLine}
        </div>
      `
    }

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const labelsHtml = Array.from({ length: Math.max(1, quantity) }, () => labelInner).join("")

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>ملصق منتج — ${escapeHtml(productName)}</title>
          <style>
            @page { size: ${cssSize}; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
              direction: rtl;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label {
              width: 100%;
              max-width: ${paperSize === 'custom' && margins?.customWidth ? `${margins.customWidth}mm` : (paperSize.includes('x') ? paperSize.split('x')[0] : '100%')};
              padding: 2mm;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              align-items: stretch;
            }
            .title {
              font-size: 10pt;
              font-weight: 800;
              text-align: center;
              line-height: 1.2;
              margin-bottom: 1mm;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .meta-container { margin-bottom: 1mm; }
            .meta {
              font-size: 7pt;
              color: #333;
              margin-bottom: 0.5mm;
              text-align: right;
              white-space: nowrap;
              overflow: hidden;
            }
            .meta .k { color: #888; font-size: 6pt; margin-inline-end: 1mm; }
            .code {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1mm 0;
            }
            .qr { display: block; margin: 0 auto; max-width: 100%; height: auto; }
            .qr-fallback { font-size: 8px; color: #999; text-align: center; }
            .barcode-wrap { width: 100%; text-align: center; }
            .barcode-wrap svg { max-width: 100%; height: auto; }
            .bc-text {
              font-size: 7pt;
              text-align: center;
              margin-top: 0.5mm;
              font-family: monospace;
            }
            .price {
              font-size: 11pt;
              font-weight: 900;
              text-align: center;
              margin-top: 1mm;
              padding-top: 1mm;
              border-top: 0.1mm solid #000;
            }
          </style>
        </head>
        <body>${labelsHtml}
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () { window.close(); };
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()

  }, [
    setting,
    symbolType,
    qrDataUrl,
    quantity,
    productName,
    salesPrice,
    barcode,
    sku,
    categoryName,
    unitName,
    showPrice,
    showCategory,
    showUnit,
    showSku,
    margins,
  ])


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4 shrink-0" aria-hidden />
              طباعة ملصق عرض
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طباعة ملصق منتج (عرض)</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-lg border bg-card p-4 shadow-inner">
            <p className="text-center text-sm font-bold leading-tight">{productName}</p>
            {showSku && (sku ?? "").trim() ? (
              <p className="mt-1 text-center text-xs text-muted-foreground tabular-nums">{(sku ?? "").trim()}</p>
            ) : null}
            <div className="mt-3 flex min-h-[140px] items-center justify-center">
              {symbolType === "qr" && qrDataUrl ? (
                <img src={qrDataUrl} alt="" width={120} height={120} className="rounded-sm border bg-white p-1" />
              ) : symbolType === "qr" ? (
                <span className="text-xs text-muted-foreground">جاري توليد QR…</span>
              ) : (
                <div className="barcode-svg-wrapper scale-90">
                  <Barcode
                    value={barcodeValue}
                    width={1.2}
                    height={48}
                    fontSize={11}
                    background="#ffffff"
                    displayValue
                  />
                </div>
              )}
            </div>
            {showCategory && (categoryName ?? "").trim() ? (
              <p className="mt-2 text-center text-xs text-muted-foreground">{categoryName}</p>
            ) : null}
            {showUnit && (unitName ?? "").trim() ? (
              <p className="text-center text-xs text-muted-foreground">الوحدة: {unitName}</p>
            ) : null}
            {showPrice ? (
              <p className="mt-2 border-t pt-2 text-center text-base font-bold tabular-nums">{formatCurrency(salesPrice)}</p>
            ) : null}
          </div>

          <div ref={barcodeRef} className="hidden" aria-hidden>
            <div className="barcode-svg-wrapper">
              <Barcode
                value={barcodeValue}
                width={1.2}
                height={40}
                fontSize={10}
                background="#ffffff"
                displayValue
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>نوع الرمز على الملصق</Label>
            <Tabs value={symbolType} onValueChange={(v) => setSymbolType(v as "qr" | "barcode")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR</TabsTrigger>
                <TabsTrigger value="barcode">باركود خطي</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox checked={showPrice} onCheckedChange={(c) => setShowPrice(c === true)} />
              <span className="text-sm">إظهار السعر</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox checked={showSku} onCheckedChange={(c) => setShowSku(c === true)} />
              <span className="text-sm">إظهار رمز الصنف</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox checked={showCategory} onCheckedChange={(c) => setShowCategory(c === true)} />
              <span className="text-sm">إظهار التصنيف</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox checked={showUnit} onCheckedChange={(c) => setShowUnit(c === true)} />
              <span className="text-sm">إظهار الوحدة</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lbl-qty">عدد الملصقات</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="lbl-qty"
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(99, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="text-center font-semibold tabular-nums"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(99, q + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button type="button" onClick={handlePrint} className="gap-2" disabled={symbolType === "qr" && !qrDataUrl}>
            <Printer className="h-4 w-4" />
            بدء الطباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
