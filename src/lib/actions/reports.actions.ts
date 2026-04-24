"use server"

import { createClient } from "@/lib/supabase/server"
import { startOfDay, endOfDay, format } from "date-fns"
import { isBackendEnabled } from "@/lib/api/feature-flags"
import { reportsApi } from "@/lib/api/reports"

export async function getDashboardStats() {
  if (isBackendEnabled('reports')) {
    try {
      const data = await reportsApi.getDaily() as any
      if (data) {
        return {
          todaySales: data.sales,
          salesCount: 0, 
          salesChange: "0.0",
          profitChange: "0.0",
          treasuryBalance: 0,
          lowStockCount: 0,
          profit: data.profits
        }
      }
    } catch (error) {
      console.error('Dashboard Stats Backend Error:', error)
      // Fall through to Supabase fallback
    }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) throw new Error("No profile found")

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 1. Get Today's Sales from v_daily_summary
  const { data: todaySummary } = await (supabase.from('v_daily_summary') as any)
    .select('*')
    .eq('date', today)
    .eq('branch_id', (profile as any).branch_id)
    .maybeSingle() as any

  const { data: yesterdaySummary } = await (supabase.from('v_daily_summary') as any)
    .select('*')
    .eq('date', yesterday)
    .eq('branch_id', (profile as any).branch_id)
    .maybeSingle() as any

  // 2. Get Treasury Balance
  const { data: treasury } = await (supabase.from('treasuries') as any)
    .select('balance')
    .eq('company_id', (profile as any).company_id)
    .eq('is_default', true)
    .single() as any

  // 3. Get Low Stock Count
  const { count: lowStockCount } = await (supabase.from('v_stock_report') as any)
    .select('id', { count: 'exact', head: true })
    .eq('low_stock', true) as any

  // Calculate changes
  const salesChange = yesterdaySummary?.total_sales 
    ? ((todaySummary?.total_sales || 0) - yesterdaySummary.total_sales) / yesterdaySummary.total_sales * 100
    : 0

  const profitChange = yesterdaySummary?.net_sales && yesterdaySummary?.total_purchases !== undefined
    ? ((todaySummary?.net_sales - todaySummary?.total_purchases) - (yesterdaySummary.net_sales - yesterdaySummary.total_purchases)) / (yesterdaySummary.net_sales - yesterdaySummary.total_purchases) * 100
    : 0

  return {
    todaySales: todaySummary?.total_sales || 0,
    salesCount: todaySummary?.sales_count || 0,
    salesChange: salesChange.toFixed(1),
    profitChange: profitChange.toFixed(1),
    treasuryBalance: treasury?.balance || 0,
    lowStockCount: lowStockCount || 0,
    profit: (todaySummary?.net_sales || 0) - (todaySummary?.total_purchases || 0) || 0
  }
}

export async function getTopProducts() {
  if (isBackendEnabled('reports')) {
    try {
      const data = await reportsApi.getTopProducts() as any
      return data || []
    } catch (e) { console.error(e) }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) return []

  const { data } = await (supabase.from('v_top_selling_products') as any)
    .select('*')
    .eq('company_id', (profile as any).company_id)
    .limit(5) as any

  return data || []
}

export async function getSalesChartData() {
  if (isBackendEnabled('reports')) {
    try {
      const data = await reportsApi.getTrend() as any
      if (data) {
        return (data || []).map((item: any) => ({
          date: item.date,
          total_sales: Number(item.total_sales || 0)
        }))
      }
    } catch (e) { console.error(e) }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) return []

  const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const { data } = await (supabase.from('v_daily_summary') as any)
    .select('date, total_sales')
    .eq('branch_id', (profile as any).branch_id)
    .gte('date', last7Days)
    .order('date', { ascending: true }) as any

  return data || []
}

export async function getRecentInvoices() {
  if (isBackendEnabled('reports')) {
    try {
      const data = await reportsApi.getSales() as any
      return data || []
    } catch (e) { console.error(e) }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) return []

  const { data } = await supabase
    .from('invoices' as any)
    .select('*')
    .eq('company_id', (profile as any).company_id)
    .order('created_at', { ascending: false })
    .limit(5) as any

  return data || []
}

export async function getLowStockProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('v_stock_report')
    .select('*')
    .eq('low_stock', true)
    .limit(5)

  return data || []
}

