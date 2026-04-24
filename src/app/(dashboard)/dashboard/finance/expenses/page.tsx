import { getExpenses } from "@/lib/actions/payments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExpenseForm } from "@/components/finance/ExpenseForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, Download, Wallet, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function ExpensesPage() {
  const expenses = (await getExpenses()) as any[]
  
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + Number(curr?.amount || 0), 0)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">إدارة المصروفات التشغيلية</h1>
          <p className="text-slate-500 font-bold mt-1">تتبع كافة المصاريف الإدارية والتشغيلية للفروع</p>
        </div>
        <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-10 gap-2 px-6 font-black shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5 shrink-0" aria-hidden />
                  تسجيل مصروف جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">إضافة مصروف جديد</DialogTitle>
                </DialogHeader>
                <ExpenseForm />
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-muted/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">إجمالي المصروفات</CardTitle>
            <div className="mt-1 text-3xl font-black tabular-nums text-foreground">
              {formatCurrency(totalExpenses)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-muted-foreground">مجموع المبالغ في السجل المعروض</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">عدد العمليات</CardTitle>
            <div className="mt-1 text-3xl font-black tabular-nums">{expenses.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">عملية مسجّلة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b py-6">
          <div className="flex justify-between items-center">
             <CardTitle className="text-xl font-black flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                سجل المصروفات التفصيلي
             </CardTitle>
             <Button type="button" variant="ghost" size="sm" className="gap-2 font-bold" aria-label="تصدير">
                <Download className="h-4 w-4" aria-hidden />
                تصدير
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[180px] font-black py-4">التاريخ</TableHead>
                <TableHead className="font-black">التصنيف</TableHead>
                <TableHead className="font-black">بواسطة / الخزينة</TableHead>
                <TableHead className="font-black">المبلغ</TableHead>
                <TableHead className="font-black">ملاحظات البيان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 font-bold text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(expense.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold px-3">
                      {expense.expense_categories?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <Wallet className="w-3 h-3 text-slate-500" />
                       </div>
                       <span className="font-bold text-slate-700">{expense.treasuries?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-lg font-bold tabular-nums text-foreground">
                      {formatCurrency(Number(expense.amount) || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] font-medium text-slate-500 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      {expense.notes || "—"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-muted p-4">
                        <Receipt className="h-8 w-8 text-muted-foreground" aria-hidden />
                      </div>
                      <p className="text-lg font-bold text-muted-foreground">لا مصروفات في الفترة</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        سجّل مصروفًا جديدًا من الزر أعلاه عند توفر بيانات.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
