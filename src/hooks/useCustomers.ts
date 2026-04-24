import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCustomers, getCustomerById } from "@/lib/actions/customers.actions"

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers()
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id
  })
}
