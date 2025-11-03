import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIStyleTipProps {
  show: boolean;
  tip: string;
  onClose: () => void;
  onLearnMore?: () => void;
}

export function AIStyleTip({ show, tip, onClose, onLearnMore }: AIStyleTipProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1">AI Styling Tip</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{tip}</p>
                
                {onLearnMore && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-2 text-primary"
                    onClick={onLearnMore}
                    data-testid="button-ai-tip-learn-more"
                  >
                    Learn more
                  </Button>
                )}
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={onClose}
                data-testid="button-close-ai-tip"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
