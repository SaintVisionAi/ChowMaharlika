"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, ShoppingBag, Truck, Clock, MapPin, Phone, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function PremiumHero() {
  return (
    <section className="relative min-h-[90vh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Pane - Saint Athena Introduction */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 border-0 px-4 py-2 text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                AI-Powered Shopping Assistant
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-7xl font-bold leading-tight"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                  Meet Saint Athena
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-gray-300 leading-relaxed"
              >
                Your Intelligent Shopping Companion
              </motion.p>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 text-gray-400 leading-relaxed text-lg"
            >
              <p>
                Saint Athena is your personal AI assistant, designed to make shopping at Maharlika Seafood & Mart 
                effortless and intelligent. She knows our entire inventory, tracks your cart, and provides 
                personalized recommendations.
              </p>
              <p className="text-yellow-400 font-medium">
                ✨ Just tell her what you need, and she'll handle the rest.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: "🛒", text: "Cart Tracking" },
                { icon: "📝", text: "List Processing" },
                { icon: "💡", text: "Smart Suggestions" },
                { icon: "🎯", text: "Inventory Aware" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-bold text-lg px-8 py-6 shadow-lg shadow-yellow-500/50"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Chat with Saint Athena
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-yellow-500/30 text-gray-300 hover:bg-yellow-500/10 hover:border-yellow-500/50 font-semibold text-lg px-8 py-6"
              >
                <Link href="/products">
                  Browse Products
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Pane - Interactive Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full"
          >
            <Card className="h-full p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-yellow-500/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Saint Athena</h3>
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online Now
                  </p>
                </div>
                <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  AI Assistant
                </Badge>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 py-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                {/* User Message 1 */}
                <div className="flex justify-end">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-gray-200 text-sm">Here's my shopping list: salmon, shrimp, rice, and soy sauce 📝</p>
                  </div>
                </div>

                {/* AI Response 1 */}
                <div className="flex justify-start">
                  <div className="bg-zinc-800 border border-yellow-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-gray-300 text-sm mb-2">Great! I found everything on your list. Here's what I recommend:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>🐟</span>
                        <span className="text-gray-200">Fresh Atlantic Salmon - $12.99/lb</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>🦐</span>
                        <span className="text-gray-200">Jumbo Shrimp - $18.99/lb</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>🍚</span>
                        <span className="text-gray-200">Jasmine Rice 5lb - $8.99</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>🧂</span>
                        <span className="text-gray-200">Premium Soy Sauce - $4.99</span>
                      </div>
                    </div>
                    <p className="text-yellow-400 font-medium mt-3 text-xs">💡 Tip: Salmon is 15% off today!</p>
                  </div>
                </div>

                {/* User Message 2 */}
                <div className="flex justify-end">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-gray-200 text-sm">What's on sale this week? 🎯</p>
                  </div>
                </div>

                {/* AI Response 2 */}
                <div className="flex justify-start">
                  <div className="bg-zinc-800 border border-yellow-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-gray-300 text-sm mb-2">This week's hottest deals:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">🔥 All Seafood</span>
                        <span className="text-green-400 font-bold">15% OFF</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">🥢 Asian Noodles</span>
                        <span className="text-green-400 font-bold">Buy 2 Get 1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">🌶️ Fresh Produce</span>
                        <span className="text-green-400 font-bold">20% OFF</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex justify-start">
                  <div className="bg-zinc-800 border border-yellow-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Preview */}
              <div className="pt-4 border-t border-yellow-500/20">
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 rounded-lg border border-yellow-500/20">
                  <span className="text-gray-500 text-sm flex-1">Click the chat icon to start shopping...</span>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold">
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Service Info Cards - Horizontal Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {/* Pickup & Delivery */}
          <Card className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Truck className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Pickup & Delivery</h4>
                <p className="text-xs text-gray-400">Same-day available</p>
              </div>
            </div>
          </Card>

          {/* Store Hours */}
          <Card className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Store Hours</h4>
                <p className="text-xs text-gray-400">Mon-Sat: 9AM-8PM</p>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Phone className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Get in Touch</h4>
                <p className="text-xs text-gray-400">24/7 Support</p>
              </div>
            </div>
          </Card>

          {/* Special Offer */}
          <Card className="p-4 bg-gradient-to-br from-yellow-950 to-zinc-900 border-yellow-500/40 hover:border-yellow-500/60 transition-all duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/30">
                <ShoppingBag className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Fresh Deals</h4>
                <p className="text-xs text-yellow-400 font-medium">15% off seafood</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  )
}
