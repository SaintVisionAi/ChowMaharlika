"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { toast as sonnerToast } from "sonner"

interface CartItem {
  name: string
  price: number
  quantity: number
}

interface ToastData {
  item: CartItem
  total: number
  itemCount: number
}

// Cherry blossom particle component
function CherryBlossom({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute w-3 h-3"
      initial={{
        x: Math.random() * 300 - 150,
        y: -20,
        opacity: 0,
        rotate: 0,
        scale: 0,
      }}
      animate={{
        y: [0, 100],
        x: [0, (Math.random() - 0.5) * 50],
        opacity: [0, 1, 0.8, 0],
        rotate: [0, 360],
        scale: [0, 1, 1, 0.5],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
      }}
    >
      <svg viewBox="0 0 20 20" className="fill-pink-400">
        <path d="M10,13 C10,13 6,11 4,9 C2,7 2,4 4,4 C6,4 8,6 10,8 C12,6 14,4 16,4 C18,4 18,7 16,9 C14,11 10,13 10,13 Z" />
      </svg>
    </motion.div>
  )
}

// Custom toast component
export function showSaintAthenaToast(data: ToastData) {
  const { item, total, itemCount } = data

  sonnerToast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative overflow-hidden rounded-xl bg-white shadow-2xl border-2 border-pink-200"
        style={{ width: "360px" }}
      >
        {/* Cherry blossom particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <CherryBlossom key={i} delay={i * 0.1} />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">SaintAthena</div>
              <div className="text-xs text-gray-500">Added to your cart</div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-100"
            >
              <Check className="h-4 w-4 text-green-600" />
            </motion.div>
          </div>

          {/* Item details */}
          <div className="mb-3 rounded-lg bg-pink-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="text-lg font-bold text-pink-600">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Cart summary */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{itemCount}</span> item
              {itemCount !== 1 ? "s" : ""} in cart
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Total:</span>
              <motion.span
                key={total}
                initial={{ scale: 1.2, color: "#FFD700" }}
                animate={{ scale: 1, color: "#111827" }}
                className="text-lg font-bold"
              >
                ${total.toFixed(2)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Bottom gold accent */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
      </motion.div>
    ),
    {
      duration: 2500,
      position: "bottom-right",
    }
  )
}

// Simple success toast
export function showSaintAthenaSuccess(message: string) {
  sonnerToast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg border-l-4 border-green-500"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{message}</div>
        </div>
      </motion.div>
    ),
    {
      duration: 2000,
      position: "bottom-right",
    }
  )
}

// Error toast
export function showSaintAthenaError(message: string) {
  sonnerToast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg border-l-4 border-red-500"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <span className="text-red-600 font-bold">!</span>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{message}</div>
        </div>
      </motion.div>
    ),
    {
      duration: 3000,
      position: "bottom-right",
    }
  )
}
