"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronDown, Sparkles, Check } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Premium Background with Gold Glow */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />
        
        {/* Gold accent glows */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,215,0,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Powered by Claude AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight">
            <span className="gold-shimmer block mb-4">Maharlika</span>
            <span className="text-white block mb-2">Premium Seafood</span>
            <span className="text-gray-400">& Grocery Excellence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade seafood and groceries with AI-powered personalized service.
            <span className="block mt-2 text-yellow-400 font-medium">Fresh. Premium. Intelligent.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-gray-900 font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all btn-press group"
              asChild
            >
              <Link href="/seafood">
                Shop Fresh Seafood
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-yellow-500/50 text-white hover:bg-yellow-500/10 hover:border-yellow-400 px-10 py-6 text-lg backdrop-blur-sm transition-all"
              asChild
            >
              <Link href="/grocery">Explore Grocery</Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-16">
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center group-hover:scale-110 transition-transform gold-pulse">
                <Check className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Premium Quality</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Hand-selected fresh seafood and premium grocery items delivered daily</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center group-hover:scale-110 transition-transform gold-pulse" style={{ animationDelay: '0.5s' }}>
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Fast Delivery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Same-day delivery through GrubHub, DoorDash, and Uber Eats</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center group-hover:scale-110 transition-transform gold-pulse" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">AI-Powered</h3>
              <p className="text-gray-400 text-sm leading-relaxed">SaintChow AI assistant for personalized recommendations 24/7</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-16 animate-bounce">
            <ChevronDown className="w-8 h-8 text-yellow-400 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
