import { Link, NavLink } from "react-router-dom";
import { Crown, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive ? "text-primary" : "text-foreground/80 hover:text-foreground",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[hsl(var(--gold-600))] to-[hsl(var(--gold-400))] text-[hsl(var(--charcoal-900))] shadow-[0_0_0_1px_hsl(var(--gold-500))]">
            <Crown className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-brand text-lg tracking-wide text-foreground">
              Maharlika
            </div>
            <div className="text-xs text-foreground/60">
              Seafood Mart & Chow
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/shop" label="Shop" />
          <NavItem to="/delivery" label="Delivery" />
          <NavItem to="/rewards" label="Rewards" />
          <NavItem to="/inventory" label="Inventory" />
          <NavItem to="/account" label="Account" />
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 rounded-md border border-[hsl(var(--gold-600))]/60 bg-gradient-to-b from-[hsl(var(--gold-500))] to-[hsl(var(--gold-600))] px-4 py-2 text-sm font-semibold text-[hsl(var(--charcoal-900))] shadow-glow-gold transition hover:brightness-110"
          >
            <ShoppingCart className="h-4 w-4" /> Shop
          </Link>
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="container grid gap-1 py-2">
            <NavItem to="/shop" label="Shop" />
            <NavItem to="/delivery" label="Delivery" />
            <NavItem to="/rewards" label="Rewards" />
            <NavItem to="/inventory" label="Inventory" />
            <NavItem to="/account" label="Account" />
          </div>
        </div>
      )}
    </header>
  );
}
