import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { UserProfile } from "@shared/schema";

interface OnboardingWizardProps {
  onComplete: (preferences: Partial<UserProfile>) => void;
  initialData?: Partial<UserProfile>;
}

interface StepOption {
  value: string;
  label: string;
  description: string;
}

export function OnboardingWizard({ onComplete, initialData }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserProfile>>({
    desiredExperience: initialData?.desiredExperience,
    shoppingMood: initialData?.shoppingMood,
    bodyType: initialData?.bodyType,
    productPagesStyle: initialData?.productPagesStyle,
    insightsPreference: initialData?.insightsPreference,
  });

  const steps = [
    {
      title: "Desired experience",
      field: "desiredExperience" as keyof UserProfile,
      options: [
        {
          value: "ultra_personalized",
          label: "Ultra personalized",
          description: "Get AI-powered recommendations tailored to your unique style",
        },
        {
          value: "non_intrusive",
          label: "Only non intrusive suggestions",
          description: "Browse freely with subtle, optional recommendations",
        },
        {
          value: "traditional",
          label: "I am traditional",
          description: "Classic shopping experience without personalization",
        },
      ],
    },
    {
      title: "Shopping mood",
      field: "shoppingMood" as keyof UserProfile,
      options: [
        {
          value: "magazine",
          label: "Magazine",
          description: "Editorial layouts with curated collections",
        },
        {
          value: "funny_interactive",
          label: "Funny and interactive",
          description: "Playful, engaging shopping with dynamic content",
        },
        {
          value: "fashionist",
          label: "Fashionist",
          description: "Trend-focused, runway-inspired experiences",
        },
      ],
    },
    {
      title: "Body type",
      field: "bodyType" as keyof UserProfile,
      options: [
        {
          value: "athletic",
          label: "Athletic Build",
          description: "Broad shoulders, defined muscles",
        },
        {
          value: "petite",
          label: "Petite",
          description: "Shorter stature, slender frame",
        },
        {
          value: "curvy",
          label: "Curvy",
          description: "Hourglass figure, fuller bust and hips",
        },
        {
          value: "tall_slim",
          label: "Tall & Slim",
          description: "Tall stature, lean build",
        },
        {
          value: "plus_size",
          label: "Plus Size",
          description: "Fuller figure, comfortable fit",
        },
      ],
    },
    {
      title: "Product pages & collections",
      field: "productPagesStyle" as keyof UserProfile,
      options: [
        {
          value: "magazine",
          label: "Magazine style",
          description: "Large visuals with editorial storytelling",
        },
        {
          value: "board",
          label: "Board style",
          description: "Grid layouts for quick browsing",
        },
        {
          value: "virtual_gallery",
          label: "Virtual gallery",
          description: "Immersive, gallery-like product displays",
        },
      ],
    },
    {
      title: "Insights",
      field: "insightsPreference" as keyof UserProfile,
      options: [
        {
          value: "fashion_recommendations",
          label: "Fashion recommendations",
          description: "Style tips and outfit pairing suggestions",
        },
        {
          value: "pricing_first",
          label: "Pricing considerations first",
          description: "Budget-focused with deals and savings highlighted",
        },
        {
          value: "try_on",
          label: "Try on",
          description: "Virtual try-on and fit visualization tools",
        },
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const selectedValue = preferences[currentStepData.field];

  const handleSelect = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [currentStepData.field]: value,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete({ ...preferences, onboardingCompleted: true });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const canProceed = selectedValue !== undefined;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-onboarding-progress">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-6" data-testid="text-onboarding-step-title">
              {currentStepData.title}
            </h2>

            <div className="space-y-3 mb-8">
              {currentStepData.options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <Card
                    key={option.value}
                    className={`p-4 cursor-pointer transition-all hover-elevate ${
                      isSelected ? "border-primary ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleSelect(option.value)}
                    data-testid={`card-option-${option.value}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1" data-testid={`text-option-label-${option.value}`}>
                          {option.label}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-option-description-${option.value}`}>
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
              size="lg"
              data-testid="button-next"
            >
              {isLastStep ? "Complete" : "Next"}
            </Button>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary"
                  : "w-2 bg-muted"
              }`}
              data-testid={`progress-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
