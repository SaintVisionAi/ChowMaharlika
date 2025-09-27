import { useState } from "react";
import { Bot, CheckCircle2, Gift, PackageSearch, ShieldCheck, Smartphone, Truck, Zap } from "lucide-react";

function GoldButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border border-[hsl(var(--gold-600))]/60",
        "bg-gradient-to-b from-[hsl(var(--gold-500))] to-[hsl(var(--gold-600))] px-6 py-3 text-sm",
        "font-semibold text-[hsl(var(--charcoal-900))] shadow-glow-gold transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-500))]",
        className,
      ].join(" ")}
    />
  );
}

function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <div className="mb-2 inline-block rounded-full border border-[hsl(var(--gold-700))]/40 bg-[hsl(var(--charcoal-800))] px-3 py-1 text-xs tracking-wide text-[hsl(var(--gold-400))]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-brand text-4xl text-foreground">{title}</h2>
      {desc && <p className="mt-3 text-foreground/70">{desc}</p>}
    </div>
  );
}

export default function Index() {
  const [messages, setMessages] = useState<Array<{ from: "user" | "saintchow"; text: string }>>([
    { from: "saintchow", text: "Hi! I’m SaintChow. Ask about today’s catch, orders, or rewards." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const reply = getReply(text);
    setMessages((m) => [...m, { from: "user", text }, { from: "saintchow", text: reply }]);
    setInput("");
  };

  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-50%,hsl(var(--gold-500))/25%,transparent),radial-gradient(800px_400px_at_-20%_20%,hsl(var(--gold-700))/15%,transparent),radial-gradient(800px_400px_at_120%_60%,hsl(var(--gold-600))/10%,transparent)]" />
        <div className="container grid min-h-[72vh] items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold-700))]/40 bg-[hsl(var(--charcoal-800))] px-3 py-1 text-xs text-[hsl(var(--gold-300))]">
              <Zap className="h-3.5 w-3.5" /> Powered by Clover · Delivery partners supported
            </div>
            <h1 className="mt-4 font-brand text-5xl leading-tight text-foreground md:text-6xl">
              Maharlika Seafood Mart & Chow
            </h1>
            <p className="mt-4 max-w-xl text-foreground/70">
              Premium seafood, Asian groceries, and hot meals with effortless checkout, rewards, and delivery. Deep charcoal with golden accents for a refined experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/shop" className="inline-block">
                <GoldButton>Shop now</GoldButton>
              </a>
              <a href="/delivery" className="inline-block">
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-[hsl(var(--charcoal-800))] px-6 py-3 text-sm font-semibold text-foreground/90 hover:text-foreground">
                  Delivery options
                </button>
              </a>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-foreground/60 md:max-w-sm">
              <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[hsl(var(--gold-400))]"/> Fresh daily</div>
              <div className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[hsl(var(--gold-400))]"/> Secure checkout</div>
              <div className="inline-flex items-center gap-2"><Gift className="h-4 w-4 text-[hsl(var(--gold-400))]"/> Rewards</div>
              <div className="inline-flex items-center gap-2"><Smartphone className="h-4 w-4 text-[hsl(var(--gold-400))]"/> SMS login at store</div>
            </div>
          </div>

          {/* Assistant */}
          <div className="rounded-xl border border-border/70 bg-[hsl(var(--charcoal-850))] p-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-b from-[hsl(var(--gold-500))] to-[hsl(var(--gold-700))] text-[hsl(var(--charcoal-900))]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">SaintChow Assistant</div>
                <div className="text-xs text-foreground/60">Ask about inventory, orders, or service.</div>
              </div>
            </div>

            <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto rounded-md bg-[hsl(var(--charcoal-900))] p-3">
              {messages.map((m, i) => (
                <div key={i} className={m.from === "user" ? "ml-auto max-w-[85%] rounded-lg bg-[hsl(var(--charcoal-700))] px-3 py-2" : "max-w-[85%] rounded-lg bg-[hsl(var(--charcoal-800))] px-3 py-2"}>
                  <div className="text-xs uppercase tracking-wide text-foreground/60">{m.from === "user" ? "You" : "SaintChow"}</div>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about salmon, rewards, or hours"
                className="flex-1 rounded-md border border-border/60 bg-[hsl(var(--charcoal-900))] px-3 py-2 text-sm outline-none placeholder:text-foreground/40"
              />
              <GoldButton onClick={send}>Send</GoldButton>
            </div>
            <p className="mt-2 text-xs text-foreground/50">
              This is a local demo. Connect to your preferred AI provider to enable production assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 py-20">
        <SectionTitle
          eyebrow="Built for speed"
          title="Seamless shopping in‑store and online"
          desc="One login across Clover terminals and the web. Delivery partners supported. Rewards that customers love."
        />
        <div className="container mt-10 grid gap-6 md:grid-cols-3">
          <Feature icon={<PackageSearch className="h-5 w-5" />} title="Live inventory" desc="Sync products and stock from Clover to keep shelves and online store aligned." />
          <Feature icon={<Truck className="h-5 w-5" />} title="Delivery partners" desc="Offer Doordash, Grubhub, Uber Eats and more from one menu." />
          <Feature icon={<Gift className="h-5 w-5" />} title="Rewards" desc="Phone‑first at checkout. Email + name supported for online accounts." />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/60 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(700px_300px_at_50%_-30%,hsl(var(--gold-500))/25%,transparent)]" />
        <div className="container flex flex-col items-center text-center">
          <h3 className="font-brand text-3xl">Ready to taste the difference?</h3>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Explore our fresh catch and house specials. Order pickup, schedule delivery, and earn rewards every time.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/shop"><GoldButton>Browse catalog</GoldButton></a>
            <a href="/rewards"><button className="rounded-md border border-border/60 bg-[hsl(var(--charcoal-800))] px-5 py-3 text-sm font-semibold text-foreground/90 hover:text-foreground">Join rewards</button></a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-[hsl(var(--charcoal-900))] p-6 shadow-xl">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--charcoal-800))] text-[hsl(var(--gold-400))]">
        {icon}
      </div>
      <div className="mt-3 font-semibold text-foreground">{title}</div>
      <p className="mt-2 text-sm text-foreground/70">{desc}</p>
    </div>
  );
}

function getReply(q: string) {
  const s = q.toLowerCase();
  if (s.includes("hours") || s.includes("open")) return "We’re open 10am–8pm daily. Holiday hours may vary.";
  if (s.includes("salmon") || s.includes("crab") || s.includes("shrimp")) return "Yes! We have fresh options today. Ask for pricing by weight at the counter or browse the online catalog.";
  if (s.includes("rewards") || s.includes("points")) return "Rewards use your phone number in‑store and your email online. You’ll earn points on every order.";
  if (s.includes("delivery") || s.includes("pickup")) return "We support pickup and local delivery via popular partners like DoorDash, Grubhub, and Uber Eats.";
  if (s.includes("loyalty") || s.includes("login") || s.includes("account")) return "Create an account with email + name for online orders. In‑person checkout uses phone number only for speed.";
  return "I can help with menu, orders, delivery, and rewards. Try: ‘What’s fresh today?’";
}
