import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: loyaltyAccount } = await supabase.from("loyalty_accounts").select("*").eq("user_id", user.id).single()

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "closed")

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and loyalty rewards</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{profile?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-semibold">{new Date(profile?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/account/edit">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Loyalty Status */}
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Status</CardTitle>
              <CardDescription>Your rewards tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary capitalize mb-2">
                  {loyaltyAccount?.tier || "Bronze"}
                </div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{loyaltyAccount?.points || 0}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/rewards">View Rewards</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/account/orders">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">📦</div>
                <p className="font-semibold">My Orders</p>
                <p className="text-sm text-muted-foreground">{recentOrders?.length || 0} orders</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/account/support">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="font-semibold">Support</p>
                <p className="text-sm text-muted-foreground">{openTickets?.count || 0} open tickets</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/rewards">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🎁</div>
                <p className="font-semibold">Rewards</p>
                <p className="text-sm text-muted-foreground">View benefits</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/account/settings">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <p className="font-semibold">Settings</p>
                <p className="text-sm text-muted-foreground">Preferences</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/account/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
