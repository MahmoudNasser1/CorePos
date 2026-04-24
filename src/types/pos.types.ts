export type Product = {
  id: string
  name: string
  name_en?: string | null
  barcode?: string | null
  sku?: string | null
  price1?: number | string | null
  price2?: number | string | null
  price3?: number | string | null
  cost_price?: number | string | null
  min_qty?: number | string | null
  is_active?: boolean | null
  stock?: number | null
  category_id?: string | null
  unit_id?: string | null
  image_url?: string | null
  company_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Legacy/mock-data fields and backend expansion:
  [key: string]: any
}

export type Customer = {
  id: string
  name: string
  phone?: string | null
  balance?: number | string | null
}

export interface CartItem extends Product {
  quantity: number
  unit_price: number
  customPrice?: number
  discountAmount: number
  discountType: 'amount' | 'percent'
  lineTotal: number
}

export interface HeldCart {
  id: string
  items: CartItem[]
  customer: Customer | null
  createdAt: string
  notes?: string
}

export interface POSSummary {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  itemsCount: number
}
