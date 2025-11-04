import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Sparkles, 
  Heart, 
  Clock,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (sku: string, size: string | undefined, quantity: number) => void;
  onRemoveItem: (sku: string, size: string | undefined) => void;
  onSaveForLater: (sku: string, size: string | undefined) => void;
  onSaveToCollection: (sku: string, size: string | undefined) => void;
}

export function ShoppingCart({ 
  isOpen, 
  onClose, 
  items,
  onUpdateQuantity,
  onRemoveItem,
  onSaveForLater,
  onSaveToCollection
}: ShoppingCartProps) {
  const [aiTip, setAiTip] = useState("Layer with a neutral blazer for a polished look");
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const suggestions = [
    "Add a belt to define your waist",
    "Consider neutral accessories",
    "Mix textures for depth"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
            data-testid="cart-overlay"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
            data-testid="cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="font-serif font-bold text-xl">Shopping Cart</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onClose}
                data-testid="button-close-cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* AI Fashion Tip */}
            {items.length > 0 && (
              <Card className="m-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Styling Tip</h3>
                    <p className="text-sm text-muted-foreground">{aiTip}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground/75">
                    Add items from stories to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const uniqueId = `${item.sku}-${item.size ?? 'default'}`;
                    return (
                    <Card key={uniqueId} className="p-4" data-testid={`cart-item-${uniqueId}`}>
                      <div className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                          {item.size && (
                            <p className="text-xs text-muted-foreground mb-2">Size: {item.size}</p>
                          )}
                          <p className="font-semibold">${item.price}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => onUpdateQuantity(item.sku, item.size, Math.max(1, item.quantity - 1))}
                              data-testid={`button-decrease-${uniqueId}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center" data-testid={`quantity-${uniqueId}`}>
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => onUpdateQuantity(item.sku, item.size, item.quantity + 1)}
                              data-testid={`button-increase-${uniqueId}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 justify-start gap-2 h-8 text-xs"
                          onClick={() => onSaveToCollection(item.sku, item.size)}
                          data-testid={`button-save-collection-${uniqueId}`}
                        >
                          <Heart className="w-3 h-3" />
                          Save to Collection
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 justify-start gap-2 h-8 text-xs"
                          onClick={() => onSaveForLater(item.sku, item.size)}
                          data-testid={`button-save-later-${uniqueId}`}
                        >
                          <Clock className="w-3 h-3" />
                          Save for Later
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => onRemoveItem(item.sku, item.size)}
                          data-testid={`button-remove-${uniqueId}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                  })}

                  {/* AI Suggestions */}
                  {items.length > 0 && (
                    <Card className="p-4 bg-accent/10">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Complete the Look
                      </h3>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <div 
                            key={index} 
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Totals */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4 bg-background">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span data-testid="cart-shipping">
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span data-testid="cart-total">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full h-12" size="lg" data-testid="button-checkout">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
