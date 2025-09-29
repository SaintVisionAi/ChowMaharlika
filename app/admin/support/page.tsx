import { createClient } from "@/lib/supabase/server"
import { SupportTicketsTable } from "@/components/admin/support-tickets-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminSupportPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")

  const { count: inProgressTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress")

  const { count: urgentTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("priority", "urgent")
    .neq("status", "resolved")
    .neq("status", "closed")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Customer Support</h1>
        <p className="text-muted-foreground">Manage customer support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTickets || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressTickets || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{urgentTickets || 0}</div>
          </CardContent>
        </Card>
      </div>

      <SupportTicketsTable tickets={tickets || []} />
    </div>
  )
}
