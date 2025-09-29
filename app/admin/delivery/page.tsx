import { createClient } from "@/lib/supabase/server"
import { DeliveryOrdersTable } from "@/components/admin/delivery-orders-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DeliveryOrdersPage() {
  const supabase = await createClient()

  const { data: deliveryOrders } = await supabase
    .from("delivery_orders")
    .select("*")
    .order("created_at", { ascending: false })

  // Get counts by platform
  const { data: grubhubOrders } = await supabase
    .from("delivery_orders")
    .select("*", { count: "exact", head: true })
    .eq("platform", "grubhub")
    .neq("status", "delivered")
    .neq("status", "cancelled")

  const { data: doordashOrders } = await supabase
    .from("delivery_orders")
    .select("*", { count: "exact", head: true })
    .eq("platform", "doordash")
    .neq("status", "delivered")
    .neq("status", "cancelled")

  const { data: ubereatsOrders } = await supabase
    .from("delivery_orders")
    .select("*", { count: "exact", head: true })
    .eq("platform", "ubereats")
    .neq("status", "delivered")
    .neq("status", "cancelled")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Delivery Orders</h1>
        <p className="text-muted-foreground">Manage orders from GrubHub, DoorDash, and Uber Eats</p>
      </div>

      {/* Platform Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">GrubHub Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#F63440" }}>
              {grubhubOrders?.count || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">DoorDash Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#FF3008" }}>
              {doordashOrders?.count || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Uber Eats Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#06C167" }}>
              {ubereatsOrders?.count || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>
      </div>

      <DeliveryOrdersTable orders={deliveryOrders || []} />
    </div>
  )
}
