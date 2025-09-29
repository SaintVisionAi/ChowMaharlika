import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-[hsl(var(--charcoal-900))] text-foreground">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F20e5d38115c54f2586198244c4136d74%2Fe140a3c475bc4486b279c44c63f83fa9?format=webp&width=96"
              alt="Maharlika logo"
              className="h-10 w-10 rounded-sm ring-1 ring-[hsl(var(--gold-600))]/60 object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="font-brand text-xl">
              Maharlika Seafood Mart & Chow
            </div>
          </div>
          <p className="mt-2 text-sm text-foreground/70">
            Fresh seafood, Asian grocery, and hot meals. Powered by Clover.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground/80">Links</div>
          <nav className="mt-3 grid gap-2 text-sm">
            <a
              href="https://chowmaharlika.cloveronline.com"
              className="hover:text-primary"
            >
              Shop
            </a>
            <Link to="/delivery" className="hover:text-primary">
              Delivery
            </Link>
            <Link to="/rewards" className="hover:text-primary">
              Rewards
            </Link>
            <Link to="/account" className="hover:text-primary">
              Account
            </Link>
          </nav>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground/80">
            Connect
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <a
              href="https://www.facebook.com/people/Maharlika-Seafood-Mart-Chow/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-primary"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
            <a
              href="https://www.instagram.com/maharlikachow/?igsh=NTc4MTIwNjQ2YQ%3D%3D"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-primary"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <div className="inline-flex items-center gap-2 text-foreground/70">
              <Phone className="h-4 w-4" /> 661-206-8619
            </div>
            <div className="inline-flex items-center gap-2 text-foreground/70">
              <Mail className="h-4 w-4" /> support@chowmaharlika.com
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-foreground/60">
        © {new Date().getFullYear()} Maharlika Seafood Mart & Chow. All rights
        reserved.
      </div>
    </footer>
  );
}
