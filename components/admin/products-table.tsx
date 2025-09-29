"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock_quantity: number
  unit: string
  is_available: boolean
}

export function ProductsTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues(product)
  }

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase.from("products").update(editValues).eq("id", id)

      if (error) throw error

      setProducts(products.map((p) => (p.id === id ? { ...p, ...editValues } : p)))
      setEditingId(null)

      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ is_available: !currentStatus }).eq("id", id)

      if (error) throw error

      setProducts(products.map((p) => (p.id === id ? { ...p, is_available: !currentStatus } : p)))

      toast({
        title: currentStatus ? "Product deactivated" : "Product activated",
        description: `Product has been ${currentStatus ? "deactivated" : "activated"}.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error toggling product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {editingId === product.id ? (
                  <Input
                    value={editValues.name || ""}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="max-w-xs"
                  />
                ) : (
                  <span className="font-medium">{product.name}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell>
                {editingId === product.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editValues.price || ""}
                    onChange={(e) => setEditValues({ ...editValues, price: Number.parseFloat(e.target.value) })}
                    className="max-w-[100px]"
                  />
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                {editingId === product.id ? (
                  <Input
                    type="number"
                    value={editValues.stock_quantity || ""}
                    onChange={(e) => setEditValues({ ...editValues, stock_quantity: Number.parseInt(e.target.value) })}
                    className="max-w-[100px]"
                  />
                ) : (
                  <span className={product.stock_quantity < 10 ? "text-destructive font-semibold" : ""}>
                    {product.stock_quantity} {product.unit}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={product.is_available ? "default" : "secondary"}>
                  {product.is_available ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {editingId === product.id ? (
                  <>
                    <Button size="sm" onClick={() => handleSave(product.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={product.is_available ? "secondary" : "default"}
                      onClick={() => handleToggleActive(product.id, product.is_available)}
                    >
                      {product.is_available ? "Deactivate" : "Activate"}
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
