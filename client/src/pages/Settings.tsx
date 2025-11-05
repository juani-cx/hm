import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Save } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TopBar } from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@shared/schema';

const USER_ID = 'default-user';

const AI_MODELS = [
  { id: 'clara-classic', name: 'Clara - The Classic' },
  { id: 'sofia-trendy', name: 'Sofia - The Trendsetter' },
  { id: 'emma-minimalist', name: 'Emma - The Minimalist' },
  { id: 'alex-street', name: 'Alex - The Street Stylist' },
];

const STYLE_OPTIONS = [
  'Minimalist',
  'Streetwear',
  'Vintage',
  'Bohemian',
  'Classic',
  'Sporty',
  'Elegant',
  'Casual',
];

const TOPS_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOMS_SIZES = ['26W x 28L', '28W x 30L', '30W x 30L', '32W x 30L', '32W x 32L', '34W x 32L', '36W x 32L'];

export default function Settings() {
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile', USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const [aiModel, setAiModel] = useState('clara-classic');
  const [curatedFeed, setCuratedFeed] = useState(true);
  const [favoriteStyles, setFavoriteStyles] = useState<string[]>([]);
  const [mediaPreview, setMediaPreview] = useState<'image' | 'video'>('image');
  const [topsSize, setTopsSize] = useState('M');
  const [bottomsSize, setBottomsSize] = useState('32W x 30L');
  const [fitPreference, setFitPreference] = useState(50);
  const [gender, setGender] = useState<'male' | 'female' | 'mannequin' | undefined>();

  useEffect(() => {
    if (profile) {
      setAiModel(profile.aiStylistModel || 'clara-classic');
      setCuratedFeed(profile.curatedFeed ?? true);
      setFavoriteStyles(profile.favoriteStyles || []);
      setMediaPreview(profile.mediaPreview || 'image');
      setTopsSize(profile.topsSize || 'M');
      setBottomsSize(profile.bottomsSize || '32W x 30L');
      setFitPreference(profile.fitPreference ?? 50);
      setGender(profile.gender);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest('PATCH', `/api/profile/${USER_ID}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', USER_ID] });
      toast({
        title: "Preferences Saved",
        description: "Your personalization settings have been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  const handleToggleStyle = (style: string) => {
    if (favoriteStyles.includes(style)) {
      setFavoriteStyles(favoriteStyles.filter(s => s !== style));
    } else {
      setFavoriteStyles([...favoriteStyles, style]);
    }
  };

  const handleSavePreferences = () => {
    updateProfileMutation.mutate({
      aiStylistModel: aiModel,
      curatedFeed,
      favoriteStyles,
      mediaPreview,
      topsSize,
      bottomsSize,
      fitPreference,
      gender,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl" data-testid="text-settings-title">Settings</h1>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4" data-testid="text-ai-preferences">AI Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-model" className="text-sm font-medium mb-2 block">
                  AI Stylist Model
                </Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger id="ai-model" data-testid="select-ai-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="curated-feed" className="text-sm font-medium">
                    Curated for You
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personalize my feed
                  </p>
                </div>
                <Switch
                  id="curated-feed"
                  checked={curatedFeed}
                  onCheckedChange={setCuratedFeed}
                  data-testid="switch-curated-feed"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4" data-testid="text-style-preferences">Style Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">My Favorite Styles</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => {
                    const isSelected = favoriteStyles.includes(style);
                    return (
                      <button
                        key={style}
                        onClick={() => handleToggleStyle(style)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover-elevate'
                        }`}
                        data-testid={`style-${style.toLowerCase()}`}
                      >
                        {style}
                        {isSelected && (
                          <X className="inline-block w-3 h-3 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Media Preview</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMediaPreview('image')}
                    className={`p-4 rounded-md text-sm font-medium border-2 transition-colors ${
                      mediaPreview === 'image'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover-elevate'
                    }`}
                    data-testid="media-image"
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setMediaPreview('video')}
                    className={`p-4 rounded-md text-sm font-medium border-2 transition-colors ${
                      mediaPreview === 'video'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover-elevate'
                    }`}
                    data-testid="media-video"
                  >
                    Video
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Gender</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setGender('male')}
                    className={`p-4 rounded-md text-sm font-medium border-2 transition-colors ${
                      gender === 'male'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover-elevate'
                    }`}
                    data-testid="gender-male"
                  >
                    Man
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`p-4 rounded-md text-sm font-medium border-2 transition-colors ${
                      gender === 'female'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover-elevate'
                    }`}
                    data-testid="gender-female"
                  >
                    Woman
                  </button>
                  <button
                    onClick={() => setGender('mannequin')}
                    className={`p-4 rounded-md text-sm font-medium border-2 transition-colors ${
                      gender === 'mannequin'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover-elevate'
                    }`}
                    data-testid="gender-mannequin"
                  >
                    No Gender
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4" data-testid="text-clothing-preferences">Clothing Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tops-size" className="text-sm font-medium mb-2 block">
                  Tops Size
                </Label>
                <Select value={topsSize} onValueChange={setTopsSize}>
                  <SelectTrigger id="tops-size" data-testid="select-tops-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPS_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size === 'M' ? `Medium (${size})` : size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bottoms-size" className="text-sm font-medium mb-2 block">
                  Bottoms Size
                </Label>
                <Select value={bottomsSize} onValueChange={setBottomsSize}>
                  <SelectTrigger id="bottoms-size" data-testid="select-bottoms-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOTTOMS_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Fit Preference</Label>
                <div className="space-y-2">
                  <Slider
                    value={[fitPreference]}
                    onValueChange={(value) => setFitPreference(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="slider-fit-preference"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slim</span>
                    <span>Regular</span>
                    <span>Loose</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleSavePreferences}
            className="w-full"
            size="lg"
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-preferences"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
