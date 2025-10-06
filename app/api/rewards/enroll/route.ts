import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enrollMember } from "@/lib/rewards"

/**
 * POST /api/rewards/enroll
 * Enroll a new member in Maharlika Rewards
 * 
 * Body:
 * - phone_number (required)
 * - email (optional)
 * - full_name (optional)
 * - birthday_date (optional)
 * - referral_code (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { phone_number, email, full_name, birthday_date, referral_code } = body
    
    if (!phone_number) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }
    
    // Validate phone format (basic)
    const phoneRegex = /^\+?[\d\s\-()]+$/
    if (!phoneRegex.test(phone_number)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }
    
    // Enroll member
    const result = await enrollMember({
      userId: user?.id,
      phoneNumber: phone_number,
      email: email || user?.email,
      fullName: full_name,
      birthdayDate: birthday_date,
      referredByCode: referral_code,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      member: {
        id: result.member!.id,
        phone_number: result.member!.phone_number,
        referral_code: result.member!.referral_code,
        points_balance: result.member!.current_points_balance,
        welcome_bonus: result.member!.total_points_earned,
      },
      message: `Welcome to Maharlika Rewards! You've earned ${result.member!.total_points_earned} welcome bonus points!`,
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json(
      { error: "Failed to enroll member" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/rewards/enroll
 * Check if user is already enrolled
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ enrolled: false })
    }
    
    const { data: member } = await supabase
      .from("loyalty_members")
      .select("id, phone_number, referral_code")
      .eq("user_id", user.id)
      .single()
    
    if (!member) {
      return NextResponse.json({ enrolled: false })
    }
    
    return NextResponse.json({
      enrolled: true,
      member_id: member.id,
      phone_number: member.phone_number,
      referral_code: member.referral_code,
    })
  } catch (error) {
    console.error("Enrollment check error:", error)
    return NextResponse.json(
      { error: "Failed to check enrollment" },
      { status: 500 }
    )
  }
}
