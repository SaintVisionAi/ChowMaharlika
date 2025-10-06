import { createClient } from "@/lib/supabase/server"
import { ProductsCatalogClient } from "@/components/products-catalog-client"

export const metadata = {
  title: "All Products | Maharlika Seafood & Grocery Mart",
  description: "Browse our complete catalog of over 2,900 premium Filipino and Asian products including fresh seafood, groceries, produce, and more."
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("name")

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0f0f0f]">
      <div className="container mx-auto px-4">
        <ProductsCatalogClient products={products || []} />
      </div>
    </div>
  )
}
