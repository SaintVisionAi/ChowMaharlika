import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant={order.status === "delivered" ? "outline" : "default"} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-primary text-xl">${order.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Method</p>
                      <p className="font-semibold capitalize">{order.delivery_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-semibold capitalize">{order.payment_method}</p>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm text-primary hover:underline font-semibold"
                    >
                      View Details
                    </Link>
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <Link
                        href={`/account/support?order=${order.id}`}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        Need Help?
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Link href="/seafood" className="text-primary hover:underline font-semibold">
                Start Shopping
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
