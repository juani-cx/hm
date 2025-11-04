import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Heart, Share2, Bookmark, Edit, Play, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Collection, Item, UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

export default function MagazineArticle() {
  const [, params] = useRoute("/magazine/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { items, addItem, setIsOpen: setCartOpen } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");

  const { data: collection, isLoading } = useQuery<Collection & { items: Item[] }>({
    queryKey: ["/api/collections", params?.id],
    enabled: !!params?.id,
  });

  const userId = "default-user";
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile", userId],
  });

  if (isLoading || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  const currentImage = collection.editorialImages[currentImageIndex];
  const viewStyle = profile?.productPagesStyle || "magazine";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Article link copied to clipboard",
    });
  };

  const handleSaveToCollection = () => {
    toast({
      title: "Saved to Collections",
      description: `${collection.title} has been added to your collections`,
    });
  };

  const handleAddToFavorites = () => {
    toast({
      title: "Added to Favorites",
      description: `${collection.title} is now in your favorites`,
    });
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim()) return;
    
    toast({
      title: "Processing...",
      description: "AI is editing your image",
    });
    
    setIsEditDialogOpen(false);
    setEditPrompt("");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % collection.editorialImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? collection.editorialImages.length - 1 : prev - 1
    );
  };

  const handleAddToCart = (item: Item) => {
    addItem({
      sku: item.sku,
      name: item.name,
      price: item.price,
      image: item.images[0],
      size: item.sizes[0], // Default to first size
    });
    
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
    
    // Optionally open the cart
    setTimeout(() => setCartOpen(true), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/collections")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg" data-testid="text-article-title">
            {collection.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="relative"
            data-testid="button-cart-header"
          >
            <Plus className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Image with Actions */}
      <div className="relative w-full aspect-[9/16] md:aspect-[16/9] bg-muted">
        <img
          src={currentImage.url}
          alt={collection.title}
          className="w-full h-full object-cover"
          data-testid="img-hero"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Hero Actions */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-2" data-testid="text-hero-title">
              {collection.title}
            </h2>
            {currentImage.caption && (
              <p className="text-white/90 text-sm md:text-base" data-testid="text-hero-caption">
                {currentImage.caption}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={() => setIsEditDialogOpen(true)}
              data-testid="button-edit-image"
            >
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={handleAddToFavorites}
              data-testid="button-favorite"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image Navigation */}
        {collection.editorialImages.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={prevImage}
              data-testid="button-prev-image"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={nextImage}
              data-testid="button-next-image"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Image Gallery Preview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl" data-testid="text-gallery-title">
              Explore this Collection
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImageViewerOpen(true)}
              data-testid="button-view-all"
            >
              View All
            </Button>
          </div>

          {/* Image Grid based on user preference */}
          {viewStyle === "magazine" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collection.editorialImages.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setIsImageViewerOpen(true);
                  }}
                  data-testid={`gallery-image-${idx}`}
                >
                  <img
                    src={img.url}
                    alt={img.caption || collection.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-sm">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {viewStyle === "board" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {collection.editorialImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-md overflow-hidden cursor-pointer hover-elevate"
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setIsImageViewerOpen(true);
                  }}
                  data-testid={`gallery-image-${idx}`}
                >
                  <img
                    src={img.url}
                    alt={img.caption || collection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {viewStyle === "virtual_gallery" && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {collection.editorialImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-64 aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-lg hover-elevate"
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setIsImageViewerOpen(true);
                  }}
                  data-testid={`gallery-image-${idx}`}
                >
                  <img
                    src={img.url}
                    alt={img.caption || collection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Article Text */}
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="font-serif text-3xl mb-4">Build Your Look</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {collection.description}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Mix and match pieces to create your perfect outfit. Our AI stylist can help you pair these items for maximum impact.
          </p>
        </div>

        {/* Product Recommendations */}
        {collection.items && collection.items.length > 0 && (
          <div className="mb-12">
            <h3 className="font-serif text-2xl mb-6" data-testid="text-products-title">
              Your Outfit
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {collection.items.slice(0, 4).map((item) => (
                <Card
                  key={item.sku}
                  className="overflow-hidden cursor-pointer group"
                  data-testid={`product-card-${item.sku}`}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-1 text-sm line-clamp-2" data-testid={`product-name-${item.sku}`}>
                      {item.name}
                    </h4>
                    <p className="text-lg font-bold mb-3" data-testid={`product-price-${item.sku}`}>
                      ${item.price.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                      data-testid={`button-add-to-cart-${item.sku}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Save Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveToCollection}
            variant="outline"
            className="flex-1"
            data-testid="button-save-collection"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save to My Collections
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            data-testid="button-share-bottom"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-screen-xl h-screen p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsImageViewerOpen(false)}
              data-testid="button-close-viewer"
            >
              <X className="w-6 h-6" />
            </Button>

            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={collection.editorialImages[currentImageIndex].url}
                alt={collection.editorialImages[currentImageIndex].caption || collection.title}
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-testid="img-fullscreen"
              />
            </AnimatePresence>

            {collection.editorialImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30"
                  onClick={prevImage}
                  data-testid="button-fullscreen-prev"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30"
                  onClick={nextImage}
                  data-testid="button-fullscreen-next"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Action Buttons in Viewer */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                onClick={() => {
                  setIsImageViewerOpen(false);
                  setIsEditDialogOpen(true);
                }}
                data-testid="button-viewer-edit"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit with AI
              </Button>
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                onClick={handleShare}
                data-testid="button-viewer-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                onClick={handleSaveToCollection}
                data-testid="button-viewer-save"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-image">
          <DialogHeader>
            <DialogTitle>Edit Image with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe how you'd like to modify this image
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="E.g., 'Make the background more vibrant' or 'Add a vintage filter'"
                className="w-full min-h-32 p-3 rounded-md border bg-background resize-none"
                data-testid="input-edit-prompt"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditImage}
                disabled={!editPrompt.trim()}
                data-testid="button-apply-edit"
              >
                Apply Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
