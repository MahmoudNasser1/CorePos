import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getInvoices, getInvoiceById, createSaleInvoice, createPurchaseInvoice } from "@/lib/actions/invoices"

export function useInvoices(filters?: any) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoices(filters)
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id
  })
}

export function useCreateSaleInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => createSaleInvoice(data.invoice, data.items, data.payments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    }
  })
}
