import type React from "react"
import { Geist, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

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
    <html lang="en" className={`${geist.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground water-texture">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
