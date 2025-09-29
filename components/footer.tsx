import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/maharlika-logo.png"
                alt="Maharlika Seafood & Mart"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h3 className="text-lg font-serif font-bold text-primary">Maharlika</h3>
                <p className="text-sm text-muted-foreground">Seafood & Mart</p>
              </div>
            </div>
            <p className="text-muted-foreground">Premium seafood and grocery experience powered by AI innovation.</p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/people/Maharlika-Seafood-Mart-Chow/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/maharlikachow/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seafood" className="text-muted-foreground hover:text-primary transition-colors">
                  Fresh Seafood
                </Link>
              </li>
              <li>
                <Link href="/grocery" className="text-muted-foreground hover:text-primary transition-colors">
                  Premium Grocery
                </Link>
              </li>
              <li>
                <Link href="/restaurant" className="text-muted-foreground hover:text-primary transition-colors">
                  Restaurant
                </Link>
              </li>
              <li>
                <Link href="/catering" className="text-muted-foreground hover:text-primary transition-colors">
                  Catering
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/rewards" className="text-muted-foreground hover:text-primary transition-colors">
                  Loyalty Program
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-muted-foreground hover:text-primary transition-colors">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Customer Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Contact us</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">info@chowmaharlika.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Visit our store</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">© 2025 Maharlika Seafood & Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