export async function getDailyReport(filters: any) {
  const supabase = await createClient()
  const { fromDate, toDate, branchId } = filters
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let query = supabase
    .from("v_daily_summary" as any)
    .select("*")
    .order("date", { ascending: false })

  if (fromDate) query = query.gte("date", fromDate.toISOString().split("T")[0])
  if (toDate) query = query.lte("date", toDate.toISOString().split("T")[0])
  if (branchId) query = query.eq("branch_id", branchId)

  const { data, error } = await query
  if (error) throw error

  // Summary row
  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      total_sales: (acc.total_sales || 0) + (row.total_sales || 0),
      total_purchases: (acc.total_purchases || 0) + (row.total_purchases || 0),
      sales_count: (acc.sales_count || 0) + (row.sales_count || 0),
    }),
    { total_sales: 0, total_purchases: 0, sales_count: 0 }
  ) as any

  return { data, totals }
}

export async function getStockReport(filters: any) {
  if (isBackendEnabled('reports')) {
    const data = await reportsApi.getStock() as any
    if (data) return { data, totals: { stock_value: 0, qty: 0 } }
  }
  const supabase = await createClient()
  const { warehouseId, lowStockOnly } = filters

  let query = (supabase.from("v_stock_report") as any).select("*").order("name")

  if (warehouseId) query = query.eq("warehouse_id", warehouseId)
  if (lowStockOnly) query = query.eq("low_stock", true)

  const { data, error } = await query
  if (error) throw error

  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      stock_value: (acc.stock_value || 0) + (row.stock_value || 0),
      qty: (acc.qty || 0) + (row.qty || 0),
    }),
    { stock_value: 0, qty: 0 }
  ) as any

  return { data, totals }
}

export async function getCustomerBalances() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles" as any)
    .select("company_id")
    .eq("id", user.id)
    .single()

  const { data, error } = await supabase
    .from("customers" as any)
    .select("id, name, phone, balance, updated_at")
    .eq("company_id", (profile as any).company_id)
    .order("balance", { ascending: false }) as any

  if (error) throw error

  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      balance: (acc.balance || 0) + (row.balance || 0),
    }),
    { balance: 0 }
  ) as any

  return { data, totals }
}

export async function getSupplierBalances() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles" as any)
    .select("company_id")
    .eq("id", user.id)
    .single()

  const { data, error } = await supabase
    .from("suppliers" as any)
    .select("id, name, phone, balance, updated_at")
    .eq("company_id", (profile as any).company_id)
    .order("balance", { ascending: false }) as any

  if (error) throw error

  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      balance: (acc.balance || 0) + (row.balance || 0),
    }),
    { balance: 0 }
  ) as any

  return { data, totals }
}

export async function getTreasuryMovement(filters: any) {
  const supabase = await createClient()
  const { fromDate, toDate, treasuryId } = filters

  let query = supabase
    .from("treasury_transactions" as any)
    .select(
      `
      *,
      profiles(full_name)
    `
    )
    .order("created_at", { ascending: false })

  if (fromDate) query = query.gte("date", fromDate.toISOString().split("T")[0])
  if (toDate) query = query.lte("date", toDate.toISOString().split("T")[0])
  if (treasuryId) query = query.eq("treasury_id", treasuryId)

  const { data, error } = await query
  if (error) throw error

  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      amount_in: (acc.amount_in || 0) + (row.type === "in" ? row.amount : 0),
      amount_out: (acc.amount_out || 0) + (row.type === "out" ? row.amount : 0),
    }),
    { amount_in: 0, amount_out: 0 }
  ) as any

  return { data, totals }
}

export async function getProfitReport(filters: any) {
  const supabase = await createClient()
  const { fromDate, toDate, branchId } = filters

  let query = (supabase.from("v_invoice_profits") as any).select("*").order("created_at", { ascending: false })

  if (fromDate) query = query.gte("created_at", fromDate.toISOString())
  if (toDate) query = query.lte("created_at", toDate.toISOString())
  if (branchId) query = query.eq("branch_id", branchId)

  const { data, error } = await query
  if (error) throw error

  const totals = (data as any[])?.reduce(
    (acc, row) => ({
      total_sales: (acc.total_sales || 0) + (row.total_sales || 0),
      total_cost: (acc.total_cost || 0) + (row.total_cost || 0),
      gross_profit: (acc.gross_profit || 0) + (row.gross_profit || 0),
    }),
    { total_sales: 0, total_cost: 0, gross_profit: 0 }
  ) as any

  return { data, totals }
}

