import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product-grid"

export default async function SeafoodPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", "seafood")
    .eq("is_available", true)
    .order("name")

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Fresh Seafood</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Hand-selected premium seafood delivered fresh daily. From wild-caught fish to sustainable shellfish, we
            bring the ocean's finest to your table.
          </p>
        </div>

        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}
