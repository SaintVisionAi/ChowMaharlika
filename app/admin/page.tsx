import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get statistics
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: totalCustomers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("*")
    .lt("stock_quantity", 10)
    .eq("is_available", true)
    .order("stock_quantity")
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{order.profiles?.full_name || "Guest"}</p>
                    <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">
                      {product.stock_quantity} {product.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">Low stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">All products are well stocked</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
