import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CloverCatalogResponse, CloverItem } from "@shared/api";
import { Search, Tag } from "lucide-react";

function formatPrice(cents: number | null) {
  if (cents == null) return "—";
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function Shop() {
  const { data, isLoading, isError, refetch } = useQuery<CloverCatalogResponse>({
    queryKey: ["clover", "catalog"],
    queryFn: async () => {
      const r = await fetch("/api/clover/catalog");
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as CloverCatalogResponse;
    },
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const base = [{ id: "all", name: "All" }, ...(data?.categories || [])];
    return base;
  }, [data]);

  const items = useMemo(() => {
    let list: CloverItem[] = data?.items || [];
    if (category !== "all") list = list.filter((i) => (i.category || "").toLowerCase() === category.toLowerCase());
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || (i.code || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [data, query, category]);

  return (
    <main className="container py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-brand text-3xl">Shop</h1>
          <p className="text-sm text-foreground/70">Live catalog from Clover. Search and filter by category.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative inline-flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items or codes"
              className="w-64 rounded-md border border-border/60 bg-[hsl(var(--charcoal-900))] pl-9 pr-3 py-2 text-sm outline-none placeholder:text-foreground/40"
            />
          </label>
          <label className="relative inline-flex items-center">
            <Tag className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-56 appearance-none rounded-md border border-border/60 bg-[hsl(var(--charcoal-900))] pl-9 pr-8 py-2 text-sm outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name === "All" ? "all" : c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <p className="mt-10 text-sm text-foreground/60">Loading catalog…</p>
      )}
      {isError && (
        <div className="mt-10 rounded-md border border-border/60 bg-[hsl(var(--charcoal-900))] p-4 text-sm">
          Failed to load. <button onClick={() => refetch()} className="underline">Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const inStock = (item.stock ?? 0) > 0;
            const label = inStock ? `${item.stock} in stock` : "Out of stock";
            return (
              <article key={item.id} className="group overflow-hidden rounded-xl border border-border/60 bg-[hsl(var(--charcoal-900))] shadow-xl">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-[radial-gradient(400px_160px_at_50%_0%,hsl(var(--gold-600))/25%,transparent)] grid place-items-center">
                    <span className="text-4xl font-brand text-[hsl(var(--gold-500))]">{item.name.slice(0,1).toUpperCase()}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium leading-tight">{item.name}</h3>
                    <div className="whitespace-nowrap text-[hsl(var(--gold-400))]">{formatPrice(item.price)}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <div className="text-foreground/60">{item.category || "Uncategorized"}</div>
                    <span className={inStock ? "text-emerald-400" : "text-rose-400"}>{label}</span>
                  </div>
                  <button disabled={!inStock} className="mt-3 w-full rounded-md border border-[hsl(var(--gold-600))]/60 bg-gradient-to-b from-[hsl(var(--gold-500))] to-[hsl(var(--gold-600))] px-4 py-2 text-sm font-semibold text-[hsl(var(--charcoal-900))] shadow-glow-gold transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                    {inStock ? "Add to cart" : "Unavailable"}
                  </button>
                </div>
              </article>
            );
          })}
          {items.length === 0 && (
            <p className="col-span-full text-sm text-foreground/60">No items match your filters.</p>
          )}
        </div>
      )}
    </main>
  );
}
