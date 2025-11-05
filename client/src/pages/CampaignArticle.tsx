import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Share2, Plus, Sparkles, Wand2, Play, Settings, Image as ImageIcon, Upload, Instagram, MessageCircle } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import type { Story, Look, Item, UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { TopBar } from "@/components/TopBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CampaignArticle() {
  const [, params] = useRoute("/campaign/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<{ [sku: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Prompt state
  const [aiPromptQuestion, setAiPromptQuestion] = useState("");
  
  // Settings/Preview Configuration state
  const [settingsBody, setSettingsBody] = useState("");
  const [settingsStyle, setSettingsStyle] = useState("");
  const [settingsMood, setSettingsMood] = useState("");
  const [settingsInspiration, setSettingsInspiration] = useState("");
  const [settingsPrompt, setSettingsPrompt] = useState("");

  const { data: story, isLoading: storyLoading, isError: storyError } = useQuery<Story>({
    queryKey: ["/api/stories", params?.id],
    enabled: !!params?.id,
  });

  const { data: looks = [] } = useQuery<Look[]>({
    queryKey: ["/api/stories", params?.id, "looks"],
    enabled: !!params?.id && !!story,
  });

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const userId = "default-user";
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile", userId],
  });

  useEffect(() => {
    if (profile) {
      setSettingsBody(profile.previewBodyDescription || "");
      setSettingsStyle(profile.previewStyle || "");
      setSettingsMood(profile.previewMood || "");
      setSettingsInspiration(profile.previewInspiration || "");
      setSettingsPrompt(profile.previewCustomPrompt || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest("PATCH", `/api/profile/${userId}`, updates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["/api/profile", userId] });
      
      const previousProfile = queryClient.getQueryData<UserProfile>(["/api/profile", userId]);
      
      if (previousProfile) {
        queryClient.setQueryData(["/api/profile", userId], {
          ...previousProfile,
          ...updates,
        });
      }
      
      return { previousProfile };
    },
    onError: (err, updates, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["/api/profile", userId], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
    },
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

  const handleCarouselClick = () => {
    if (story.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % story.images.length;
      setCurrentImageIndex(nextIndex);
      toast({
        title: "New personalized view",
        description: `Showing image ${nextIndex + 1} of ${story.images.length}`,
      });
    }
  };

  const handleVideoToggle = () => {
    setIsVideoMode(!isVideoMode);
    toast({
      title: isVideoMode ? "Switched to images" : "Switched to video",
      description: isVideoMode ? "Viewing static images" : "Enjoy the dynamic video experience",
    });
  };

  const handleAddUserPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = {
          url: reader.result as string,
          caption: story.title,
          timestamp: Date.now(),
        };
        
        const currentProfile = queryClient.getQueryData<UserProfile>(["/api/profile", userId]);
        const currentPhotos = currentProfile?.uploadedPhotos || [];
        
        updateProfileMutation.mutate({
          uploadedPhotos: [...currentPhotos, photoData],
        });
        
        toast({
          title: "Photo uploaded!",
          description: "Your photo has been added to this collection",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareTo = (platform: string) => {
    toast({
      title: `Sharing to ${platform}`,
      description: "Opening share interface...",
    });
    setIsSharePanelOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Campaign link copied to clipboard",
    });
    setIsSharePanelOpen(false);
  };

  const handleAddToFavorites = () => {
    const currentProfile = queryClient.getQueryData<UserProfile>(["/api/profile", userId]);
    const currentFavorites = currentProfile?.favoriteCollections || [];
    const isAlreadyFavorite = currentFavorites.includes(story.id);
    
    if (isAlreadyFavorite) {
      updateProfileMutation.mutate({
        favoriteCollections: currentFavorites.filter(id => id !== story.id),
      });
      toast({
        title: "Removed from Favorites",
        description: `${story.title} has been removed from your favorites`,
      });
    } else {
      updateProfileMutation.mutate({
        favoriteCollections: [...currentFavorites, story.id],
      });
      toast({
        title: "Added to Favorites",
        description: `${story.title} is now in your favorites`,
      });
    }
  };

  const handleAskAI = () => {
    if (!aiPromptQuestion.trim()) return;
    
    toast({
      title: "AI is thinking...",
      description: "Getting personalized insights about this collection",
    });
    setAiPromptQuestion("");
    setIsAIPromptOpen(false);
  };

  const handleSaveSettings = () => {
    updateProfileMutation.mutate({
      previewBodyDescription: settingsBody,
      previewStyle: settingsStyle,
      previewMood: settingsMood,
      previewInspiration: settingsInspiration,
      previewCustomPrompt: settingsPrompt,
    });
    
    toast({
      title: "Settings Saved",
      description: "Your preview preferences have been updated",
    });
    setIsSettingsOpen(false);
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

  const paragraphs = story.narrativeMd?.split('\n\n') || [];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-md mx-auto px-4 py-4">
        <h1 className="font-serif text-center text-3xl sm:text-4xl tracking-tight" data-testid="text-campaign-title">
          {story.title}
        </h1>
      </div>

      <div className="max-w-md mx-auto px-3">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
          {isVideoMode && story.videoRef ? (
            <video
              src={story.videoRef}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              data-testid="video-hero"
            />
          ) : (
            <img
              src={currentImage}
              alt={story.title}
              className="w-full h-full object-cover"
              data-testid="img-hero"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-0 w-9 h-9"
            onClick={() => setIsSettingsOpen(true)}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="font-serif text-white text-2xl sm:text-3xl mb-4" data-testid="text-choose-flow">
              Choose your flow
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {story.images.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                    onClick={handleCarouselClick}
                    data-testid="button-carousel"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                )}
                
                {story.videoRef && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                    onClick={handleVideoToggle}
                    data-testid="button-video"
                  >
                    <Play className="w-5 h-5" fill={isVideoMode ? "white" : "none"} />
                  </Button>
                )}
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                  onClick={() => setIsAIPromptOpen(true)}
                  data-testid="button-ai-wand"
                >
                  <Wand2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                  onClick={handleAddUserPhoto}
                  data-testid="button-add-photo"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                  onClick={() => setIsSharePanelOpen(true)}
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent hover:bg-white/20 text-white border-0 w-8 h-8"
                  onClick={handleAddToFavorites}
                  data-testid="button-heart"
                >
                  <Heart 
                    className="w-5 h-5" 
                    fill={profile?.favoriteCollections?.includes(story.id) ? "white" : "none"}
                  />
                </Button>
              </div>
            </div>

            {story.images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {story.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                    data-testid={`dot-${idx}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-3">
          Add items to your outfit first
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {paragraphs.length > 0 && (
            <>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {paragraphs[0]}
                </p>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20" data-testid="ai-tips-module">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg mb-2">Styled just for you</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on your {settingsStyle || "minimal"} style preference and {settingsBody || "your body type"}, 
                      we recommend pairing the leather jacket with high-waisted trousers for an elongated silhouette. 
                      The organic cotton turtleneck creates a perfect base layer that complements your sustainable values.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setIsAIPromptOpen(true)}
                      data-testid="button-get-more-tips"
                    >
                      Get more AI tips
                    </Button>
                  </div>
                </div>
              </Card>

              {paragraphs[1] && (
                <>
                  <div>
                    <h3 className="font-serif text-2xl mb-4">The Art of Layering</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {paragraphs[1]}
                    </p>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-lg text-muted-foreground">
                    "True style isn't about following trends—it's about choosing pieces that honor both craft and planet."
                  </blockquote>
                </>
              )}

              {paragraphs[2] && (
                <div>
                  <h3 className="font-serif text-2xl mb-4">Conscious Choices</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {paragraphs[2]}
                  </p>
                </div>
              )}

              <Card className="p-6 bg-gradient-to-br from-accent/5 via-background to-primary/5 border-accent/20" data-testid="virtual-tryon-module">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Wand2 className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg mb-2">See it on you</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Curious how this collection looks on your body type? Our AI can generate personalized previews 
                      showing these pieces styled specifically for you—in different settings, lighting, and poses.
                    </p>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => setLocation("/ai-stylist")}
                      data-testid="button-virtual-tryon"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Virtual Try-On
                    </Button>
                  </div>
                </div>
              </Card>

              {paragraphs[3] && (
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {paragraphs[3]}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {lookItems.length > 0 && (
          <div className="mt-12">
            <h3 className="font-serif text-2xl mb-6" data-testid="text-shop-title">
              Shop This Collection
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {lookItems.map((item) => (
                <Card
                  key={item.sku}
                  className="overflow-hidden group hover-elevate"
                  data-testid={`product-card-${item.sku}`}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium mb-1 text-sm line-clamp-2" data-testid={`product-name-${item.sku}`}>
                      {item.name}
                    </h4>
                    <p className="text-base font-bold mb-2" data-testid={`product-price-${item.sku}`}>
                      ${item.price}
                    </p>
                    
                    <Select 
                      value={selectedSize[item.sku] || item.sizes[0]}
                      onValueChange={(value) => setSelectedSize({ ...selectedSize, [item.sku]: value })}
                    >
                      <SelectTrigger className="w-full mb-2 h-8 text-xs" data-testid={`select-size-${item.sku}`}>
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
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                      data-testid={`button-add-to-cart-${item.sku}`}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAIPromptOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIPromptOpen(false)}
              data-testid="ai-prompt-backdrop"
            />
            
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-50 p-6 max-h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              data-testid="ai-prompt-panel"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl">AI Styling Assistant</h3>
                      <p className="text-sm text-muted-foreground">Ask questions or describe how you want to see this collection</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-question" className="text-base mb-2">Your question</Label>
                    <Input
                      id="ai-question"
                      placeholder="e.g., Show me this in outdoors on a young male, big curvy, caucasian..."
                      value={aiPromptQuestion}
                      onChange={(e) => setAiPromptQuestion(e.target.value)}
                      className="text-base h-12"
                      data-testid="input-ai-question"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={handleAskAI}
                      disabled={!aiPromptQuestion.trim()}
                      data-testid="button-ask-ai"
                    >
                      Ask AI
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAIPromptOpen(false)}
                      data-testid="button-cancel-ai"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "How would this look styled outdoors?",
                        "Show on a petite frame",
                        "Mix with streetwear style",
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setAiPromptQuestion(suggestion)}
                          className="text-xs"
                          data-testid={`suggestion-${suggestion.slice(0, 10)}`}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSharePanelOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSharePanelOpen(false)}
              data-testid="share-panel-backdrop"
            />
            
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-50 p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              data-testid="share-panel"
            >
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-xl mb-6 text-center">Share this collection</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <button
                    onClick={() => handleShareTo("Instagram")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover-elevate active-elevate-2"
                    data-testid="share-instagram"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">Instagram</span>
                  </button>

                  <button
                    onClick={() => handleShareTo("TikTok")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover-elevate active-elevate-2"
                    data-testid="share-tiktok"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <SiTiktok className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">TikTok</span>
                  </button>

                  <button
                    onClick={() => handleShareTo("WhatsApp")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover-elevate active-elevate-2"
                    data-testid="share-whatsapp"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover-elevate active-elevate-2"
                    data-testid="share-copy"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium">Copy Link</span>
                  </button>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSharePanelOpen(false)}
                  data-testid="button-cancel-share"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-settings">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Configure preview</DialogTitle>
            <DialogDescription>
              Set your preferences for how you want to see fashion content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="settings-body">Body</Label>
              <Input
                id="settings-body"
                placeholder="Shorter stature, slender frame"
                value={settingsBody}
                onChange={(e) => setSettingsBody(e.target.value)}
                data-testid="input-settings-body"
              />
            </div>

            <div>
              <Label htmlFor="settings-style">Style</Label>
              <Input
                id="settings-style"
                placeholder="Minimal fashion"
                value={settingsStyle}
                onChange={(e) => setSettingsStyle(e.target.value)}
                data-testid="input-settings-style"
              />
            </div>

            <div>
              <Label htmlFor="settings-mood">Mood</Label>
              <Input
                id="settings-mood"
                placeholder="Happy summer"
                value={settingsMood}
                onChange={(e) => setSettingsMood(e.target.value)}
                data-testid="input-settings-mood"
              />
            </div>

            <div>
              <Label htmlFor="settings-inspiration">Inspiration</Label>
              <Input
                id="settings-inspiration"
                placeholder="Image, music, video"
                value={settingsInspiration}
                onChange={(e) => setSettingsInspiration(e.target.value)}
                data-testid="input-settings-inspiration"
              />
            </div>

            <div>
              <Label htmlFor="settings-prompt">Prompt</Label>
              <Input
                id="settings-prompt"
                placeholder="Ask for your own style"
                value={settingsPrompt}
                onChange={(e) => setSettingsPrompt(e.target.value)}
                data-testid="input-settings-prompt"
              />
            </div>

            <Button 
              className="w-full"
              onClick={handleSaveSettings}
              data-testid="button-save-settings"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
