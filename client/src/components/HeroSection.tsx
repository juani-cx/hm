import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Home, Sparkles, Heart, Settings, HelpCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import hmLogo from "@assets/H&M-Logo_1762206118498.png";
import bgVideo from "@assets/cover3_1762284331952.mp4";

interface HeroSectionProps {
  onEnterFlow: () => void;
}

export function HeroSection({ onEnterFlow }: HeroSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const menuItems = [
    { label: 'Flow Stories', icon: Home, onClick: () => onEnterFlow() },
    { label: 'AI Stylist', icon: Sparkles, onClick: () => console.log('AI Stylist') },
    { label: 'User Profile', icon: User, onClick: () => setLocation('/profile') },
    { label: 'Onboarding', icon: Settings, onClick: () => setLocation('/onboarding') },
    { label: 'Help & Support', icon: HelpCircle, onClick: () => console.log('Help') },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-hero-background"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between py-4 px-6"
      >
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              data-testid="button-hero-menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <img src={hmLogo} alt="H&M" className="h-8 w-auto" />
                <span className="font-serif text-xl">Flow</span>
              </SheetTitle>
            </SheetHeader>
            
            <nav className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="justify-start gap-3 h-12"
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  data-testid={`hero-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <img 
          src={hmLogo} 
          alt="H&M" 
          className="h-8 w-auto absolute left-1/2 -translate-x-1/2"
          data-testid="img-hero-logo"
        />
        
        <div className="w-10" />
      </motion.header>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-full flex flex-col items-center justify-end pb-12 px-6"
      >
        <h1 className="font-serif font-bold text-5xl md:text-6xl text-white text-center tracking-tight leading-tight mb-4">
          Style Your Story
        </h1>
        <p className="text-white/90 text-base md:text-lg text-center mb-8 max-w-md">
          Discover curated looks, get AI-powered style tips, and shop the latest trends
        </p>
        
        <Button
          size="lg"
          onClick={onEnterFlow}
          className="backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 h-12 rounded-full font-medium text-base"
          data-testid="button-enter-flow"
        >
          Explore Flow Stories
        </Button>
        
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-12"
        >
          <ChevronDown className="text-white/60 w-6 h-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}