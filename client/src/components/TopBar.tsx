import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingBag, User, Menu, Home, Sparkles, Heart, Settings, HelpCircle } from "lucide-react";
import hmLogo from '@assets/H&M-Logo_1762206118498.png';

interface TopBarProps {
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  cartCount?: number;
}

export function TopBar({ onSearchClick, onCartClick, onProfileClick, cartCount = 0 }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const menuItems = [
    { label: 'Flow Stories', icon: Home, onClick: () => setLocation('/') },
    { label: 'AI Stylist', icon: Sparkles, onClick: () => setLocation('/ai-stylist') },
    { label: 'Favorites', icon: Heart, onClick: () => console.log('Favorites') },
    { label: 'Settings', icon: Settings, onClick: () => console.log('Settings') },
    { label: 'Help & Support', icon: HelpCircle, onClick: () => console.log('Help') },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-md bg-background/90 border-b flex items-center justify-between px-4">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5" />
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
                data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
        className="h-6 w-auto absolute left-1/2 -translate-x-1/2"
        data-testid="logo-hm"
      />

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onSearchClick}
          data-testid="button-search"
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCartClick}
          className="relative"
          data-testid="button-cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onProfileClick}
          data-testid="button-profile"
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}