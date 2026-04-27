"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Plus, Star, Trash2, Loader2, Save, FileText, Receipt, Tags, FileCheck, ShoppingCart, FileInput, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { TemplateBuilderDialog } from "@/components/printing/TemplateBuilderDialog"
import { createPrintTemplate, updatePrintTemplate, upsertPrintSettings, deletePrintTemplate } from "@/lib/actions/settings.actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DOCUMENT_TYPES, PAPER_SIZES, DEFAULT_MARGINS } from "@/lib/constants/printing"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface PrintTemplate {
  id: string
  type: string
  name: string
  contentHtml: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface PrintSetting {
  id: string
  documentType: string
  paperSize: string
  printerName: string | null
  templateId: string | null
  marginConfig: any
  templateCode?: string | null
}

interface Props {
  initialSettings: PrintSetting[]
  initialTemplates: PrintTemplate[]
}

const ICON_MAP: Record<string, any> = {
  invoice_sale: FileText,
  invoice_purchase: FileInput,
  invoice_return: FileCheck,
  pos_receipt: Receipt,
  quotation: ShoppingCart,
  barcode_label: Tags,
}

function PaperPreview({ paperSize, margins }: { paperSize: string; margins: any }) {
  const dimensions: Record<string, { w: number; h: number }> = {
    'A4': { w: 210, h: 297 },
    'A5': { w: 148, h: 210 },
    '80mm': { w: 80, h: 120 },
    '58mm': { w: 58, h: 100 },
    '50x30mm': { w: 50, h: 30 },
    '40x20mm': { w: 40, h: 20 },
  }
  const dim = paperSize === 'custom' && margins?.customWidth && margins?.customHeight
    ? { w: parseFloat(margins.customWidth), h: parseFloat(margins.customHeight) }
    : (dimensions[paperSize] || dimensions['A4'])
  const scale = 50 / Math.max(dim.w, dim.h)
  
  const parseVal = (val: string | undefined, defaultVal: number) => {
    if (!val) return defaultVal;
    if (val.includes('mm')) return parseFloat(val) * 0.5;
    if (val.includes('cm')) return parseFloat(val) * 5; // Simplified scaling
    return parseFloat(val) * 0.5;
  }

  return (
    <div className="flex items-center justify-center shrink-0 w-16 h-16 bg-muted/30 rounded-lg">
      <div 
        className="bg-white border border-gray-300 shadow-sm relative overflow-hidden"
        style={{ width: dim.w * scale, height: dim.h * scale }}
      >
        <div 
          className="absolute border border-dashed border-blue-400 bg-blue-50/50"
          style={{
            top: parseVal(margins?.top, 0),
            right: parseVal(margins?.right, 0),
            bottom: parseVal(margins?.bottom, 0),
            left: parseVal(margins?.left, 0),
          }}
        />
      </div>
    </div>
  )
}

