import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("[v0] Starting Clover inventory sync via Supabase Edge Function...")

    // Get user's access token for the edge function
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    if (!accessToken) {
      return NextResponse.json({ error: "No valid session" }, { status: 401 })
    }

    // Call the Supabase Edge Function for Clover sync
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const edgeFunctionResponse = await fetch(
      `${supabaseUrl}/functions/v1/clover-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!edgeFunctionResponse.ok) {
      const errorText = await edgeFunctionResponse.text()
      console.error("[v0] Edge function error:", errorText)
      throw new Error(`Edge function failed: ${edgeFunctionResponse.status}`)
    }

    const result = await edgeFunctionResponse.json()
    console.log("[v0] Edge function result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error calling Clover sync edge function:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync inventory",
      },
      { status: 500 },
    )
  }
}
