"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm SaintChow, your AI assistant at Maharlika Seafood & Mart. How can I help you find the freshest seafood or assist with your shopping today?",
    },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: message }])
    setMessage("")

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'd be happy to help you with that! Let me check our current inventory and provide you with the best recommendations.",
        },
      ])
    }, 1000)
  }

  return (
    <>
      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-yellow-600 hover:bg-yellow-700 shadow-lg"
        size="icon"
      >
        <span className="text-2xl">✨</span>
      </Button>

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 h-96 glass-effect border-yellow-600/20 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">SaintChow</h3>
                <p className="text-xs text-gray-400">AI Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white">
              ✕
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === "user" ? "bg-yellow-600 text-white" : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask SaintChow anything..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="sm" onClick={handleSendMessage} className="bg-yellow-600 hover:bg-yellow-700">
                →
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
