import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { GlobalCart } from "@/components/GlobalCart";
import { AssistantOverlay } from "@/components/AssistantOverlay";
import Home from "@/pages/Home";
import AIStylist from "@/pages/AIStylist";
import Settings from "@/pages/Settings";
import Collections from "@/pages/Collections";
import Collection from "@/pages/Collection";
import MagazineArticle from "@/pages/MagazineArticle";
import CampaignArticle from "@/pages/CampaignArticle";
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
      <Route path="/settings" component={Settings} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:id" component={Collection} />
      <Route path="/magazine/:id" component={MagazineArticle} />
      <Route path="/campaign/:id" component={CampaignArticle} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isHomePage = location === '/';

  return (
    <>
      <Toaster />
      <Router />
      <GlobalCart />
      {!isHomePage && (
        <AssistantOverlay
          suggestions={['Show me winter looks', 'What goes with jeans?', 'Sustainable options']}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
