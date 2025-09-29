import { CloverSync } from "@/components/admin/clover-sync"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CloverIntegrationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Clover Integration</h1>
        <p className="text-muted-foreground">Sync inventory and orders with your Clover POS system</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Your Clover POS integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Merchant ID</span>
                <span className="font-mono text-sm">526163795887</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-semibold text-green-600">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Information</CardTitle>
            <CardDescription>Inventory synchronization details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm">Never</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto Sync</span>
                <span className="text-sm">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CloverSync />
    </div>
  )
}
