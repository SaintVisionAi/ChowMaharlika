"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function CloverSync() {
  const [syncing, setSyncing] = useState(false)
  const [updatingImages, setUpdatingImages] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)

    try {
      const response = await fetch("/api/clover/sync", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync")
      }

      toast({
        title: "Sync successful",
        description: data.message,
      })

      router.refresh()
    } catch (error) {
      console.error("Error syncing:", error)
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync with Clover",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleUpdateImages = async () => {
    setUpdatingImages(true)

    try {
      const response = await fetch("/api/products/update-images", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update images")
      }

      toast({
        title: "Images updated successfully",
        description: data.message,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating images:", error)
      toast({
        title: "Image update failed",
        description: error instanceof Error ? error.message : "Failed to update product images",
        variant: "destructive",
      })
    } finally {
      setUpdatingImages(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Sync</CardTitle>
          <CardDescription>Sync your product inventory from Clover POS to your online store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What happens during sync?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Fetches all items from your Clover inventory</li>
              <li>Updates existing products with latest prices and stock</li>
              <li>Adds new products that don't exist in your online store</li>
              <li>Preserves your custom product descriptions and images</li>
            </ul>
          </div>

          <Button onClick={handleSync} disabled={syncing} size="lg" className="w-full">
            {syncing ? "Syncing..." : "Sync Inventory Now"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#FFD700]">Product Image Update</CardTitle>
          <CardDescription>
            Automatically fetch and assign high-quality images to your products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Fetches images from Clover API if available</li>
              <li>Uses smart matching based on product names (salmon, shrimp, crab, etc.)</li>
              <li>Applies high-quality Unsplash images as fallbacks</li>
              <li>Only updates products without existing images</li>
            </ul>
          </div>

          <Button 
            onClick={handleUpdateImages} 
            disabled={updatingImages} 
            size="lg" 
            className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0f0f0f] font-semibold"
          >
            {updatingImages ? "Updating Images..." : "Update Product Images"}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
