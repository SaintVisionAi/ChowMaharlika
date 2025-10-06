import { createClient } from "@/lib/supabase/server"
import { SeafoodPageClient } from "@/components/seafood-page-client"

export default async function SeafoodPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", "seafood")
    .eq("is_available", true)
    .order("name")

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0f0f0f]">
      <div className="container mx-auto px-4 space-y-12">
        <SeafoodPageClient products={products || []} />
      </div>
    </div>
  )
}
