import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface AISuggestionsCardProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export function AISuggestionsCard({ onSuggestionClick }: AISuggestionsCardProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['/api/assistant/suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/assistant/suggestions?context=feed');
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    onSuggestionClick?.(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-2"
    >
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-medium">AI Style Assistant</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Get personalized styling tips and discover looks perfect for you
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(suggestions?.suggestions || [
              "What's trending this season?",
              "Help me build a capsule wardrobe",
              "Sustainable fashion tips"
            ]).slice(0, 3).map((suggestion: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => handleSuggestionClick(suggestion)}
                data-testid={`ai-suggestion-${index}`}
              >
                <span className="text-sm line-clamp-2">{suggestion}</span>
              </Button>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
