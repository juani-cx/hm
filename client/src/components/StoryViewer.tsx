import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Look {
  id: string;
  title: string;
  items: Array<{ sku: string; name: string; price: number }>;
}

interface StoryViewerProps {
  storyTitle: string;
  looks: Look[];
  images: string[];
  onClose: () => void;
  onShopLook: (lookId: string) => void;
}

export function StoryViewer({ storyTitle, looks, images, onClose, onShopLook }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentLook = looks[currentIndex] || looks[0];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <div className="flex gap-1 flex-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="ml-4 backdrop-blur-md bg-black/20 text-white hover:bg-black/40 rounded-full"
          data-testid="button-close-story"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center" onClick={goNext}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={storyTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[70vh] w-full object-contain"
          />
        </AnimatePresence>

        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-black/20 rounded-full p-2 text-white"
          data-testid="button-prev-slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-black/20 rounded-full p-2 text-white"
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="font-serif font-bold text-2xl text-white mb-3 tracking-tight">
          {currentLook?.title || storyTitle}
        </h3>
        
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2 scrollbar-hide">
          {currentLook?.items.map((item) => (
            <Badge
              key={item.sku}
              variant="secondary"
              className="backdrop-blur-sm bg-white/90 text-black border-none whitespace-nowrap"
            >
              {item.name} · ${item.price}
            </Badge>
          ))}
        </div>

        <Button
          onClick={() => onShopLook(currentLook?.id || looks[0]?.id)}
          className="w-full backdrop-blur-md bg-white/90 text-black hover:bg-white rounded-full h-12 font-medium"
          data-testid="button-shop-look"
        >
          Shop the Look
        </Button>
      </div>
    </div>
  );
}