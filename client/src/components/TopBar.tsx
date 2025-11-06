import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ShoppingBag, User, Menu, Home, Sparkles, Heart, Settings, HelpCircle, Layers, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { MusicPlayer } from "@/components/MusicPlayer";
import hmLogo from '@assets/H&M-Logo_1762206118498.png';

interface TopBarProps {
  onSearchClick?: () => void;
  onProfileClick?: () => void;
}

export function TopBar({ onSearchClick, onProfileClick }: TopBarProps) {
  const { items, setIsOpen: setCartOpen } = useCart();
  const { openSettings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const menuItems = [
    { label: 'Flow Stories', icon: Home, onClick: () => setLocation('/') },
    { label: 'Collections', icon: Layers, onClick: () => setLocation('/collections') },
    { label: 'AI Stylist', icon: Sparkles, onClick: () => setLocation('/ai-stylist') },
    { label: 'Favorites', icon: Heart, onClick: () => console.log('Favorites') },
    { label: 'Settings', icon: Settings, onClick: () => openSettings() },
    { label: 'Help & Support', icon: HelpCircle, onClick: () => console.log('Help') },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-md bg-background/90 border-b px-4">
      <div className="grid grid-cols-3 items-center h-full">
        {/* Left: Menu */}
        <div className="flex items-center justify-start">
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
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setLocation('/')}
            className="hover-elevate rounded-md p-1 transition-all"
            data-testid="button-logo-home"
          >
            <img 
              src={hmLogo} 
              alt="H&M" 
              className="h-6 w-auto"
              data-testid="logo-hm"
            />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2">
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
            onClick={() => setCartOpen(true)}
            className="relative"
            data-testid="button-cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onProfileClick?.()}
                data-testid="button-profile"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 bg-white dark:bg-background p-0 mt-2"
              sideOffset={8}
            >
              <DropdownMenuLabel className="px-4 pt-4 pb-2">My Account</DropdownMenuLabel>
              
              <div className="border-t border-b py-2 bg-muted/30">
                <MusicPlayer />
              </div>
              
              <div className="py-2">
                <DropdownMenuItem 
                  onSelect={() => openSettings()}
                  className="cursor-pointer mx-2 my-1"
                  data-testid="menu-personalize"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Personalize Experience
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onSelect={() => console.log('Payment options')}
                  className="cursor-pointer mx-2 my-1"
                  data-testid="menu-payment"
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  Payment Options
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}