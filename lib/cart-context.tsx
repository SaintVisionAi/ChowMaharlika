"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  category: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Omit<CartItem, "id">) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  itemCount: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Load cart from Supabase on mount
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase.from("cart_items").select("*").eq("user_id", user.id)

        if (error) throw error
        setItems(data || [])
      } else {
        // Load from localStorage for guest users
        const localCart = localStorage.getItem("cart")
        if (localCart) {
          setItems(JSON.parse(localCart))
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (product: Omit<CartItem, "id">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if item already exists
        const existingItem = items.find((item) => item.product_id === product.product_id)

        if (existingItem) {
          await updateQuantity(existingItem.id, existingItem.quantity + product.quantity)
        } else {
          const { data, error } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              ...product,
            })
            .select()
            .single()

          if (error) throw error
          setItems([...items, data])
        }
      } else {
        // Guest cart in localStorage
        const newItem = { ...product, id: Date.now().toString() }
        const updatedItems = [...items, newItem]
        setItems(updatedItems)
        localStorage.setItem("cart", JSON.stringify(updatedItems))
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

        if (error) throw error
      }

      const updatedItems = items.filter((item) => item.id !== itemId)
      setItems(updatedItems)
      localStorage.setItem("cart", JSON.stringify(updatedItems))

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", itemId)

        if (error) throw error
      }

      const updatedItems = items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      setItems(updatedItems)
      localStorage.setItem("cart", JSON.stringify(updatedItems))
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

        if (error) throw error
      }

      setItems([])
      localStorage.removeItem("cart")
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
