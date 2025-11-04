import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Collection } from "@shared/schema";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function CollectionsPage() {
  const [, setLocation] = useLocation();
  const { data: collections, isLoading, isError, error } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Unable to Load Collections</h2>
            <p className="text-muted-foreground mb-4">We couldn't load the collections. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
              data-testid="button-retry-collections"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">No Collections Available</h2>
            <p className="text-muted-foreground">Check back soon for new collections.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Collections</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated fashion collections, each telling its own story through editorial photography and timeless style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer overflow-hidden transition-all hover-elevate active-elevate-2"
              onClick={() => setLocation(`/magazine/${collection.id}`)}
              data-testid={`collection-card-${collection.id}`}
            >
              {/* Collection Image */}
              <div className="aspect-[4/5] bg-muted overflow-hidden" data-testid={`collection-image-${collection.id}`}>
                {collection.editorialImages[0]?.url && (
                  <img
                    src={collection.editorialImages[0].url}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>

              {/* Collection Info */}
              <div className="p-6">
                <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors" data-testid={`collection-title-${collection.id}`}>
                  {collection.title}
                </h3>
                
                {collection.season && (
                  <p className="text-sm text-muted-foreground mb-3" data-testid={`collection-season-${collection.id}`}>
                    {collection.season}
                  </p>
                )}
                
                <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`collection-description-${collection.id}`}>
                  {collection.description}
                </p>

                {/* Tags */}
                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {collection.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-muted rounded-md"
                        data-testid={`collection-tag-${collection.id}-${i}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View Collection */}
                <div className="flex items-center text-sm font-medium group-hover:text-primary transition-colors" data-testid={`collection-link-${collection.id}`}>
                  <span>View Collection</span>
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
