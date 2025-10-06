import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createActionLogger, type ActionType } from "@/lib/action-logger"

export async function POST(request: Request) {
  try {
    console.log("[v0] AI action request received")

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized action attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { action_type, action_data, conversation_id } = body

    if (!action_type || !action_data) {
      return NextResponse.json({ error: "Missing action_type or action_data" }, { status: 400 })
    }

    // Create action logger
    const actionLogger = await createActionLogger()

    // Log the action as pending
    const actionId = await actionLogger.logAction({
      user_id: user.id,
      conversation_id,
      action_type: action_type as ActionType,
      action_data,
    })

    if (!actionId) {
      return NextResponse.json({ error: "Failed to log action" }, { status: 500 })
    }

    console.log("[v0] Action logged, waiting for confirmation:", actionId)

    // Return action ID for confirmation flow
    return NextResponse.json({
      success: true,
      action_id: actionId,
      status: "pending",
      message: "Action logged and awaiting confirmation",
    })
  } catch (error) {
    console.error("[v0] Error processing AI action:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}

/**
 * Confirm and execute an action
 */
export async function PATCH(request: Request) {
  try {
    console.log("[v0] AI action execution request received")

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { action_id } = body

    if (!action_id) {
      return NextResponse.json({ error: "Missing action_id" }, { status: 400 })
    }

    // Create action logger
    const actionLogger = await createActionLogger()

    // Get the action
    const action = await actionLogger.getAction(action_id)

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 })
    }

    // Verify ownership
    if (action.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify action is pending
    if (action.status !== "pending") {
      return NextResponse.json({ error: `Action is ${action.status}, cannot execute` }, { status: 400 })
    }

    // Confirm the action
    await actionLogger.confirmAction(action_id)

    // Execute the action based on type
    let result: any
    let success = true
    let errorMessage = ""

    try {
      switch (action.action_type) {
        case "cancel_order":
          result = await executeCancelOrder(action.action_data.order_id, action.action_data.reason, supabase)
          break

        case "get_order_status":
          result = await executeGetOrderStatus(action.action_data.order_id, supabase)
          break

        case "get_order_history":
          result = await executeGetOrderHistory(action.action_data.page || 1, action.action_data.limit || 10, supabase)
          break

        default:
          throw new Error(`Unknown action type: ${action.action_type}`)
      }
    } catch (error: any) {
      success = false
      errorMessage = error.message || "Action execution failed"
      console.error("[v0] Action execution error:", error)
    }

    // Update action status
    if (success) {
      await actionLogger.executeAction(action_id, result)
      console.log("[v0] Action executed successfully:", action_id)

      return NextResponse.json({
        success: true,
        action_id,
        status: "executed",
        result,
      })
    } else {
      await actionLogger.failAction(action_id, errorMessage)
      console.log("[v0] Action failed:", action_id, errorMessage)

      return NextResponse.json({
        success: false,
        action_id,
        status: "failed",
        error: errorMessage,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error executing AI action:", error)
    return NextResponse.json({ error: "Failed to execute action" }, { status: 500 })
  }
}

/**
 * Cancel an action
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const actionId = searchParams.get("action_id")

    if (!actionId) {
      return NextResponse.json({ error: "Missing action_id" }, { status: 400 })
    }

    const actionLogger = await createActionLogger()

    // Verify ownership before cancelling
    const action = await actionLogger.getAction(actionId)
    if (!action || action.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const cancelled = await actionLogger.cancelAction(actionId)

    if (cancelled) {
      return NextResponse.json({
        success: true,
        message: "Action cancelled",
      })
    } else {
      return NextResponse.json({ error: "Failed to cancel action" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error cancelling action:", error)
    return NextResponse.json({ error: "Failed to cancel action" }, { status: 500 })
  }
}

// Helper functions to execute specific actions

async function executeCancelOrder(orderId: string, reason: string | undefined, supabase: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Pass through Supabase session
      Cookie: supabase.headers?.get("cookie") || "",
    },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to cancel order")
  }

  return await response.json()
}

async function executeGetOrderStatus(orderId: string, supabase: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/orders/${orderId}/status`, {
    method: "GET",
    headers: {
      Cookie: supabase.headers?.get("cookie") || "",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get order status")
  }

  return await response.json()
}

async function executeGetOrderHistory(page: number, limit: number, supabase: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/orders/history?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Cookie: supabase.headers?.get("cookie") || "",
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get order history")
  }

  return await response.json()
}
