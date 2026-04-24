"use client"

import { DataTable } from "@/components/shared/DataTable"
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { Button } from "@/components/ui/button"
import { Eye, Printer, Edit, MoreHorizontal, XCircle, FileDown, SlidersHorizontal } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import * as XLSX from "xlsx"
import { convertToInvoice, convertPOToInvoice, cancelInvoice } from "@/lib/actions/invoices"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"

interface InvoiceTableProps {
  data: any[]
  type: "sale" | "purchase" | "quotation" | "sale_return" | "purchase_order" | "purchase_return"
}

function invoiceDateKey(d: unknown): string {
  if (d == null || typeof d !== "string") return ""
  return d.length >= 10 ? d.slice(0, 10) : d
}

export function InvoiceTable({ data, type }: InvoiceTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const partyName =
        type === "sale" || type === "quotation" || type === "sale_return"
          ? item.customers?.name || ""
          : item.suppliers?.name || ""
      const matchesSearch =
        String(item.invoice_number ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(partyName).toLowerCase().includes(searchTerm.toLowerCase())
      const key = invoiceDateKey(item.date)
      const matchesFrom = !dateFrom || (key && key >= dateFrom)
      const matchesTo = !dateTo || (key && key <= dateTo)
      return matchesStatus && matchesSearch && matchesFrom && matchesTo
    })
  }, [data, type, statusFilter, searchTerm, dateFrom, dateTo])

  const newInvoiceHref =
    type === "purchase"
      ? "/dashboard/purchases/new"
      : type === "quotation"
        ? "/dashboard/sales/quotations/new"
        : type === "purchase_order"
          ? "/dashboard/purchases/orders/new"
          : type === "purchase_return"
            ? "/dashboard/purchases/returns/new"
            : "/dashboard/sales/new"

  const handleConvert = async (id: string) => {
    if (
      !confirm(
        "إصدار فاتورة مبيعات من عرض السعر هذا؟ سيتم إنشاء فاتورة جديدة مرتبطة بالعرض.",
      )
    ) {
      return
    }
    try {
      const res = await convertToInvoice(id)
      if (res.success) {
        toast.success("تم تحويل عرض السعر لفاتورة مبيعات بنجاح")
        router.push(`/dashboard/sales/invoices/${(res as any).id}`)
      } else {
        toast.error("خطأ: " + (res as any).error)
      }
    } catch (error: any) {
      toast.error("حدث خطأ أثناء التحويل")
    }
  }

  const handleConvertPO = async (id: string) => {
    try {
      const res = await convertPOToInvoice(id)
      if (res.success) {
        toast.success("تم تحويل أمر الشراء لفاتورة مشتريات بنجاح")
        router.push(`/dashboard/purchases/invoices/${(res as any).id}`)
      } else {
        toast.error("خطأ: " + (res as any).error)
      }
    } catch (error: any) {
      toast.error("حدث خطأ أثناء التحويل")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذه الفاتورة؟")) return
    try {
      const res = await cancelInvoice(id)
      if (res.success) {
        toast.success("تم إلغاء الفاتورة بنجاح")
        router.refresh()
      }
    } catch (error) {
      toast.error("فشل إلغاء الفاتورة")
    }
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      "الرقم": item.invoice_number,
      "التاريخ": item.date,
      "الطرف": type === "sale" || type === "quotation" || type === "sale_return"
        ? item.customers?.name
        : item.suppliers?.name,
      "الإجمالي": item.total,
      "المدفوع": item.paid,
      "المتبقي": item.remaining,
      "الحالة": item.status
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Invoices")
    XLSX.writeFile(wb, `invoices_${type}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns = [
    {
      accessorKey: "invoice_number",
      header: "الرقم",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("invoice_number") || "---"}</span>
      )
    },
    {
      accessorKey: "date",
      header: "التاريخ",
    },
    {
      accessorKey:
        type === "sale" || type === "quotation" || type === "sale_return"
          ? "customers"
          : "suppliers",
      header:
        type === "sale" || type === "quotation" || type === "sale_return"
          ? "العميل"
          : "المورد",
      cell: ({ row }: any) => {
        const party = row.original.customers || row.original.suppliers
        return party?.name || "---"
      }
    },
    {
      accessorKey: "total",
      header: "الإجمالي",
      cell: ({ row }: any) => <CurrencyDisplay amount={row.getValue("total")} />
    },
    {
      accessorKey: "paid",
      header: "المدفوع",
      cell: ({ row }: any) => <CurrencyDisplay amount={row.getValue("paid")} className="text-green-600" />
    },
    {
      accessorKey: "remaining",
      header: "المتبقي",
      cell: ({ row }: any) => (
        <CurrencyDisplay 
          amount={row.getValue("remaining")} 
          className={cn(row.getValue("remaining") > 0 ? "text-red-500 font-bold" : "text-gray-400")}
        />
      )
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }: any) => (
        <InvoiceStatusBadge status={String(row.getValue("status") ?? "")} />
      )
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const invoice = row.original
        let basePath = '/dashboard/sales/invoices'
        if (type === "purchase" || type === "purchase_return") basePath = "/dashboard/purchases/invoices"
        if (type === "quotation") basePath = "/dashboard/sales/quotations"
        if (type === "purchase_order") basePath = "/dashboard/purchases/orders"
        
        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/${invoice.id}`}>
                  <Eye className="me-2 h-4 w-4" /> عرض التفاصيل
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/${invoice.id}/print`} target="_blank">
                  <Printer className="me-2 h-4 w-4" /> معاينة الطباعة
                </Link>
              </DropdownMenuItem>
              {type === 'quotation' && invoice.status !== 'converted' && (
                <DropdownMenuItem onClick={() => handleConvert(invoice.id)} className="font-bold text-primary">
                  <Edit className="me-2 h-4 w-4" /> إصدار فاتورة
                </DropdownMenuItem>
              )}
              {type === 'purchase_order' && invoice.status !== 'converted' && (
                <DropdownMenuItem onClick={() => handleConvertPO(invoice.id)} className="font-bold text-primary">
                  <Edit className="me-2 h-4 w-4" /> تحويل لفاتورة شراء
                </DropdownMenuItem>
              )}
              {invoice.status === 'draft' && (
                <DropdownMenuItem asChild>
                  <Link href={`${basePath}/${invoice.id}/edit`}>
                    <Edit className="me-2 h-4 w-4" /> تعديل
                  </Link>
                </DropdownMenuItem>
              )}
              {invoice.status !== "void" &&
                type !== "quotation" &&
                type !== "purchase_order" &&
                type !== "purchase_return" && (
                <DropdownMenuItem onClick={() => handleCancel(invoice.id)} className="text-red-600">
                  <XCircle className="me-2 h-4 w-4" /> إلغاء الفاتورة
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const filterFields = (
    <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:gap-4">
      <div className="space-y-2 sm:col-span-2 lg:min-w-[220px] lg:flex-1">
        <Label className="text-xs text-muted-foreground">بحث</Label>
        <Input
          placeholder="رقم الفاتورة أو اسم العميل/المورد…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">من تاريخ</Label>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-background" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">إلى تاريخ</Label>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-background" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">الحالة</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full min-w-[180px] bg-background lg:w-[180px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="paid">مدفوعة</SelectItem>
            <SelectItem value="partial">جزئية</SelectItem>
            <SelectItem value="confirmed">مؤكدة</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
            <SelectItem value="void">ملغاة</SelectItem>
            {type === "quotation" && <SelectItem value="converted">محوّل لفاتورة</SelectItem>}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="hidden items-center justify-between gap-4 rounded-xl border border-muted bg-muted/30 p-4 md:flex">
        {filterFields}
        <Button variant="outline" size="sm" onClick={exportToExcel} className="shrink-0 gap-2 bg-background">
          <FileDown className="h-4 w-4" aria-hidden />
          تصدير ({filteredData.length})
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-muted bg-muted/30 p-4 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-2 bg-background">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                فلاتر وبحث
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto" dir="rtl">
              <SheetHeader>
                <SheetTitle>تصفية الفواتير</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">{filterFields}</div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 bg-background">
            <FileDown className="h-4 w-4" aria-hidden />
            تصدير
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        showToolbar={false}
        emptyState={{
          title: "لا فواتير في الفترة المختارة",
          description: "جرّب توسيع نطاق التاريخ أو تغيير الحالة أو مسح البحث.",
          ctaHref: newInvoiceHref,
          ctaLabel:
            type === "purchase"
              ? "فاتورة مشتريات جديدة"
              : type === "quotation"
                ? "عرض سعر جديد"
                : type === "purchase_order"
                  ? "أمر شراء جديد"
                  : type === "purchase_return"
                    ? "مرتجع مشتريات جديد"
                    : "فاتورة جديدة",
        }}
      />
    </div>
  )
}
