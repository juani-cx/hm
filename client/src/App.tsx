import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { GlobalCart } from "@/components/GlobalCart";
import Home from "@/pages/Home";
import AIStylist from "@/pages/AIStylist";
import Collections from "@/pages/Collections";
import Collection from "@/pages/Collection";
import MagazineArticle from "@/pages/MagazineArticle";
import OnboardingPage from "@/pages/onboarding";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/ai-stylist" component={AIStylist} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:id" component={Collection} />
      <Route path="/magazine/:id" component={MagazineArticle} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <GlobalCart />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
