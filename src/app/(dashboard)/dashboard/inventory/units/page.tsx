import { getUnits } from "@/lib/actions/inventory.actions"
import { UnitsView, type UnitItem } from "./UnitsView"

export default async function UnitsPage() {
  const raw = await getUnits()
  const initialUnits: UnitItem[] = raw.map((u) => ({
    id: u.id,
    name: u.name,
    short_name: u.nameEn ?? null,
  }))
  return (
    <div className="p-6">
      <UnitsView initialUnits={initialUnits} />
    </div>
  )
}
