"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Sparkles, Search, ShoppingCart, Loader2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/lib/cart-context"
import { showSaintAthenaToast, showSaintAthenaError } from "./saint-athena-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface SaintAthenaPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SaintAthenaPanel({ isOpen, onClose }: SaintAthenaPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm **SaintAthena**, your shopping assistant! 🌸\n\nI know all 2,300+ products in the store. You can:\n• Search for items (in English or Filipino!)\n• Give me a shopping list\n• Ask for deals and specials\n• Find alternatives for out-of-stock items\n\nTry: *\"hipon, salmon, rice\"* or *\"What's on sale today?\"*",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, searchResults])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setSearchResults([])

    try {
      // Detect if it's a shopping list (contains commas or multiple words)
      const isShoppingList = input.includes(",") || input.split(/\s+/).length > 5

      if (isShoppingList) {
        // Process as shopping list via chat API
        const response = await fetch("/api/saint-athena/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, mode: "list" }),
        })

        const data = await response.json()

        if (data.processedList) {
          const { processedList, summary } = data

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: summary,
              timestamp: Date.now(),
            },
          ])

          // Show cart items as quick-add buttons
          if (processedList.items.length > 0) {
            setSearchResults(
              processedList.items
                .filter((item: any) => item.bestMatch)
                .map((item: any) => ({
                  ...item.bestMatch.product,
                  matchScore: item.bestMatch.matchScore,
                  dealFound: item.dealFound,
                  quantity: item.requestedQuantity,
                }))
            )
          }
        }
      } else {
        // Regular chat
        const response = await fetch("/api/saint-athena/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        })

        const data = await response.json()

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "I'm here to help! What can I find for you?",
            timestamp: Date.now(),
          },
        ])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that. Can you try again?",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addItem({
        product_id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity: product.quantity || 1,
        category: product.category,
      })

      showSaintAthenaToast({
        item: {
          name: product.name,
          price: product.sale_price || product.price,
          quantity: product.quantity || 1,
        },
        total: 0, // Will be updated by cart context
        itemCount: 0,
      })
    } catch (error) {
      showSaintAthenaError("Failed to add item to cart")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gradient-to-r from-pink-50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">SaintAthena</h2>
                  <p className="text-xs text-gray-500">Your Shopping Expert</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600 mr-2">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-gray-900 text-white"
                          : "bg-pink-50 text-gray-900"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="mt-1 text-xs opacity-50">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-pink-50 px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                      <span className="text-sm text-gray-600">Searching...</span>
                    </div>
                  </motion.div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Quick Add to Cart:</span>
                    </div>
                    {searchResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between rounded-lg border border-pink-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {result.name}
                            </div>
                            {result.dealFound && (
                              <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
                                <Tag className="inline h-3 w-3 mr-0.5" />
                                Deal!
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            ${(result.sale_price || result.price).toFixed(2)}
                            {result.quantity > 1 && ` × ${result.quantity}`}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(result)}
                          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500"
                        >
                          Add
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Try: 'hipon, salmon, rice' or 'What's on sale?'"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="mt-2 text-xs text-center text-gray-500">
                💡 Tip: I understand Filipino! Try "hipon" for shrimp
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
