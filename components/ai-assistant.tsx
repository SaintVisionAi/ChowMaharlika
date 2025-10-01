"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Loader2, Copy, Check, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const STORAGE_KEY = "saintchow_chat_history"

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { addItem } = useCart()
  const { toast } = useToast()
  const supabase = createClient()

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMessages(parsed)
      } catch (e) {
        console.error("Failed to parse chat history", e)
      }
    } else {
      // Set welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm **SaintChow**, your AI assistant at Maharlika Seafood & Mart. 🦐🐟\n\nHow can I help you find the freshest seafood or assist with your shopping today?",
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    getUser()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  // Parse product recommendations from JSON blocks
  const parseProductRecommendations = (content: string): ProductRecommendation[] => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
    if (!jsonMatch) return []

    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (parsed.type === "product_recommendations" && Array.isArray(parsed.products)) {
        return parsed.products
      }
    } catch (e) {
      console.error("Failed to parse product recommendations", e)
    }
    return []
  }

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setError(null)
    setIsStreaming(true)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      // Call streaming API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      // Read streaming response
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
                // Update streaming message in real-time
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
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Parse products from final message
      const products = parseProductRecommendations(assistantMessage)
      if (products.length > 0) {
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.products = products
          }
          return newMessages
        })
      }
    } catch (err: any) {
      if (err.name === "AbortError") return

      console.error("Chat error:", err)
      setError(err.message || "Failed to get response. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to get response",
        variant: "destructive",
      })
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [input, messages, userId, isStreaming, toast])

  // Handle adding product to cart
  const handleAddToCart = async (product: ProductRecommendation) => {
    try {
      await addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      })
    } catch (error) {
      console.error("Failed to add to cart", error)
    }
  }

  // Copy message to clipboard
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Clear chat history
  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm **SaintChow**, your AI assistant at Maharlika Seafood & Mart. 🦐🐟\n\nHow can I help you find the freshest seafood or assist with your shopping today?",
        timestamp: Date.now(),
      },
    ])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <>
      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 shadow-2xl hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all duration-300 gold-pulse btn-press"
        size="icon"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-8 w-8 text-gray-900 drop-shadow-lg" />
      </Button>

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[450px] max-w-[95vw] h-[600px] max-h-[80vh] glass-effect flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-yellow-600/5 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg gold-pulse">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-white gold-shimmer">SaintChow</h3>
                <p className="text-xs text-gray-400">AI Shopping Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 text-gray-400 hover:text-yellow-400 text-xs transition-colors"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-yellow-600/20 scrollbar-track-transparent bg-black/20">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}>
                <div className="flex flex-col max-w-[85%]">
                  <div
                    className={`p-3 rounded-2xl text-sm shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-medium rounded-br-sm"
                        : "bg-zinc-900/90 text-gray-100 border border-zinc-800/50 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between hover-lift transition-all hover:border-yellow-500/60"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                            <p className="text-base text-yellow-400 font-bold mt-1">${product.price.toFixed(2)}</p>
                            {product.reason && (
                              <p className="text-xs text-gray-400 mt-1">{product.reason}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold ml-3 btn-press shadow-lg"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Copy button for assistant messages */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.content, index)}
                      className="self-start mt-1 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/90 border border-yellow-500/20 text-gray-100 p-3 rounded-2xl rounded-bl-sm flex items-center space-x-2 shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-sm">SaintChow is thinking...</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm shadow-lg">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-yellow-500/20 bg-black/40">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SaintChow anything..."
                className="flex-1 bg-zinc-900/80 border-zinc-800 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/30"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isStreaming}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isStreaming || !input.trim()}
                className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold px-6 btn-press shadow-lg"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "→"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Press <span className="text-yellow-400">Enter</span> to send • <span className="text-yellow-400">Esc</span> to close</p>
          </div>
        </Card>
      )}
    </>
  )
}
