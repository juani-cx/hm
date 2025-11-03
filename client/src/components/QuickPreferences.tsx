import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

interface QuickPreferencesProps {
  onComplete: (preferences: string[]) => void;
  onSkip: () => void;
  onDismiss?: () => void;
}

const preferenceOptions = [
  "Minimalist",
  "Bold & Colorful",
  "Streetwear",
  "Sustainable",
];

export function QuickPreferences({ onComplete, onSkip, onDismiss }: QuickPreferencesProps) {
  const handleSelect = (pref: string) => {
    console.log('Preference selected:', pref);
    onComplete([pref]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border-t sm:border sm:rounded-3xl p-6 w-full sm:max-w-md sm:m-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <h3 className="font-medium">Help us personalize your experience</h3>
          </div>
          {onDismiss && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onDismiss}
              className="h-6 w-6 -mt-1 -mr-2 flex-shrink-0"
              data-testid="button-close-preferences"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Choose your style preference to get better recommendations
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
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

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full"
            data-testid="button-skip-preferences"
          >
            Skip for now
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="w-full text-muted-foreground"
              data-testid="button-dismiss-preferences"
            >
              Don't show me this again
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}