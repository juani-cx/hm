import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { StoryFeed } from "@/components/StoryFeed";
import { StoryViewer } from "@/components/StoryViewer";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { AssistantOverlay } from "@/components/AssistantOverlay";
import { QuickPreferences } from "@/components/QuickPreferences";
import { TopBar } from "@/components/TopBar";
import heroImg from '@assets/generated_images/Hero_fashion_editorial_image_aaf760a6.png';
import autumnImg from '@assets/generated_images/Story_card_autumn_look_7a4bbbf6.png';
import summerImg from '@assets/generated_images/Story_card_summer_look_b5f6c911.png';
import workwearImg from '@assets/generated_images/Story_card_workwear_look_a3ea8ce1.png';
import jacketImg from '@assets/generated_images/Product_leather_jacket_a13fb76c.png';
import sweaterImg from '@assets/generated_images/Product_knit_sweater_77d57eeb.png';
import teeImg from '@assets/generated_images/Product_basic_tee_7cb6d64a.png';
import jeansImg from '@assets/generated_images/Product_denim_jeans_ce699130.png';

type View = 'hero' | 'feed' | 'story' | 'product';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const stories = [
    { 
      id: '1', 
      title: 'Autumn Essentials', 
      imageUrl: autumnImg, 
      lookCount: 6, 
      tags: ['Sustainability'],
      looks: [
        {
          id: 'look1',
          title: 'Autumn Layers',
          items: [
            { sku: 'SKU001', name: 'Trench Coat', price: 89 },
            { sku: 'SKU002', name: 'White Turtleneck', price: 29 },
            { sku: 'SKU003', name: 'Wool Scarf', price: 35 },
          ]
        },
        {
          id: 'look2',
          title: 'Cozy Weekend',
          items: [
            { sku: 'SKU004', name: 'Knit Sweater', price: 49 },
            { sku: 'SKU005', name: 'Denim Jeans', price: 59 },
          ]
        }
      ],
      images: [autumnImg, workwearImg]
    },
    { 
      id: '2', 
      title: 'Summer Breeze', 
      imageUrl: summerImg, 
      lookCount: 4, 
      tags: ['Fresh'],
      looks: [
        {
          id: 'look3',
          title: 'Garden Party',
          items: [
            { sku: 'SKU006', name: 'Floral Dress', price: 69 },
            { sku: 'SKU007', name: 'Straw Hat', price: 25 },
          ]
        }
      ],
      images: [summerImg]
    },
    { 
      id: '3', 
      title: 'Office Chic', 
      imageUrl: workwearImg, 
      lookCount: 5, 
      tags: ['Professional'],
      looks: [
        {
          id: 'look4',
          title: 'Power Suit',
          items: [
            { sku: 'SKU008', name: 'Tailored Blazer', price: 129 },
            { sku: 'SKU009', name: 'Dress Pants', price: 79 },
          ]
        }
      ],
      images: [workwearImg]
    },
    { 
      id: '4', 
      title: 'Weekend Vibes', 
      imageUrl: autumnImg, 
      lookCount: 3,
      looks: [
        {
          id: 'look5',
          title: 'Casual Cool',
          items: [
            { sku: 'SKU010', name: 'Basic Tee', price: 19 },
            { sku: 'SKU011', name: 'Relaxed Jeans', price: 49 },
          ]
        }
      ],
      images: [autumnImg]
    },
  ];

  const sampleProduct = {
    sku: 'SKU001',
    name: 'Premium Leather Jacket',
    price: 199,
    images: [jacketImg, sweaterImg, teeImg],
    description: 'Classic leather jacket with a modern twist. Features premium leather construction, multiple pockets, and adjustable waist. Perfect for layering in transitional weather.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    material: 'Genuine Leather',
    sustainTags: ['Eco-friendly tanning', 'Recycled lining'],
    stock: 12,
  };

  const handleEnterFlow = () => {
    setCurrentView('feed');
    setShowPreferences(true);
  };

  const handleStoryClick = (storyId: string) => {
    setSelectedStory(storyId);
    setCurrentView('story');
  };

  const handleShopLook = () => {
    setCurrentView('product');
  };

  const handleAddToCart = (sku: string, size: string) => {
    console.log('Added to cart:', sku, size);
    setCartCount(prev => prev + 1);
    setCurrentView('feed');
  };

  const currentStoryData = stories.find(s => s.id === selectedStory);

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
          <StoryFeed stories={stories} onStoryClick={handleStoryClick} />
          {showPreferences && (
            <QuickPreferences
              onComplete={(prefs) => {
                console.log('Preferences set:', prefs);
                setShowPreferences(false);
              }}
              onSkip={() => setShowPreferences(false)}
            />
          )}
        </>
      )}

      {currentView === 'story' && currentStoryData && (
        <StoryViewer
          storyTitle={currentStoryData.title}
          looks={currentStoryData.looks}
          images={currentStoryData.images}
          onClose={() => setCurrentView('feed')}
          onShopLook={handleShopLook}
        />
      )}

      {currentView === 'product' && (
        <ProductDetailPage
          product={sampleProduct}
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