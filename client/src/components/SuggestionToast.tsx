import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SuggestionToastProps {
  message: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  onDismiss: () => void;
  show: boolean;
}

export function SuggestionToast({ 
  message, 
  suggestions, 
  onSuggestionClick, 
  onDismiss,
  show 
}: SuggestionToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-30 backdrop-blur-md bg-background/95 border shadow-lg rounded-2xl p-4 max-w-md mx-auto"
          data-testid="suggestion-toast"
        >
          <div className="flex items-start gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{message}</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={onDismiss}
              data-testid="button-dismiss-suggestion"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((suggestion, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover-elevate active-elevate-2"
                onClick={() => {
                  onSuggestionClick(suggestion);
                  onDismiss();
                }}
                data-testid={`badge-suggestion-${idx}`}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}