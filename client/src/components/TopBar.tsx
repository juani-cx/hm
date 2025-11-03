import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, User } from "lucide-react";

interface TopBarProps {
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  cartCount?: number;
}

export function TopBar({ onSearchClick, onCartClick, onProfileClick, cartCount = 0 }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-md bg-background/90 border-b flex items-center justify-between px-4">
      <div className="flex-1" />
      
      <h1 className="font-serif font-bold text-2xl tracking-tight">
        H&M
      </h1>

      <div className="flex-1 flex items-center justify-end gap-2">
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