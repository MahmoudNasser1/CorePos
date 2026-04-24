import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Customer, HeldCart, Product, POSSummary } from '@/types/pos.types'
import { v4 as uuidv4 } from 'uuid'

interface POSState {
  cart: CartItem[]
  customer: Customer | null
  priceList: 1 | 2 | 3
  discountType: 'amount' | 'percent'
  discountValue: number
  notes: string
  heldCarts: HeldCart[]
  isProcessing: boolean
  vatRate: number // Default tax rate

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateItemPrice: (productId: string, price: number) => void
  updateItemDiscount: (productId: string, discount: number, type: 'amount' | 'percent') => void
  setCustomer: (customer: Customer | null) => void
  setPriceList: (list: 1 | 2 | 3) => void
  setDiscount: (type: 'amount' | 'percent', value: number) => void
  setNotes: (notes: string) => void
  holdCart: () => void
  resumeCart: (id: string) => void
  deleteHeldCart: (id: string) => void
  clearCart: () => void
  setProcessing: (status: boolean) => void
  setVatRate: (rate: number) => void
  setHeldCarts: (carts: HeldCart[]) => void

  // Helper for computing totals
  getSummary: () => POSSummary
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      customer: null,
      priceList: 1,
      discountType: 'amount',
      discountValue: 0,
      notes: '',
      heldCarts: [],
      isProcessing: false,
      vatRate: 14, // Default

      addItem: (product: Product) => {
        if (!product || !product.id) {
          console.warn('POS Store: Attempted to add invalid product:', product)
          return
        }

        const { cart, priceList } = get()
        const existingItem = cart.find((item) => item.id === product.id)
        
        // Get price based on selected price list with safe fallback
        const unitPrice = priceList === 1 ? (product.price1 || 0) : 
                          priceList === 2 ? (product.price2 || 0) : 
                          (product.price3 || 0)
        
        console.log(`POS Store: Adding product ${product.id} (${product.name}) with price ${unitPrice}`)

        if (existingItem) {
          get().updateQty(product.id, existingItem.quantity + 1)
        } else {
          const newItem: CartItem = {
            ...product,
            quantity: 1,
            unit_price: Number(unitPrice) || 0,
            lineTotal: Number(unitPrice) || 0,
            discountAmount: 0,
            discountType: 'amount'
          }
          set({ cart: [...cart, newItem] })
        }
      },

      removeItem: (productId: string) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) })
      },

      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          cart: get().cart.map((item) =>
            item.id === productId 
              ? { ...item, quantity: qty, lineTotal: (item.unit_price || 0) * qty - (item.discountAmount || 0) } 
              : item
          ),
        })
      },

      updateItemPrice: (productId: string, price: number) => {
        set({
          cart: get().cart.map((item) =>
            item.id === productId 
              ? { ...item, unit_price: price, lineTotal: price * item.quantity - (item.discountAmount || 0) } 
              : item
          ),
        })
      },

      updateItemDiscount: (productId: string, discount: number, type: 'amount' | 'percent') => {
        set({
          cart: get().cart.map((item) => {
            if (item.id === productId) {
              const discAmount = type === 'percent' 
                ? ((item.unit_price || 0) * item.quantity * discount) / 100 
                : discount
              return { 
                ...item, 
                discountAmount: discAmount, 
                discountType: type,
                lineTotal: (item.unit_price || 0) * item.quantity - discAmount 
              }
            }
            return item
          }),
        })
      },

      setCustomer: (customer) => set({ customer }),
      
      setPriceList: (list) => {
        set({ priceList: list })
      },

      setDiscount: (type, value) => set({ discountType: type, discountValue: value }),
      
      setNotes: (notes) => set({ notes }),

      holdCart: () => {
        // This is now mainly for local visual feedback
        // The actual DB call will be in the component
        const { cart, customer, heldCarts, notes } = get()
        if (cart.length === 0) return
        
        const newHeldCart: HeldCart = {
          id: uuidv4(),
          items: [...cart],
          customer,
          createdAt: new Date().toISOString(),
          notes
        }
        
        set({ 
          heldCarts: [newHeldCart, ...heldCarts],
          cart: [],
          customer: null,
          notes: '',
          discountValue: 0
        })
      },

      resumeCart: (id: string) => {
        const { heldCarts } = get()
        const held = heldCarts.find(h => h.id === id)
        if (!held) return
        
        set({
          cart: held.items,
          customer: held.customer,
          notes: held.notes || '',
          heldCarts: heldCarts.filter(h => h.id !== id)
        })
      },

      setHeldCarts: (carts) => set({ heldCarts: carts }),

      deleteHeldCart: (id: string) => {
        set({ heldCarts: get().heldCarts.filter(h => h.id !== id) })
      },

      clearCart: () => set({ 
        cart: [], 
        customer: null, 
        discountValue: 0, 
        notes: '',
        isProcessing: false 
      }),

      setProcessing: (status) => set({ isProcessing: status }),
      
      setVatRate: (rate) => set({ vatRate: rate }),

      getSummary: (): POSSummary => {
        const { cart, discountType, discountValue, vatRate } = get()
        
        const subtotal = cart.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0)
        
        const itemsDiscount = cart.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
        
        const cartDiscountAmount = discountType === 'percent' 
          ? (subtotal - itemsDiscount) * (discountValue / 100) 
          : discountValue
          
        const totalDiscount = itemsDiscount + cartDiscountAmount
        const netBeforeTax = subtotal - totalDiscount
        const taxAmount = (netBeforeTax * vatRate) / 100
        const total = netBeforeTax + taxAmount
        
        return {
          subtotal,
          taxAmount,
          discountAmount: totalDiscount,
          total,
          itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    }),
    {
      name: 'core-pos-store',
      partialize: (state) => ({ 
        heldCarts: state.heldCarts,
        vatRate: state.vatRate
        // We don't necessarily want to persist the active cart across page refreshes 
        // if user closes browser, but for POS it might be good.
        // For now, let's persist the cart too.
      }),
    }
  )
)
