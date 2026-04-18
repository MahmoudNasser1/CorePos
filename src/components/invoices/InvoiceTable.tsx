"use client"

import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { Button } from "@/components/ui/button"
import { Eye, Printer, Edit, MoreHorizontal, XCircle, FileDown } from "lucide-react"
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
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InvoiceTableProps {
  data: any[]
  type: 'sale' | 'purchase' | 'quotation' | 'sale_return' | 'purchase_order'
}

export function InvoiceTable({ data, type }: InvoiceTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(item => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesSearch = (item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ((type.includes('sale') || type === 'quotation') ? item.customers?.name : item.suppliers?.name)?.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const handleConvert = async (id: string) => {
    try {
      const res = await convertToInvoice(id)
      if (res.success) {
        toast.success("تم تحويل عرض السعر لفاتورة مبيعات بنجاح")
        router.push(`/dashboard/sales/invoices/${res.id}`)
      } else {
        toast.error("خطأ: " + res.error)
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
        router.push(`/dashboard/purchases/invoices/${res.id}`)
      } else {
        toast.error("خطأ: " + res.error)
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
      "الطرف": (type.includes('sale') || type === 'quotation') ? item.customers?.name : item.suppliers?.name,
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
      accessorKey: (type === 'sale' || type === 'quotation' || type === 'sale_return') ? "customers" : "suppliers",
      header: (type === 'sale' || type === 'quotation' || type === 'sale_return') ? "العميل" : "المورد",
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
      cell: ({ row }: any) => <StatusBadge status={row.getValue("status")} />
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const invoice = row.original
        let basePath = '/dashboard/sales/invoices'
        if (type === 'purchase') basePath = '/dashboard/purchases/invoices'
        if (type === 'quotation') basePath = '/dashboard/sales/quotations'
        if (type === 'purchase_order') basePath = '/dashboard/purchases/orders'
        
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
                  <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/${invoice.id}/print`} target="_blank">
                  <Printer className="ml-2 h-4 w-4" /> طباعة مسبقة
                </Link>
              </DropdownMenuItem>
              {type === 'quotation' && invoice.status !== 'converted' && (
                <DropdownMenuItem onClick={() => handleConvert(invoice.id)} className="text-primary font-bold">
                  <Edit className="ml-2 h-4 w-4" /> تحويل لفاتورة
                </DropdownMenuItem>
              )}
              {type === 'purchase_order' && invoice.status !== 'converted' && (
                <DropdownMenuItem onClick={() => handleConvertPO(invoice.id)} className="text-primary font-bold">
                  <Edit className="ml-2 h-4 w-4" /> تحويل لفاتورة شراء
                </DropdownMenuItem>
              )}
              {invoice.status === 'draft' && (
                <DropdownMenuItem asChild>
                  <Link href={`${basePath}/${invoice.id}/edit`}>
                    <Edit className="ml-2 h-4 w-4" /> تعديل
                  </Link>
                </DropdownMenuItem>
              )}
              {invoice.status !== 'void' && type !== 'quotation' && type !== 'purchase_order' && (
                <DropdownMenuItem onClick={() => handleCancel(invoice.id)} className="text-red-600">
                  <XCircle className="ml-2 h-4 w-4" /> إلغاء الفاتورة
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-muted">
        <div className="flex flex-wrap items-center gap-4">
          <Input 
            placeholder="بحث برقم الفاتورة أو الاسم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px] bg-white"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="partial">جزئية</SelectItem>
              <SelectItem value="confirmed">مؤكدة</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="void">ملغاة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 bg-white">
          <FileDown className="h-4 w-4" />
          تصدير Excel ({filteredData.length})
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData} 
      />
    </div>
  )
}
