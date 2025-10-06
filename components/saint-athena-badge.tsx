"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"

interface SaintAthenaBadgeProps {
  onOpenPanel?: () => void
}

export function SaintAthenaBadge({ onOpenPanel }: SaintAthenaBadgeProps) {
  const { itemCount, total } = useCart()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button
        onClick={onOpenPanel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-lg shadow-pink-500/50 transition-all duration-300 group"
        aria-label="Open SaintAthena shopping assistant"
      >
        {/* Gold ring pulse animation */}
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-400"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Main icon */}
        <div className="relative z-10">
          <motion.div
            animate={{
              rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>

          {/* Item count badge */}
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900 shadow-md"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <div>
                  <div className="text-xs font-medium text-white">SaintAthena</div>
                  {itemCount > 0 ? (
                    <div className="text-xs text-gray-400">
                      {itemCount} {itemCount === 1 ? "item" : "items"} · $
                      {total.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Your shopping assistant</div>
                  )}
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1 rotate-45 bg-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Cherry blossom particles on hover */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-0 h-2 w-2 rounded-full bg-pink-300"
                initial={{
                  x: 32,
                  y: 32,
                  opacity: 0,
                }}
                animate={{
                  x: [32, Math.random() * 60 - 30, Math.random() * 80 - 40],
                  y: [32, -Math.random() * 40 - 20, -Math.random() * 60 - 30],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
