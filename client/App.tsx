import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Placeholder title="Shop" />} />
              <Route
                path="/delivery"
                element={<Placeholder title="Delivery" />}
              />
              <Route
                path="/rewards"
                element={<Placeholder title="Rewards" />}
              />
              <Route
                path="/inventory"
                element={<Placeholder title="Inventory Dashboard" />}
              />
              <Route
                path="/account"
                element={<Placeholder title="Account" />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
