import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product-grid"

export default async function GroceryPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", "grocery")
    .eq("is_available", true)
    .order("name")

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Premium Grocery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Curated selection of international and local grocery items. From Filipino favorites to Asian specialties,
            find everything you need for authentic home cooking.
          </p>
        </div>

        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}
