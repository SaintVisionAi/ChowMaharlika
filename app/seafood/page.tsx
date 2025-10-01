import { createClient } from "@/lib/supabase/server"
import { PremiumProductGrid } from "@/components/premium-product-grid"

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
        <PremiumProductGrid 
          products={products || []} 
          title="Fresh Seafood"
          subtitle="Hand-selected premium seafood delivered fresh daily. From wild-caught fish to sustainable shellfish, we bring the ocean's finest to your table."
        />
      </div>
    </div>
  )
}
