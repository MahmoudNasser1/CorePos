import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  date,
  uniqueIndex,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// --- Enums ---
export const roleEnum = pgEnum('role', ['admin', 'manager', 'cashier', 'viewer'])
export const invoiceTypeEnum = pgEnum('invoice_type', [
  'sale',
  'purchase',
  'sale_return',
  'purchase_return',
  'quotation',
  'purchase_order',
  'stock_transfer',
])
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'confirmed',
  'partial',
  'paid',
  'void',
  'converted',
])
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card',
  'check',
  'transfer',
  'deferred',
])
export const txTypeEnum = pgEnum('tx_type', ['in', 'out', 'transfer'])

// --- 1. Companies & Branches ---
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  logoUrl: text('logo_url'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  taxNumber: text('tax_number'),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).default('0'),
  currency: text('currency').default('EGP'),
  /** Default branch for the company (used for UI defaults) */
  defaultBranchId: uuid('default_branch_id'),
  /** ISO 3166-1 alpha-2 — افتراضي مصر */
  countryCode: text('country_code').default('EG'),
  /** IANA timezone — للتقارير اليومية ولاحقاً الجدولة */
  timezone: text('timezone').default('Africa/Cairo'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// --- 2. Users & Profiles ---
// Using a local users table for self-hosted backend
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id),
  branchId: uuid('branch_id').references(() => branches.id),
  orgUnitId: uuid('org_unit_id'),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // admin, manager, cashier, viewer
  isActive: boolean('is_active').default(true),
  quickStartDismissed: boolean('quick_start_dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// --- 2.2 Org Units ---
export const orgUnits = pgTable(
  'org_units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    parentId: uuid('parent_id').references((): any => orgUnits.id as any),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniq: uniqueIndex('org_units_company_name_unique').on(table.companyId, table.name),
  }),
)

// --- 2.1 SaaS (minimal) ---
export const plans = pgTable('plans', {
  id: text('id').primaryKey(), // free/starter/pro
  name: text('name').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  planId: text('plan_id').references(() => plans.id).notNull(),
  status: text('status').default('trialing').notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// --- 3. Products & Inventory ---
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  parentId: uuid('parent_id').references((): any => categories.id as any), // Workaround for Drizzle self-reference
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

export const units = pgTable('units', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    categoryId: uuid('category_id').references(() => categories.id),
    unitId: uuid('unit_id').references(() => units.id),
    name: text('name').notNull(),
    nameEn: text('name_en'),
    barcode: text('barcode'),
    sku: text('sku'),
    description: text('description'),
    imageUrl: text('image_url'),
    price1: numeric('price1', { precision: 12, scale: 2 }).default('0'),
    price2: numeric('price2', { precision: 12, scale: 2 }).default('0'),
    price3: numeric('price3', { precision: 12, scale: 2 }).default('0'),
    costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0'),
    avgCost: numeric('avg_cost', { precision: 12, scale: 2 }).default('0'),
    minQty: numeric('min_qty', { precision: 12, scale: 3 }).default('0'),
    hasSerial: boolean('has_serial').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    barcodeUnique: uniqueIndex('idx_products_barcode_company').on(table.companyId, table.barcode),
    skuUnique: uniqueIndex('idx_products_sku_company').on(table.companyId, table.sku),
  }),
)

export const productStock = pgTable(
  'product_stock',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    warehouseId: uuid('warehouse_id')
      .references(() => warehouses.id, { onDelete: 'cascade' })
      .notNull(),
    qty: numeric('qty', { precision: 12, scale: 3 }).default('0'),
    avgCost: numeric('avg_cost', { precision: 12, scale: 2 }).default('0'),
  },
  (table) => ({
    pk: uniqueIndex('product_warehouse_unique').on(table.productId, table.warehouseId),
  }),
)

