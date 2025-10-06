import { createClient } from "@/lib/supabase/server"

export type ActionType = "cancel_order" | "get_order_status" | "get_order_history" | "modify_order" | "refund_order"

export type ActionStatus = "pending" | "confirmed" | "executed" | "failed" | "cancelled"

export interface AIAction {
  id?: string
  user_id: string
  conversation_id?: string
  action_type: ActionType
  action_data: Record<string, any>
  status: ActionStatus
  result?: Record<string, any>
  error_message?: string
  executed_at?: string
  created_at?: string
  updated_at?: string
}

export class ActionLogger {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  /**
   * Log a new AI action with pending status
   */
  async logAction(action: Omit<AIAction, "id" | "status" | "created_at" | "updated_at">): Promise<string | null> {
    try {
      console.log("[v0] Logging AI action:", action.action_type)

      const { data, error } = await this.supabase
        .from("ai_actions")
        .insert({
          user_id: action.user_id,
          conversation_id: action.conversation_id,
          action_type: action.action_type,
          action_data: action.action_data,
          status: "pending",
        })
        .select("id")
        .single()

      if (error) {
        console.error("[v0] Failed to log action:", error)
        return null
      }

      console.log("[v0] Action logged with ID:", data.id)
      return data.id
    } catch (error) {
      console.error("[v0] Error logging action:", error)
      return null
    }
  }

  /**
   * Update action status to confirmed (user approved)
   */
  async confirmAction(actionId: string): Promise<boolean> {
    try {
      console.log("[v0] Confirming action:", actionId)

      const { error } = await this.supabase
        .from("ai_actions")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .eq("status", "pending") // Only confirm if still pending

      if (error) {
        console.error("[v0] Failed to confirm action:", error)
        return false
      }

      console.log("[v0] Action confirmed:", actionId)
      return true
    } catch (error) {
      console.error("[v0] Error confirming action:", error)
      return false
    }
  }

  /**
   * Update action status to executed with result
   */
  async executeAction(actionId: string, result: Record<string, any>): Promise<boolean> {
    try {
      console.log("[v0] Marking action as executed:", actionId)

      const { error } = await this.supabase
        .from("ai_actions")
        .update({
          status: "executed",
          result,
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId)

      if (error) {
        console.error("[v0] Failed to mark action as executed:", error)
        return false
      }

      console.log("[v0] Action executed:", actionId)
      return true
    } catch (error) {
      console.error("[v0] Error executing action:", error)
      return false
    }
  }

  /**
   * Update action status to failed with error message
   */
  async failAction(actionId: string, errorMessage: string): Promise<boolean> {
    try {
      console.log("[v0] Marking action as failed:", actionId)

      const { error } = await this.supabase
        .from("ai_actions")
        .update({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId)

      if (error) {
        console.error("[v0] Failed to mark action as failed:", error)
        return false
      }

      console.log("[v0] Action marked as failed:", actionId)
      return true
    } catch (error) {
      console.error("[v0] Error failing action:", error)
      return false
    }
  }

  /**
   * Cancel a pending action
   */
  async cancelAction(actionId: string): Promise<boolean> {
    try {
      console.log("[v0] Cancelling action:", actionId)

      const { error } = await this.supabase
        .from("ai_actions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .eq("status", "pending") // Only cancel if pending

      if (error) {
        console.error("[v0] Failed to cancel action:", error)
        return false
      }

      console.log("[v0] Action cancelled:", actionId)
      return true
    } catch (error) {
      console.error("[v0] Error cancelling action:", error)
      return false
    }
  }

  /**
   * Get recent actions for a user
   */
  async getUserActions(userId: string, limit: number = 10): Promise<AIAction[]> {
    try {
      const { data, error } = await this.supabase
        .from("ai_actions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[v0] Failed to fetch user actions:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching user actions:", error)
      return []
    }
  }

  /**
   * Get action by ID
   */
  async getAction(actionId: string): Promise<AIAction | null> {
    try {
      const { data, error } = await this.supabase
        .from("ai_actions")
        .select("*")
        .eq("id", actionId)
        .single()

      if (error) {
        console.error("[v0] Failed to fetch action:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("[v0] Error fetching action:", error)
      return null
    }
  }
}

/**
 * Helper function to create ActionLogger instance
 */
export async function createActionLogger(): Promise<ActionLogger> {
  const supabase = await createClient()
  return new ActionLogger(supabase)
}
