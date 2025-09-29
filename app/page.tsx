import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AIAssistant } from "@/components/ai-assistant"

export default function HomePage() {
  return (
    <main className="min-h-screen water-texture">
      <Header />
      <HeroSection />
      <AIAssistant />
    </main>
  )
}
