import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Plus, X, ShoppingBag, Heart, Wand2, Share2, Settings, Instagram, MessageCircle } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TopBar } from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import type { Item, UserProfile } from '@shared/schema';
import { useCart } from '@/contexts/CartContext';

const USER_ID = 'default-user';

export default function AIStylist() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isSelectItemsOpen, setIsSelectItemsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [settingsBody, setSettingsBody] = useState("");
  const [settingsStyle, setSettingsStyle] = useState("");
  const [settingsMood, setSettingsMood] = useState("");
  const [settingsInspiration, setSettingsInspiration] = useState("");

  const { toast } = useToast();
  const { addItem: addToCart } = useCart();

  const { data: storeItems = [] } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  useEffect(() => {
    if (userProfile) {
      setSettingsBody(userProfile.previewBodyDescription || "");
      setSettingsStyle(userProfile.previewStyle || "");
      setSettingsMood(userProfile.previewMood || "");
      setSettingsInspiration(userProfile.previewInspiration || "");
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest("PATCH", `/api/profile/${USER_ID}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", USER_ID] });
      toast({
        title: "Settings Saved",
        description: "Your preview preferences have been updated",
      });
    },
  });

  const handleSaveSettings = () => {
    updateProfileMutation.mutate({
      previewBodyDescription: settingsBody,
      previewStyle: settingsStyle,
      previewMood: settingsMood,
      previewInspiration: settingsInspiration,
    });
    setIsSettingsOpen(false);
  };

  const handleAddItem = (item: Item) => {
    if (!selectedItems.find(i => i.sku === item.sku)) {
      setSelectedItems([...selectedItems, item]);
      toast({
        title: "Item Added",
        description: `${item.name} added to your outfit`,
      });
    }
  };

  const handleRemoveItem = (sku: string) => {
    setSelectedItems(selectedItems.filter(i => i.sku !== sku));
  };

  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assistant/generate-outfit-preview', {
        skus: selectedItems.map(i => i.sku),
        modelType: 'athletic',
        items: selectedItems.map(i => ({
          name: i.name,
          color: i.color,
          material: i.material
        }))
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewImage(data.imageUrl);
      setIsGenerating(false);
    },
    onError: () => {
      setPreviewImage(null);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Sorry, image generation is currently unavailable. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleGeneratePreview = () => {
    if (selectedItems.length === 0) return;
    setIsGenerating(true);
    setPreviewImage(null);
    generatePreviewMutation.mutate();
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
      description: "Link copied to clipboard",
    });
    setIsSharePanelOpen(false);
  };

  const handleSaveOutfit = () => {
    toast({
      title: "Outfit Saved",
      description: "Your outfit has been saved to your collection",
    });
  };

  const handleAddToCart = () => {
    selectedItems.forEach(item => {
      addToCart({
        sku: item.sku,
        name: item.name,
        price: item.price,
        image: item.images[0],
        size: item.sizes[0] || 'M',
      });
    });
    toast({
      title: "Added to Cart",
      description: `${selectedItems.length} items added to your cart`,
    });
  };

  const totalValue = selectedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl mb-2" data-testid="text-ai-stylist-title">AI Stylist</h1>
          <p className="text-sm text-muted-foreground">
            Build your perfect outfit with AI-powered suggestions
          </p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Virtual Try-On</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSharePanelOpen(true)}
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSettingsOpen(true)}
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed" data-testid="preview-area">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Outfit Preview"
                className="w-full h-full object-cover"
                data-testid="preview-image"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Wand2 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm px-4 text-center">Select items and generate preview</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsSelectItemsOpen(true)}
              className="w-full"
              variant="default"
              data-testid="button-add-items"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Items ({selectedItems.length})
            </Button>
            
            {selectedItems.length > 0 && (
              <Button
                onClick={handleGeneratePreview}
                className="w-full"
                variant="default"
                disabled={isGenerating}
                data-testid="button-generate-preview"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Preview
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4">Style Guide</h3>
          <div className="space-y-3">
            <Card className="p-4">
              <p className="font-medium mb-1">Build Your Look</p>
              <p className="text-sm text-muted-foreground">
                Mix and match pieces to create your perfect outfit
              </p>
            </Card>
            <Card className="p-4">
              <p className="font-medium mb-1">AI Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Get personalized suggestions based on your style preferences
              </p>
            </Card>
            <Card className="p-4">
              <p className="font-medium mb-1">Save & Share</p>
              <p className="text-sm text-muted-foreground">
                Keep your favorite combinations for later
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Your Outfit</h3>
            {selectedItems.length > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setIsSelectItemsOpen(true)}
                data-testid="button-add-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No items selected yet</p>
              <Button
                onClick={() => setIsSelectItemsOpen(true)}
                data-testid="button-start-styling"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Styling
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedItems.map((item) => (
                  <Card
                    key={item.sku}
                    className="overflow-hidden relative group"
                    data-testid={`selected-item-${item.sku}`}
                  >
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                      onClick={() => handleRemoveItem(item.sku)}
                      data-testid={`button-remove-${item.sku}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="aspect-[3/4] relative bg-muted">
                      {item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">${item.price}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Total Outfit Value</p>
                <p className="text-2xl font-bold" data-testid="total-value">${totalValue.toFixed(2)}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSaveOutfit}
                  data-testid="button-save-outfit"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Outfit
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={isSelectItemsOpen} onOpenChange={setIsSelectItemsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Select Items</DialogTitle>
            <DialogDescription>Choose items to add to your outfit</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
              {storeItems.map((item) => (
                <Card
                  key={item.sku}
                  className={`overflow-hidden cursor-pointer hover-elevate ${
                    selectedItems.find(i => i.sku === item.sku) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleAddItem(item)}
                  data-testid={`item-${item.sku}`}
                >
                  <div className="aspect-[3/4] relative bg-muted">
                    {item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">${item.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <h3 className="font-serif text-xl mb-6 text-center">Share this outfit</h3>
                
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
                    data-testid="share-copy-link"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-primary-foreground" />
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
    </div>
  );
}
