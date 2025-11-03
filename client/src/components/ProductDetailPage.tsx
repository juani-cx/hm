import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Heart, Share2, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface ProductDetailPageProps {
  product: {
    sku: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    sizes: string[];
    color: string;
    material: string;
    sustainTags?: string[];
    stock: number;
  };
  onClose: () => void;
  onAddToCart: (sku: string, size: string) => void;
}

export function ProductDetailPage({ product, onClose, onAddToCart }: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart(product.sku, selectedSize);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-pdp"
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLiked(!liked)}
            data-testid="button-like-product"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => console.log('Share clicked')}
            data-testid="button-share-product"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {product.images.map((image, idx) => (
              <motion.img
                key={idx}
                src={image}
                alt={`${product.name} - ${idx + 1}`}
                className="w-full aspect-[3/4] object-cover rounded-xl snap-center flex-shrink-0"
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-center mt-3">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-medium mb-2">{product.name}</h1>
          <div className="text-3xl font-bold text-primary mb-4">${product.price}</div>

          {product.sustainTags && product.sustainTags.length > 0 && (
            <div className="bg-muted rounded-xl p-4 mb-6 flex gap-3">
              <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Sustainable Choice</div>
                <div className="text-xs text-muted-foreground">
                  {product.sustainTags.join(' · ')}
                </div>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed mb-6">{product.description}</p>

          <div className="mb-6">
            <div className="text-sm font-medium mb-3">Select Size</div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="min-w-[3rem]"
                  data-testid={`button-size-${size.toLowerCase()}`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <div className="text-muted-foreground mb-1">Color</div>
              <div className="font-medium">{product.color}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Material</div>
              <div className="font-medium">{product.material}</div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full h-14 bg-black text-white rounded-full font-medium hover:bg-black/90"
            data-testid="button-add-to-cart"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}