"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Plus, Star, Trash2, Loader2, Save } from "lucide-react"
import { TemplateBuilderDialog } from "@/components/printing/TemplateBuilderDialog"
import { createPrintTemplate, updatePrintTemplate, upsertPrintSettings, deletePrintTemplate } from "@/lib/actions/settings.actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DOCUMENT_TYPES, PAPER_SIZES } from "@/lib/constants/printing"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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

export function PrintSettingsClient({ initialSettings, initialTemplates }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [templates, setTemplates] = useState(initialTemplates)
  const [pendingPrinterSaves, setPendingPrinterSaves] = useState<Record<string, boolean>>({})
  
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
    
    const payload = {
      documentType,
      paperSize: changes.paperSize ?? existing?.paperSize ?? 'A4',
      printerName: (changes.printerName !== undefined ? changes.printerName : existing?.printerName) ?? null,
      templateId: (changes.templateId !== undefined ? changes.templateId : existing?.templateId) ?? null,
    }

    // Optimistic UI update
    setSettings(prev => {
      const filtered = prev.filter(s => s.documentType !== documentType)
      const newItem: PrintSetting = {
        id: existing?.id || 'temp',
        ...payload,
        marginConfig: existing?.marginConfig || null
      }
      return [...filtered, newItem]
    })

    if (changes.printerName !== undefined) {
      setPendingPrinterSaves(prev => ({ ...prev, [documentType]: true }))
    }

    try {
      const result = await upsertPrintSettings(payload)
      if (result.success && result.data) {
        if (changes.paperSize || changes.templateId) {
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

              return (
                <div key={docType.value} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg items-end bg-slate-50/50">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">{docType.label}</Label>
                    <p className="text-xs text-muted-foreground">{docType.value}</p>
                  </div>
                  
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
                        {PAPER_SIZES.map(sz => (
                          <SelectItem key={sz.value} value={sz.value}>{sz.label}</SelectItem>
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
                        <Badge variant="secondary">
                          {DOCUMENT_TYPES.find(d => d.value === tpl.type)?.label || tpl.type}
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

