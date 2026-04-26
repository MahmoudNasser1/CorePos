import { redirect } from "next/navigation"

export default function SalesRootPage() {
  redirect("/dashboard/sales/invoices")
}
