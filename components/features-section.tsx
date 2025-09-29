import { Card } from "@/components/ui/card"
import { Sparkles, ShoppingCart, Award, Smartphone } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Shopping",
      description:
        "SaintChow AI assistant helps you navigate our inventory, find the freshest items, and provides personalized recommendations based on your preferences.",
    },
    {
      icon: ShoppingCart,
      title: "Seamless E-commerce",
      description:
        "Shop online with our intuitive platform featuring real-time inventory, smart search, and integrated checkout with multiple payment options.",
    },
    {
      icon: Award,
      title: "Loyalty Rewards",
      description:
        "Earn points with every purchase using your phone number. Enjoy exclusive discounts, early access to premium items, and special member benefits.",
    },
    {
      icon: Smartphone,
      title: "Multi-Platform Delivery",
      description:
        "Order through our website or your favorite delivery apps - GrubHub, DoorDash, Uber Eats. Same premium quality, multiple convenient options.",
    },
  ]

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Our <span className="text-primary">Principal</span> Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combining innovation, durability, and efficiency for the ultimate seafood and grocery shopping experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 glass-effect border-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