/**
 * تقرير المصروفات
 */
export async function getExpensesReport(params: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle() as any;

  if (!profile) return [];

  let query = supabase
    .from('expenses' as any)
    .select(`
      id, amount, date, notes,
      expense_categories (name),
      branches (name)
    `)
    .eq('company_id', profile.company_id)
    .order('date', { ascending: false });

  if (params.startDate) query = query.gte('date', params.startDate);
  if (params.endDate) query = query.lte('date', params.endDate);
  if (params.categoryId) query = query.eq('category_id', params.categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * تقرير الأرباح والخسائر (Income Statement)
 */
export async function getProfitLossData(companyId: string, startDate: string, endDate: string) {
  const supabase = await createClient();

  // 1. المبيعات
  const { data: sales } = await supabase
    .from('invoices' as any)
    .select('total, tax_amount')
    .eq('company_id', companyId)
    .eq('type', 'sale')
    .gte('date', startDate)
    .lte('date', endDate);

  // 2. تكلفة المخزون المباع (COGS)
  const { data: profits } = await supabase
    .from('v_invoice_profits' as any)
    .select('gross_profit, total')
    .gte('date', startDate)
    .lte('date', endDate);

  // 3. المصروفات
  const { data: expenses } = await supabase
    .from('expenses' as any)
    .select('amount')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate);

  const totalSales = (sales as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;
  const totalVAT = (sales as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.tax_amount), 0) || 0;
  
  // COGS = Sales - Gross Profit
  const totalGrossProfit = (profits as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.gross_profit), 0) || 0;
  const totalCOGS = totalSales - totalGrossProfit;
  
  const totalExpenses = (expenses as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

  const netProfit = totalGrossProfit - totalExpenses;

  return {
    totalSales,
    totalVAT,
    totalCOGS,
    totalExpenses,
    grossProfit: totalGrossProfit,
    netProfit,
  };
}

/**
 * تقرير المبيعات التفصيلي
 */
export async function getSalesReport(params: {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}) {
  if (isBackendEnabled('reports')) {
    const data = await reportsApi.getSales() as any
    return data
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('invoices' as any)
    .select(`
      id, invoice_number, date, total, tax_amount, discount_amount, paid, remaining, status,
      customers (name),
      profiles!invoices_cashier_id_fkey (full_name)
    `)
    .eq('company_id', (profile as any)?.company_id)
    .eq('type', 'sale')
    .order('date', { ascending: false });

  if (params.startDate) query = query.gte('date', params.startDate);
  if (params.endDate) query = query.lte('date', params.endDate);
  if (params.branchId) query = query.eq('branch_id', params.branchId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * تقرير الأرباح والخسائر المتقدم من الـ View
 */
export async function getPremiumProfitLoss(params: {
  startDate?: string,
  endDate?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('v_profit_loss_summary' as any)
    .select('*')
    .eq('company_id', (profile as any)?.company_id)

  if (params.startDate) query = query.gte('period_date', params.startDate)
  if (params.endDate) query = query.lte('period_date', params.endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * جلب سجل العمليات
 */
export async function getAuditLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  const { data, error } = await supabase
    .from('audit_logs' as any)
    .select(`
      *,
      profiles (full_name)
    `)
    .eq('company_id', (profile as any)?.company_id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}

/**
 * تقرير الضريبة
 */
export async function getTaxReport(params: {
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) return [];

  let query = supabase
    .from('invoices' as any)
    .select(`
      id, invoice_number, date, total, tax_amount, type,
      customers (name)
    `)
    .eq('company_id', (profile as any).company_id)
    .neq('tax_amount', 0)
    .order('date', { ascending: false });

  if (params.startDate) query = query.gte('date', params.startDate);
  if (params.endDate) query = query.lte('date', params.endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * تقرير حركة الأصناف
 */
export async function getStockMovementReport(params: {
  startDate?: string;
  endDate?: string;
  productId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) return [];

  let query = supabase
    .from('invoice_items' as any)
    .select(`
      id, qty, unit_price, total_line,
      invoices!inner (
        id, invoice_number, date, type, status, company_id
      ),
      products (name)
    `)
    .eq('invoices.company_id', (profile as any).company_id);

  if (params.startDate) query = query.gte('invoices.date', params.startDate);
  if (params.endDate) query = query.lte('invoices.date', params.endDate);
  if (params.productId) query = query.eq('product_id', params.productId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

