import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, X, ShoppingBag, Heart, Wand2, Search } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TopBar } from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import type { Item, UserProfile } from '@shared/schema';

interface AISuggestion {
  text: string;
  reasoning: string;
}

const MODEL_AVATARS = [
  { id: 'athletic', name: 'Athletic Build', description: 'Broad shoulders, defined muscles' },
  { id: 'petite', name: 'Petite', description: 'Shorter stature, slender frame' },
  { id: 'curvy', name: 'Curvy', description: 'Hourglass figure, fuller bust and hips' },
  { id: 'tall', name: 'Tall & Slim', description: 'Tall stature, lean build' },
  { id: 'plus', name: 'Plus Size', description: 'Fuller figure, comfortable fit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'shoes', label: 'Shoes' },
];

const OCCASIONS = ['casual', 'formal', 'business', 'party', 'sport'];
const COLOR_FAMILIES = ['black', 'white', 'gray', 'brown', 'beige', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'multicolor'];
const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under50', label: 'Under $50', min: 0, max: 50 },
  { id: '50-100', label: '$50-$100', min: 50, max: 100 },
  { id: '100-200', label: '$100-$200', min: 100, max: 200 },
  { id: 'over200', label: 'Over $200', min: 200, max: Infinity },
];

const USER_ID = 'default-user';

