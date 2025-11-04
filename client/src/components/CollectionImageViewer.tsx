import { useState } from "react";
import type { Collection, Item } from "@shared/schema";
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface CollectionImageViewerProps {
  collection: Collection & { items?: Item[] };
  initialIndex: number;
  onClose: () => void;
  onAddToCart: (sku: string, size: string) => void;
  onSaveLater: (sku: string) => void;
}

export default function CollectionImageViewer({
  collection,
  initialIndex,
  onClose,
  onAddToCart,
  onSaveLater,
}: CollectionImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { toast } = useToast();

  const currentEditorialImage = collection.editorialImages[currentIndex];
  
  // Get items for current editorial image
  const currentItems = collection.items?.filter(item =>
    currentEditorialImage.itemSkus.includes(item.sku)
  ) || [];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : collection.editorialImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < collection.editorialImages.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  const handleAddAllToCart = () => {
    currentItems.forEach(item => {
      onAddToCart(item.sku, "M");
    });
  };

  const handleSaveCollection = () => {
    // Save the entire collection to favorites
    // This would typically call an API endpoint
    console.log("Save collection:", collection.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="collection-image-viewer"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
        data-testid="button-close-viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      {collection.editorialImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
            data-testid="button-previous-image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
            data-testid="button-next-image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {collection.editorialImages.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {collection.editorialImages.length}
        </div>
      )}

      {/* Main Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img
            src={currentEditorialImage.url}
            alt={currentEditorialImage.caption || `Editorial ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Gradient Overlay for Bottom Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6 md:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          {/* Caption */}
          {currentEditorialImage.caption && (
            <h2 className="font-serif text-3xl md:text-4xl mb-4" data-testid="viewer-caption">
              {currentEditorialImage.caption}
            </h2>
          )}

          {/* Items in this look */}
          {currentItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentItems.map((item) => (
                <Badge
                  key={item.sku}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm"
                  data-testid={`viewer-item-badge-${item.sku}`}
                >
                  {item.name} - ${item.price}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSaveCollection}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm gap-2"
              data-testid="button-save-collection-viewer"
            >
              <Heart className="w-4 h-4" />
              Add to My Collection
            </Button>

            <Button
              onClick={() => {
                if (currentItems.length > 0) {
                  onSaveLater(currentItems[0].sku);
                }
              }}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm gap-2"
              data-testid="button-save-later-viewer"
            >
              <Bookmark className="w-4 h-4" />
              Save for Later
            </Button>

            <Button
              onClick={handleAddAllToCart}
              className="bg-white hover:bg-white/90 text-black gap-2"
              data-testid="button-add-cart-viewer"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart ({currentItems.length})
            </Button>

            <Button
              onClick={() => {
                toast({
                  title: "AI Stylist",
                  description: "Chat with our AI stylist to get personalized recommendations for this collection.",
                });
              }}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm gap-2"
              data-testid="button-ai-assist-viewer"
            >
              <Sparkles className="w-4 h-4" />
              Virtual AI Assist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
