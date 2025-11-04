import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EditorialContentProps {
  onTryAIStylist?: () => void;
  onCreateCollection?: () => void;
}

export function EditorialContent({ onTryAIStylist, onCreateCollection }: EditorialContentProps) {
  const articles = [
    {
      title: "The Art of Layering",
      excerpt: "Master the technique of combining textures and silhouettes for a sophisticated fall wardrobe.",
      image: "/generated_images/Story_card_autumn_look_7a4bbbf6.png"
    },
    {
      title: "Sustainable Style Guide",
      excerpt: "Discover how to build a conscious wardrobe without compromising on style or quality.",
      image: "/generated_images/Story_card_workwear_look_a3ea8ce1.png"
    },
    {
      title: "Workwear Reinvented",
      excerpt: "Professional pieces that transition seamlessly from boardroom to happy hour.",
      image: "/generated_images/Story_card_workwear_look_a3ea8ce1.png"
    }
  ];

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-3 sm:mb-4 tracking-tight">
          Style Stories
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Editorial insights and styling advice from our fashion editors
        </p>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`article-${index}`}>
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-serif font-semibold text-lg sm:text-xl mb-1 sm:mb-2">{article.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{article.excerpt}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Interactive CTAs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-primary/10">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-lg sm:text-xl mb-1 sm:mb-2">Try AI Stylist</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Get personalized styling recommendations powered by AI. Tell us your style preferences and discover looks curated just for you.
              </p>
              <Button 
                onClick={onTryAIStylist}
                className="w-full sm:w-auto"
                data-testid="button-try-ai-stylist"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-background border-accent/20">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-accent/10">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-lg sm:text-xl mb-1 sm:mb-2">Create Your Collection</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Mix and match your favorite pieces. Build custom outfits and save them to your personal collection for easy shopping later.
              </p>
              <Button 
                onClick={onCreateCollection}
                variant="outline"
                className="w-full sm:w-auto"
                data-testid="button-create-collection"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Creating
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