export default function AIStylist() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_AVATARS[0].id);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  
  const hasSeededRef = useRef(false);

  const { toast } = useToast();

  const { data: storeItems = [] } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  useEffect(() => {
    if (!hasSeededRef.current && userProfile && (!userProfile.savedCollections || userProfile.savedCollections.length === 0) && storeItems.length > 0) {
      hasSeededRef.current = true;
      const demoSkus = ['SKU001', 'SKU002', 'SKU005', 'SKU007'];
      const demoItems = storeItems.filter(item => demoSkus.includes(item.sku));
      
      if (demoItems.length > 0) {
        updateProfileMutation.mutate({
          savedCollections: demoItems.map(item => ({
            collectionId: item.sku,
            collectionTitle: item.name,
            itemSkus: [item.sku],
            savedAt: Date.now(),
          })),
        });
      }
    }
  }, [userProfile, storeItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    let items = [...storeItems];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query) ||
        item.material.toLowerCase().includes(query)
      );
    }

    if (selectedOccasion !== 'all') {
      items = items.filter(item => item.occasion?.includes(selectedOccasion as any));
    }

    if (selectedColorFamily !== 'all') {
      items = items.filter(item => item.colorFamily === selectedColorFamily);
    }

    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      if (range) {
        items = items.filter(item => item.price >= range.min && item.price < range.max);
      }
    }

    return items;
  }, [storeItems, debouncedSearch, selectedOccasion, selectedColorFamily, selectedPriceRange]);

  const itemsByCategory = useMemo(() => {
    const groups: Record<string, Item[]> = {
      all: filteredItems,
    };

    CATEGORIES.forEach(cat => {
      if (cat.id !== 'all') {
        groups[cat.id] = filteredItems.filter(item => item.category === cat.id);
      }
    });

    return groups;
  }, [filteredItems]);

  const collectionItems = useMemo(() => {
    if (!userProfile?.savedCollections) return [];
    const allSkus = userProfile.savedCollections.flatMap(c => c.itemSkus);
    return storeItems.filter(item => allSkus.includes(item.sku));
  }, [userProfile, storeItems]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await apiRequest('PATCH', `/api/profile/${USER_ID}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', USER_ID] });
    },
  });

  const removeFromCollectionMutation = useMutation({
    mutationFn: async (sku: string) => {
      const updatedCollections = (userProfile?.savedCollections || [])
        .map(collection => ({
          ...collection,
          itemSkus: collection.itemSkus.filter(itemSku => itemSku !== sku),
        }))
        .filter(collection => collection.itemSkus.length > 0);
      
      const response = await apiRequest('PATCH', `/api/profile/${USER_ID}`, {
        savedCollections: updatedCollections,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', USER_ID] });
      toast({
        title: "Removed from Collection",
        description: "Item has been removed from your collection",
      });
    },
  });

  const skuList = selectedItems.map(i => i.sku).join(',');
  
  const { data: aiSuggestions } = useQuery<{ suggestions: AISuggestion[] }>({
    queryKey: ['/api/assistant/stylist-suggestions', skuList],
    queryFn: async () => {
      if (!skuList) return { suggestions: [] };
      const res = await fetch(`/api/assistant/stylist-suggestions?skus=${skuList}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      return res.json();
    },
    enabled: selectedItems.length > 0,
  });

  const handleAddItem = (item: Item) => {
    if (!selectedItems.find(i => i.sku === item.sku)) {
      setSelectedItems([...selectedItems, item]);
      setIsDrawerOpen(false);
    }
  };

  const handleRemoveItem = (sku: string) => {
    setSelectedItems(selectedItems.filter(i => i.sku !== sku));
  };

  const handleRemoveFromCollection = (sku: string) => {
    removeFromCollectionMutation.mutate(sku);
  };

  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assistant/generate-outfit-preview', {
        skus: selectedItems.map(i => i.sku),
        modelType: selectedModel,
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

  const getItemImage = (item: Item) => item.images?.[0] || '';

  const renderItemGrid = (items: Item[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
      {items.map((item) => (
        <Card 
          key={item.sku}
          className="overflow-hidden hover-elevate cursor-pointer"
          onClick={() => handleAddItem(item)}
          data-testid={`item-${item.sku}`}
        >
          <div className="aspect-[3/4] relative bg-muted">
            {getItemImage(item) && (
              <img
                src={getItemImage(item)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-3">
            <p className="font-medium text-sm line-clamp-2">{item.name}</p>
            <p className="text-sm text-muted-foreground mt-1">${item.price}</p>
            <p className="text-xs text-muted-foreground capitalize">{item.material}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                AI Stylist
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Build your perfect outfit with AI-powered suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Your Outfit</h2>
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="default" 
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                      size="sm"
                      data-testid="button-add-item"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add Item
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-screen w-screen p-0 max-w-none">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
                        <SheetTitle className="text-2xl font-serif">Select Items</SheetTitle>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsDrawerOpen(false)}
                          data-testid="button-close-drawer"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <Tabs defaultValue="store" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4 border-b bg-background">
                          <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="store" data-testid="tab-store">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              From Store
                            </TabsTrigger>
                            <TabsTrigger value="collection" data-testid="tab-collection">
                              <Heart className="w-4 h-4 mr-2" />
                              My Collection
                            </TabsTrigger>
                          </TabsList>
                          
                          <div className="mt-4 mb-4 space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name, color, or material..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                data-testid="input-search"
                              />
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                                <SelectTrigger className="w-auto min-w-[140px]" data-testid="select-occasion">
                                  <SelectValue placeholder="All Occasions" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Occasions</SelectItem>
                                  {OCCASIONS.map(occ => (
                                    <SelectItem key={occ} value={occ} className="capitalize">
                                      {occ}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={selectedColorFamily} onValueChange={setSelectedColorFamily}>
                                <SelectTrigger className="w-auto min-w-[120px]" data-testid="select-color">
                                  <SelectValue placeholder="All Colors" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Colors</SelectItem>
                                  {COLOR_FAMILIES.map(color => (
                                    <SelectItem key={color} value={color} className="capitalize">
                                      {color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                                <SelectTrigger className="w-auto min-w-[130px]" data-testid="select-price">
                                  <SelectValue placeholder="All Prices" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRICE_RANGES.map(range => (
                                    <SelectItem key={range.id} value={range.id}>
                                      {range.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <TabsContent value="store" className="flex-1 overflow-hidden mt-0">
                          <Accordion type="single" collapsible defaultValue="all" className="h-full overflow-y-auto px-6 py-4">
                            {CATEGORIES.map(category => {
                              const items = itemsByCategory[category.id] || [];
                              if (items.length === 0 && category.id !== 'all') return null;
                              
                              return (
                                <AccordionItem 
                                  key={category.id} 
                                  value={category.id}
                                  data-testid={`accordion-category-${category.id}`}
                                >
                                  <AccordionTrigger className="text-base font-medium py-4">
                                    {category.label} ({items.length})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {items.length > 0 ? (
                                      renderItemGrid(items)
                                    ) : (
                                      <p className="text-sm text-muted-foreground text-center py-8">
                                        No items found in this category
                                      </p>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </TabsContent>
                      
                        <TabsContent value="collection" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                          {isLoadingProfile ? (
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">Loading your collection...</p>
                            </div>
                          ) : collectionItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Your saved collection is empty</p>
                              <p className="text-sm mt-2">Save items from stories to see them here</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                              {collectionItems.map((item) => (
                                <Card 
                                  key={item.sku}
                                  className="overflow-hidden relative group"
                                  data-testid={`collection-item-${item.sku}`}
                                >
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                    onClick={() => handleRemoveFromCollection(item.sku)}
                                    data-testid={`button-remove-collection-${item.sku}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => handleAddItem(item)}
                                  >
                                    <div className="aspect-[3/4] relative bg-muted">
                                      {getItemImage(item) && (
                                        <img
                                          src={getItemImage(item)}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="p-3">
                                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                                      <p className="text-sm text-muted-foreground mt-1">${item.price}</p>
                                      <p className="text-xs text-muted-foreground capitalize">{item.material}</p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No items selected yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start building your outfit by adding items
                  </p>
                  <Button 
                    onClick={() => setIsDrawerOpen(true)}
                    data-testid="button-start-styling"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Styling
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {selectedItems.map((item) => (
                    <Card 
                      key={item.sku}
                      className="overflow-hidden relative group"
                      data-testid={`selected-item-${item.sku}`}
                    >
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-7 sm:w-7"
                        onClick={() => handleRemoveItem(item.sku)}
                        data-testid={`button-remove-${item.sku}`}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <div className="aspect-[3/4] relative bg-muted">
                        {getItemImage(item) && (
                          <img
                            src={getItemImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2 sm:p-3">
                        <p className="font-medium text-xs sm:text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">${item.price}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Outfit Value</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        ${selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm" data-testid="button-save-outfit">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Save Outfit</span>
                        <span className="sm:hidden">Save</span>
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm" data-testid="button-add-to-cart">
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">Virtual Try-On</h3>
              </div>

              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Select Model</p>
                <div className="space-y-2">
                  {MODEL_AVATARS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover-elevate'
                      }`}
                      data-testid={`model-${model.id}`}
                    >
                      <p className="font-medium text-xs sm:text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-3 sm:mb-4" data-testid="preview-area">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Outfit Preview"
                    className="w-full h-full object-cover"
                    data-testid="preview-image"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Wand2 className="w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm px-2 text-center">Select items and generate preview</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleGeneratePreview}
                disabled={selectedItems.length === 0 || isGenerating}
                className="w-full gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
                data-testid="button-generate-preview"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    Generate Preview
                  </>
                )}
              </Button>

              {selectedItems.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Add items to your outfit first
                </p>
              )}
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">AI Style Tips</h3>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Select items to get personalized style suggestions</p>
                </div>
              ) : aiSuggestions?.suggestions && aiSuggestions.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {aiSuggestions.suggestions.map((suggestion, index) => (
                    <Card key={index} className="p-4 bg-background" data-testid={`suggestion-${index}`}>
                      <p className="font-medium text-sm mb-2">{suggestion.text}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>Loading AI suggestions...</p>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Style Guide</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div>
                  <p className="font-medium mb-1">Build Your Look</p>
                  <p className="text-muted-foreground text-xs">
                    Mix and match pieces to create your perfect outfit
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">AI Recommendations</p>
                  <p className="text-muted-foreground text-xs">
                    Get personalized suggestions based on your style preferences
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Save & Share</p>
                  <p className="text-muted-foreground text-xs">
                    Keep your favorite combinations for later
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
