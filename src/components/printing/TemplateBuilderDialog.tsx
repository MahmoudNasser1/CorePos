"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye, Code } from "lucide-react"
import { DOCUMENT_TYPES } from "@/lib/constants/printing"

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

export function TemplateBuilderDialog({ open, onOpenChange, template, onSave }: TemplateBuilderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{template ? 'تعديل القالب' : 'إضافة قالب جديد'}</DialogTitle>
          <DialogDescription>
            قم بتعديل كود HTML الخاص بالقالب. يمكنك استخدام متغيرات مثل {"{{invoice.no}}"} او {"{{product.name}}"}
          </DialogDescription>
        </DialogHeader>

        <form id="template-form" onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4 px-6 pb-4">
            <div className="space-y-2">
              <Label>اسم القالب</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))} 
                placeholder="مثال: فاتورة ضريبية مبسطة"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع المستند</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData(d => ({ ...d, type: val }))}
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

          <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden px-6">
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="gap-2">
                <Code className="w-4 h-4" />
                تعديل الكود
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                معاينة
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="flex-1 mt-0 overflow-hidden">
              <div className="h-full flex flex-col space-y-2">
                <Label>محتوى القالب (HTML)</Label>
                <Textarea 
                  required
                  value={formData.contentHtml}
                  onChange={(e) => setFormData(d => ({ ...d, contentHtml: e.target.value }))}
                  className="flex-1 font-mono text-sm leading-relaxed p-4 bg-muted/30"
                  dir="ltr"
                  placeholder="<div><h1>فاتورة {{invoice.no}}</h1></div>"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden border rounded-md">
              <iframe 
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { font-family: sans-serif; padding: 20px; }
                        * { box-sizing: border-box; }
                      </style>
                    </head>
                    <body>
                      ${formData.contentHtml || '<div style="color: #666; text-align: center; margin-top: 50px;">لا يوجد محتوى للمعاينة</div>'}
                    </body>
                  </html>
                `}
                className="w-full h-full border-none bg-white"
                title="Template Preview"
              />
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter className="p-6 pt-4 border-t gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            إلغاء
          </Button>
          <Button type="submit" form="template-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {template ? 'تحديث القالب' : 'إنشاء القالب'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

