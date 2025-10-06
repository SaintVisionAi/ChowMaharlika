"use client"

import { motion } from "framer-motion"
import { useCart } from "@/lib/cart-context"
import { Sparkles, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VirtualReceipt() {
  const { items, total, itemCount, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
          <Sparkles className="h-8 w-8 text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try asking SaintAthena for recommendations!
        </p>
      </div>
    )
  }

  const subtotal = total
  const tax = total * 0.08 // 8% tax estimate
  const finalTotal = subtotal + tax

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Receipt Header */}
      <div className="relative overflow-hidden rounded-t-2xl bg-white p-6 shadow-lg border-2 border-pink-200">
        {/* Cherry blossom decoration */}
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="120" height="120" viewBox="0 0 120 120" className="fill-pink-500">
            <path d="M60,80 C60,80 30,65 15,50 C0,35 0,15 15,15 C30,15 45,30 60,45 C75,30 90,15 105,15 C120,15 120,35 105,50 C90,65 60,80 60,80 Z" />
            <path d="M60,30 C60,30 40,20 30,10 C20,0 20,-10 30,-10 C40,-10 50,0 60,10 C70,0 80,-10 90,-10 C100,-10 100,0 90,10 C80,20 60,30 60,30 Z" />
          </svg>
        </div>

        {/* Header Text */}
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🌸</span>
            <h2 className="text-2xl font-bold text-gray-900">Maharlika Seafood</h2>
            <span className="text-2xl">🌸</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-pink-500" />
            <span>SaintAthena's Shopping List</span>
          </div>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="bg-white border-x-2 border-pink-200 p-6 pt-0">
        <div className="border-b-2 border-dashed border-pink-200 pb-4 mb-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-400">✓</span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="ml-5 flex items-center gap-2 text-xs text-gray-500">
                    <span>Qty: {item.quantity}</span>
                    <span>×</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subtotal */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-mono text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (estimated):</span>
            <span className="font-mono text-gray-900">${tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-pink-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">TOTAL:</span>
            </div>
            <motion.span
              key={finalTotal}
              initial={{ scale: 1.1, color: "#FFD700" }}
              animate={{ scale: 1, color: "#111827" }}
              className="text-2xl font-bold font-mono"
            >
              ${finalTotal.toFixed(2)}
            </motion.span>
          </div>
        </div>

        {/* Item Count */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      {/* Receipt Footer */}
      <div className="rounded-b-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 p-4 shadow-lg border-2 border-t-0 border-pink-200">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-900">
            🌸 Thank you for shopping with us! 🌸
          </p>
          <p className="mt-1 text-xs text-gray-700">
            Powered by SaintAthena AI Shopping Assistant
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-6">
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white font-bold py-6 text-lg shadow-xl"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Continue to Checkout
        </Button>
      </div>
    </div>
  )
}
