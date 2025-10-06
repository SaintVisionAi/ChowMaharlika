import { createClient } from "@/lib/supabase/server"
import { PremiumProductGrid } from "@/components/premium-product-grid"
import { GroceryPageClient } from "@/components/grocery-page-client"

export default async function GroceryPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", "grocery")
    .eq("is_available", true)
    .order("name")

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0f0f0f]">
      <div className="container mx-auto px-4 space-y-12">
        <GroceryPageClient products={products || []} />
      </div>
    </div>
  )
}
