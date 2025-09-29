import { createClient } from "@/lib/supabase/server"
import { OrdersTable } from "@/components/admin/orders-table"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email, phone)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  )
}
