"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface SupportTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export function SupportTicketsTable({ tickets: initialTickets }: { tickets: SupportTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("support_tickets").update({ status: newStatus }).eq("id", ticketId)

      if (error) throw error

      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)))

      toast({
        title: "Ticket updated",
        description: `Ticket status changed to ${newStatus}.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating ticket:", error)
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      })
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "default",
      high: "default",
      urgent: "destructive",
    }

    return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "secondary",
      in_progress: "default",
      resolved: "outline",
      closed: "outline",
    }

    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>
  }

  if (tickets.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No support tickets yet</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{ticket.profiles?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{ticket.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                </div>
              </TableCell>
              <TableCell className="capitalize">{ticket.category}</TableCell>
              <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
              <TableCell className="text-sm">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
