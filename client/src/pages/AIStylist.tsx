import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, X, ShoppingBag, Heart, Wand2, Share2, Settings, Instagram, MessageCircle, Edit2 } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TopBar } from '@/components/TopBar';
import type { Item, UserProfile } from '@shared/schema';
import { useCart } from '@/contexts/CartContext';

const USER_ID = 'default-user';

type ItemCategory = 'all' | 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'accessories' | 'shoes';

export default function AIStylist() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isSelectItemsOpen, setIsSelectItemsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [currentTab, setCurrentTab] = useState<'store' | 'collections'>('store');
  const [configurationComplete, setConfigurationComplete] = useState(false);
  const [showConfigInPreview, setShowConfigInPreview] = useState(true);

  const [settingsBody, setSettingsBody] = useState("");
  const [settingsStyle, setSettingsStyle] = useState("");
  const [settingsMood, setSettingsMood] = useState("");
  const [settingsGender, setSettingsGender] = useState<"male" | "female" | "mannequin" | "">("");

  const { addItem: addToCart } = useCart();

  const { data: storeItems = [] } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: userCollections = [] } = useQuery<Item[]>({
    queryKey: ['/api/collections/items'],
    enabled: currentTab === 'collections',
  });

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  // Filter items based on category
  const displayItems = currentTab === 'store' ? storeItems : userCollections;
  const filteredItems = selectedCategory === 'all' 
    ? displayItems 
    : displayItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    if (userProfile) {
      setSettingsBody(userProfile.previewBodyDescription || "");
      setSettingsStyle(userProfile.previewStyle || "");
      setSettingsMood(userProfile.previewMood || "");
      setSettingsGender(userProfile.gender || "");
      
      // Check if configuration is complete (4 required fields)
      const hasAllSettings = userProfile.previewBodyDescription && 
                            userProfile.previewStyle && 
                            userProfile.previewMood &&
                            userProfile.gender;
      if (hasAllSettings) {
        setConfigurationComplete(true);
        setShowConfigInPreview(false);
      }
    }
  }, [userProfile]);

  // Check if current settings are complete (4 required fields)
  const areSettingsComplete = settingsBody && settingsStyle && settingsMood && settingsGender;
  
  // Auto-enable Add Items when config is filled (and disable when incomplete)
  useEffect(() => {
    setConfigurationComplete(!!areSettingsComplete);
  }, [areSettingsComplete]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest("PATCH", `/api/profile/${USER_ID}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", USER_ID] });
    },
  });

  const handleSaveSettings = () => {
    const hasExistingPreview = !!previewImage && selectedItems.length > 0;
    
    updateProfileMutation.mutate({
      previewBodyDescription: settingsBody,
      previewStyle: settingsStyle,
      previewMood: settingsMood,
      gender: settingsGender as "male" | "female" | undefined,
    });
    setConfigurationComplete(true);
    setShowConfigInPreview(false);
    setIsSettingsOpen(false);
    
    // Regenerate image if there's already a preview and items selected
    if (hasExistingPreview) {
      setIsGenerating(true);
      // Keep the old image visible while generating new one
      generatePreviewMutation.mutate();
    }
  };

  const handleUseProfileSettings = () => {
    if (userProfile) {
      setSettingsBody(userProfile.previewBodyDescription || "");
      setSettingsStyle(userProfile.previewStyle || "");
      setSettingsMood(userProfile.previewMood || "");
      setSettingsGender(userProfile.gender || "");
    }
  };

  const handleAddItem = (item: Item) => {
    const isSelected = selectedItems.find(i => i.sku === item.sku);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.sku !== item.sku));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (sku: string) => {
    setSelectedItems(selectedItems.filter(i => i.sku !== sku));
  };

  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assistant/generate-outfit-preview', {
        skus: selectedItems.map(i => i.sku),
        modelType: settingsBody.toLowerCase().replace(/\s+/g, '-'),
        gender: settingsGender,
        style: settingsStyle,
        mood: settingsMood,
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
      setIsSelectItemsOpen(false);
    },
    onError: () => {
      setPreviewImage(null);
      setIsGenerating(false);
    }
  });

  const handleGeneratePreview = () => {
    if (selectedItems.length === 0) return;
    setIsGenerating(true);
    setPreviewImage(null);
    generatePreviewMutation.mutate();
  };

  const handleUpdatePreview = () => {
    handleGeneratePreview();
  };

  const handleShareTo = (platform: string) => {
    setIsSharePanelOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsSharePanelOpen(false);
  };

  const handleSaveOutfit = () => {
    // Outfit saved
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
  };

  const handleClearAllItems = () => {
    setSelectedItems([]);
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

          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed relative" data-testid="preview-area">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Outfit Preview"
                  className="w-full h-full object-cover"
                  data-testid="preview-image"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-white text-sm font-medium">Generating new preview...</p>
                    </div>
                  </div>
                )}
              </>
            ) : showConfigInPreview ? (
              <div className="w-full h-full p-6 flex flex-col justify-center">
                <h3 className="font-serif text-xl mb-4">Configure Your Virtual Try-On</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="config-gender">Gender</Label>
                    <Select value={settingsGender} onValueChange={(v) => setSettingsGender(v as "male" | "female" | "mannequin")}>
                      <SelectTrigger id="config-gender" data-testid="select-config-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="mannequin">No Gender (Mannequin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="config-body">Body Type</Label>
                    <Select value={settingsBody} onValueChange={setSettingsBody}>
                      <SelectTrigger id="config-body" data-testid="select-config-body">
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Athletic Build">Athletic Build</SelectItem>
                        <SelectItem value="Petite">Petite</SelectItem>
                        <SelectItem value="Curvy">Curvy</SelectItem>
                        <SelectItem value="Tall & Slim">Tall & Slim</SelectItem>
                        <SelectItem value="Plus Size">Plus Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="config-style">Style Preference</Label>
                    <Select value={settingsStyle} onValueChange={setSettingsStyle}>
                      <SelectTrigger id="config-style" data-testid="select-config-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                        <SelectItem value="Streetwear">Streetwear</SelectItem>
                        <SelectItem value="Vintage">Vintage</SelectItem>
                        <SelectItem value="Elegant">Elegant</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Bohemian">Bohemian</SelectItem>
                        <SelectItem value="Sporty">Sporty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="config-mood">Mood</Label>
                    <Select value={settingsMood} onValueChange={setSettingsMood}>
                      <SelectTrigger id="config-mood" data-testid="select-config-mood">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Confident">Confident</SelectItem>
                        <SelectItem value="Relaxed">Relaxed</SelectItem>
                        <SelectItem value="Energetic">Energetic</SelectItem>
                        <SelectItem value="Sophisticated">Sophisticated</SelectItem>
                        <SelectItem value="Playful">Playful</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userProfile && (
                    <Button
                      variant="outline"
                      onClick={handleUseProfileSettings}
                      className="w-full"
                      data-testid="button-use-profile"
                    >
                      Use My Profile Settings
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Wand2 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm px-4 text-center">Select items and generate preview</p>
              </div>
            )}
          </div>

          {previewImage && selectedItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Selected Items ({selectedItems.length})</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSelectItemsOpen(true)}
                  data-testid="button-edit-items"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedItems.map((item) => (
                  <div key={item.sku} className="flex-shrink-0 w-20">
                    <div className="aspect-square bg-muted rounded-md overflow-hidden">
                      {item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!previewImage && (
              <Button
                onClick={() => setIsSelectItemsOpen(true)}
                className="w-full"
                variant="default"
                disabled={!configurationComplete}
                data-testid="button-add-items"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Items ({selectedItems.length})
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
        <DialogContent className="max-w-full max-h-full h-screen w-screen m-0 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="font-serif text-3xl">Build Your Outfit</DialogTitle>
            <DialogDescription className="mt-1">Choose items from our collection or your saved pieces</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'store' | 'collections')} className="h-full flex flex-col">
              <div className="px-6 pt-4 pb-2 border-b flex-shrink-0">
                <TabsList className="w-full max-w-md">
                  <TabsTrigger value="store" className="flex-1" data-testid="tab-store">
                    Store Items
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="flex-1" data-testid="tab-collections">
                    My Collections
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="px-6 py-4 border-b flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Badge
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('all')}
                    data-testid="filter-all"
                  >
                    All
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'tops' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('tops')}
                    data-testid="filter-tops"
                  >
                    Tops
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'bottoms' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('bottoms')}
                    data-testid="filter-bottoms"
                  >
                    Bottoms
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'dresses' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('dresses')}
                    data-testid="filter-dresses"
                  >
                    Dresses
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'outerwear' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('outerwear')}
                    data-testid="filter-outerwear"
                  >
                    Outerwear
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'accessories' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('accessories')}
                    data-testid="filter-accessories"
                  >
                    Accessories
                  </Badge>
                  <Badge
                    variant={selectedCategory === 'shoes' ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory('shoes')}
                    data-testid="filter-shoes"
                  >
                    Shoes
                  </Badge>
                </div>
              </div>

              <TabsContent value="store" className="overflow-y-auto px-6 py-4 m-0 flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                  {filteredItems.map((item) => (
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
              </TabsContent>

              <TabsContent value="collections" className="overflow-y-auto px-6 py-4 m-0 flex-1">
                {userCollections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Saved Items Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Items you save from campaigns and collections will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.sku}
                        className={`overflow-hidden cursor-pointer hover-elevate ${
                          selectedItems.find(i => i.sku === item.sku) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleAddItem(item)}
                        data-testid={`collection-item-${item.sku}`}
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
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-6 border-t bg-background">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">{selectedItems.length}</span> items selected
                  </div>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleClearAllItems}
                      className="p-1 hover-elevate rounded-md"
                      data-testid="button-clear-all-items"
                      aria-label="Clear all selected items"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={handleGeneratePreview}
                size="lg"
                disabled={isGenerating || selectedItems.length === 0}
                data-testid="button-generate-from-modal"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-settings">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {previewImage ? "Update Try-On Parameters" : "Configure Virtual Try-On"}
            </DialogTitle>
            <DialogDescription>
              {previewImage 
                ? "Modify your preferences to regenerate the preview" 
                : "Set your preferences for how you want to see fashion content"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="settings-gender">Gender</Label>
              <Select value={settingsGender} onValueChange={(v) => setSettingsGender(v as "male" | "female" | "mannequin")}>
                <SelectTrigger id="settings-gender" data-testid="select-settings-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mannequin">No Gender (Mannequin)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="settings-body">Body Type</Label>
              <Select value={settingsBody} onValueChange={setSettingsBody}>
                <SelectTrigger id="settings-body" data-testid="select-body">
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Athletic Build">Athletic Build</SelectItem>
                  <SelectItem value="Petite">Petite</SelectItem>
                  <SelectItem value="Curvy">Curvy</SelectItem>
                  <SelectItem value="Tall & Slim">Tall & Slim</SelectItem>
                  <SelectItem value="Plus Size">Plus Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="settings-style">Style Preference</Label>
              <Select value={settingsStyle} onValueChange={setSettingsStyle}>
                <SelectTrigger id="settings-style" data-testid="select-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minimalist">Minimalist</SelectItem>
                  <SelectItem value="Streetwear">Streetwear</SelectItem>
                  <SelectItem value="Vintage">Vintage</SelectItem>
                  <SelectItem value="Elegant">Elegant</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Bohemian">Bohemian</SelectItem>
                  <SelectItem value="Sporty">Sporty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="settings-mood">Mood</Label>
              <Select value={settingsMood} onValueChange={setSettingsMood}>
                <SelectTrigger id="settings-mood" data-testid="select-mood">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confident">Confident</SelectItem>
                  <SelectItem value="Relaxed">Relaxed</SelectItem>
                  <SelectItem value="Energetic">Energetic</SelectItem>
                  <SelectItem value="Sophisticated">Sophisticated</SelectItem>
                  <SelectItem value="Playful">Playful</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleSaveSettings}
              disabled={!areSettingsComplete}
              data-testid="button-save-settings"
            >
              {previewImage ? "Apply Changes" : "Save to Profile"}
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
