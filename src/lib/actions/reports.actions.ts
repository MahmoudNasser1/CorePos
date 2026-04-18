"use server"

import { createClient } from "@/lib/supabase/server"
import { startOfDay, endOfDay, format } from "date-fns"

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No profile found")

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 1. Get Today's Sales from v_daily_summary
  const { data: todaySummary } = await supabase
    .from('v_daily_summary')
    .select('*')
    .eq('date', today)
    .eq('branch_id', profile.branch_id)
    .maybeSingle()

  const { data: yesterdaySummary } = await supabase
    .from('v_daily_summary')
    .select('*')
    .eq('date', yesterday)
    .eq('branch_id', profile.branch_id)
    .maybeSingle()

  // 2. Get Treasury Balance
  const { data: treasury } = await supabase
    .from('treasuries')
    .select('balance')
    .eq('company_id', profile.company_id)
    .eq('is_default', true)
    .single()

  // 3. Get Low Stock Count
  const { data: lowStock } = await supabase
    .from('v_stock_report')
    .select('id', { count: 'exact', head: true })
    .eq('low_stock', true)

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
    lowStockCount: lowStock?.count || 0,
    profit: (todaySummary?.net_sales || 0) - (todaySummary?.total_purchases || 0) || 0
  }
}

export async function getTopProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data } = await supabase
    .from('v_top_selling_products')
    .select('*')
    .eq('company_id', profile.company_id)
    .limit(5)

  return data || []
}

export async function getSalesChartData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('v_daily_summary')
    .select('date, total_sales')
    .eq('branch_id', profile.branch_id)
    .gte('date', last7Days)
    .order('date', { ascending: true })

  return data || []
}

export async function getRecentInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })
    .limit(5)

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
    .from("v_daily_summary")
    .select("*")
    .order("date", { ascending: false })

  if (fromDate) query = query.gte("date", fromDate.toISOString().split("T")[0])
  if (toDate) query = query.lte("date", toDate.toISOString().split("T")[0])
  if (branchId) query = query.eq("branch_id", branchId)

  const { data, error } = await query
  if (error) throw error

  // Summary row
  const totals = data?.reduce(
    (acc, row) => ({
      total_sales: (acc.total_sales || 0) + (row.total_sales || 0),
      total_purchases: (acc.total_purchases || 0) + (row.total_purchases || 0),
      sales_count: (acc.sales_count || 0) + (row.sales_count || 0),
    }),
    { total_sales: 0, total_purchases: 0, sales_count: 0 }
  )

  return { data, totals }
}

export async function getStockReport(filters: any) {
  const supabase = await createClient()
  const { warehouseId, lowStockOnly } = filters

  let query = supabase.from("v_stock_report").select("*").order("name")

  if (warehouseId) query = query.eq("warehouse_id", warehouseId)
  if (lowStockOnly) query = query.eq("low_stock", true)

  const { data, error } = await query
  if (error) throw error

  const totals = data?.reduce(
    (acc, row) => ({
      stock_value: (acc.stock_value || 0) + (row.stock_value || 0),
      qty: (acc.qty || 0) + (row.qty || 0),
    }),
    { stock_value: 0, qty: 0 }
  )

  return { data, totals }
}

export async function getCustomerBalances() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, balance, updated_at")
    .eq("company_id", profile.company_id)
    .order("balance", { ascending: false })

  if (error) throw error

  const totals = data?.reduce(
    (acc, row) => ({
      balance: (acc.balance || 0) + (row.balance || 0),
    }),
    { balance: 0 }
  )

  return { data, totals }
}

export async function getSupplierBalances() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, phone, balance, updated_at")
    .eq("company_id", profile.company_id)
    .order("balance", { ascending: false })

  if (error) throw error

  const totals = data?.reduce(
    (acc, row) => ({
      balance: (acc.balance || 0) + (row.balance || 0),
    }),
    { balance: 0 }
  )

  return { data, totals }
}

export async function getTreasuryMovement(filters: any) {
  const supabase = await createClient()
  const { fromDate, toDate, treasuryId } = filters

  let query = supabase
    .from("treasury_transactions")
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

  const totals = data?.reduce(
    (acc, row) => ({
      amount_in: (acc.amount_in || 0) + (row.type === "in" ? row.amount : 0),
      amount_out: (acc.amount_out || 0) + (row.type === "out" ? row.amount : 0),
    }),
    { amount_in: 0, amount_out: 0 }
  )

  return { data, totals }
}

export async function getProfitReport(filters: any) {
  const supabase = await createClient()
  const { fromDate, toDate, branchId } = filters

  let query = supabase.from("v_invoice_profits").select("*").order("created_at", { ascending: false })

  if (fromDate) query = query.gte("created_at", fromDate.toISOString())
  if (toDate) query = query.lte("created_at", toDate.toISOString())
  if (branchId) query = query.eq("branch_id", branchId)

  const { data, error } = await query
  if (error) throw error

  const totals = data?.reduce(
    (acc, row) => ({
      total_sales: (acc.total_sales || 0) + (row.total_sales || 0),
      total_cost: (acc.total_cost || 0) + (row.total_cost || 0),
      gross_profit: (acc.gross_profit || 0) + (row.gross_profit || 0),
    }),
    { total_sales: 0, total_cost: 0, gross_profit: 0 }
  )

  return { data, totals }
}

/**
 * تقرير المصروفات
 */
export async function getExpensesReport(params: {
  companyId: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('expenses')
    .select(`
      id, amount, date, notes,
      expense_categories (name),
      branches (name)
    `)
    .eq('company_id', params.companyId)
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
    .from('invoices')
    .select('total, tax_amount')
    .eq('company_id', companyId)
    .eq('type', 'sale')
    .gte('date', startDate)
    .lte('date', endDate);

  // 2. تكلفة المخزون المباع (COGS)
  const { data: profits } = await supabase
    .from('v_invoice_profits')
    .select('gross_profit, total')
    .gte('date', startDate)
    .lte('date', endDate);

  // 3. المصروفات
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate);

  const totalSales = sales?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
  const totalVAT = sales?.reduce((acc, curr) => acc + Number(curr.tax_amount), 0) || 0;
  
  // COGS = Sales - Gross Profit
  const totalGrossProfit = profits?.reduce((acc, curr) => acc + Number(curr.gross_profit), 0) || 0;
  const totalCOGS = totalSales - totalGrossProfit;
  
  const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('invoices')
    .select(`
      id, invoice_number, date, total, tax_amount, discount_amount, paid, remaining, status,
      customers (name),
      profiles!invoices_cashier_id_fkey (full_name)
    `)
    .eq('company_id', profile?.company_id)
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
    .from('v_profit_loss_summary')
    .select('*')
    .eq('company_id', profile?.company_id)

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
    .single()

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles (full_name)
    `)
    .eq('company_id', profile?.company_id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}
