import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import hmLogo from "@assets/H&M-Logo_1762206118498.png";

interface HeroSectionProps {
  onEnterFlow: () => void;
}

export function HeroSection({ onEnterFlow }: HeroSectionProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 px-6"
      >
        <img 
          src={hmLogo} 
          alt="H&M" 
          className="h-8 w-auto brightness-0 invert"
          data-testid="img-hero-logo"
        />
      </motion.header>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-full flex flex-col items-center justify-end pb-12 px-6"
      >
        <h1 className="font-serif font-bold text-5xl md:text-6xl text-white text-center tracking-tight leading-tight mb-4">
          Style Your Story
        </h1>
        <p className="text-white/90 text-base md:text-lg text-center mb-8 max-w-md">
          Discover curated looks, get AI-powered style tips, and shop the latest trends
        </p>
        
        <Button
          size="lg"
          onClick={onEnterFlow}
          className="backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 h-12 rounded-full font-medium text-base"
          data-testid="button-enter-flow"
        >
          Explore Flow Stories
        </Button>
        
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-12"
        >
          <ChevronDown className="text-white/60 w-6 h-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}