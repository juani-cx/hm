import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, Share2, Bookmark, Play, ChevronLeft, ChevronRight, X, Plus, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Story, Look, Item, UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { TopBar } from "@/components/TopBar";

export default function CampaignArticle() {
  const [, params] = useRoute("/campaign/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<{ [sku: string]: string }>({});
  
  // AI Prompt state
  const [aiMood, setAiMood] = useState("");
  const [aiStyle, setAiStyle] = useState("");
  const [aiBodyType, setAiBodyType] = useState("");
  const [aiInspiration, setAiInspiration] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const { data: story, isLoading: storyLoading, isError: storyError } = useQuery<Story>({
    queryKey: ["/api/stories", params?.id],
    enabled: !!params?.id,
  });

  const { data: looks = [], isError: looksError } = useQuery<Look[]>({
    queryKey: ["/api/stories", params?.id, "looks"],
    enabled: !!params?.id && !!story,
  });

  const { data: items = [], isError: itemsError } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const userId = "default-user";
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile", userId],
  });

  if (storyLoading || !story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <TopBar />
        <div className="text-center">
          {storyError ? (
            <>
              <p className="text-destructive mb-4">Failed to load campaign</p>
              <Button onClick={() => setLocation("/")}>Back to Home</Button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading campaign...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Get items from looks and deduplicate by SKU
  const lookItemsMap = new Map<string, Item>();
  looks.flatMap(look => 
    look.items.map(li => items.find(item => item.sku === li.sku)).filter(Boolean)
  ).forEach(item => {
    if (item && !lookItemsMap.has(item.sku)) {
      lookItemsMap.set(item.sku, item);
    }
  });
  const lookItems = Array.from(lookItemsMap.values());

  const currentImage = story.images[currentImageIndex];
  const viewStyle = profile?.productPagesStyle || "magazine";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Campaign link copied to clipboard",
    });
  };

  const handleSaveToCollection = () => {
    toast({
      title: "Saved to Collections",
      description: `${story.title} has been added to your collections`,
    });
  };

  const handleAddToFavorites = () => {
    toast({
      title: "Added to Favorites",
      description: `${story.title} is now in your favorites`,
    });
  };

  const handleGenerateAIView = () => {
    toast({
      title: "Generating...",
      description: "AI is creating your personalized view",
    });
    setIsAIPromptOpen(false);
    // Reset fields
    setAiMood("");
    setAiStyle("");
    setAiBodyType("");
    setAiInspiration("");
    setCustomPrompt("");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % story.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? story.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = (item: Item, size?: string) => {
    const itemSize = size || selectedSize[item.sku] || item.sizes[0];
    addItem({
      sku: item.sku,
      name: item.name,
      price: item.price,
      image: item.images[0],
      size: itemSize,
    });
    
    toast({
      title: "Added to Cart",
      description: `${item.name} (${itemSize}) has been added to your cart`,
    });
    
    setTimeout(() => setCartOpen(true), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      {/* Hero Image with Interactive Controls */}
      <div className="relative w-full aspect-[9/16] md:aspect-[16/9] bg-muted">
        <img
          src={currentImage}
          alt={story.title}
          className="w-full h-full object-cover"
          data-testid="img-hero"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Hero Content & Actions */}
        <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex items-end justify-between">
          <div className="flex-1 pr-3">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-white mb-1 sm:mb-2" data-testid="text-hero-title">
              {story.title}
            </h1>
            <p className="text-white/90 text-xs sm:text-sm md:text-base" data-testid="text-hero-subtitle">
              {story.lookCount} looks · {story.tags?.join(', ')}
            </p>
          </div>
          
          {/* Floating Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={handleSaveToCollection}
              data-testid="button-save-collection"
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={handleAddToFavorites}
              data-testid="button-favorite"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Image Navigation */}
        {story.images.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-3 sm:px-4">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={prevImage}
              data-testid="button-prev-image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
              onClick={nextImage}
              data-testid="button-next-image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Interactive Media Section */}
      <div className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {story.images.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImageViewerOpen(true)}
                data-testid="button-view-gallery"
                className="text-xs sm:text-sm"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                View Gallery
              </Button>
            )}
            
            {story.videoRef && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoOpen(true)}
                data-testid="button-play-video"
                className="text-xs sm:text-sm"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Watch Video
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAIPromptOpen(true)}
              data-testid="button-ai-prompt"
              className="text-xs sm:text-sm"
            >
              <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              AI Styling
            </Button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Editorial Content */}
        <div className="prose prose-sm sm:prose-lg max-w-none mb-8 sm:mb-12">
          <h2 className="font-serif text-xl sm:text-3xl mb-3 sm:mb-4">{story.title}</h2>
          
          {story.narrativeMd ? (
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
              {story.narrativeMd.split('\n\n').map((paragraph, idx) => (
                <div key={idx}>
                  <p className="mb-4">{paragraph}</p>
                  
                  {/* AI Suggestion between paragraphs */}
                  {idx === 0 && (
                    <Card className="my-6 sm:my-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5" data-testid="ai-suggestion-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base mb-2">This collection matches your style!</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                            Based on your preferences, we think you'll love these pieces. Try them on virtually to see how they look on you.
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => setLocation("/ai-stylist")}
                            data-testid="button-try-on-suggestion"
                            className="text-xs sm:text-sm"
                          >
                            <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Try It On Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Discover the latest trends and curated looks from our {story.title} collection. Each piece is carefully selected to help you express your unique style.
              </p>
              
              {/* AI Suggestion */}
              <Card className="my-6 sm:my-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5" data-testid="ai-suggestion-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base mb-2">This collection matches your style!</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Based on your preferences, we think you'll love these pieces. Try them on virtually to see how they look on you.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setLocation("/ai-stylist")}
                      data-testid="button-try-on-suggestion"
                      className="text-xs sm:text-sm"
                    >
                      <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Try It On Now
                    </Button>
                  </div>
                </div>
              </Card>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Mix and match pieces to create your perfect outfit. Our AI stylist can help you pair these items for maximum impact and style confidence.
              </p>
            </>
          )}
        </div>

        {/* Shop This Collection */}
        {lookItems.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-serif text-xl sm:text-2xl" data-testid="text-shop-title">
                Shop This Collection
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lookItems.length} {lookItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {lookItems.slice(0, 8).map((item) => (
                <Card
                  key={item.sku}
                  className="overflow-hidden group"
                  data-testid={`product-card-${item.sku}`}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <h4 className="font-medium mb-1 text-xs sm:text-sm line-clamp-2" data-testid={`product-name-${item.sku}`}>
                      {item.name}
                    </h4>
                    <p className="text-sm sm:text-base font-bold mb-2" data-testid={`product-price-${item.sku}`}>
                      ${item.price.toFixed(2)}
                    </p>
                    
                    {/* Size Selection */}
                    <Select 
                      value={selectedSize[item.sku] || item.sizes[0]}
                      onValueChange={(value) => setSelectedSize({ ...selectedSize, [item.sku]: value })}
                    >
                      <SelectTrigger className="w-full mb-2 h-7 sm:h-8 text-xs" data-testid={`select-size-${item.sku}`}>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleAddToCart(item)}
                      data-testid={`button-add-to-cart-${item.sku}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Save Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleSaveToCollection}
            variant="outline"
            className="flex-1 text-xs sm:text-sm"
            data-testid="button-save-collection-bottom"
          >
            <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Save to My Collections</span>
            <span className="sm:hidden">Save</span>
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="text-xs sm:text-sm"
            data-testid="button-share-bottom"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Gallery */}
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
                src={story.images[currentImageIndex]}
                alt={story.title}
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-testid="img-fullscreen"
              />
            </AnimatePresence>

            {story.images.length > 1 && (
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      {story.videoRef && (
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative aspect-video bg-black">
              <video
                src={story.videoRef}
                controls
                autoPlay
                className="w-full h-full"
                data-testid="video-player"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Prompt Dialog */}
      <Dialog open={isAIPromptOpen} onOpenChange={setIsAIPromptOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-ai-prompt">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              AI Styling Assistant
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="style" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="style" data-testid="tab-style">Style</TabsTrigger>
              <TabsTrigger value="mood" data-testid="tab-mood">Mood</TabsTrigger>
              <TabsTrigger value="body" data-testid="tab-body">Body</TabsTrigger>
              <TabsTrigger value="prompt" data-testid="tab-prompt">Prompt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="style" className="space-y-4">
              <div>
                <Label htmlFor="style-input">Minimal fashion</Label>
                <Input 
                  id="style-input"
                  placeholder="e.g., Minimal, Streetwear, Elegant..."
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  data-testid="input-style"
                />
              </div>
              <div>
                <Label htmlFor="inspiration-input">Inspiration</Label>
                <Input 
                  id="inspiration-input"
                  placeholder="e.g., Image, music, video..."
                  value={aiInspiration}
                  onChange={(e) => setAiInspiration(e.target.value)}
                  data-testid="input-inspiration"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="mood" className="space-y-4">
              <div>
                <Label htmlFor="mood-input">Happy summer</Label>
                <Input 
                  id="mood-input"
                  placeholder="e.g., Happy, Confident, Relaxed..."
                  value={aiMood}
                  onChange={(e) => setAiMood(e.target.value)}
                  data-testid="input-mood"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="space-y-4">
              <div>
                <Label htmlFor="body-input">Shorter stature, slender frame</Label>
                <Select value={aiBodyType} onValueChange={setAiBodyType}>
                  <SelectTrigger id="body-input" data-testid="select-body-type">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athletic">Athletic Build</SelectItem>
                    <SelectItem value="petite">Petite</SelectItem>
                    <SelectItem value="curvy">Curvy</SelectItem>
                    <SelectItem value="tall_slim">Tall & Slim</SelectItem>
                    <SelectItem value="plus_size">Plus Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="prompt" className="space-y-4">
              <div>
                <Label htmlFor="prompt-input">Ask for your own task</Label>
                <textarea
                  id="prompt-input"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe what you want to see... e.g., 'Show me this outfit in a beach setting with sunset lighting'"
                  className="w-full min-h-32 p-3 rounded-md border bg-background resize-none text-sm"
                  data-testid="input-custom-prompt"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAIPromptOpen(false)}
              data-testid="button-cancel-ai"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAIView}
              data-testid="button-generate-ai"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
