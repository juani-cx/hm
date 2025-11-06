import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, User, UserRound, UserX, Dumbbell, Triangle, Users, RectangleVertical, Hourglass } from "lucide-react";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: (preferences: OnboardingPreferences) => void;
  onDismiss: () => void;
}

export interface OnboardingPreferences {
  desiredExperience?: 'ultra_personalized' | 'non_intrusive' | 'traditional';
  stylePreference?: 'casual_comfy' | 'minimalist' | 'playful' | 'fashionist';
  gender?: 'male' | 'female' | 'mannequin';
  bodyType?: 'athletic' | 'petite' | 'curvy' | 'tall_slim' | 'plus_size';
  topsSize?: string;
  bottomsSize?: string;
  fitPreference?: number;
  productPagesStyle?: 'magazine' | 'board' | 'virtual_gallery';
  insightsPreference?: 'fashion_recommendations' | 'pricing_first' | 'fit_my_style';
}

export function OnboardingWizard({ open, onComplete, onDismiss }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    fitPreference: 50,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleSkip = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const updatePreference = <K extends keyof OnboardingPreferences>(
    key: K,
    value: OnboardingPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent 
        className="max-w-md"
        data-testid="onboarding-wizard"
      >
        <DialogTitle className="sr-only">
          {step === 1 && "Desired experience"}
          {step === 2 && "Size and flow"}
          {step === 3 && "Product pages & collections"}
          {step === 4 && "Insights preferences"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Step {step} of 4: Configure your preferences for a personalized experience
        </DialogDescription>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Onboarding 1-5
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Desired experience</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => updatePreference('desiredExperience', 'ultra_personalized')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.desiredExperience === 'ultra_personalized'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-ultra-personalized"
                >
                  <div className="font-medium">Ultra personalized</div>
                  <div className="text-sm text-muted-foreground">Broad shoulders, defined muscles</div>
                </button>

                <button
                  onClick={() => updatePreference('desiredExperience', 'non_intrusive')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.desiredExperience === 'non_intrusive'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-non-intrusive"
                >
                  <div className="font-medium">Only non intrusive suggestions</div>
                  <div className="text-sm text-muted-foreground">Shorter stature, slender frame</div>
                </button>

                <button
                  onClick={() => updatePreference('desiredExperience', 'traditional')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.desiredExperience === 'traditional'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-traditional"
                >
                  <div className="font-medium">I am traditional</div>
                  <div className="text-sm text-muted-foreground">Hourglass figure, fuller bust and hips</div>
                </button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-serif text-xl mb-4">Style preferences</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => updatePreference('stylePreference', 'casual_comfy')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      preferences.stylePreference === 'casual_comfy'
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-casual-comfy"
                  >
                    <div className="font-medium">Casual and comfy</div>
                    <div className="text-sm text-muted-foreground">Broad shoulders, defined muscles</div>
                  </button>

                  <button
                    onClick={() => updatePreference('stylePreference', 'minimalist')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      preferences.stylePreference === 'minimalist'
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-minimalist"
                  >
                    <div className="font-medium">Minimalist</div>
                    <div className="text-sm text-muted-foreground">Shorter stature, slender frame</div>
                  </button>

                  <button
                    onClick={() => updatePreference('stylePreference', 'playful')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      preferences.stylePreference === 'playful'
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-playful"
                  >
                    <div className="font-medium">Playful</div>
                    <div className="text-sm text-muted-foreground">Shorter stature, slender frame</div>
                  </button>

                  <button
                    onClick={() => updatePreference('stylePreference', 'fashionist')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      preferences.stylePreference === 'fashionist'
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-fashionist"
                  >
                    <div className="font-medium">Fashionist</div>
                    <div className="text-sm text-muted-foreground">Hourglass figure, fuller bust and hips</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Size and flow</h2>
              
              <div>
                <Label className="text-sm font-semibold mb-3 block">Gender</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updatePreference('gender', 'male')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.gender === 'male'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-gender-male"
                  >
                    <User className="w-6 h-6" />
                    <span className="text-xs font-medium">Male</span>
                  </button>
                  <button
                    onClick={() => updatePreference('gender', 'female')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.gender === 'female'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-gender-female"
                  >
                    <UserRound className="w-6 h-6" />
                    <span className="text-xs font-medium">Female</span>
                  </button>
                  <button
                    onClick={() => updatePreference('gender', 'mannequin')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.gender === 'mannequin'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-gender-no-gender"
                  >
                    <UserX className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap">No Gender</span>
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block">Body Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updatePreference('bodyType', 'athletic')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.bodyType === 'athletic'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-body-athletic"
                  >
                    <Dumbbell className="w-6 h-6" />
                    <span className="text-xs font-medium">Athletic</span>
                  </button>
                  <button
                    onClick={() => updatePreference('bodyType', 'petite')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.bodyType === 'petite'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-body-petite"
                  >
                    <Triangle className="w-6 h-6" />
                    <span className="text-xs font-medium">Petite</span>
                  </button>
                  <button
                    onClick={() => updatePreference('bodyType', 'curvy')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.bodyType === 'curvy'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-body-curvy"
                  >
                    <Hourglass className="w-6 h-6" />
                    <span className="text-xs font-medium">Curvy</span>
                  </button>
                  <button
                    onClick={() => updatePreference('bodyType', 'tall_slim')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.bodyType === 'tall_slim'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-body-tall-slim"
                  >
                    <RectangleVertical className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap">Tall & Slim</span>
                  </button>
                  <button
                    onClick={() => updatePreference('bodyType', 'plus_size')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all hover-elevate ${
                      preferences.bodyType === 'plus_size'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    }`}
                    data-testid="option-body-plus-size"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap">Plus Size</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Clothing Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tops-size" className="text-sm mb-2 block">Tops Size</Label>
                    <Select value={preferences.topsSize} onValueChange={(v) => updatePreference('topsSize', v)}>
                      <SelectTrigger id="tops-size" data-testid="select-tops-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bottoms-size" className="text-sm mb-2 block">Bottoms Size</Label>
                    <Select value={preferences.bottomsSize} onValueChange={(v) => updatePreference('bottomsSize', v)}>
                      <SelectTrigger id="bottoms-size" data-testid="select-bottoms-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="26">26</SelectItem>
                        <SelectItem value="28">28</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="34">34</SelectItem>
                        <SelectItem value="36">36</SelectItem>
                        <SelectItem value="38">38</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Fit Preference</Label>
                    </div>
                    <Slider
                      value={[preferences.fitPreference || 50]}
                      onValueChange={(v) => updatePreference('fitPreference', v[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                      data-testid="slider-fit-preference"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Slim</span>
                      <span>Regular</span>
                      <span>Loose</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Product pages & collections</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => updatePreference('productPagesStyle', 'magazine')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.productPagesStyle === 'magazine'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-magazine-style"
                >
                  <div className="font-medium">Magazine style</div>
                  <div className="text-sm text-muted-foreground">Broad shoulders, defined muscles</div>
                </button>

                <button
                  onClick={() => updatePreference('productPagesStyle', 'board')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.productPagesStyle === 'board'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-board-style"
                >
                  <div className="font-medium">Board style</div>
                  <div className="text-sm text-muted-foreground">Shorter stature, slender frame</div>
                </button>

                <button
                  onClick={() => updatePreference('productPagesStyle', 'virtual_gallery')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.productPagesStyle === 'virtual_gallery'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-virtual-gallery"
                >
                  <div className="font-medium">Virtual gallery</div>
                  <div className="text-sm text-muted-foreground">Hourglass figure, fuller bust and hips</div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Insights preferences</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => updatePreference('insightsPreference', 'fashion_recommendations')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.insightsPreference === 'fashion_recommendations'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-fashion-recommendations"
                >
                  <div className="font-medium">Fashion recommendations</div>
                  <div className="text-sm text-muted-foreground">Broad shoulders, defined muscles</div>
                </button>

                <button
                  onClick={() => updatePreference('insightsPreference', 'pricing_first')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.insightsPreference === 'pricing_first'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-pricing-first"
                >
                  <div className="font-medium">Pricing considerations first</div>
                  <div className="text-sm text-muted-foreground">Shorter stature, slender frame</div>
                </button>

                <button
                  onClick={() => updatePreference('insightsPreference', 'fit_my_style')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    preferences.insightsPreference === 'fit_my_style'
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  data-testid="option-fit-my-style"
                >
                  <div className="font-medium">Fit my style</div>
                  <div className="text-sm text-muted-foreground">Hourglass figure, fuller bust and hips</div>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <button
              onClick={handleSkip}
              className="text-sm font-medium hover-elevate px-4 py-2 rounded-md"
              data-testid="button-skip"
            >
              Skip
            </button>
            <Button
              onClick={handleNext}
              className="bg-[hsl(0,80%,45%)] hover:bg-[hsl(0,80%,40%)] text-white"
              data-testid="button-next"
            >
              {step === 4 ? 'Start shopping now' : (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
