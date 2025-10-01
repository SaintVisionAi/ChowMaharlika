import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloverItem {
  id: string
  name: string
  price: number
  description?: string
  categories?: { name: string }[]
  stockCount?: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Debug route to test Clover API directly
  const url = new URL(req.url)
  if (url.pathname.endsWith('/debug') && req.method === 'GET') {
    console.log('[CLOVER-DEBUG] Debug ping start')
    
    try {
      const cloverMerchantId = Deno.env.get('CLOVER_MERCHANT_ID')
      const cloverApiKey = Deno.env.get('CLOVER_API_KEY')
      
      console.log('[CLOVER-DEBUG] Environment check:')
      console.log(`   Merchant ID: ${cloverMerchantId || 'MISSING'}`)
      console.log(`   API Key: ${cloverApiKey ? cloverApiKey.substring(0, 12) + '...' : 'MISSING'}`)
      
      if (!cloverMerchantId || !cloverApiKey) {
        return new Response(JSON.stringify({ 
          error: 'Missing environment variables',
          merchantId: !!cloverMerchantId,
          apiKey: !!cloverApiKey
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Test different Clover endpoints
      const endpoints = [
        {
          name: 'Items (no v3)',
          url: `https://api.clover.com/merchants/${cloverMerchantId}/items`
        },
        {
          name: 'Items (with v3)',
          url: `https://api.clover.com/v3/merchants/${cloverMerchantId}/items`
        },
        {
          name: 'Merchant Info',
          url: `https://api.clover.com/merchants/${cloverMerchantId}`
        }
      ]
      
      const results = []
      
      for (const endpoint of endpoints) {
        console.log(`[CLOVER-DEBUG] Testing ${endpoint.name}: ${endpoint.url}`)
        
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${cloverApiKey}`,
              'Accept': 'application/json'
            }
          })
          
          const status = response.status
          const statusText = response.statusText
          const headers = Object.fromEntries(response.headers.entries())
          
          let body = ''
          try {
            if (status === 204) {
              body = 'No Content (Empty)'
            } else {
              const text = await response.text()
              body = text.length > 500 ? text.substring(0, 500) + '...' : text
            }
          } catch (e) {
            body = 'Failed to read response body'
          }
          
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            status,
            statusText,
            headers,
            body,
            success: status >= 200 && status < 300
          })
          
          console.log(`[CLOVER-DEBUG] ${endpoint.name} result: ${status} ${statusText}`)
          
        } catch (error) {
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            error: error instanceof Error ? error.message : String(error)
          })
          console.error(`[CLOVER-DEBUG] ${endpoint.name} error:`, error)
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Debug test completed',
        environment: {
          merchantId: cloverMerchantId,
          hasApiKey: !!cloverApiKey,
          apiKeyPrefix: cloverApiKey ? cloverApiKey.substring(0, 12) + '...' : null
        },
        results
      }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      console.error('[CLOVER-DEBUG] Debug error:', error)
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Clover credentials from environment
    const cloverMerchantId = Deno.env.get('CLOVER_MERCHANT_ID')
    const cloverApiKey = Deno.env.get('CLOVER_API_KEY')
    const cloverBaseUrl = Deno.env.get('CLOVER_BASE_URL') || 'https://api.clover.com'

    if (!cloverMerchantId || !cloverApiKey) {
      throw new Error('Missing Clover credentials')
    }

    console.log('[CLOVER-SYNC] Starting inventory sync...')
    console.log(`[CLOVER-SYNC] Merchant ID: ${cloverMerchantId}`)
    console.log(`[CLOVER-SYNC] Base URL: ${cloverBaseUrl}`)

    // Verify user is admin (if called from authenticated context)
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is admin
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch inventory from Clover (using the working API endpoint)
    console.log('[CLOVER-SYNC] Fetching items from Clover...')
    const cloverResponse = await fetch(
      `https://api.clover.com/merchants/${cloverMerchantId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${cloverApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!cloverResponse.ok && cloverResponse.status !== 204) {
      const errorText = await cloverResponse.text()
      console.error('[CLOVER-SYNC] Clover API error:', errorText)
      throw new Error(`Clover API error: ${cloverResponse.status} - ${errorText}`)
    }

    let cloverItems: CloverItem[] = []
    
    if (cloverResponse.status === 204) {
      console.log('[CLOVER-SYNC] 204 No Content - Empty inventory in Clover')
      cloverItems = []
    } else {
      const cloverData = await cloverResponse.json()
      cloverItems = cloverData.elements || []
    }
    
    console.log(`[CLOVER-SYNC] Retrieved ${cloverItems.length} items from Clover`)

    let syncedCount = 0
    let errorCount = 0

    // Sync each item to Supabase
    for (const item of cloverItems) {
      try {
        console.log(`[CLOVER-SYNC] Syncing item: ${item.name}`)
        
        // Check if product already exists
        const { data: existingProduct } = await supabaseClient
          .from('products')
          .select('id')
          .eq('clover_id', item.id)
          .single()

        const productData = {
          name: item.name,
          description: item.description || '',
          price: item.price / 100, // Convert from cents to dollars
          category: item.categories?.[0]?.name?.toLowerCase() || 'general',
          stock_quantity: item.stockCount || 0,
          clover_id: item.id,
          is_available: true,
          last_synced_at: new Date().toISOString(),
        }

        if (existingProduct) {
          // Update existing product
          const { error } = await supabaseClient
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)

          if (error) throw error
          console.log(`[CLOVER-SYNC] Updated: ${item.name}`)
        } else {
          // Insert new product
          const { error } = await supabaseClient
            .from('products')
            .insert(productData)

          if (error) throw error
          console.log(`[CLOVER-SYNC] Created: ${item.name}`)
        }

        syncedCount++
      } catch (error) {
        console.error(`[CLOVER-SYNC] Error syncing ${item.name}:`, error)
        errorCount++
      }
    }

    console.log(`[CLOVER-SYNC] Sync complete: ${syncedCount} synced, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${syncedCount} items from Clover`,
        syncedCount,
        errorCount,
        totalItems: cloverItems.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[CLOVER-SYNC] Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})