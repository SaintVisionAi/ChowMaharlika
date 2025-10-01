import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface CreateOrderRequest {
  orderId: string
  items: OrderItem[]
  total: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

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

    // Parse request body
    const requestBody: CreateOrderRequest = await req.json()
    const { orderId, items, total } = requestBody

    if (!orderId || !items || !total) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: orderId, items, total' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[CLOVER-ORDER] Creating order ${orderId} in Clover...`)
    console.log(`[CLOVER-ORDER] Total: $${total}, Items: ${items.length}`)

    // Create order in Clover
    const cloverOrderResponse = await fetch(
      `${cloverBaseUrl}/v3/merchants/${cloverMerchantId}/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloverApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total: Math.round(total * 100), // Convert to cents
          state: 'open',
          note: `Online order ${orderId}`
        })
      }
    )

    if (!cloverOrderResponse.ok) {
      const errorText = await cloverOrderResponse.text()
      console.error('[CLOVER-ORDER] Order creation failed:', errorText)
      throw new Error(`Failed to create Clover order: ${cloverOrderResponse.status}`)
    }

    const cloverOrder = await cloverOrderResponse.json()
    console.log(`[CLOVER-ORDER] Created Clover order: ${cloverOrder.id}`)

    // Add line items to the Clover order
    let lineItemsAdded = 0
    for (const item of items) {
      try {
        console.log(`[CLOVER-ORDER] Adding line item: ${item.name}`)
        
        const lineItemResponse = await fetch(
          `${cloverBaseUrl}/v3/merchants/${cloverMerchantId}/orders/${cloverOrder.id}/line_items`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cloverApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: item.name,
              price: Math.round(item.price * 100), // Convert to cents
              quantity: item.quantity
            })
          }
        )

        if (!lineItemResponse.ok) {
          console.error(`[CLOVER-ORDER] Failed to add line item: ${item.name}`)
        } else {
          lineItemsAdded++
          console.log(`[CLOVER-ORDER] Added line item: ${item.name}`)
        }
      } catch (error) {
        console.error(`[CLOVER-ORDER] Error adding line item ${item.name}:`, error)
      }
    }

    // Update the order in Supabase with the Clover order ID
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        clover_order_id: cloverOrder.id,
        status: 'processing' 
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[CLOVER-ORDER] Failed to update Supabase order:', updateError)
      // Don't fail the whole operation if Supabase update fails
    }

    console.log(`[CLOVER-ORDER] Order ${orderId} successfully created in Clover with ${lineItemsAdded} line items`)

    return new Response(
      JSON.stringify({
        success: true,
        cloverOrderId: cloverOrder.id,
        message: `Order created in Clover POS with ${lineItemsAdded}/${items.length} items`,
        lineItemsAdded
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[CLOVER-ORDER] Function error:', error)
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