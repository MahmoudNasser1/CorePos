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
import { Plus, Receipt, Filter, Download, ArrowDownRight, Wallet, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function ExpensesPage() {
  const expenses = await getExpenses()
  
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">إدارة المصروفات التشغيلية</h1>
          <p className="text-slate-500 font-bold mt-1">تتبع كافة المصاريف الإدارية والتشغيلية للفروع</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-bold shadow-sm">
                <Filter className="w-4 h-4" />
                تصفية
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 font-black shadow-lg shadow-primary/20 h-10 px-6">
                  <Plus className="h-5 w-5" />
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
        <Card className="border-none shadow-sm bg-rose-50 border border-rose-100 dark:bg-rose-950/20">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-bold text-rose-600">إجمالي المصروفات</CardTitle>
             <div className="text-3xl font-black text-rose-700 mt-1">{totalExpenses.toLocaleString()} ج.م</div>
          </CardHeader>
          <CardContent>
             <div className="text-xs font-bold text-rose-500 flex items-center gap-1">
               <ArrowDownRight className="w-4 h-4" />
               بناءً على الفترة المحددة
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50 border border-slate-100">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-bold text-slate-500">عدد العمليات</CardTitle>
             <div className="text-3xl font-black text-slate-900 mt-1">{expenses.length} عملية</div>
          </CardHeader>
          <CardContent>
             <div className="text-xs font-bold text-slate-400">نثريات ورواتب وإيجارات</div>
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
             <Button variant="ghost" size="sm" className="font-bold gap-2">
                <Download className="w-4 h-4" />
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
                    <div className="font-black text-rose-600 text-lg tracking-tight">
                      {expense.amount.toLocaleString('ar-EG')} ج.م
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
                  <TableCell colSpan={5} className="text-center py-24">
                     <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full">
                           <Receipt className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="font-bold text-slate-400 text-lg">لا توجد مصروفات مسجلة حالياً</div>
                        <Button variant="outline" size="sm" className="mt-2">تسجيل أول مصروف</Button>
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
