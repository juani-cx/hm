import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { HeroSection } from "@/components/HeroSection";
import { StoryFeed } from "@/components/StoryFeed";
import { QuickPreferences } from "@/components/QuickPreferences";
import { EditorialContent } from "@/components/EditorialContent";
import { ShoppingCart } from "@/components/ShoppingCart";
import { TopBar } from "@/components/TopBar";
import { LoadingCard } from "@/components/LoadingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { fetchStories, updateProfile } from "@/lib/api";
import heroImg from '@assets/generated_images/Hero_fashion_editorial_image_aaf760a6.png';

type View = 'hero' | 'feed';

interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<View>('hero');
  const [showPreferences, setShowPreferences] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userId] = useState('demo-user');
  const [preferencesDismissed, setPreferencesDismissed] = useState(() => {
    return localStorage.getItem('hm-preferences-dismissed') === 'true';
  });

  // Fetch stories from API
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: fetchStories,
    enabled: currentView === 'feed',
  });


  const handleEnterFlow = () => {
    setCurrentView('feed');
    if (!preferencesDismissed) {
      setShowPreferences(true);
    }
  };



  const handleUpdateQuantity = (sku: string, size: string | undefined, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => !(item.sku === sku && item.size === size)));
    } else {
      setCartItems(prev => prev.map(item =>
        item.sku === sku && item.size === size ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (sku: string, size: string | undefined) => {
    setCartItems(prev => prev.filter(item => !(item.sku === sku && item.size === size)));
  };

  const handleSaveForLater = async (sku: string, size: string | undefined) => {
    console.log('Save for later:', sku, size);
    await trackUserBehavior('save_for_later', { sku, size });
  };

  const handleSaveToCollection = async (sku: string, size: string | undefined) => {
    console.log('Save to collection:', sku, size);
    await trackUserBehavior('save_to_collection', { sku, size });
  };

  const trackUserBehavior = async (action: string, data: any) => {
    try {
      await updateProfile({
        userId,
        lastAction: action,
        actionData: data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to track behavior:', error);
    }
  };

  const handleAISuggestionClick = (suggestion: string) => {
    console.log('AI Suggestion clicked:', suggestion);
  };

  const handleTryAIStylist = () => {
    setLocation('/ai-stylist');
  };

  const handleCreateCollection = () => {
    console.log('Create Collection');
    // Navigate to collection builder
  };

  const handleDismissPreferences = () => {
    localStorage.setItem('hm-preferences-dismissed', 'true');
    setPreferencesDismissed(true);
    setShowPreferences(false);
  };

  const handleSavePreferences = async (prefs: string[]) => {
    try {
      await updateProfile({
        userId,
        styleTags: prefs,
        consents: { behavioral: false, personalization: true }
      });
      setShowPreferences(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setShowPreferences(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'hero' && (
        <div 
          className="h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <HeroSection onEnterFlow={handleEnterFlow} />
        </div>
      )}

      {currentView === 'feed' && (
        <>
          <TopBar
            onSearchClick={() => console.log('Search')}
            onProfileClick={() => console.log('Profile')}
          />
          
          {storiesLoading ? (
            <div className="max-w-md mx-auto px-4 py-6">
              <h2 className="font-serif font-bold text-4xl mb-6 tracking-tight">Flow Stories for You</h2>
              <div className="grid grid-cols-2 gap-4">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            </div>
          ) : (
            <>
              <StoryFeed 
                stories={stories || []} 
                onAISuggestionClick={handleAISuggestionClick}
                showTopCollections={true}
              />
              
              <div className="max-w-md mx-auto px-3 sm:px-4 pb-6">
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full bg-primary/10">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-lg sm:text-xl mb-1 sm:mb-2">Try AI Stylist</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Get personalized styling recommendations powered by AI. Tell us your style preferences and discover looks curated just for you.
                      </p>
                      <Button 
                        onClick={handleTryAIStylist}
                        className="w-full sm:w-auto"
                        data-testid="button-try-ai-stylist"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Started
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
              
              <EditorialContent
                onTryAIStylist={handleTryAIStylist}
                onCreateCollection={handleCreateCollection}
              />
            </>
          )}
          
          {showPreferences && !preferencesDismissed && (
            <QuickPreferences
              onComplete={handleSavePreferences}
              onSkip={() => setShowPreferences(false)}
              onDismiss={handleDismissPreferences}
            />
          )}
          
          <ShoppingCart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onSaveForLater={handleSaveForLater}
            onSaveToCollection={handleSaveToCollection}
          />
        </>
      )}
    </div>
  );
}