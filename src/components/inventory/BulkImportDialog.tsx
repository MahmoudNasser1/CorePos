"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileDown, CheckCircle2, AlertCircle, X, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { bulkImportProducts } from "@/lib/actions/inventory.actions"

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'report'

interface ImportData {
  Name: string
  Barcode?: string
  SKU?: string
  Category?: string
  Unit?: string
  "Price 1"?: string | number
  "Price 2"?: string | number
  "Price 3"?: string | number
  "Cost Price"?: string | number
  "Min Qty"?: string | number
  "Initial Qty"?: string | number
}

interface ImportReport {
  total: number
  imported: number
  skipped: number
  errors: string[]
}

const TEMPLATE_HEADERS = [
  "الاسم", "الباركود", "SKU", "القسم", "الوحدة", 
  "سعر البيع الأساسي", "سعر الجملة", "سعر خاص", "سعر التكلفة", 
  "الحد الأدنى", "الكمية الافتتاحية", "السيريال"
]

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [step, setStep] = useState<Step>('upload')
  const [data, setData] = useState<ImportData[]>([])
  const [report, setReport] = useState<ImportReport | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setStep('upload')
    setData([])
    setReport(null)
    setIsImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const SAMPLE_ROWS = [
      [
        "لابتوب ديل (مثال - أجهزة بسيريال)", 
        "DELL-XPS-13", 
        "DELL-100", 
        "إلكترونيات", 
        "قطعة", 
        25000, 24000, 23500, 22000, 
        2, 1, "SN-ABC-123"
      ],
      [
        "جراب آيفون 15 (مثال - إكسسوارات)", 
        "BAR-IPH-CASE", 
        "ACC-001", 
        "إكسسوارات", 
        "قطعة", 
        250, 200, 180, 100, 
        10, 50, "" 
      ],
      [
        "خدمة تركيب وصيانة (مثال - خدمات)", 
        "SRV-MNT-1", 
        "SERV-01", 
        "خدمات", 
        "خدمة", 
        150, 150, 150, 0, 
        0, 1000, "" 
      ],
      [
        "ماوس لاسلكي (مثال - منتج عام)", 
        "6221234567890", 
        "MSE-WRL", 
        "إلكترونيات", 
        "حبة", 
        120, 100, 95, 60, 
        5, 30, "" 
      ]
    ]
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...SAMPLE_ROWS])
    // Make columns wider for Arabic text
    ws['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Products Template")
    XLSX.writeFile(wb, "products_import_template.xlsx")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const result = evt.target?.result
        const wb = XLSX.read(result, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const parsedData = XLSX.utils.sheet_to_json<any>(ws)

        if (!parsedData || parsedData.length === 0) {
          toast.error("الملف فارغ")
          return
        }

        if (parsedData.length > 500) {
          toast.error("الحد الأقصى هو 500 منتج في الملف الواحد")
          return
        }

        // Normalize data keys (try to map English/Arabic to expected English keys)
        const normalizedData: ImportData[] = parsedData.map(row => {
          const nameRaw = row.Name || row.name || row['الاسم'] || row['اسم المنتج'] || ''
          return {
            Name: String(nameRaw).trim(),
            Barcode: String(row.Barcode || row.barcode || row['الباركود'] || '').trim(),
            SKU: String(row.SKU || row.sku || row['SKU'] || '').trim(),
            Category: String(row.Category || row.category || row['الفئة'] || row['القسم'] || '').trim(),
            Unit: String(row.Unit || row.unit || row['الوحدة'] || '').trim(),
            "Price 1": row['Price 1'] || row.price1 || row['سعر البيع الأساسي'] || row['السعر الأساسي'] || row['السعر'] || 0,
            "Price 2": row['Price 2'] || row.price2 || row['سعر الجملة'] || 0,
            "Price 3": row['Price 3'] || row.price3 || row['سعر خاص'] || 0,
            "Cost Price": row['Cost Price'] || row.costPrice || row['سعر التكلفة'] || row['التكلفة'] || 0,
            "Min Qty": row['Min Qty'] || row.minQty || row['الحد الأدنى'] || 0,
            "Initial Qty": row['Initial Qty'] || row.initialQty || row['الكمية الافتتاحية'] || row['الكمية'] || 0,
            "Serial": String(row.Serial || row.serial || row['السيريال'] || row['الرقم التسلسلي'] || '').trim(),
          }
        }).filter(row => row.Name?.length > 0)

        setData(normalizedData)
        setStep('preview')
      } catch (error) {
        toast.error("حدث خطأ أثناء قراءة الملف، تأكد من صحة التنسيق")
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    setStep('importing')
    setIsImporting(true)

    try {
      const payload = data.map(item => ({
        name: String(item.Name),
        barcode: item.Barcode ? String(item.Barcode) : undefined,
        sku: item.SKU ? String(item.SKU) : undefined,
        categoryName: item.Category ? String(item.Category) : undefined,
        unitName: item.Unit ? String(item.Unit) : undefined,
        price1: String(item["Price 1"] || '0'),
        price2: String(item["Price 2"] || '0'),
        price3: String(item["Price 3"] || '0'),
        costPrice: String(item["Cost Price"] || '0'),
        minQty: String(item["Min Qty"] || '0'),
        initialQty: String(item["Initial Qty"] || '0'),
      }))

      const result = await bulkImportProducts(payload) as any
      setReport({
        total: result?.total || data.length,
        imported: result?.imported || 0,
        skipped: result?.skipped || 0,
        errors: result?.errors || [],
      })
      setStep('report')
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الاستيراد")
      setStep('preview') // allow retry
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>استيراد المنتجات بالجملة</DialogTitle>
          <DialogDescription>
            قم برفع ملف Excel أو CSV لإضافة مجموعة من المنتجات دفعة واحدة (بحد أقصى 500 منتج).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center w-full max-w-md cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">اضغط لاختيار ملف</p>
                    <p className="text-sm text-gray-500 mt-1">يدعم .xlsx و .csv</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">ليس لديك القالب؟</p>
                <Button variant="outline" onClick={downloadTemplate}>
                  <FileDown className="ml-2 h-4 w-4" />
                  تحميل القالب الفارغ
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <div>
                  <h3 className="font-medium text-lg">معاينة البيانات</h3>
                  <p className="text-sm text-gray-500">تم العثور على {data.length} منتج صالح في الملف.</p>
                </div>
                <Button variant="secondary" onClick={() => setStep('upload')}>
                  <Upload className="ml-2 h-4 w-4" />
                  رفع ملف آخر
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>التكلفة</TableHead>
                      <TableHead>الكمية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 50).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.Name}</TableCell>
                        <TableCell>{row.Barcode || '-'}</TableCell>
                        <TableCell>{row.Category || '-'}</TableCell>
                        <TableCell>{row.Unit || '-'}</TableCell>
                        <TableCell>{row["Price 1"]}</TableCell>
                        <TableCell>{row["Cost Price"]}</TableCell>
                        <TableCell>{row["Initial Qty"]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {data.length > 50 && (
                <p className="text-xs text-gray-400 text-center">يتم عرض أول 50 منتجاً فقط للمعاينة.</p>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="w-full max-w-md space-y-2 text-center">
                <Progress value={undefined} className="w-full h-3" />
                <p className="text-lg font-medium text-primary mt-4 animate-pulse">جاري الاستيراد...</p>
                <p className="text-sm text-gray-500">يرجى الانتظار وعدم إغلاق النافذة. قد تستغرق العملية بضع دقائق.</p>
              </div>
            </div>
          )}

          {step === 'report' && report && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-80">إجمالي الصفوف</p>
                    <p className="text-2xl font-bold">{report.total}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-80">تم الاستيراد بنجاح</p>
                    <p className="text-2xl font-bold">{report.imported}</p>
                  </div>
                </div>

                <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-80">تم التخطي / مكرر</p>
                    <p className="text-2xl font-bold">{report.skipped}</p>
                  </div>
                </div>
              </div>

              {report.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 p-3 border-b border-red-200">
                    <p className="font-medium text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      تفاصيل الأخطاء ({report.errors.length})
                    </p>
                  </div>
                  <ScrollArea className="h-[150px] bg-white p-4">
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {report.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <p className="text-gray-600">اكتملت العملية! يمكنك التحقق من المنتجات في جدول المخزون.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t pt-4">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                رجوع
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                <CheckCircle2 className="ml-2 h-4 w-4" />
                تأكيد وبدء الاستيراد
              </Button>
            </>
          )}

          {step === 'report' && (
            <Button onClick={handleClose}>
              إغلاق وتحديث القائمة
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
