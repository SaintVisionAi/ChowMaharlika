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

          {/* Right Pane - Services & Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Service Cards */}
            <div className="space-y-4">
              {/* Pickup & Delivery */}
              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Truck className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-white">Pickup & Delivery</h3>
                    <p className="text-gray-400">
                      Order online and choose pickup at our store or convenient home delivery. 
                      Same-day delivery available!
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        Local Pickup
                      </Badge>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        <Truck className="w-3 h-3 mr-1" />
                        Home Delivery
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Store Hours */}
              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-white">Store Hours</h3>
                    <div className="space-y-1 text-gray-400">
                      <div className="flex justify-between">
                        <span>Monday - Saturday</span>
                        <span className="text-yellow-400 font-medium">9:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="text-yellow-400 font-medium">10:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact */}
              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Phone className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-white">Get in Touch</h3>
                    <p className="text-gray-400">
                      Questions? Our team is here to help! Call us or chat with Saint Athena 24/7.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Us
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Special Offer */}
              <Card className="p-6 bg-gradient-to-br from-yellow-950 to-zinc-900 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-500/30">
                    <ShoppingBag className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Badge className="bg-yellow-500 text-gray-900 mb-2">
                      Limited Time Offer
                    </Badge>
                    <h3 className="text-xl font-bold text-white">Fresh Catch of the Day</h3>
                    <p className="text-gray-300">
                      Get 15% off premium seafood when you order through Saint Athena!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  )
}
