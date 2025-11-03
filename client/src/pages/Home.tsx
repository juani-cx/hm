import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/HeroSection";
import { StoryFeed } from "@/components/StoryFeed";
import { StoryViewer } from "@/components/StoryViewer";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { AssistantOverlay } from "@/components/AssistantOverlay";
import { QuickPreferences } from "@/components/QuickPreferences";
import { TopBar } from "@/components/TopBar";
import { LoadingCard } from "@/components/LoadingCard";
import { fetchStories, fetchStory, updateProfile, fetchItem } from "@/lib/api";
import heroImg from '@assets/generated_images/Hero_fashion_editorial_image_aaf760a6.png';

type View = 'hero' | 'feed' | 'story' | 'product';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userId] = useState('demo-user');

  // Fetch stories from API
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: fetchStories,
    enabled: currentView === 'feed',
  });

  // Fetch selected story details
  const { data: storyData } = useQuery({
    queryKey: ['/api/stories', selectedStory],
    queryFn: () => selectedStory ? fetchStory(selectedStory) : null,
    enabled: !!selectedStory && currentView === 'story',
  });

  // Fetch selected product details
  const { data: productData } = useQuery({
    queryKey: ['/api/items', selectedSku],
    queryFn: () => selectedSku ? fetchItem(selectedSku) : null,
    enabled: !!selectedSku && currentView === 'product',
  });

  const handleEnterFlow = () => {
    setCurrentView('feed');
    setShowPreferences(true);
  };

  const handleStoryClick = (storyId: string) => {
    setSelectedStory(storyId);
    setCurrentView('story');
  };

  const handleShopLook = (lookId: string) => {
    // Find the selected look and use its first item
    const selectedLook = storyData?.looks?.find(look => look.id === lookId);
    if (selectedLook?.items?.[0]?.sku) {
      setSelectedSku(selectedLook.items[0].sku);
      setCurrentView('product');
    }
  };

  const handleAddToCart = (sku: string, size: string) => {
    console.log('Added to cart:', sku, size);
    setCartCount(prev => prev + 1);
    setCurrentView('feed');
  };

  const handleAskAssistant = (question: string) => {
    console.log('Ask assistant:', question);
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
            cartCount={cartCount}
            onSearchClick={() => console.log('Search')}
            onCartClick={() => console.log('Cart')}
            onProfileClick={() => console.log('Profile')}
          />
          
          {storiesLoading ? (
            <div className="max-w-md mx-auto px-4 py-6">
              <h2 className="font-serif font-bold text-4xl mb-6 tracking-tight">Flow Stories</h2>
              <div className="grid grid-cols-2 gap-4">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            </div>
          ) : (
            <StoryFeed stories={stories || []} onStoryClick={handleStoryClick} />
          )}
          
          {showPreferences && (
            <QuickPreferences
              onComplete={handleSavePreferences}
              onSkip={() => setShowPreferences(false)}
            />
          )}
        </>
      )}

      {currentView === 'story' && storyData && (
        <StoryViewer
          storyTitle={storyData.title}
          looks={storyData.looks || []}
          images={storyData.images || []}
          onClose={() => setCurrentView('feed')}
          onShopLook={handleShopLook}
          onAskAssistant={handleAskAssistant}
        />
      )}

      {currentView === 'product' && productData && (
        <ProductDetailPage
          product={productData}
          onClose={() => setCurrentView('story')}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentView !== 'hero' && currentView !== 'product' && (
        <AssistantOverlay
          suggestions={['Show me winter looks', 'What goes with jeans?', 'Sustainable options']}
        />
      )}
    </div>
  );
}