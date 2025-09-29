"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getDeliveryPlatformColor, getDeliveryPlatformName } from "@/lib/delivery-platforms"

interface DeliveryOrder {
  id: string
  platform: "grubhub" | "doordash" | "ubereats"
  external_order_id: string
  customer_name: string
  customer_phone?: string
  delivery_address: string
  total: number
  status: string
  created_at: string
  estimated_delivery_time?: string
}

export function DeliveryOrdersTable({ orders: initialOrders }: { orders: DeliveryOrder[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order")
      }

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
      picked_up: "default",
      delivered: "outline",
      cancelled: "destructive",
    }

    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>
  }

  if (orders.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No delivery orders yet</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Badge style={{ backgroundColor: getDeliveryPlatformColor(order.platform), color: "white" }}>
                  {getDeliveryPlatformName(order.platform)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">{order.external_order_id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  {order.customer_phone && <p className="text-sm text-muted-foreground">{order.customer_phone}</p>}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm">{order.delivery_address}</TableCell>
              <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-sm">
                {order.estimated_delivery_time
                  ? new Date(order.estimated_delivery_time).toLocaleTimeString()
                  : new Date(order.created_at).toLocaleTimeString()}
              </TableCell>
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
                    <SelectItem value="picked_up">Picked Up</SelectItem>
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
