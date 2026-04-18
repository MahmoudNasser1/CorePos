"use client"

import { useState, useRef } from "react"
import Barcode from "react-barcode"
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
import { Printer, Minus, Plus, Search } from "lucide-react"

interface BarcodePrintDialogProps {
  productName: string
  productPrice: number
  barcode: string
  trigger?: React.ReactNode
}

export function BarcodePrintDialog({
  productName,
  productPrice,
  barcode,
  trigger
}: BarcodePrintDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [open, setOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    // We'll use a hidden iframe approach or just a dedicated window print
    // For standard label printers, we need a clean print layout
    const printContent = printRef.current?.innerHTML
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة باركود - ${productName}</title>
            <style>
              @page {
                size: 40mm 25mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                width: 40mm;
                height: 25mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: sans-serif;
                overflow: hidden;
                direction: rtl;
              }
              .label {
                width: 40mm;
                height: 25mm;
                padding: 1mm;
                box-sizing: border-box;
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-after: always;
              }
              .name {
                font-size: 8px;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 1px;
              }
              .barcode-container {
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: scale(0.9);
                margin: -5px 0;
              }
              .price {
                font-size: 9px;
                font-weight: 800;
                margin-top: 1px;
              }
              @media screen {
                .label { border: 1px dashed #ccc; margin-bottom: 10px; }
              }
            </style>
          </head>
          <body>
            ${Array(quantity).fill(0).map(() => `
              <div class="label">
                <div class="name">${productName}</div>
                <div class="barcode-container">
                  ${printRef.current?.querySelector('.barcode-svg-wrapper')?.innerHTML || ''}
                </div>
                <div class="price">${new Intl.NumberFormat('ar-SA').format(productPrice)} ر.س</div>
              </div>
            `).join('')}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة ملصقات
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>طباعة ملصقات الباركود</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Label Preview */}
          <div className="flex flex-col items-center">
            <Label className="mb-4 text-muted-foreground self-start">معاينة الملصق (40x25 ملم)</Label>
            <div className="w-[180px] h-[112px] bg-white border rounded shadow-inner flex flex-col items-center justify-between p-2 text-black overflow-hidden select-none">
              <div className="text-[10px] font-bold text-center w-full truncate px-1">
                {productName}
              </div>
              
              <div className="barcode-svg-wrapper transform scale-[0.7] -my-4 origin-center">
                <Barcode 
                  value={barcode || "000000000000"} 
                  width={1.5} 
                  height={40} 
                  fontSize={14}
                  background="transparent"
                  displayValue={true}
                />
              </div>
              
              <div className="text-[12px] font-black border-t w-full text-center pt-0.5">
                {new Intl.NumberFormat('ar-SA').format(productPrice)} ر.س
              </div>
            </div>
          </div>

          {/* Hidden reference for printing SVG */}
          <div ref={printRef} className="hidden">
            <div className="barcode-svg-wrapper">
              <Barcode 
                value={barcode || "000000000000"} 
                width={1.2} 
                height={35} 
                fontSize={12}
                displayValue={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="qty">عدد الملصقات المطلوب طباعتها</Label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-center font-bold text-lg"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            بدء الطباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
