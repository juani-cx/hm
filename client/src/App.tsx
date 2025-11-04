import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AIStylist from "@/pages/AIStylist";
import Collections from "@/pages/Collections";
import Collection from "@/pages/Collection";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
