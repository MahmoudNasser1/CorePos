"use client"

import React, { useState } from "react"
import { Shield, Save, Loader2, Info, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { patchRbac } from "@/lib/actions/rbac.actions"

const PERMISSION_GROUPS = [
  {
    name: "نقطة البيع (POS)",
    permissions: [
      { key: "pos.execute", label: "الوصول لواجهة البيع السريع" },
    ],
  },
  {
    name: "المخزون",
    permissions: [
      { key: "inventory.read", label: "عرض المخزون" },
      { key: "inventory.write", label: "إدارة المخزون (إضافة/تعديل)" },
    ],
  },
  {
    name: "المبيعات",
    permissions: [
      { key: "sales.read", label: "عرض المبيعات" },
      { key: "sales.write", label: "إجراء مبيعات" },
      { key: "sales.void", label: "إلغاء فواتير" },
      { key: "sales.discount", label: "تطبيق خصومات" },
    ],
  },
  {
    name: "العملاء والموردون",
    permissions: [
      { key: "customers.read", label: "عرض العملاء" },
      { key: "customers.write", label: "إضافة/تعديل العملاء" },
      { key: "suppliers.read", label: "عرض الموردين" },
      { key: "suppliers.write", label: "إضافة/تعديل الموردين" },
    ],
  },
  {
    name: "المشتريات",
    permissions: [
      { key: "purchases.read", label: "عرض المشتريات" },
      { key: "purchases.write", label: "إدارة المشتريات" },
    ],
  },
  {
    name: "المالية",
    permissions: [
      { key: "finance.read", label: "عرض المالية" },
      { key: "finance.write", label: "إدارة المالية" },
    ],
  },
  {
    name: "التقارير",
    permissions: [
      { key: "reports.read", label: "عرض التقارير" },
      { key: "reports.view_costs", label: "عرض التكاليف في التقارير" },
    ],
  },
  {
    name: "الفروع والمستودعات",
    permissions: [
      { key: "branches.manage", label: "إدارة الفروع" },
      { key: "warehouses.manage", label: "إدارة المستودعات" },
    ],
  },
  {
    name: "الإدارة والنظام",
    permissions: [
      { key: "admin.users.read", label: "عرض المستخدمين" },
      { key: "admin.users.manage", label: "إدارة المستخدمين" },
      { key: "admin.roles.manage", label: "إدارة الصلاحيات" },
      { key: "admin.settings.manage", label: "إعدادات الشركة" },
      { key: "admin.audit.read", label: "سجلات النظام" },
      { key: "billing.read", label: "عرض الفواتير والاشتراك" },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  owner: "مالك الحساب",
  admin: "مسؤول النظام",
  manager: "مدير عمليات",
  cashier: "كاشير",
  accountant: "محاسب",
}

export function RbacManager({ initialData }: { initialData: any }) {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(initialData.rolePermissions || {})
  const [overrides, setOverrides] = useState<any[]>(initialData.overrides || [])
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedPerm, setSelectedPerm] = useState<string>("")
  const [selectedEffect, setSelectedEffect] = useState<"allow" | "deny">("allow")

  const roles = initialData.roles || []
  const users = initialData.users || []

  const togglePermission = (roleId: string, permissionKey: string) => {
    setRolePermissions((prev) => {
      const current = prev[roleId] || []
      if (current.includes(permissionKey)) {
        return { ...prev, [roleId]: current.filter((k) => k !== permissionKey) }
      } else {
        return { ...prev, [roleId]: [...current, permissionKey] }
      }
    })
  }

  const handleSaveRole = async (roleId: string) => {
    setIsSaving(roleId)
    try {
      const res = await patchRbac({
        kind: "role_permissions",
        roleId,
        permissions: rolePermissions[roleId] || [],
        reason: "تحديث صلاحيات الدور",
      })
      if (res?.success) toast.success("تم الحفظ بنجاح")
      else toast.error(res?.message || "فشل الحفظ")
    } catch (error) {
      toast.error("خطأ في الاتصال")
    } finally {
      setIsSaving(null)
    }
  }

  const handleAddOverride = async () => {
    if (!selectedUser || !selectedPerm) return
    setIsSaving("override")
    try {
      const res = await patchRbac({
        kind: "user_override",
        userId: selectedUser,
        permissionKey: selectedPerm,
        effect: selectedEffect,
        reason: "إضافة استثناء يدوي",
      })
      if (res?.success) {
        toast.success("تمت إضافة الاستثناء")
        setOverrides([...overrides, { userId: selectedUser, permissionKey: selectedPerm, effect: selectedEffect }])
      } else {
        toast.error(res?.message || "فشل الإضافة")
      }
    } catch (error) {
      toast.error("خطأ في الاتصال")
    } finally {
      setIsSaving(null)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                مصفوفة الصلاحيات للأدوار
              </CardTitle>
              <CardDescription>تحكم في ما يمكن لكل دور وظيفي القيام به في النظام.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[200px] text-right font-bold py-6 px-6 bg-muted/20">الصلاحية</TableHead>
                  {roles.map((role: any) => (
                    <TableHead key={role.id} className="text-center min-w-[120px] py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {ROLE_LABELS[role.name] || role.name}
                        </span>
                        {role.isSystem && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            نظام
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] px-3 border-primary/20 hover:bg-primary/5 transition-colors"
                          disabled={isSaving === role.id || role.name === "owner" || role.name === "admin"}
                          onClick={() => handleSaveRole(role.id)}
                        >
                          {isSaving === role.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Save className="ml-1.5 h-3 w-3" />
                              حفظ
                            </>
                          )}
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_GROUPS.map((group) => (
                  <React.Fragment key={group.name}>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={roles.length + 1} className="text-right py-3 px-6 font-bold text-xs text-muted-foreground uppercase tracking-wider">
                        {group.name}
                      </TableCell>
                    </TableRow>
                    {group.permissions.map((perm) => (
                      <TableRow key={perm.key} className="hover:bg-primary/5 border-b transition-colors">
                        <TableCell className="text-right text-sm py-4 px-8 border-l border-muted/20">{perm.label}</TableCell>
                        {roles.map((role: any) => (
                          <TableCell key={`${role.id}-${perm.key}`} className="text-center py-4">
                            <Checkbox
                              checked={role.name === "owner" || role.name === "admin" || (rolePermissions[role.id] || []).includes(perm.key)}
                              onCheckedChange={() => togglePermission(role.id, perm.key)}
                              disabled={role.name === "owner" || role.name === "admin"}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            استثناءات المستخدمين
          </CardTitle>
          <CardDescription>إضافة صلاحيات محددة لمستخدم معين أو منعه من خاصية رغم صلاحيات دوره.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-xl border border-muted/50">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-xs font-bold mr-1">المستخدم</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">اختر مستخدماً...</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-xs font-bold mr-1">الصلاحية</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedPerm}
                onChange={(e) => setSelectedPerm(e.target.value)}
              >
                <option value="">اختر صلاحية...</option>
                {PERMISSION_GROUPS.flatMap(g => g.permissions).map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 w-[120px]">
              <label className="text-xs font-bold mr-1">التأثير</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedEffect}
                onChange={(e) => setSelectedEffect(e.target.value as any)}
              >
                <option value="allow">سماح</option>
                <option value="deny">منع</option>
              </select>
            </div>
            <Button 
              onClick={handleAddOverride} 
              disabled={isSaving === "override" || !selectedUser || !selectedPerm}
              className="gap-2"
            >
              {isSaving === "override" ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة استثناء"}
            </Button>
          </div>

          <div className="space-y-3">
            {overrides.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm italic">لا توجد استثناءات مخصصة حالياً.</p>
            ) : (
              <div className="grid gap-3">
                {overrides.map((ov, idx) => {
                  const user = users.find((u: any) => u.id === ov.userId)
                  const perm = PERMISSION_GROUPS.flatMap(g => g.permissions).find(p => p.key === ov.permissionKey)
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${ov.effect === 'allow' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-sm">{user?.fullName || ov.userId}</span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="text-sm">{perm?.label || ov.permissionKey}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${ov.effect === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ov.effect === 'allow' ? 'مسموح' : 'ممنوع'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300">ملاحظات حول الأمان:</h4>
            <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>أدوار "المالك" و "المدير" تمتلك كافة الصلاحيات تلقائياً لضمان عدم تعطل النظام.</li>
              <li>استثناءات المستخدمين لها أولوية أعلى من صلاحيات الدور الوظيفي.</li>
              <li>سيتم تسجيل كافة التغييرات في سجلات التدقيق (Audit Logs) للرجوع إليها لاحقاً.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
