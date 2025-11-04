import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (sku: string, size: string | undefined, quantity: number) => void;
  removeItem: (sku: string, size: string | undefined) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.sku === item.sku && i.size === item.size
      );

      if (existingItem) {
        return prev.map((i) =>
          i.sku === item.sku && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const updateQuantity = (sku: string, size: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku, size);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.sku === sku && item.size === size ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (sku: string, size: string | undefined) => {
    setItems((prev) => prev.filter((item) => !(item.sku === sku && item.size === size)));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
