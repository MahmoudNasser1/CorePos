"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye, Code, Copy, DownloadCloud, CheckCircle2 } from "lucide-react"
import { DOCUMENT_TYPES, TEMPLATE_VARIABLES } from "@/lib/constants/printing"
import { STARTER_TEMPLATES } from "@/lib/constants/starter-templates"
import { renderTemplate } from "@/lib/print-renderer"
import { toast } from "sonner"

interface Template {
  id: string
  type: string
  name: string
  contentHtml: string
  isDefault: boolean
}

interface TemplateBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: Template | null
  onSave: (data: any) => Promise<void>
}

// Mock data for preview
const MOCK_PREVIEW_DATA = {
  invoice: {
    invoice_number: 'INV-2026-0001',
    date: new Date().toLocaleDateString('ar-EG'),
    total: 1540.50,
    subtotal: 1350.00,
    tax_amount: 190.50,
    discount_amount: 0,
    paid: 1540.50,
    remaining: 0,
    status: 'paid',
    customers: { name: 'عميل تجريبي', phone: '0123456789' },
    suppliers: { name: 'مورد تجريبي' },
    profiles: { full_name: 'محمد الكاشير' },
    notes: 'هذا عرض تجريبي لمعاينة القالب فقط.',
    invoice_items: [
      { products: { name: 'منتج تجريبي 1' }, qty: 2, unit_price: 500, total_line: 1000 },
      { products: { name: 'منتج تجريبي 2' }, qty: 1, unit_price: 350, total_line: 350 },
    ]
  },
  company: {
    name: 'مؤسسة التجربة والنجاح',
    tax_number: '123-456-789',
    phone: '01000000000',
    currency: 'ج.م'
  }
}

export function TemplateBuilderDialog({ open, onOpenChange, template, onSave }: TemplateBuilderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice_sale',
    contentHtml: '',
  })

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        contentHtml: template.contentHtml,
      })
    } else {
      setFormData({
        name: '',
        type: 'invoice_sale',
        contentHtml: '',
      })
    }
  }, [template, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadStarterTemplate = () => {
    const starter = STARTER_TEMPLATES[formData.type as keyof typeof STARTER_TEMPLATES]
    if (starter) {
      setFormData(prev => ({ ...prev, contentHtml: starter }))
      toast.success("تم تحميل القالب الافتراضي بنجاح")
    } else {
      toast.error("لا يوجد قالب افتراضي متاح لهذا النوع")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success("تم النسخ!")
  }

  const availableVariables = TEMPLATE_VARIABLES[formData.type] || []

  const previewHtml = useMemo(() => {
    return renderTemplate({
      invoice: MOCK_PREVIEW_DATA.invoice,
      company: MOCK_PREVIEW_DATA.company,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Pos-Sahl-Demo',
      type: formData.type as any
    }, formData.contentHtml || "");
  }, [formData.contentHtml, formData.type])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="text-xl">{template ? 'تعديل القالب' : 'إضافة قالب جديد'}</DialogTitle>
              <DialogDescription className="mt-1">
                صمم قالب الطباعة باستخدام HTML و CSS مع المتغيرات المتاحة.
              </DialogDescription>
            </div>
            {!template && (
              <Button variant="outline" size="sm" onClick={loadStarterTemplate} className="gap-2">
                <DownloadCloud className="w-4 h-4" />
                تحميل قالب جاهز
              </Button>
            )}
          </div>
        </DialogHeader>

        <form id="template-form" onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b">
            <div className="flex-1 grid grid-cols-2 gap-6 p-6">
              <div className="space-y-2">
                <Label>اسم القالب <span className="text-destructive">*</span></Label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))} 
                  placeholder="مثال: الفاتورة الضريبية الرسمية"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع المستند</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => {
                    const willChangeType = val !== formData.type;
                    setFormData(d => ({ ...d, type: val }));
                    if (willChangeType && !template && formData.contentHtml.length < 50) {
                      const starter = STARTER_TEMPLATES[val as keyof typeof STARTER_TEMPLATES];
                      if(starter) setFormData(d => ({ ...d, contentHtml: starter }));
                    }
                  }}
                  disabled={!!template}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-[3] flex flex-col overflow-hidden border-l">
              <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 pb-2 flex justify-between items-center shrink-0 border-b">
                  <TabsList>
                    <TabsTrigger value="edit" className="gap-2">
                      <Code className="w-4 h-4 text-blue-500" />
                      تعديل الكود (HTML)
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      معاينة حية
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="edit" className="flex-1 mt-0 overflow-hidden relative">
                  <Textarea 
                    required
                    value={formData.contentHtml}
                    onChange={(e) => setFormData(d => ({ ...d, contentHtml: e.target.value }))}
                    className="w-full h-full resize-none font-mono text-[13px] leading-relaxed p-6 bg-[#1e1e1e] text-[#d4d4d4] border-0 rounded-none focus-visible:ring-0"
                    dir="ltr"
                    spellCheck="false"
                    placeholder="<div><h1>فاتورة {{invoice.no}}</h1></div>"
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden bg-muted/20 p-6">
                  <div className="w-full h-full bg-white shadow-sm border rounded-lg overflow-hidden flex items-center justify-center">
                    <iframe 
                      srcDoc={`
                        <!DOCTYPE html>
                        <html dir="rtl">
                          <head>
                            <meta charset="utf-8">
                            <style>
                              body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; box-sizing: border-box; }
                              * { box-sizing: border-box; }
                            </style>
                          </head>
                          <body>
                            ${previewHtml || '<div style="color: #999; text-align: center; margin-top: 2rem; font-family: sans-serif;">لا يوجد محتوى للمعاينة</div>'}
                          </body>
                        </html>
                      `}
                      className="w-full h-full border-none"
                      title="Template Preview"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              <div className="p-4 border-b bg-slate-100/50 shrink-0">
                <h3 className="font-semibold text-sm">المتغيرات المتاحة</h3>
                <p className="text-xs text-muted-foreground mt-1">اضغط على المتغير النَصّي للنسخ والمفتاح لللصق في الكود.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {availableVariables.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد متغيرات مسجلة لهذا النوع إضغط حفظ ثم حاول مجددا</p>
                ) : (
                  availableVariables.map((v) => (
                    <div key={v.key} className="bg-white rounded-md border shadow-sm overflow-hidden hover:border-primary/40 transition-colors">
                      <div className="p-2.5 flex items-center justify-between bg-slate-50 border-b">
                        <span className="font-medium text-xs text-slate-700">{v.label}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(v.key)}
                        >
                          {copiedKey === v.key ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-primary" />
                          )}
                        </Button>
                      </div>
                      <div className="p-2.5 text-left bg-slate-900/5" dir="ltr">
                        <code className="text-xs font-mono text-primary font-bold cursor-pointer hover:underline" onClick={() => copyToClipboard(v.key)}>
                          {v.key}
                        </code>
                        {v.example && (
                          <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <span className="font-semibold">مثال:</span>
                            <span className="truncate">{v.example}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="p-4 border-t bg-slate-50 shrink-0">
          <div className="flex justify-between w-full items-center">
            <p className="text-xs text-muted-foreground">التصميم المخصص يعتمد على HTML و CSS بالكامل.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                إلغاء
              </Button>
              <Button type="submit" form="template-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {template ? 'حفظ التعديلات' : 'إنشاء القالب'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
