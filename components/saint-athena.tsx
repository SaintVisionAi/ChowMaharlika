"use client"

import { useState } from "react"
import { SaintAthenaBadge } from "./saint-athena-badge"
import { SaintAthenaPanel } from "./saint-athena-panel"
import { Toaster } from "sonner"

export function SaintAthena() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <>
      {/* Floating Badge */}
      <SaintAthenaBadge onOpenPanel={() => setIsPanelOpen(true)} />

      {/* Chat Panel */}
      <SaintAthenaPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}
