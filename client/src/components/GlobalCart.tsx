import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "@/components/ShoppingCart";
import { useToast } from "@/hooks/use-toast";

export function GlobalCart() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const handleSaveForLater = (sku: string, size: string | undefined) => {
    toast({
      title: "Saved for Later",
      description: "Item moved to saved items",
    });
  };

  const handleSaveToCollection = (sku: string, size: string | undefined) => {
    toast({
      title: "Saved to Collection",
      description: "Item added to your collection",
    });
  };

  return (
    <ShoppingCart
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      items={items}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onSaveForLater={handleSaveForLater}
      onSaveToCollection={handleSaveToCollection}
    />
  );
}
