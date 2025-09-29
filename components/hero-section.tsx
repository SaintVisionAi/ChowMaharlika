"use client"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/20 to-background/30" />
        <div
          className="absolute inset-0 opacity-20 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23DAA520' fillOpacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
            <span className="gold-shimmer block mb-2">Maharlika</span>
            <span className="text-foreground block mb-2">is a lever of influence in</span>
            <span className="text-foreground">premium seafood & grocery</span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the finest selection of fresh seafood and premium groceries, enhanced by our AI assistant
            SaintChow for personalized service.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
              Shop Fresh Seafood →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg bg-transparent"
            >
              Explore Grocery
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Premium Quality</h3>
              <p className="text-muted-foreground">Hand-selected fresh seafood and premium grocery items daily</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Fast Delivery</h3>
              <p className="text-muted-foreground">Same-day delivery through GrubHub, DoorDash, and Uber Eats</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI-Powered Service</h3>
              <p className="text-muted-foreground">SaintChow AI assistant for personalized recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
