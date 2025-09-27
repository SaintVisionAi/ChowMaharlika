import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] grid place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="font-brand text-5xl mb-2">404</h1>
        <p className="text-lg text-foreground/70 mb-6">Page not found</p>
        <a
          href="/"
          className="rounded-md border border-[hsl(var(--gold-600))]/60 bg-gradient-to-b from-[hsl(var(--gold-500))] to-[hsl(var(--gold-600))] px-4 py-2 text-sm font-semibold text-[hsl(var(--charcoal-900))] shadow-glow-gold"
        >
          Back home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
