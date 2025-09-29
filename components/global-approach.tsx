import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GlobalApproach() {
  const approaches = [
    {
      image: "/handshake-business-partnership.jpg",
      title: "Strategic Partnerships",
      description: "Building lasting relationships with premium suppliers and delivery platforms",
    },
    {
      image: "/modern-technology-interface.jpg",
      title: "Technology Integration",
      description: "Seamless POS integration with Clover and multi-platform delivery systems",
    },
    {
      image: "/fresh-seafood-premium-quality.jpg",
      title: "Quality Assurance",
      description: "Rigorous quality control ensuring the freshest seafood and premium groceries",
    },
  ]

  return (
    <section className="py-24 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            A global approach
            <br />
            for a future model
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {approaches.map((approach, index) => (
            <Card
              key={index}
              className="overflow-hidden glass-effect border-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={approach.image || "/placeholder.svg"}
                  alt={approach.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">{approach.title}</h3>
                <p className="text-muted-foreground">{approach.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-6 text-foreground">Let's discuss your project</h3>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Conversation</Button>
        </div>
      </div>
    </section>
  )
}
