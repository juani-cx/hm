import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Collection, Item } from "@shared/schema";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingBag, Bookmark, ChevronRight } from "lucide-react";
import CollectionImageViewer from "@/components/CollectionImageViewer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CollectionWithItems = Collection & { items: Item[] };

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: collection, isLoading } = useQuery<CollectionWithItems>({
    queryKey: [`/api/collections/${id}`],
  });

  const handleSaveCollection = async () => {
    try {
      await apiRequest(`/api/profile/guest`, {
        method: "POST",
        body: JSON.stringify({
          event: "save_collection",
          collectionId: id,
        }),
      });
      
      toast({
        title: "Collection Saved",
        description: "This collection has been added to your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (itemSku: string, size: string = "M") => {
    try {
      await apiRequest(`/api/profile/guest`, {
        method: "POST",
        body: JSON.stringify({
          event: "add_to_cart",
          itemSku,
          size,
        }),
      });
      
      toast({
        title: "Added to Cart",
        description: "Item added to your shopping cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAllToCart = async () => {
    if (!collection?.items) return;
    
    try {
      for (const item of collection.items) {
        await apiRequest(`/api/profile/guest`, {
          method: "POST",
          body: JSON.stringify({
            event: "add_to_cart",
            itemSku: item.sku,
            size: "M",
          }),
        });
      }
      
      toast({
        title: "Added to Cart",
        description: `${collection.items.length} items added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLater = async (itemSku: string) => {
    try {
      await apiRequest(`/api/profile/guest`, {
        method: "POST",
        body: JSON.stringify({
          event: "save_for_later",
          itemSku,
        }),
      });
      
      toast({
        title: "Saved for Later",
        description: "Item saved to your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Collection Not Found</h2>
            <p className="text-muted-foreground">The collection you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Collection Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">{collection.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {collection.description}
          </p>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            {collection.season && (
              <span className="text-sm text-muted-foreground">{collection.season}</span>
            )}
            {collection.tags && collection.tags.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex gap-2">
                  {collection.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-sm text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleSaveCollection}
              variant="outline"
              className="gap-2"
              data-testid="button-save-collection"
            >
              <Heart className="w-4 h-4" />
              Save Collection
            </Button>
            <Button
              onClick={handleAddAllToCart}
              className="gap-2"
              data-testid="button-add-all-to-cart"
            >
              <ShoppingBag className="w-4 h-4" />
              Add All to Cart
            </Button>
          </div>
        </div>

        {/* Editorial Images */}
        <div className="space-y-16 mb-16">
          {collection.editorialImages.map((editorial, index) => (
            <div key={index} className="space-y-6">
              <div
                onClick={() => openViewer(index)}
                className="cursor-pointer group relative overflow-hidden rounded-lg bg-muted aspect-[3/4] md:aspect-[4/3]"
                data-testid={`editorial-image-${index}`}
              >
                <img
                  src={editorial.url}
                  alt={editorial.caption || `Editorial ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-medium">Click to view full screen</p>
                  </div>
                </div>
              </div>
              
              {editorial.caption && (
                <h3 className="font-serif text-2xl text-center">{editorial.caption}</h3>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Module - Shop This Collection */}
        <Card className="p-8 mb-16">
          <h2 className="font-serif text-3xl mb-6 text-center">Shop This Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collection.items?.map((item) => (
              <div key={item.sku} className="group" data-testid={`collection-item-${item.sku}`}>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                  {item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <h4 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">${item.price}</p>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item.sku)}
                    className="w-full"
                    data-testid={`button-add-cart-${item.sku}`}
                  >
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveLater(item.sku)}
                    className="w-full"
                    data-testid={`button-save-later-${item.sku}`}
                  >
                    <Bookmark className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center mb-8">
          <Button variant="outline" size="lg" className="gap-2" data-testid="button-explore-more">
            Explore More Collections
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Full-Page Image Viewer */}
      {viewerOpen && collection && (
        <CollectionImageViewer
          collection={collection}
          initialIndex={currentImageIndex}
          onClose={() => setViewerOpen(false)}
          onAddToCart={handleAddToCart}
          onSaveLater={handleSaveLater}
        />
      )}
    </div>
  );
}