// --- 4. Contacts ---
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  taxNumber: text('tax_number'),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  taxNumber: text('tax_number'),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// --- 5. Invoices ---
export const invoiceSequences = pgTable(
  'invoice_sequences',
  {
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    type: text('invoice_type').notNull(),
    yearMonth: text('year_month').notNull(),
    lastNumber: integer('last_number').default(0),
  },
  (table) => ({
    cpk: primaryKey({ columns: [table.companyId, table.type, table.yearMonth] }),
  }),
)

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  invoiceNumber: text('invoice_number'),
  type: text('type').notNull(), // sale, purchase, sale_return, etc.
  status: text('status').default('confirmed'),
  customerId: uuid('customer_id').references(() => customers.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  cashierId: uuid('cashier_id').references(() => profiles.id),
  date: date('date').defaultNow(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).default('0'),
  paid: numeric('paid', { precision: 12, scale: 2 }).default('0'),
  remaining: numeric('remaining', { precision: 12, scale: 2 }).default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  qty: numeric('qty', { precision: 12, scale: 3 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0'),
  totalLine: numeric('total_line', { precision: 12, scale: 2 }).notNull(),
  profit: numeric('profit', { precision: 12, scale: 2 }).default('0'),
})

// --- 6. Treasuries ---
export const treasuries = pgTable('treasuries', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id),
  name: text('name').notNull(),
  type: text('type').default('cash'),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const treasuryTransactions = pgTable('treasury_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  treasuryId: uuid('treasury_id').references(() => treasuries.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  type: text('tx_type').notNull(), // in, out, transfer
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'), // cash, card, etc.
  referenceId: uuid('reference_id'),
  referenceType: text('reference_type'),
  notes: text('notes'),
  date: date('date').defaultNow(),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// --- 6.1 Expenses ---
export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  branchId: uuid('branch_id').references(() => branches.id),
  categoryId: uuid('category_id').references(() => expenseCategories.id),
  treasuryId: uuid('treasury_id').references(() => treasuries.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  date: date('date').defaultNow(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// --- 6.3 Variables (shared system reference values) ---
export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    /** Stable key used by POS/finance logic (cash/card/transfer/check/deferred, etc.) */
    code: text('code').notNull(),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniq: uniqueIndex('payment_methods_company_code_unique').on(table.companyId, table.code),
  }),
)

export const operationReasons = pgTable(
  'operation_reasons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    /** sale_return | purchase_return | void | discount | other */
    scope: text('scope').notNull(),
    label: text('label').notNull(),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    idx: uniqueIndex('operation_reasons_company_scope_label_unique').on(table.companyId, table.scope, table.label),
  }),
)

// --- 6.2 POS held carts ---
export const posHoldCarts = pgTable('pos_hold_carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  items: text('items').notNull(), // JSON string
  total: numeric('total', { precision: 12, scale: 2 }).default('0'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// --- 7. Idempotency keys (write deduplication) ---
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    key: text('key').notNull(),
    requestHash: text('request_hash'),
    responseJson: text('response_json'), // store as JSON string for simplicity in MVP
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniq: uniqueIndex('idempotency_company_key_unique').on(table.companyId, table.key),
  }),
)

// --- 8. Platform audit logs (platform-admin ops) ---
export const platformAuditLogs = pgTable('platform_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: uuid('target_id'),
  reason: text('reason'),
  metaJson: text('meta_json'),
  ip: text('ip'),
  requestId: text('request_id'),
  createdAt: timestamp('created_at').defaultNow(),
})
// --- Relations ---
export const companiesRelations = relations(companies, ({ many }) => ({
  branches: many(branches),
  profiles: many(profiles),
  products: many(products),
  customers: many(customers),
  suppliers: many(suppliers),
  categories: many(categories),
  units: many(units),
  treasuries: many(treasuries),
  expenseCategories: many(expenseCategories),
  expenses: many(expenses),
  posHoldCarts: many(posHoldCarts),
  invoices: many(invoices),
}))

export const branchesRelations = relations(branches, ({ one, many }) => ({
  company: one(companies, {
    fields: [branches.companyId],
    references: [companies.id],
  }),
  warehouses: many(warehouses),
  profiles: many(profiles),
  treasuries: many(treasuries),
  expenses: many(expenses),
  posHoldCarts: many(posHoldCarts),
  invoices: many(invoices),
}))

