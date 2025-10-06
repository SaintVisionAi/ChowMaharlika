import type React from "react"
import { GeistSans } from "geist/font/sans"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SaintAthena } from "@/components/saint-athena"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata = {
  title: "Maharlika Seafood & Mart - Premium Seafood & Grocery",
  description: "Experience luxury seafood and grocery shopping with AI-powered assistance from SaintChow",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground water-texture">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <SaintAthena />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