export function PrintSettingsClient({ initialSettings, initialTemplates }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [templates, setTemplates] = useState(initialTemplates)
  const [pendingPrinterSaves, setPendingPrinterSaves] = useState<Record<string, boolean>>({})
  const [expandedMargins, setExpandedMargins] = useState<Record<string, boolean>>({})
  
  // Template Dialog State
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null)

  const handleSaveTemplate = async (data: any) => {
    try {
      let result
      if (editingTemplate) {
        result = await updatePrintTemplate(editingTemplate.id, data)
      } else {
        result = await createPrintTemplate(data)
      }
      
      if (result.success && result.data) {
        toast.success(editingTemplate ? "تم تحديث القالب" : "تم إنشاء القالب")
        if (editingTemplate) {
          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.data as PrintTemplate : t))
        } else {
          setTemplates(prev => [result.data as PrintTemplate, ...prev])
        }
      } else {
        toast.error("فشل حفظ القالب")
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ")
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const isUsed = settings.some(s => s.templateId === id)
      if (isUsed) {
        toast.error("لا يمكن حذف هذا القالب لأنه مخصص حالياً كقالب افتراضي لأحد المستندات")
        return
      }

      await deletePrintTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
      toast.success("تم حذف القالب بنجاح")
    } catch (err: any) {
      toast.error("فشل حذف القالب")
    }
  }

  const handleUpdateSetting = async (documentType: string, changes: Partial<PrintSetting>) => {
    const previousSettings = [...settings]
    const existing = settings.find(s => s.documentType === documentType)
    
    let pendingMargins = changes.marginConfig 
        ? (typeof changes.marginConfig === 'string' ? changes.marginConfig : JSON.stringify(changes.marginConfig))
        : existing?.marginConfig 
          ? (typeof existing.marginConfig === 'string' ? existing.marginConfig : JSON.stringify(existing.marginConfig))
          : null;

    // Auto update margins if paper size changes and margin config wasn't explicitly changed right now
    if (changes.paperSize && !changes.marginConfig) {
      const defaultMarg = DEFAULT_MARGINS[changes.paperSize]
      if (defaultMarg) {
        pendingMargins = JSON.stringify(defaultMarg)
      }
    }

    const payload = {
      documentType,
      paperSize: changes.paperSize ?? existing?.paperSize ?? 'A4',
      printerName: (changes.printerName !== undefined ? changes.printerName : existing?.printerName) ?? null,
      templateId: (changes.templateId !== undefined ? changes.templateId : existing?.templateId) ?? null,
      marginConfig: pendingMargins
    }

    // Optimistic UI update
    setSettings(prev => {
      const filtered = prev.filter(s => s.documentType !== documentType)
      const newItem: PrintSetting = {
        id: existing?.id || 'temp',
        ...payload,
      }
      return [...filtered, newItem]
    })

    if (changes.printerName !== undefined) {
      setPendingPrinterSaves(prev => ({ ...prev, [documentType]: true }))
    }

    try {
      const result = await upsertPrintSettings(payload)
      if (result.success && result.data) {
        if (changes.paperSize || changes.templateId || changes.marginConfig) {
          toast.success("تم تحديث الإعداد")
        }
        setSettings(prev => {
          const filtered = prev.filter(s => s.documentType !== documentType)
          return [...filtered, result.data as PrintSetting]
        })
      } else {
        throw new Error("API Error")
      }
    } catch (err: any) {
      toast.error("فشل التحديث، يرجى المحاولة مرة أخرى")
      setSettings(previousSettings) // Rollback
    } finally {
      if (changes.printerName !== undefined) {
        setPendingPrinterSaves(prev => ({ ...prev, [documentType]: false }))
      }
    }
  }

  const handleTestPrint = (docType: string) => {
    // Generate simple test print window
    const win = window.open('', '_blank')
    if (!win) return toast.error("تأكد من السماح بالنوافذ المنبثقة للطباعة")
    
    const setting = settings.find(s => s.documentType === docType)
    const margins = typeof setting?.marginConfig === 'string' 
      ? JSON.parse(setting.marginConfig) 
      : (setting?.marginConfig || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' })
    const paperSize = setting?.paperSize || 'A4'
    const docName = DOCUMENT_TYPES.find(d => d.value === docType)?.label || docType

    win.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة تجريبية - ${docName}</title>
          <style>
             @media print {
              body { background: white !important; }
              @page { 
                size: ${paperSize.includes('80mm') ? '80mm auto' : paperSize.includes('58mm') ? '58mm auto' : paperSize}; 
                margin: ${margins.top || '0'} ${margins.right || '0'} ${margins.bottom || '0'} ${margins.left || '0'}; 
              }
            }
            body { font-family: system-ui, sans-serif; padding: 2rem; text-align: center; }
            .test-box { border: 2px dashed #ccc; padding: 2rem; border-radius: 8px; margin: 0 auto; max-width: 500px; }
          </style>
        </head>
        <body>
          <div class="test-box">
            <h1>طباعة تجريبية</h1>
            <h2>${docName}</h2>
            <p><strong>مقاس الورق:</strong> ${paperSize}</p>
            <p><strong>الهوامش:</strong> أعلى: ${margins.top}, أسفل: ${margins.bottom}, يمين: ${margins.right}, يسار: ${margins.left}</p>
            <br/>
            <p style="color: #666">تم ضبط الإعدادات بنجاح من نظام Pos-Sahl.</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
          </script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="settings">خيارات الطباعة</TabsTrigger>
        <TabsTrigger value="templates">قوالب الطباعة (HTML)</TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الورق والطابعات</CardTitle>
            <CardDescription>
              حدد الطابعة الافتراضية ومقاس الورق لكل نوع من المستندات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {DOCUMENT_TYPES.map(docType => {
              const currentSetting = settings.find(s => s.documentType === docType.value)
              const relevantTemplates = templates.filter(t => t.type === docType.value)
              const isPending = pendingPrinterSaves[docType.value]
              const Icon = ICON_MAP[docType.value] || FileText
              const margins = typeof currentSetting?.marginConfig === 'string' 
                ? JSON.parse(currentSetting.marginConfig) 
                : (currentSetting?.marginConfig || DEFAULT_MARGINS[currentSetting?.paperSize || 'A4'] || { top: '0', bottom: '0', right: '0', left: '0' })
              const isExpanded = expandedMargins[docType.value]

              return (
                <div key={docType.value} className="p-4 border rounded-lg bg-slate-50/50 flex flex-col gap-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <Label className="text-base font-bold cursor-pointer">{docType.label}</Label>
                        <p className="text-xs text-muted-foreground">{docType.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleTestPrint(docType.value)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        طباعة تجريبية
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-6 items-end mt-2">
                    <PaperPreview paperSize={currentSetting?.paperSize || 'A4'} margins={margins} />

                    <div className="space-y-2">
                      <Label>مقاس الورق</Label>
                      <Select 
                        value={currentSetting?.paperSize || 'A4'}
                        onValueChange={(val) => handleUpdateSetting(docType.value, { paperSize: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مقاس الورق" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            PAPER_SIZES.reduce((acc, curr) => {
                              if (!acc[curr.group]) acc[curr.group] = []
                              acc[curr.group].push(curr)
                              return acc
                            }, {} as Record<string, typeof PAPER_SIZES[number][]>)
                          ).map(([group, sizes]) => (
                            <div key={group}>
                              <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground bg-muted/30 capitalize">
                                {group}
                              </div>
                              {sizes.map(sz => (
                                <SelectItem key={sz.value} value={sz.value} className="pr-4">{sz.label}</SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>القالب (اختياري)</Label>
                      <Select 
                        value={currentSetting?.templateId || "default"}
                        onValueChange={(val) => handleUpdateSetting(docType.value, { templateId: val === "default" ? null : val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="قالب النظام الافتراضي" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">قالب النظام الافتراضي</SelectItem>
                          {relevantTemplates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>اسم الطابعة (اختياري)</Label>
                        {isPending && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      </div>
                      <div className="relative">
                        <Input 
                          placeholder="Printer Name / IP" 
                          defaultValue={currentSetting?.printerName || ''}
                          onBlur={(e) => {
                            const val = e.target.value.trim()
                            if (val !== (currentSetting?.printerName || '')) {
                              handleUpdateSetting(docType.value, { printerName: val || null })
                            }
                          }}
                          className={isPending ? "pr-8" : ""}
                        />
                      </div>
                    </div>

                    {/* Custom Size Fields */}
                    {currentSetting?.paperSize === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-dashed">
                        <div className="space-y-1">
                          <Label className="text-[10px]">العرض (مم)</Label>
                          <Input 
                            type="number"
                            className="h-7 text-xs"
                            placeholder="50"
                            defaultValue={margins?.customWidth || '50'}
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              if (val !== (margins?.customWidth || '50')) {
                                handleUpdateSetting(docType.value, { 
                                  marginConfig: { ...margins, customWidth: val || '50' } 
                                })
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">الارتفاع (مم)</Label>
                          <Input 
                            type="number"
                            className="h-7 text-xs"
                            placeholder="30"
                            defaultValue={margins?.customHeight || '30'}
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              if (val !== (margins?.customHeight || '30')) {
                                handleUpdateSetting(docType.value, { 
                                  marginConfig: { ...margins, customHeight: val || '30' } 
                                })
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Product Label Specific Options */}
                    {docType.value === 'barcode_label' && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <Label className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Tags className="w-3 h-3" />
                          خيارات ملصق المنتجات
                        </Label>
                        
                        <div className="space-y-2">
                          <Label className="text-[10px]">نوع الرمز</Label>
                          <Select 
                            defaultValue={margins?.symbolType || 'barcode'}
                            onValueChange={(val) => handleUpdateSetting(docType.value, { 
                              marginConfig: { ...margins, symbolType: val } 
                            })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="barcode">باركود خطي (Code128)</SelectItem>
                              <SelectItem value="qr">رمز استجابة سريع (QR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 pt-1 border-y border-dashed py-2">
                          {[
                            { id: 'showPrice', label: 'إظهار السعر' },
                            { id: 'showSku', label: 'إظهار الرمز' },
                            { id: 'showCategory', label: 'إظهار التصنيف' },
                            { id: 'showUnit', label: 'إظهار الوحدة' },
                          ].map(item => (
                            <div key={item.id} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox 
                                id={`${docType.value}-${item.id}`}
                                checked={margins?.[item.id] !== false}
                                onCheckedChange={(checked) => handleUpdateSetting(docType.value, { 
                                  marginConfig: { ...margins, [item.id]: !!checked } 
                                })}
                              />
                              <label 
                                htmlFor={`${docType.value}-${item.id}`}
                                className="text-[11px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Margins Section */}
                  <div className="mt-2 border-t pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-fit text-xs px-2 h-7"
                      onClick={() => setExpandedMargins(p => ({ ...p, [docType.value]: !p[docType.value] }))}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                      {isExpanded ? "إخفاء إعدادات الهوامش" : "تعديل إعدادات الهوامش"}
                    </Button>
                    
                    {isExpanded && (
                      <div className="grid grid-cols-4 gap-4 mt-3 bg-white p-3 rounded-md border">
                        {(['top', 'bottom', 'right', 'left'] as const).map(side => (
                          <div key={side} className="space-y-1.5 focus-within:text-primary">
                            <Label className="text-xs">
                              {side === 'top' ? 'أعلى' : side === 'bottom' ? 'أسفل' : side === 'right' ? 'يمين' : 'يسار'}
                            </Label>
                            <Input 
                              className="h-8 text-sm placeholder:text-gray-300" 
                              placeholder={DEFAULT_MARGINS[currentSetting?.paperSize || 'A4']?.[side]}
                              defaultValue={margins[side]}
                              onBlur={(e) => {
                                const val = e.target.value.trim()
                                if (val !== margins[side]) {
                                  handleUpdateSetting(docType.value, { 
                                    marginConfig: { ...margins, [side]: val || '0mm' } 
                                  })
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div>
              <CardTitle>قوالب مخصصة</CardTitle>
              <CardDescription>يمكنك إنشاء قوالب HTML مخصصة للفواتير والباركود.</CardDescription>
            </div>
            <Button onClick={() => { setEditingTemplate(null); setIsTemplateDialogOpen(true) }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة قالب
            </Button>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-dashed border-2 rounded-lg">
                لا توجد قوالب مخصصة حتى الآن.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم القالب</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow key={tpl.id}>
                      <TableCell className="font-medium">{tpl.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1.5">
                          {(() => {
                             const Icon = ICON_MAP[tpl.type] || FileText
                             return <><Icon className="w-3 h-3" /> {DOCUMENT_TYPES.find(d => d.value === tpl.type)?.label || tpl.type}</>
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tpl.isDefault ? (
                          <Badge variant="default" className="gap-1 flex w-fit items-center">
                            <Star className="w-3 h-3" />
                            افتراضي
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">عادي</span>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setEditingTemplate(tpl); setIsTemplateDialogOpen(true) }}
                          >
                            <Edit2 className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 ml-1" />
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف القالب؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيؤدي هذا إلى حذف قالب "{tpl.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTemplate(tpl.id)} className="bg-destructive hover:bg-destructive/90">
                                  تأكيد الحذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TemplateBuilderDialog 
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </Tabs>
  )
}

