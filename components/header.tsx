"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="fixed top-0 w-full z-50 glass-effect">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/maharlika-logo.png"
              alt="Maharlika Seafood & Mart"
              width={60}
              height={60}
              className="w-12 h-12"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-serif font-bold text-primary">Maharlika</h1>
              <p className="text-xs text-muted-foreground">Seafood & Mart</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/seafood" className="text-foreground hover:text-primary transition-colors">
              Fresh Seafood
            </Link>
            <Link href="/grocery" className="text-foreground hover:text-primary transition-colors">
              Grocery
            </Link>
            <Link href="/restaurant" className="text-foreground hover:text-primary transition-colors">
              Restaurant
            </Link>
            <Link href="/rewards" className="text-foreground hover:text-primary transition-colors">
              Rewards
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              Search
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary relative" asChild>
              <Link href="/cart">
                Cart {itemCount > 0 && `(${itemCount})`}
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? "✕" : "☰"}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              <Link href="/seafood" className="text-foreground hover:text-primary transition-colors">
                Fresh Seafood
              </Link>
              <Link href="/grocery" className="text-foreground hover:text-primary transition-colors">
                Grocery
              </Link>
              <Link href="/restaurant" className="text-foreground hover:text-primary transition-colors">
                Restaurant
              </Link>
              <Link href="/rewards" className="text-foreground hover:text-primary transition-colors">
                Rewards
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
