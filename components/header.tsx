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
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-yellow-500/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center gold-pulse shadow-lg transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-gray-900">M</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-serif font-bold gold-shimmer">Maharlika</h1>
              <p className="text-xs text-gray-400 tracking-wide">Premium Seafood & Mart</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/seafood" className="text-gray-300 hover:text-yellow-400 transition-all duration-200 font-medium text-sm tracking-wide">
              Fresh Seafood
            </Link>
            <Link href="/grocery" className="text-gray-300 hover:text-yellow-400 transition-all duration-200 font-medium text-sm tracking-wide">
              Grocery
            </Link>
            <Link href="/restaurant" className="text-gray-300 hover:text-yellow-400 transition-all duration-200 font-medium text-sm tracking-wide">
              Restaurant
            </Link>
            <Link href="/rewards" className="text-gray-300 hover:text-yellow-400 transition-all duration-200 font-medium text-sm tracking-wide">
              Rewards
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-all duration-200 font-medium text-sm tracking-wide">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all font-medium" 
              asChild
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all font-medium group" 
              asChild
            >
              <Link href="/cart" className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow-lg gold-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-yellow-500/20 bg-black/20 backdrop-blur-sm rounded-b-lg">
            <div className="flex flex-col space-y-2 pt-4 px-2">
              <Link href="/seafood" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all px-4 py-3 rounded-lg font-medium">
                Fresh Seafood
              </Link>
              <Link href="/grocery" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all px-4 py-3 rounded-lg font-medium">
                Grocery
              </Link>
              <Link href="/restaurant" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all px-4 py-3 rounded-lg font-medium">
                Restaurant
              </Link>
              <Link href="/rewards" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all px-4 py-3 rounded-lg font-medium">
                Rewards
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all px-4 py-3 rounded-lg font-medium">
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
