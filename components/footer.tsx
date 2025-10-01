import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-yellow-500/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-gray-900">M</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold gold-shimmer">Maharlika</h3>
                <p className="text-sm text-gray-400">Premium Seafood & Mart</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">Enterprise-grade seafood and grocery experience powered by AI innovation.</p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/people/Maharlika-Seafood-Mart-Chow/"
                className="text-gray-400 hover:text-yellow-400 transition-all p-2 hover:bg-yellow-500/10 rounded-lg"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/maharlikachow/"
                className="text-gray-400 hover:text-yellow-400 transition-all p-2 hover:bg-yellow-500/10 rounded-lg"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/seafood" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Fresh Seafood
                </Link>
              </li>
              <li>
                <Link href="/grocery" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Premium Grocery
                </Link>
              </li>
              <li>
                <Link href="/restaurant" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Restaurant
                </Link>
              </li>
              <li>
                <Link href="/catering" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Catering
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/rewards" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Loyalty Program
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  Customer Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-yellow-400 transition-all inline-block">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span>Contact us</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">info@chowmaharlika.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>Visit our store</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-500/20 mt-12 pt-8">
          <p className="text-gray-500 text-center text-sm">© 2025 Maharlika Seafood & Mart. All rights reserved. <span className="text-yellow-400">Powered by Claude AI</span></p>
        </div>
      </div>
    </footer>
  )
}
