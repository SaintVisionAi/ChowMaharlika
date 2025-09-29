import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function InnovationSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Combining innovation, durability and efficiency
          </h2>
        </div>

        {/* Main feature image */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">M</span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                Interactive seafood display and AI-powered inventory management
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Maharlika leverages cutting-edge technology in the seafood industry. We offer sustainable solutions for
            premium seafood and grocery services.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Discover More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
