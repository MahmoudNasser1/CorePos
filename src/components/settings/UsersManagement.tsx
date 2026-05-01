"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  KeyRound,
  Pencil,
  Search,
  CheckCircle2,
  Copy,
} from "lucide-react"
import { AdminUser, AdminBranch } from "@/lib/api/admin"
import { toast } from "sonner"
import {
  createCompanyUser,
  updateCompanyUser,
  toggleCompanyUserActive,
  resetCompanyUserPassword,
} from "@/lib/actions/settings.actions"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { PermissionGuard } from "@/components/shared/PermissionGuard"

interface UsersManagementProps {
  initialUsers: AdminUser[]
  branches: AdminBranch[]
}

export function UsersManagement({ initialUsers, branches }: UsersManagementProps) {
  const [search, setSearch] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [isPasswordResultOpen, setIsPasswordResultOpen] = useState(false)
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [reasonAction, setReasonAction] = useState<"toggle" | "reset" | "update" | null>(null)
  const [reason, setReason] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "cashier",
    branchId: "none",
    password: "",
  })

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    try {
      setIsLoading(true)
      const payloadBranchId = formData.branchId === "none" ? undefined : formData.branchId
      await createCompanyUser({ ...formData, branchId: payloadBranchId })
      toast.success("تم إنشاء المستخدم بنجاح")
      setIsAddDialogOpen(false)
      setFormData({ email: "", fullName: "", role: "cashier", branchId: "none", password: "" })
    } catch (error: any) {
      toast.error(error.message || "فشل في إنشاء المستخدم")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser) return
    try {
      setIsLoading(true)
      const payloadBranchId = formData.branchId === "none" ? null : formData.branchId
      await updateCompanyUser(selectedUser.id, { ...formData, branchId: payloadBranchId, reason })
      toast.success("تم تحديث بيانات المستخدم")
      setIsEditDialogOpen(false)
      setIsReasonDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "فشل في تحديث البيانات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!selectedUser) return
    try {
      setIsLoading(true)
      await toggleCompanyUserActive(selectedUser.id, reason)
      toast.success(selectedUser.isActive ? "تم تعطيل الحساب" : "تم تفعيل الحساب")
      setIsReasonDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "فشل في تغيير الحالة")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return
    try {
      setIsLoading(true)
      const res = await resetCompanyUserPassword(selectedUser.id, reason)
      setTempPassword(res.data.tempPassword)
      setIsPasswordResultOpen(true)
      setIsReasonDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "فشل في إعادة تعيين كلمة المرور")
    } finally {
      setIsLoading(false)
    }
  }

  const openReasonDialog = (user: AdminUser, action: "toggle" | "reset" | "update") => {
    setSelectedUser(user)
    setReasonAction(action)
    setReason("")
    setIsReasonDialogOpen(true)
  }

  const openEditDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId || "none",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث عن مستخدم..."
            className="pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <PermissionGuard permission="admin.users.manage">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            إضافة مستخدم جديد
          </Button>
        </PermissionGuard>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الفرع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الانضمام</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {user.role === "owner" ? "مالك النظام" : user.role === "admin" ? "مدير" : user.role === "manager" ? "مدير عمليات" : user.role === "accountant" ? "محاسب" : "كاشير"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{user.branchName || "غير محدد"}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : ""}>
                    {user.isActive ? "نشط" : "معطل"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ar })}
                </TableCell>
                <TableCell>
                  <PermissionGuard permission="admin.users.manage">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel className="text-right">الخيارات</DropdownMenuLabel>
                        <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => openReasonDialog(user, "reset")}>
                          <KeyRound className="h-4 w-4" />
                          إعادة كلمة المرور
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="flex-row-reverse gap-2 text-destructive focus:text-destructive" 
                          onClick={() => openReasonDialog(user, "toggle")}
                          disabled={user.role === "owner"}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          {user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </PermissionGuard>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  لا يوجد مستخدمين مطابقين للبحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">إضافة مستخدم جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات المستخدم الجديد وتعيين دوره الوظيفي.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 text-right">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input 
                id="fullName" 
                className="text-right" 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2 text-right">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                className="text-right" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
            <div className="grid gap-2 text-right">
              <Label htmlFor="password">كلمة المرور (اختياري)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="اتركه فارغاً للتوليد التلقائي" 
                className="text-right" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 text-right">
                <Label htmlFor="role">الدور الوظيفي</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="manager">مدير عمليات</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="cashier">كاشير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 text-right">
                <Label htmlFor="branch">الفرع</Label>
                <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="none">بدون فرع (للمدراء)</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button onClick={handleCreate} disabled={isLoading || !formData.email || !formData.fullName}>
              {isLoading ? "جاري الحفظ..." : "حفظ المستخدم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">تعديل مستخدم</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 text-right">
              <Label htmlFor="edit-fullName">الاسم الكامل</Label>
              <Input 
                id="edit-fullName" 
                className="text-right" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 text-right">
                <Label htmlFor="edit-role">الدور الوظيفي</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })} disabled={selectedUser?.role === "owner"}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="owner">مالك النظام</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="manager">مدير عمليات</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="cashier">كاشير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 text-right">
                <Label htmlFor="edit-branch">الفرع</Label>
                <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="none">بدون فرع (للمدراء)</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => openReasonDialog(selectedUser!, "update")} disabled={isLoading}>
              متابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reason Dialog (Audit Preparation) */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الإجراء</DialogTitle>
            <DialogDescription className="text-right">
              يرجى ذكر سبب هذا التغيير ليتم تسجيله في سجل التدقيق.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="مثلاً: تغيير في المهام الوظيفية" 
              className="text-right" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              variant={reasonAction === "toggle" ? "destructive" : "default"}
              onClick={() => {
                if (reasonAction === "toggle") handleToggle()
                if (reasonAction === "reset") handleResetPassword()
                if (reasonAction === "update") handleUpdate()
              }} 
              disabled={isLoading || !reason}
            >
              {isLoading ? "جاري المعالجة..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Result Dialog */}
      <Dialog open={isPasswordResultOpen} onOpenChange={setIsPasswordResultOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center justify-end gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              تمت إعادة تعيين كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-right">
              كلمة المرور المؤقتة الجديدة للمستخدم هي:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
            <Button variant="ghost" size="icon" onClick={() => {
              navigator.clipboard.writeText(tempPassword)
              toast.info("تم النسخ")
            }}>
              <Copy className="h-4 w-4" />
            </Button>
            <code className="flex-1 text-center font-mono text-xl font-bold tracking-wider">{tempPassword}</code>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            يرجى تزويد المستخدم بها وطلب تغييرها بعد أول تسجيل دخول.
          </p>
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsPasswordResultOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
