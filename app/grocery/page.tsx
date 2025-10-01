import { createClient } from "@/lib/supabase/server"
import { PremiumProductGrid } from "@/components/premium-product-grid"

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
        <PremiumProductGrid 
          products={products || []} 
          title="Premium Grocery"
          subtitle="Curated selection of international and local grocery items. From Filipino favorites to Asian specialties, find everything you need for authentic home cooking."
        />
      </div>
    </div>
  )
}
