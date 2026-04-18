import { Database } from './database.types'

export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']

export interface CartItem extends Product {
  quantity: number
  customPrice?: number
  discountAmount?: number
  discountType?: 'amount' | 'percent'
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
