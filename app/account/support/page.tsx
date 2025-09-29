import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SupportTicketForm } from "@/components/support-ticket-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function SupportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Customer Support</h1>
          <p className="text-muted-foreground">Get help with your orders and account</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Create Ticket Form */}
          <div className="lg:col-span-2">
            <SupportTicketForm />

            {/* Existing Tickets */}
            <div className="mt-8">
              <h2 className="text-2xl font-serif font-bold mb-4">Your Support Tickets</h2>
              {tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                          </div>
                          <Badge
                            variant={ticket.status === "resolved" || ticket.status === "closed" ? "outline" : "default"}
                            className="ml-4"
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">Priority: {ticket.priority}</span>
                            <span className="capitalize">Category: {ticket.category}</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                          <Link
                            href={`/account/support/${ticket.id}`}
                            className="text-sm text-primary hover:underline font-semibold"
                          >
                            View Details
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">No support tickets yet</CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Help Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Us</h4>
                  <p className="text-sm text-muted-foreground mb-1">Phone: (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Email: support@maharlika.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Business Hours</h4>
                  <p className="text-sm text-muted-foreground">Mon-Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/faq#delivery" className="block text-sm hover:text-primary">
                  How long does delivery take?
                </Link>
                <Link href="/faq#returns" className="block text-sm hover:text-primary">
                  What is your return policy?
                </Link>
                <Link href="/faq#rewards" className="block text-sm hover:text-primary">
                  How do loyalty rewards work?
                </Link>
                <Link href="/faq#payment" className="block text-sm hover:text-primary">
                  What payment methods do you accept?
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
