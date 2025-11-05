import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface StoryCardProps {
  id: string;
  title: string;
  imageUrl: string;
  lookCount: number;
  tags?: string[];
  onClick?: () => void;
}

export function StoryCard({ id, title, imageUrl, lookCount, tags = [], onClick }: StoryCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(`/campaign/${id}`);
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      data-testid={`card-story-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif font-bold text-xl text-white mb-1 tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/80">
          <span>{lookCount} looks</span>
          {tags.length > 0 && (
            <>
              <span>·</span>
              <span>{tags.join(', ')}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}