export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
  branch: one(branches, {
    fields: [warehouses.branchId],
    references: [branches.id],
  }),
  productStocks: many(productStock),
  invoices: many(invoices),
}))

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [profiles.companyId],
    references: [companies.id],
  }),
  branch: one(branches, {
    fields: [profiles.branchId],
    references: [branches.id],
  }),
  orgUnit: one(orgUnits, {
    fields: [profiles.orgUnitId],
    references: [orgUnits.id],
  }),
  invoices: many(invoices),
  posHoldCarts: many(posHoldCarts),
}))

export const orgUnitsRelations = relations(orgUnits, ({ one, many }) => ({
  company: one(companies, { fields: [orgUnits.companyId], references: [companies.id] }),
  parent: one(orgUnits, { fields: [orgUnits.parentId], references: [orgUnits.id] }),
  members: many(profiles),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  company: one(companies, {
    fields: [categories.companyId],
    references: [companies.id],
  }),
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
  subcategories: many(categories, {
    relationName: 'subcategories',
  }),
}))

export const unitsRelations = relations(units, ({ one, many }) => ({
  company: one(companies, {
    fields: [units.companyId],
    references: [companies.id],
  }),
  products: many(products),
}))

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  company: one(companies, {
    fields: [paymentMethods.companyId],
    references: [companies.id],
  }),
}))

export const operationReasonsRelations = relations(operationReasons, ({ one }) => ({
  company: one(companies, {
    fields: [operationReasons.companyId],
    references: [companies.id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  unit: one(units, {
    fields: [products.unitId],
    references: [units.id],
  }),
  stock: many(productStock),
  invoiceItems: many(invoiceItems),
}))

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, {
    fields: [productStock.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [productStock.warehouseId],
    references: [warehouses.id],
  }),
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  invoices: many(invoices),
  posHoldCarts: many(posHoldCarts),
}))

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  company: one(companies, {
    fields: [suppliers.companyId],
    references: [companies.id],
  }),
  invoices: many(invoices),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  branch: one(branches, {
    fields: [invoices.branchId],
    references: [branches.id],
  }),
  warehouse: one(warehouses, {
    fields: [invoices.warehouseId],
    references: [warehouses.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  supplier: one(suppliers, {
    fields: [invoices.supplierId],
    references: [suppliers.id],
  }),
  cashier: one(profiles, {
    fields: [invoices.cashierId],
    references: [profiles.id],
  }),
  items: many(invoiceItems),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}))

export const treasuriesRelations = relations(treasuries, ({ one, many }) => ({
  company: one(companies, {
    fields: [treasuries.companyId],
    references: [companies.id],
  }),
  branch: one(branches, {
    fields: [treasuries.branchId],
    references: [branches.id],
  }),
  transactions: many(treasuryTransactions),
  expenses: many(expenses),
}))

export const treasuryTransactionsRelations = relations(treasuryTransactions, ({ one }) => ({
  treasury: one(treasuries, {
    fields: [treasuryTransactions.treasuryId],
    references: [treasuries.id],
  }),
  company: one(companies, {
    fields: [treasuryTransactions.companyId],
    references: [companies.id],
  }),
  creator: one(profiles, {
    fields: [treasuryTransactions.createdBy],
    references: [profiles.id],
  }),
}))

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  company: one(companies, { fields: [expenseCategories.companyId], references: [companies.id] }),
  expenses: many(expenses),
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  company: one(companies, { fields: [expenses.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [expenses.branchId], references: [branches.id] }),
  category: one(expenseCategories, { fields: [expenses.categoryId], references: [expenseCategories.id] }),
  treasury: one(treasuries, { fields: [expenses.treasuryId], references: [treasuries.id] }),
  createdByProfile: one(profiles, { fields: [expenses.createdBy], references: [profiles.id] }),
}))

export const posHoldCartsRelations = relations(posHoldCarts, ({ one }) => ({
  company: one(companies, { fields: [posHoldCarts.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [posHoldCarts.branchId], references: [branches.id] }),
  customer: one(customers, { fields: [posHoldCarts.customerId], references: [customers.id] }),
  createdByProfile: one(profiles, { fields: [posHoldCarts.createdBy], references: [profiles.id] }),
}))
