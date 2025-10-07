"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  ShoppingCart,
  Loader2,
  Minimize2,
  Check,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
  products?: ProductRecommendation[]
}

interface ProductRecommendation {
  id: string
  name: string
  price: number
  category: string
  reason?: string
}

const STORAGE_KEY = "saint_athena_chat_history"

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { items, addItem } = useCart()
  const { toast } = useToast()
  const supabase = createClient()

  // Load chat history
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setMessages(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load chat history", e)
      }
    } else {
      // Welcome message
      setMessages([
        {
          role: "assistant",
          content: `Hello! I'm **Saint Athena** 🌟, your intelligent shopping assistant at Maharlika Seafood & Mart.

I can help you:
- 🛒 **Track your cart** (${items.length} ${items.length === 1 ? 'item' : 'items'} currently)
- 📝 **Process shopping lists** (just paste or type your list!)
- 💡 **Make smart suggestions** based on what's available
- 🔍 **Find specific products** in our inventory
- 🎯 **Check availability** and prices

What can I help you with today?`,
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    getUser()
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  // Update cart count in welcome message
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === "assistant") {
      const updatedMessage = {
        ...messages[0],
        content: messages[0].content.replace(
          /\(\d+ items? currently\)/,
          `(${items.length} ${items.length === 1 ? 'item' : 'items'} currently)`
        ),
      }
      setMessages([updatedMessage, ...messages.slice(1)])
    }
  }, [items.length])

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsStreaming(true)

    abortControllerRef.current = new AbortController()

    try {
      // Include cart context
      const cartContext = items.length > 0 
        ? `Current cart contains: ${items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}`
        : "Cart is empty"

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Saint Athena, an intelligent shopping assistant. ${cartContext}. Be helpful, concise, and proactive.`,
            },
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: userMessage.role, content: userMessage.content },
          ],
          userId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (!reader) throw new Error("No response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantMessage += parsed.text
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.content = assistantMessage
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                      timestamp: Date.now(),
                    })
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      toast({
        title: "Message sent",
        description: "Saint Athena responded",
      })
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              title="Chat with SaintAthena - Powered by SaintSal™"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <Image 
                src="/saintsallogo.ico" 
                alt="SaintSal™ by SaintVision.Ai" 
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </Button>
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-30"></div>
            
            {/* Badge for cart items */}
            {items.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white border-2 border-zinc-900 flex items-center justify-center p-0 text-xs font-bold">
                {items.length}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card
              className={cn(
                "bg-gradient-to-b from-zinc-900 to-black border-yellow-500/30 shadow-2xl shadow-yellow-500/20",
                isMinimized ? "w-96" : "w-96 h-[600px]",
                "flex flex-col"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-950/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center p-1">
                      <Image 
                        src="/saintsallogo.ico" 
                        alt="SaintSal™" 
                        width={36}
                        height={36}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Saint Athena</h3>
                    <p className="text-xs text-gray-400">Powered by SaintSal™</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {items.length}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {!isMinimized && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg p-3",
                            message.role === "user"
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900"
                              : "bg-zinc-800/50 text-gray-200 border border-yellow-500/20"
                          )}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="text-sm prose prose-invert prose-sm max-w-none"
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    ))}
                    {isStreaming && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800/50 rounded-lg p-3 border border-yellow-500/20">
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-yellow-500/20 bg-zinc-900/50">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Saint Athena anything..."
                        disabled={isStreaming}
                        className="bg-zinc-800 border-yellow-500/20 text-white placeholder:text-gray-500 focus:border-yellow-500/50"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isStreaming || !input.trim()}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900"
                      >
                        {isStreaming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send • Shift+Enter for new line
                    </p>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
