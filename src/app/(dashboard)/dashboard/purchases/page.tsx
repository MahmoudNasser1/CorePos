import { redirect } from "next/navigation"

export default function PurchasesRootPage() {
  redirect("/dashboard/purchases/invoices")
}
