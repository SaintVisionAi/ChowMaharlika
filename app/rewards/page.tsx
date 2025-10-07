"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Award, 
  Star, 
  Crown, 
  TrendingUp, 
  Gift, 
  History, 
  Users, 
  Heart,
  Sparkles,
  ArrowRight,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RewardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [balance, setBalance] = useState<any>(null)
  const [catalog, setCatalog] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkEnrollmentAndLoadData()
  }, [])

  async function checkEnrollmentAndLoadData() {
    setLoading(true)
    
    // Check if user is logged in
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)
    
    if (!currentUser) {
      setLoading(false)
      return
    }

    // Check enrollment
    const enrollResponse = await fetch("/api/rewards/enroll")
    const enrollData = await enrollResponse.json()
    
    if (enrollData.enrolled) {
      setEnrolled(true)
      await loadRewardsData()
    } else {
      setEnrolled(false)
    }
    
    setLoading(false)
  }

  async function loadRewardsData() {
    // Load balance
    const balanceResponse = await fetch("/api/rewards/balance")
    const balanceData = await balanceResponse.json()
    setBalance(balanceData)

    // Load catalog
    const catalogResponse = await fetch("/api/rewards/catalog")
    const catalogData = await catalogResponse.json()
    setCatalog(catalogData)

    // Load history
    const historyResponse = await fetch("/api/rewards/history?limit=10")
    const historyData = await historyResponse.json()
    setHistory(historyData)
  }

  async function handleRedeem(rewardId: string) {
    const response = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reward_id: rewardId }),
    })

    const data = await response.json()

    if (data.success) {
      toast({
        title: "Reward Redeemed! 🎉",
        description: `Your code: ${data.redemption_code}. Use it at checkout!`,
      })
      await loadRewardsData()
    } else {
      toast({
        title: "Redemption Failed",
        description: data.error,
        variant: "destructive",
      })
    }
  }

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case "Bronze": return <Award className="h-6 w-6" style={{ color: "#CD7F32" }} />
      case "Silver": return <Star className="h-6 w-6" style={{ color: "#C0C0C0" }} />
      case "Gold": return <Crown className="h-6 w-6" style={{ color: "#FFD700" }} />
      default: return <Award className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <Sparkles className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-3 text-lg">Loading your rewards...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto p-12 text-center glass-effect border-yellow-500/20">
          <Sparkles className="h-16 w-16 mx-auto text-yellow-400 mb-6" />
          <h1 className="text-3xl font-bold mb-4 gold-glow">Maharlika Rewards</h1>
          <p className="text-gray-300 mb-8">
            Sign in to join our rewards program and start earning points!
          </p>
          <Button onClick={() => router.push("/auth/login")} size="lg" className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold">
            Sign In to Join
          </Button>
        </Card>
      </div>
    )
  }

  if (!enrolled) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto p-12 text-center glass-effect border-yellow-500/20">
          <Gift className="h-16 w-16 mx-auto text-yellow-400 mb-6" />
          <h1 className="text-3xl font-bold mb-4 gold-glow">Join Maharlika Rewards!</h1>
          <p className="text-gray-300 mb-8">
            Get 20 welcome points just for joining. Earn 1 point per $1 spent!
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-zinc-900 rounded-lg border border-orange-500/30">
              <Award className="h-8 w-8 mx-auto mb-2" style={{ color: "#CD7F32" }} />
              <div className="font-bold text-white">Bronze</div>
              <div className="text-sm text-gray-400">0-499 pts</div>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg border border-gray-500/30">
              <Star className="h-8 w-8 mx-auto mb-2" style={{ color: "#C0C0C0" }} />
              <div className="font-bold text-white">Silver</div>
              <div className="text-sm text-gray-400">500-999 pts</div>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg border border-yellow-500/30">
              <Crown className="h-8 w-8 mx-auto mb-2" style={{ color: "#FFD700" }} />
              <div className="font-bold text-white">Gold</div>
              <div className="text-sm text-gray-400">1000+ pts</div>
            </div>
          </div>
          <Button 
            onClick={async () => {
              const response = await fetch("/api/rewards/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone_number: user.phone || user.email,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || "",
                }),
              })
              const data = await response.json()
              if (data.success) {
                toast({ title: "Welcome! 🎉", description: data.message })
                await checkEnrollmentAndLoadData()
              }
            }}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold"
          >
            Enroll Now - Get 20 Points Free!
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Card */}
      <Card className="p-8 mb-8 glass-effect border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold gold-glow">Maharlika Rewards</h1>
              <Badge 
                variant="outline" 
                className="text-lg px-3 py-1 border-yellow-500 text-yellow-400"
              >
                {getTierIcon(balance?.tier?.current?.name)}
                <span className="ml-2">{balance?.tier?.current?.name}</span>
              </Badge>
            </div>
            <p className="text-gray-300">
              Member since {new Date(balance?.member?.enrollment_date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold gold-shimmer">
              {balance?.points?.current_balance}
            </div>
            <div className="text-gray-300 font-medium">Points Available</div>
            <div className="text-sm text-yellow-400">
              ≈ ${balance?.points?.dollar_value} in rewards
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {!balance?.tier?.progress?.isMaxTier && (
          <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-yellow-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">
                Progress to {balance?.tier?.progress?.nextTier?.tier_name}
              </span>
              <span className="text-sm text-yellow-400">
                {balance?.tier?.progress?.pointsUntilNext} points to go
              </span>
            </div>
            <Progress value={balance?.tier?.progress?.progressPercentage} className="h-3 bg-zinc-800" />
          </div>
        )}
      </Card>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border border-yellow-500/20">
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="referral">
            <Users className="h-4 w-4 mr-2" />
            Refer Friends
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog?.rewards?.all?.map((reward: any) => (
              <Card key={reward.id} className="p-6 glass-effect border-yellow-500/20 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">{reward.reward_name}</h3>
                    <p className="text-sm text-gray-300">{reward.reward_description}</p>
                  </div>
                  {reward.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-yellow-400">
                      {reward.points_required} pts
                    </span>
                    {reward.dollar_value && (
                      <span className="text-gray-300">
                        ${reward.dollar_value} value
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={balance?.points?.current_balance < reward.points_required}
                    className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400"
                  >
                    {balance?.points?.current_balance >= reward.points_required ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Redeem Now
                      </>
                    ) : (
                      `Need ${reward.points_required - balance?.points?.current_balance} more pts`
                    )}
                  </Button>
                </div>

                {reward.reward_type === "charity" && (
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Supports local food bank
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6 glass-effect border-yellow-500/20">
            <h3 className="font-bold text-xl mb-4 text-white">Transaction History</h3>
            <div className="space-y-4">
              {history?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-zinc-700 pb-4">
                  <div>
                    <div className="font-medium text-white">{tx.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.date).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Card className="p-8 text-center glass-effect border-yellow-500/20">
            <Users className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
            <h3 className="font-bold text-2xl mb-2 text-white">Refer Friends, Earn Points!</h3>
            <p className="text-gray-300 mb-6">
              Share your code. You get 25 points, they get 20 points!
            </p>
            
            <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-yellow-500/20">
              <div className="text-sm text-gray-400 mb-2">Your Referral Code</div>
              <div className="text-3xl font-mono font-bold text-yellow-400 mb-4">
                {balance?.member?.referral_code}
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(balance?.member?.referral_code)
                  toast({ title: "Copied!", description: "Referral code copied to clipboard" })
                }}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold"
              >
                Copy Code
              </Button>
            </div>

            <div className="text-sm text-gray-300">
              Referrals completed: {balance?.member?.referral_count}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 glass-effect border-yellow-500/20 text-center">
              <div className="text-sm text-gray-400 mb-2">Lifetime Points Earned</div>
              <div className="text-3xl font-bold text-yellow-400">{balance?.points?.lifetime_earned}</div>
            </Card>
            <Card className="p-6 glass-effect border-yellow-500/20 text-center">
              <div className="text-sm text-gray-400 mb-2">Total Purchases</div>
              <div className="text-3xl font-bold text-white">{balance?.purchase_stats?.total_purchases}</div>
            </Card>
            <Card className="p-6 glass-effect border-yellow-500/20 text-center">
              <div className="text-sm text-gray-400 mb-2">Total Spent</div>
              <div className="text-3xl font-bold text-white">${balance?.purchase_stats?.total_spent?.toFixed(2)}</div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
