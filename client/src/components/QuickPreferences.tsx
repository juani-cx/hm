import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface QuickPreferencesProps {
  onComplete: (preferences: string[]) => void;
  onSkip: () => void;
}

const preferenceOptions = [
  "Minimalist",
  "Bold & Colorful",
  "Classic",
  "Streetwear",
  "Sustainable",
  "Budget-Friendly",
];

export function QuickPreferences({ onComplete, onSkip }: QuickPreferencesProps) {
  const handleSelect = (pref: string) => {
    console.log('Preference selected:', pref);
    onComplete([pref]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[calc(100%-2rem)] backdrop-blur-md bg-background/95 border shadow-lg rounded-3xl p-6 z-30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Help us personalize your experience</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Choose your style preference to get better recommendations
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {preferenceOptions.map((option) => (
          <Badge
            key={option}
            variant="outline"
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => handleSelect(option)}
            data-testid={`badge-pref-${option.toLowerCase().replace(/\s/g, '-')}`}
          >
            {option}
          </Badge>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        className="w-full"
        data-testid="button-skip-preferences"
      >
        Skip for now
      </Button>
    </motion.div>
  );
}