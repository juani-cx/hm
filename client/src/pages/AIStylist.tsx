import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Plus, X, ShoppingBag, Heart, Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { TopBar } from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@shared/schema';

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

export default function AIStylist() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_AVATARS[0].id);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: storeItems = [] } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const skuList = selectedItems.map(i => i.sku).join(',');
  
  const { data: aiSuggestions, refetch: refetchSuggestions } = useQuery<{ suggestions: AISuggestion[] }>({
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
      console.log('Preview generated:', data);
      setPreviewImage(data.imageUrl);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Preview generation failed:', error);
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

  const { toast } = useToast();

  const getItemImage = (item: Item) => item.images?.[0] || '';

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-primary" />
                AI Stylist
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Build your perfect outfit with AI-powered suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Outfit Builder - Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Outfit</h2>
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="default" 
                      className="gap-2"
                      data-testid="button-add-item"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle>Select Items</SheetTitle>
                    </SheetHeader>
                    
                    <Tabs defaultValue="store" className="mt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="store" data-testid="tab-store">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          From Store
                        </TabsTrigger>
                        <TabsTrigger value="collection" data-testid="tab-collection">
                          <Heart className="w-4 h-4 mr-2" />
                          My Collection
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="store" className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pb-4">
                          {storeItems.map((item) => (
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
                      </TabsContent>
                      
                      <TabsContent value="collection" className="mt-4">
                        <div className="text-center py-12 text-muted-foreground">
                          <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Your saved collection is empty</p>
                          <p className="text-sm mt-2">Save items from stories to see them here</p>
                        </div>
                      </TabsContent>
                    </Tabs>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Outfit Value</p>
                      <p className="text-2xl font-bold">
                        ${selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" data-testid="button-save-outfit">
                        <Heart className="w-4 h-4 mr-2" />
                        Save Outfit
                      </Button>
                      <Button data-testid="button-add-to-cart">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* AI Suggestions Panel */}
          <div className="space-y-6">
            {/* Virtual Try-On Preview */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Virtual Try-On</h3>
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-3">Select Model</p>
                <div className="space-y-2">
                  {MODEL_AVATARS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover-elevate'
                      }`}
                      data-testid={`model-${model.id}`}
                    >
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Area */}
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4" data-testid="preview-area">
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
                    <p className="text-sm">Select items and generate preview</p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePreview}
                disabled={selectedItems.length === 0 || isGenerating}
                className="w-full gap-2"
                data-testid="button-generate-preview"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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

            <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Style Tips</h3>
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

            {/* Quick Style Guide */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Style Guide</h3>
              <div className="space-y-3 text-sm">
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
