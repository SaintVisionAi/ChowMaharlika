"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/delivery", label: "Delivery Orders", icon: "🚚" },
  { href: "/admin/support", label: "Support Tickets", icon: "💬" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/clover", label: "Clover POS", icon: "💳" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Maharlika Management</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/20",
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t">
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/">Back to Store</Link>
        </Button>
      </div>
    </aside>
  )
}
