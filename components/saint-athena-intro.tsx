"use client"

import { motion } from "framer-motion"
import { Sparkles, MessageCircle, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SaintAthenaIntroProps {
  onOpenChat?: () => void
}

export function SaintAthenaIntro({ onOpenChat }: SaintAthenaIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/95 via-black/95 to-zinc-900/95 border-2 border-yellow-500/30 shadow-2xl backdrop-blur-xl"
    >
      {/* Animated gold glow background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: 0.4 
              }}
              className="relative w-24 h-24 md:w-32 md:h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full animate-pulse" />
              <div className="absolute inset-1 bg-gradient-to-br from-zinc-900 to-black rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>

          {/* Text Section */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                  Meet SaintAthena
                </span>
              </h2>
              <p className="text-lg md:text-xl text-yellow-400/90 font-semibold mb-1">
                Your AI Shopping Assistant 🌸
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl"
            >
              I know all <span className="text-yellow-400 font-bold">2,300+ products</span> in our store! 
              Chat with me in <span className="text-yellow-400 font-semibold">English or Filipino</span>, 
              give me shopping lists, ask for deals, or find alternatives for out-of-stock items.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-sm">
                <MessageCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-100 font-medium">Smart Search</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-sm">
                <ShoppingBag className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-100 font-medium">Shopping Lists</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-100 font-medium">Live Deals</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                size="lg"
                onClick={onOpenChat}
                className="mt-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-gray-900 font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting with SaintAthena
              </Button>
            </motion.div>

            {/* Try Examples */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-gray-400 italic"
            >
              Try: <span className="text-yellow-400 font-medium">"hipon, salmon, rice"</span> or{" "}
              <span className="text-yellow-400 font-medium">"What's on sale today?"</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-yellow-500/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-yellow-500/20 rounded-bl-3xl" />
    </motion.div>
  )
}
