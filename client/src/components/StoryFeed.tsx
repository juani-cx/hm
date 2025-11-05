import { StoryCard } from "./StoryCard";
import { AISuggestionsCard } from "./AISuggestionsCard";
import { motion } from "framer-motion";

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  lookCount: number;
  tags?: string[];
}

interface StoryFeedProps {
  stories: Story[];
  onAISuggestionClick?: (suggestion: string) => void;
  showTopCollections?: boolean;
}

export function StoryFeed({ stories, onAISuggestionClick, showTopCollections = false }: StoryFeedProps) {
  const topStories = showTopCollections ? stories.slice(0, 4) : stories;
  const title = showTopCollections ? "Top Collections" : "Flow Stories";
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif font-bold text-3xl sm:text-4xl mb-4 sm:mb-6 tracking-tight">
            {title}
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {!showTopCollections && <AISuggestionsCard onSuggestionClick={onAISuggestionClick} />}
          
          {topStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <StoryCard {...story} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}