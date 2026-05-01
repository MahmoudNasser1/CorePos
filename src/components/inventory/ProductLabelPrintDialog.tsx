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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEFAULT_MARGINS } from "@/lib/constants/printing"

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
  const [overridePaperSize, setOverridePaperSize] = useState<string | null>(null)

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

  const activePaperSize = overridePaperSize || setting?.paperSize || '50x30mm'
  const activeMargins = overridePaperSize && overridePaperSize !== setting?.paperSize && overridePaperSize !== 'custom'
    ? DEFAULT_MARGINS[overridePaperSize] || { top: '1mm', right: '1mm', bottom: '1mm', left: '1mm' }
    : margins

  useEffect(() => {
    if (activeMargins) {
      if (activeMargins.symbolType) setSymbolType(activeMargins.symbolType)
      if (activeMargins.showPrice !== undefined) setShowPrice(activeMargins.showPrice)
      if (activeMargins.showCategory !== undefined) setShowCategory(activeMargins.showCategory)
      if (activeMargins.showUnit !== undefined) setShowUnit(activeMargins.showUnit)
      if (activeMargins.showSku !== undefined) setShowSku(activeMargins.showSku)
    }
  }, [activeMargins])

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
    const paperSize = activePaperSize
    const usedMargins = activeMargins
    
    // Simple parser for CSS size
    let cssSize = paperSize
    if (paperSize === '50x30mm') cssSize = '50mm 30mm'
    else if (paperSize === '58x48mm') cssSize = '58mm 48mm'
    else if (paperSize === '40x20mm') cssSize = '40mm 20mm'
    else if (paperSize === 'A4') cssSize = 'A4'
    else if (paperSize === '80mm') cssSize = '80mm 200mm' // Continuous
    else if (paperSize === 'custom' && usedMargins?.customWidth && usedMargins?.customHeight) {
      cssSize = `${usedMargins.customWidth}mm ${usedMargins.customHeight}mm`
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
              max-width: ${paperSize === 'custom' && usedMargins?.customWidth ? `${usedMargins.customWidth}mm` : (paperSize.includes('x') ? paperSize.split('x')[0] : '100%')};
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


  const previewScale = 6;
  let labelW = 50, labelH = 30;
  if (activePaperSize === 'custom' && activeMargins?.customWidth && activeMargins?.customHeight) {
    labelW = Number(activeMargins.customWidth) || 50;
    labelH = Number(activeMargins.customHeight) || 30;
  } else if (activePaperSize?.includes('x')) {
    const parts = activePaperSize.split('x');
    labelW = Number(parts[0].replace('mm','')) || 50;
    labelH = Number(parts[1].replace('mm','')) || 30;
  }
  const previewW = labelW * previewScale;
  const previewH = labelH * previewScale;
  const fitScale = Math.min(1, 350 / previewW);

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
          {/* Paper Size Selector */}
          <div className="space-y-2">
            <Label>مقاس الملصق</Label>
            <Select 
              value={overridePaperSize === null ? "default" : overridePaperSize} 
              onValueChange={(val) => setOverridePaperSize(val === 'default' ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مقاس الملصق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  الافتراضي ({setting?.paperSize === 'custom' && margins?.customWidth ? `${margins.customWidth}x${margins.customHeight}mm مخصص` : setting?.paperSize || '50x30mm'})
                </SelectItem>
                <SelectItem value="50x30mm">50x30mm</SelectItem>
                <SelectItem value="40x20mm">40x20mm</SelectItem>
                <SelectItem value="58x48mm">58x48mm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center items-start overflow-hidden w-full my-4" style={{ height: `${previewH * fitScale}px` }}>
            <div 
              className="rounded-md border bg-white shadow-sm flex flex-col overflow-hidden"
              style={{ 
                width: `${previewW}px`,
                height: `${previewH}px`,
                transform: `scale(${fitScale})`,
                transformOrigin: 'top center',
                padding: `${previewScale * 1.5}px`
              }}
            >
              <style>{`.barcode-preview-wrapper svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }`}</style>
              
              <p className="text-center font-bold leading-tight line-clamp-2" style={{ fontSize: `${previewScale * 2.2}px` }}>{productName}</p>
              {showSku && (sku ?? "").trim() ? (
                <p className="text-center text-muted-foreground tabular-nums" style={{ fontSize: `${previewScale * 1.6}px`, marginTop: `${previewScale * 0.5}px` }}>{(sku ?? "").trim()}</p>
              ) : null}
              
              <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden" style={{ margin: `${previewScale}px 0` }}>
                {symbolType === "qr" && qrDataUrl ? (
                  <img src={qrDataUrl} alt="" className="object-contain" style={{ width: '100%', height: '100%', maxWidth: `${previewScale * 15}px`, maxHeight: `${previewScale * 15}px` }} />
                ) : symbolType === "qr" ? (
                  <span className="text-muted-foreground" style={{ fontSize: `${previewScale * 1.5}px` }}>QR</span>
                ) : (
                  <div className="barcode-preview-wrapper flex items-center justify-center w-full h-full overflow-hidden">
                    <Barcode
                      value={barcodeValue}
                      width={1.2}
                      height={previewScale * 6}
                      fontSize={previewScale * 1.5}
                      background="#ffffff"
                      displayValue
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-auto">
                {showCategory && (categoryName ?? "").trim() ? (
                  <p className="text-center text-muted-foreground line-clamp-1" style={{ fontSize: `${previewScale * 1.5}px` }}>{categoryName}</p>
                ) : null}
                {showUnit && (unitName ?? "").trim() ? (
                  <p className="text-center text-muted-foreground line-clamp-1" style={{ fontSize: `${previewScale * 1.5}px` }}>الوحدة: {unitName}</p>
                ) : null}
                {showPrice ? (
                  <p className="border-t text-center font-bold tabular-nums" style={{ fontSize: `${previewScale * 2.5}px`, marginTop: `${previewScale * 0.5}px`, paddingTop: `${previewScale * 0.5}px` }}>{formatCurrency(salesPrice)}</p>
                ) : null}
              </div>
            </div>
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
