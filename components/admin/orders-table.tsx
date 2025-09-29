"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  total_amount: number
  status: string
  delivery_method: string
  created_at: string
  profiles: {
    full_name: string
    email: string
    phone: string
  }
}

export function OrdersTable({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      preparing: "default",
      ready: "default",
      delivered: "outline",
      cancelled: "destructive",
    }

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.profiles?.full_name || "Guest"}</p>
                  <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{order.profiles?.phone || "N/A"}</TableCell>
              <TableCell className="font-semibold">${order.total_amount.toFixed(2)}</TableCell>
              <TableCell className="capitalize">{order.delivery_method}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
