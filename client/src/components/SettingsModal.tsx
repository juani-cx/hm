import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";

const USER_ID = 'default-user';

const AI_MODELS = [
  { id: 'clara', name: 'Clara - Minimalist Expert' },
  { id: 'sofia', name: 'Sofia - Trend Forecaster' },
  { id: 'emma', name: 'Emma - Sustainable Style' },
  { id: 'alex', name: 'Alex - Street Fashion' },
];

const STYLE_OPTIONS = ['Minimalist', 'Streetwear', 'Vintage', 'Bohemian', 'Classic', 'Edgy', 'Romantic', 'Athleisure'];
const TOPS_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOMS_SIZES = ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36'];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', USER_ID],
    enabled: open,
  });

  const [aiStylistModel, setAiStylistModel] = useState('clara');
  const [curatedFeed, setCuratedFeed] = useState(true);
  const [favoriteStyles, setFavoriteStyles] = useState<string[]>(['Minimalist']);
  const [mediaPreview, setMediaPreview] = useState<'image' | 'video'>('image');
  const [gender, setGender] = useState<'male' | 'female' | 'mannequin' | undefined>(undefined);
  const [topsSize, setTopsSize] = useState('M');
  const [bottomsSize, setBottomsSize] = useState('28');
  const [fitPreference, setFitPreference] = useState(50);

  useEffect(() => {
    if (profile && open) {
      setAiStylistModel(profile.aiStylistModel || 'clara');
      setCuratedFeed(profile.curatedFeed ?? true);
      setFavoriteStyles(profile.favoriteStyles || ['Minimalist']);
      setMediaPreview(profile.mediaPreview || 'image');
      setGender(profile.gender);
      setTopsSize(profile.topsSize || 'M');
      setBottomsSize(profile.bottomsSize || '28');
      setFitPreference(profile.fitPreference ?? 50);
    }
  }, [profile, open]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await fetch(`/api/profile/${USER_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
      // Automatically close modal after saving
      setTimeout(() => onOpenChange(false), 300);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSavePreferences = () => {
    updateProfileMutation.mutate({
      aiStylistModel,
      curatedFeed,
      favoriteStyles,
      mediaPreview,
      gender,
      topsSize,
      bottomsSize,
      fitPreference,
    });
  };

  const handleToggleStyle = (style: string) => {
    setFavoriteStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Header with title and close button */}
      <div className="flex items-center justify-between px-6 py-6 border-b">
        <h1 className="font-serif text-3xl" data-testid="text-settings-title">
          Settings
        </h1>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 hover-elevate rounded-md"
          data-testid="button-close-settings"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4" data-testid="text-ai-preferences">AI Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-model" className="text-sm font-medium mb-2 block">
                  AI Stylist Model
                </Label>
                <Select value={aiStylistModel} onValueChange={setAiStylistModel}>
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
        </div>
      </div>

      {/* Fixed bottom CTA button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
        <div className="max-w-2xl mx-auto">
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
