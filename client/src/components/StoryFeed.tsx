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
  onStoryClick: (storyId: string) => void;
  onAISuggestionClick?: (suggestion: string) => void;
}

export function StoryFeed({ stories, onStoryClick, onAISuggestionClick }: StoryFeedProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif font-bold text-4xl mb-6 tracking-tight">
            Flow Stories
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          <AISuggestionsCard onSuggestionClick={onAISuggestionClick} />
          
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <StoryCard
                {...story}
                onClick={() => onStoryClick(story.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}