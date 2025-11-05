import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { GlobalCart } from "@/components/GlobalCart";
import { AssistantOverlay } from "@/components/AssistantOverlay";
import { SettingsModal } from "@/components/SettingsModal";
import Home from "@/pages/Home";
import AIStylist from "@/pages/AIStylist";
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
  const { isOpen, openSettings, closeSettings } = useSettings();

  return (
    <>
      <Toaster />
      <Router />
      <GlobalCart />
      <SettingsModal 
        open={isOpen} 
        onOpenChange={(next) => next ? openSettings() : closeSettings()} 
      />
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
        <SettingsProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </SettingsProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
